<script setup>
import { ref, onMounted, onUnmounted, nextTick, watchEffect } from "vue";
import { useRouter } from "vue-router";
import BottomNav from "../components/BottomNav.vue";

const router = useRouter();
const user = ref(null);
const currentTab = ref("chat");
const messages = ref([]);
const inputText = ref("");
const isLoading = ref(false);
const messagesLoading = ref(true);
const sendingMessage = ref(false);
const refreshing = ref(false);
const unreadCount = ref(0);
const pollInterval = ref(null);
const messagesContainer = ref(null);

// Quick action messages
const quickActions = ref([
  "Hello, I need help",
  "Payment issue",
  "Job application status",
  "Technical support",
]);

onMounted(() => {
  // Get user data from localStorage
  const userData = localStorage.getItem("userData");
  if (userData) {
    user.value = JSON.parse(userData);
  } else {
    // Redirect to login if no user data
    router.push("/login");
  }

  loadMessages();
  loadUnreadCount();

  // Poll for new messages every 10 seconds (silent updates)
  pollInterval.value = setInterval(() => {
    loadMessages(true);
    loadUnreadCount();
  }, 10000);
});

onUnmounted(() => {
  if (pollInterval.value) {
    clearInterval(pollInterval.value);
  }
});

// Watch for new messages to scroll to bottom
const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// Load messages whenever messages array changes
const stopWatcher = watchEffect(() => {
  if (messages.value.length > 0) {
    setTimeout(scrollToBottom, 100);
  }
});

const loadMessages = async (silent = false) => {
  if (!silent) messagesLoading.value = true;

  try {
    const token = localStorage.getItem("userToken");
    if (!token) return;

    const response = await fetch(
      "https://canada.rohatechs.com/api/chat/messages",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    if (response.ok && data.success) {
      messages.value = data.data;
      await nextTick();
      scrollToBottom();
    }
  } catch (error) {
    console.error("Error loading messages:", error);
  } finally {
    if (!silent) messagesLoading.value = false;
  }
};

const loadUnreadCount = async () => {
  try {
    const token = localStorage.getItem("userToken");
    if (!token) return;

    const response = await fetch(
      "https://canada.rohatechs.com/api/chat/unread-count",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    if (response.ok && data.success) {
      unreadCount.value = data.data.unread_count;
    }
  } catch (error) {
    console.error("Error loading unread count:", error);
  }
};

const sendMessage = async () => {
  if (inputText.value.trim() === "" || sendingMessage.value) return;

  const messageText = inputText.value.trim();
  inputText.value = "";
  sendingMessage.value = true;

  try {
    const token = localStorage.getItem("userToken");
    if (!token) {
      alert("Please log in to send messages");
      router.push("/login");
      return;
    }

    const response = await fetch("https://canada.rohatechs.com/api/chat/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: messageText,
      }),
    });

    const data = await response.json();
    if (response.ok && data.success) {
      // Add the new message to the list immediately for better UX
      messages.value.push(data.data);
      await nextTick();
      scrollToBottom();
      // Reload all messages silently to ensure consistency
      await loadMessages(true);
    } else {
      alert("Failed to send message. Please try again.");
      inputText.value = messageText; // Restore message if failed
    }
  } catch (error) {
    alert("Failed to send message. Please try again.");
    console.error("Error sending message:", error);
    inputText.value = messageText; // Restore message if failed
  } finally {
    sendingMessage.value = false;
  }
};

const onRefresh = async () => {
  refreshing.value = true;
  await loadMessages();
  await loadUnreadCount();
  refreshing.value = false;
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString();
  }
};

const shouldShowDate = (index) => {
  if (index === 0) return true;
  return (
    formatDate(messages.value[index].created_at) !==
    formatDate(messages.value[index - 1].created_at)
  );
};

const setActiveTab = (tab) => {
  currentTab.value = tab;

  // Navigate to different pages based on tab
  if (tab === "home") {
    router.push("/user-home");
  } else if (tab === "jobs") {
    router.push("/jobs");
  } else if (tab === "payment") {
    router.push("/payment");
  } else if (tab === "chat") {
    // Already on chat page
  } else if (tab === "profile") {
    router.push("/profile");
  } else {
    // For other tabs, could navigate or show placeholder
    alert(`${tab} feature coming soon!`);
  }
};

const logout = () => {
  localStorage.removeItem("userToken");
  localStorage.removeItem("userData");
  router.push("/");
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-red-50 to-gray-50 pb-20">
    <!-- Header -->
    <div
      class="bg-gradient-to-r from-red-600 to-red-700 text-white p-3 md:p-4 shadow-lg"
    >
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-lg md:text-xl font-bold flex items-center">
            <span class="mr-2">💬</span>
            Support Chat
          </h1>
          <p class="text-red-100 text-xs md:text-sm">
            {{ user ? `Hi ${user.first_name}!` : "Welcome" }} Ask us anything
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="onRefresh"
            :disabled="refreshing"
            class="bg-red-700 hover:bg-red-800 p-2 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh messages"
          >
            <span v-if="refreshing" class="animate-spin">⟳</span>
            <span v-else>⟳</span>
          </button>
          <button
            @click="logout"
            class="bg-red-700 hover:bg-red-800 px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors text-xs md:text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </div>

    <!-- Messages Container -->
    <div class="flex-1 px-3 md:px-4 py-4 h-[calc(100vh-200px)] overflow-hidden">
      <!-- Loading State -->
      <div
        v-if="messagesLoading"
        class="flex flex-col items-center justify-center h-full"
      >
        <div
          class="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-red-600 mb-4"
        ></div>
        <p class="text-gray-600 text-sm md:text-base">
          Loading your conversation...
        </p>
      </div>

      <!-- Messages -->
      <div v-else class="h-full flex flex-col">
        <div
          ref="messagesContainer"
          class="flex-1 overflow-y-auto space-y-3 md:space-y-4 py-2"
          :class="{ 'opacity-50': refreshing }"
        >
          <!-- Welcome Message -->
          <div v-if="messages.length === 0" class="text-center py-8">
            <div
              class="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mx-auto max-w-md"
            >
              <div class="text-3xl md:text-4xl mb-4">👋</div>
              <h3 class="text-lg md:text-xl font-semibold text-gray-800 mb-2">
                Welcome to Support!
              </h3>
              <p class="text-sm md:text-base text-gray-600 leading-relaxed">
                Our team is here to help you with any questions about job
                applications, payments, or general support.
              </p>
              <div class="mt-4 text-xs md:text-sm text-gray-500">
                Start typing below to begin the conversation
              </div>
            </div>
          </div>

          <!-- Message List -->
          <div v-else class="space-y-3 md:space-y-4">
            <div
              v-for="(message, index) in messages"
              :key="message.id"
              class="message-group"
            >
              <!-- Date Separator -->
              <div
                v-if="shouldShowDate(index)"
                class="text-center my-4 md:my-6"
              >
                <span
                  class="bg-white text-gray-600 px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm shadow-sm border"
                >
                  {{ formatDate(message.created_at) }}
                </span>
              </div>

              <!-- Message Bubble -->
              <div
                :class="[
                  'flex',
                  message.is_from_admin ? 'justify-start' : 'justify-end',
                ]"
              >
                <div
                  :class="[
                    'message-bubble max-w-xs md:max-w-md px-3 md:px-4 py-2 md:py-3 rounded-2xl shadow-sm',
                    message.is_from_admin
                      ? 'bg-white border border-gray-200 text-gray-800'
                      : 'bg-red-600 text-white',
                  ]"
                >
                  <!-- Admin Badge -->
                  <div
                    v-if="message.is_from_admin"
                    class="flex items-center mb-1"
                  >
                    <span
                      class="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full"
                    >
                      Support Team
                    </span>
                  </div>

                  <p class="text-sm md:text-base leading-relaxed break-words">
                    {{ message.message }}
                  </p>
                  <p
                    :class="[
                      'text-xs mt-2 flex items-center',
                      message.is_from_admin ? 'text-gray-500' : 'text-red-100',
                    ]"
                  >
                    <span class="mr-1">{{
                      formatTime(message.created_at)
                    }}</span>
                    <span
                      v-if="!message.is_from_admin && message.is_read"
                      class="ml-auto"
                      >✓✓</span
                    >
                    <span v-else-if="!message.is_from_admin" class="ml-auto"
                      >✓</span
                    >
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="sendingMessage" class="flex justify-end">
            <div
              class="bg-red-600 text-white px-3 md:px-4 py-2 md:py-3 rounded-2xl max-w-xs"
            >
              <div class="flex items-center space-x-1">
                <div class="flex space-x-1">
                  <div
                    class="w-2 h-2 bg-white rounded-full animate-bounce"
                  ></div>
                  <div
                    class="w-2 h-2 bg-white rounded-full animate-bounce"
                    style="animation-delay: 0.1s"
                  ></div>
                  <div
                    class="w-2 h-2 bg-white rounded-full animate-bounce"
                    style="animation-delay: 0.2s"
                  ></div>
                </div>
                <span class="text-xs ml-2">Sending...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Container -->
    <div
      class="fixed bottom-15 mt-4 left-0 py-4 right-0 bg-white border-t border-gray-200 p-3 md:p-4 shadow-lg"
    >
      <div class="max-w-4xl mx-auto">
        <form @submit.prevent="sendMessage" class="flex space-x-2 md:space-x-3">
          <div class="flex-1 relative">
            <textarea
              v-model="inputText"
              @keydown.enter.prevent="!sendingMessage && sendMessage()"
              placeholder="Type your message here..."
              :disabled="sendingMessage"
              class="w-full border border-gray-300 rounded-2xl px-4 md:px-5 py-3 md:py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:opacity-50 text-sm md:text-base"
              rows="1"
              maxlength="1000"
              style="min-height: 44px; max-height: 120px"
            ></textarea>
            <div class="absolute bottom-2 right-2 text-xs text-gray-400">
              {{ inputText.length }}/1000
            </div>
          </div>
          <button
            type="submit"
            :disabled="!inputText.trim() || sendingMessage"
            :class="[
              'px-4 md:px-6 py-2 md:py-3 rounded-2xl font-semibold transition-all transform min-w-[80px] md:min-w-[100px]',
              inputText.trim() && !sendingMessage
                ? 'bg-red-600 text-white hover:bg-red-700 hover:scale-105 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed',
            ]"
          >
            <span
              v-if="sendingMessage"
              class="flex items-center justify-center"
            >
              <div
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
              ></div>
            </span>
            <span v-else class="text-sm md:text-base">Send</span>
          </button>
        </form>

        <!-- Quick Actions -->
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNav :current-tab="currentTab" @tab-change="setActiveTab" />
  </div>
</template>

<style scoped>
/* Custom scrollbar for messages */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Message animations */
.message-group {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Auto-resize textarea */
textarea {
  resize: none;
  overflow-y: auto;
}

/* Hover effects */
.message-bubble {
  transition: all 0.2s ease;
}

.message-bubble:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Focus states */
textarea:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Loading animation */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Quick actions hover */
.quick-action {
  transition: all 0.2s ease;
}

.quick-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
