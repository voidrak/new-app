<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import AdminBottomNav from "../components/AdminBottomNav.vue";

const router = useRouter();
const currentTab = ref("chat");
const user = ref(null);
const conversations = ref([]);
const selectedConversation = ref(null);
const messages = ref([]);
const newMessage = ref("");
const loading = ref(false);
const messagesLoading = ref(false);
const messagesContainer = ref(null);

onMounted(() => {
  // Get user data from localStorage
  const userData = localStorage.getItem("userData");
  if (userData) {
    user.value = JSON.parse(userData);
    // Check if user is actually an admin
    if (!user.value.is_admin && user.value.role !== "admin") {
      router.push("/user-home");
    }
  } else {
    // Redirect to login if no user data
    router.push("/login");
  }

  loadConversations();
});

const loadConversations = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem("userToken");
    const response = await fetch(
      "https://canada.rohatechs.com/api/admin/chat/conversations",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    const data = await response.json();
    if (response.ok && data.success) {
      conversations.value = data.data || [];
    } else {
      console.error("Failed to load conversations:", data.message);
    }
  } catch (error) {
    console.error("Error loading conversations:", error);
  } finally {
    loading.value = false;
  }
};

const selectConversation = async (conversation) => {
  selectedConversation.value = conversation;
  await loadMessages(conversation.user_id);
};

const loadMessages = async (userId) => {
  messagesLoading.value = true;
  try {
    const token = localStorage.getItem("userToken");
    const response = await fetch(
      `https://canada.rohatechs.com/api/admin/chat/messages/${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    const data = await response.json();
    if (response.ok && data.success) {
      messages.value = data.data.messages || [];
      await nextTick();
      scrollToBottom();
      // Update unread count for this conversation
      const conversationIndex = conversations.value.findIndex(
        (conv) => conv.user_id === userId
      );
      if (conversationIndex !== -1) {
        conversations.value[conversationIndex].unread_count = 0;
      }
    } else {
      console.error("Failed to load messages:", data.message);
    }
  } catch (error) {
    console.error("Error loading messages:", error);
  } finally {
    messagesLoading.value = false;
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedConversation.value) return;

  const messageText = newMessage.value.trim();
  newMessage.value = "";

  try {
    const token = localStorage.getItem("userToken");
    const response = await fetch(
      `https://canada.rohatechs.com/api/admin/chat/send/${selectedConversation.value.user_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ message: messageText }),
      }
    );

    const data = await response.json();
    if (response.ok && data.success) {
      // Add the message to the messages array
      messages.value.push(data.data);
      await nextTick();
      scrollToBottom();

      // Update conversation list
      await loadConversations();
    } else {
      alert("Failed to send message: " + (data.message || "Unknown error"));
      newMessage.value = messageText; // Restore message if failed
    }
  } catch (error) {
    console.error("Error sending message:", error);
    alert("Error sending message: " + error.message);
    newMessage.value = messageText; // Restore message if failed
  }
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const goBackToConversations = () => {
  selectedConversation.value = null;
  messages.value = [];
};

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString();
};

const handleTabChange = (tab) => {
  currentTab.value = tab;
  if (tab === "home") {
    router.push("/admin-home");
  } else if (tab === "job") {
    router.push("/admin-job-app");
  } else if (tab === "users") {
    router.push("/admin-users");
  } else if (tab === "payment") {
    router.push("/admin-payment");
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
    <div class="bg-red-600 text-white p-3 md:p-4 shadow-lg">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <button
            v-if="selectedConversation"
            @click="goBackToConversations"
            class="text-white hover:bg-red-700 p-2 rounded-lg transition-colors"
          >
            ← Back
          </button>
          <h1 class="text-lg md:text-xl font-bold">
            {{
              selectedConversation
                ? selectedConversation.user_name
                : "Admin Chat"
            }}
          </h1>
        </div>
        <button
          @click="logout"
          class="bg-red-700 hover:bg-red-800 px-3 py-1.5 md:px-4 md:py-2 rounded text-xs md:text-sm"
        >
          Logout
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex h-[calc(100vh-140px)] md:h-[calc(100vh-120px)]">
      <!-- Conversations List -->
      <div
        v-if="!selectedConversation"
        class="w-full bg-white border-r border-gray-200"
      >
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-8">
          <div
            class="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-red-600"
          ></div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="conversations.length === 0"
          class="flex items-center justify-center h-full"
        >
          <div class="text-center p-4">
            <div class="text-4xl md:text-6xl mb-4">👥</div>
            <h3 class="text-lg md:text-xl font-semibold text-gray-700 mb-2">
              No conversations yet
            </h3>
            <p class="text-sm md:text-base text-gray-500">
              Users will appear here when they start chatting
            </p>
          </div>
        </div>

        <!-- Conversations List -->
        <div v-else class="overflow-y-auto h-full">
          <div class="p-3 md:p-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-800">Conversations</h2>
            <p class="text-sm text-gray-600">
              {{ conversations.length }} active chats
            </p>
          </div>

          <div class="space-y-1">
            <div
              v-for="conversation in conversations"
              :key="conversation.user_id"
              @click="selectConversation(conversation)"
              class="p-3 md:p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center space-x-2">
                    <h3
                      class="font-semibold text-gray-900 text-sm md:text-base"
                    >
                      {{ conversation.user_name }}
                    </h3>
                    <span
                      v-if="conversation.unread_count > 0"
                      class="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center"
                    >
                      {{ conversation.unread_count }}
                    </span>
                  </div>
                  <p class="text-xs md:text-sm text-gray-600 mt-1">
                    {{ conversation.user_phone }}
                  </p>
                  <p
                    v-if="conversation.last_message"
                    class="text-xs md:text-sm text-gray-500 mt-1 line-clamp-2"
                  >
                    {{ conversation.last_message }}
                  </p>
                </div>
                <div class="text-xs text-gray-400 ml-2">
                  {{
                    conversation.last_message_time
                      ? formatTime(conversation.last_message_time)
                      : ""
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Messages -->
      <div v-if="selectedConversation" class="flex-1 flex flex-col bg-white">
        <!-- Messages Loading -->
        <div
          v-if="messagesLoading"
          class="flex justify-center items-center py-8"
        >
          <div
            class="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-red-600"
          ></div>
        </div>

        <!-- Messages Container -->
        <div
          v-else
          ref="messagesContainer"
          class="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4"
        >
          <div
            v-for="message in messages"
            :key="message.id"
            :class="[
              'flex',
              message.is_from_admin ? 'justify-end' : 'justify-start',
            ]"
          >
            <div
              :class="[
                'max-w-xs md:max-w-md px-3 md:px-4 py-2 rounded-lg text-sm md:text-base',
                message.is_from_admin
                  ? 'bg-red-600 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none',
              ]"
            >
              <p class="break-words">{{ message.message }}</p>
              <p
                :class="[
                  'text-xs mt-1',
                  message.is_from_admin ? 'text-red-100' : 'text-gray-500',
                ]"
              >
                {{ formatTime(message.created_at) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Message Input -->
        <div class="border-t border-gray-200 p-3 md:p-4">
          <form @submit.prevent="sendMessage" class="flex space-x-2">
            <input
              v-model="newMessage"
              type="text"
              placeholder="Type your message..."
              class="flex-1 border border-gray-300 rounded-lg px-3 md:px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              :disabled="messagesLoading"
            />
            <button
              type="submit"
              :disabled="!newMessage.trim() || messagesLoading"
              class="bg-red-600 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Admin Bottom Navigation -->
    <AdminBottomNav :current-tab="currentTab" @tab-change="handleTabChange" />
  </div>
</template>
