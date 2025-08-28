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
const refreshing = ref(false);
const unreadCount = ref(0);
const pollInterval = ref(null);

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

  // Poll for new messages every 10 seconds
  pollInterval.value = setInterval(() => {
    loadMessages();
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
  const messagesContainer = document.querySelector(".messages-container");
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
};

// Load messages whenever messages array changes
const stopWatcher = watchEffect(() => {
  if (messages.value.length > 0) {
    setTimeout(scrollToBottom, 100);
  }
});

const loadMessages = async () => {
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
    }
  } catch (error) {
    console.error("Error loading messages:", error);
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
  if (inputText.value.trim() === "" || isLoading.value) return;

  try {
    isLoading.value = true;
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
        message: inputText.value.trim(),
      }),
    });

    const data = await response.json();
    if (response.ok && data.success) {
      inputText.value = "";
      // Add the new message to the list immediately for better UX
      messages.value.push(data.data);
      // Reload all messages to ensure consistency
      loadMessages();
    } else {
      alert("Failed to send message. Please try again.");
    }
  } catch (error) {
    alert("Failed to send message. Please try again.");
    console.error("Error sending message:", error);
  } finally {
    isLoading.value = false;
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
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Header -->
    <div class="bg-red-600 text-white p-4 shadow-lg">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-xl font-bold">🍁 Canada Jobs</h1>
          <p class="text-red-100 text-sm">Support Chat</p>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="logout"
            class="bg-red-700 hover:bg-red-800 px-3 py-2 rounded-lg transition-colors text-sm"
          >
            Logout
          </button>
          <div v-if="unreadCount > 0" class="bg-red-700 rounded-full px-2 py-1">
            <span class="text-xs font-bold text-white">{{ unreadCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages Container -->
    <div class="flex-1 px-4 py-4 overflow-hidden">
      <div
        class="messages-container h-96 overflow-y-auto space-y-4"
        @scroll="onRefresh"
      >
        <div v-if="messages.length === 0" class="text-center py-8">
          <p class="text-gray-500 text-lg">
            Welcome to support chat! Send a message to get started.
          </p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="(message, index) in messages"
            :key="message.id"
            class="message-group"
          >
            <!-- Date Separator -->
            <div v-if="shouldShowDate(index)" class="text-center my-4">
              <span
                class="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs"
              >
                {{ formatDate(message.created_at) }}
              </span>
            </div>

            <!-- Message Bubble -->
            <div
              :class="[
                'message-bubble max-w-xs px-4 py-2 rounded-lg',
                message.is_from_admin
                  ? 'bg-white border border-gray-200 self-start'
                  : 'bg-blue-500 text-white self-end',
              ]"
            >
              <p class="text-sm leading-relaxed">{{ message.message }}</p>
              <p
                :class="[
                  'text-xs mt-1',
                  message.is_from_admin ? 'text-gray-500' : 'text-blue-100',
                ]"
              >
                {{ formatTime(message.created_at) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Container -->
    <div
      class="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4"
    >
      <div class="flex space-x-2">
        <textarea
          v-model="inputText"
          @keydown.enter.prevent="sendMessage"
          placeholder="Type your message..."
          :disabled="isLoading"
          class="flex-1 border border-gray-300 rounded-full px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="1"
          maxlength="1000"
        ></textarea>
        <button
          @click="sendMessage"
          :disabled="!inputText.trim() || isLoading"
          :class="[
            'px-6 py-2 rounded-full font-semibold transition-colors',
            inputText.trim() && !isLoading
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed',
          ]"
        >
          <span v-if="isLoading">Sending...</span>
          <span v-else>Send</span>
        </button>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNav :current-tab="currentTab" @tab-change="setActiveTab" />
  </div>
</template>

<style scoped>
.messages-container {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: #f7fafc;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.message-bubble {
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.self-start {
  align-self: flex-start;
}

.self-end {
  align-self: flex-end;
}
</style>
