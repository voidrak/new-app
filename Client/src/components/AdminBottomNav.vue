<script setup>
const props = defineProps({
  currentTab: {
    type: String,
    default: "home",
  },
});

const emit = defineEmits(["tab-change"]);

function handleTabClick(tab) {
  emit("tab-change", tab);
}
</script>

<template>
  <!-- Admin Bottom Navigation -->
  <div
    class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-3 py-2 shadow-lg"
  >
    <div class="flex justify-around items-center">
      <button
        @click="handleTabClick('home')"
        :class="[
          'flex flex-col items-center py-1.5 px-2 rounded-lg transition-all duration-300',
          currentTab === 'home'
            ? 'bg-red-600 text-white transform scale-105'
            : 'text-gray-400',
        ]"
      >
        <svg
          class="w-5 h-5 mb-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m3 12 2-2m0 0 7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11 2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6"
          />
        </svg>
        <span class="text-xs font-medium">Home</span>
      </button>

      <button
        @click="handleTabClick('job')"
        :class="[
          'flex flex-col items-center py-1.5 px-2 rounded-lg transition-all duration-300',
          currentTab === 'job'
            ? 'bg-red-600 text-white transform scale-105'
            : 'text-gray-400',
        ]"
      >
        <svg
          class="w-5 h-5 mb-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span class="text-xs font-medium">Job</span>
      </button>

      <button
        @click="handleTabClick('chat')"
        :class="[
          'flex flex-col items-center py-1.5 px-2 rounded-lg transition-all duration-300',
          currentTab === 'chat'
            ? 'bg-red-600 text-white transform scale-105'
            : 'text-gray-400',
        ]"
      >
        <svg
          class="w-5 h-5 mb-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span class="text-xs font-medium">Chat</span>
      </button>

      <button
        @click="handleTabClick('users')"
        :class="[
          'flex flex-col items-center py-1.5 px-2 rounded-lg transition-all duration-300',
          currentTab === 'users'
            ? 'bg-red-600 text-white transform scale-105'
            : 'text-gray-400',
        ]"
      >
        <svg
          class="w-5 h-5 mb-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
        <span class="text-xs font-medium">Users</span>
      </button>

      <button
        @click="handleTabClick('payment')"
        :class="[
          'flex flex-col items-center py-1.5 px-2 rounded-lg transition-all duration-300',
          currentTab === 'payment'
            ? 'bg-red-600 text-white transform scale-105'
            : 'text-gray-400',
        ]"
      >
        <svg
          class="w-5 h-5 mb-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
        <span class="text-xs font-medium">Payment</span>
      </button>
    </div>
  </div>
</template>
