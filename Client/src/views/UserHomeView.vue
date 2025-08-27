<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const user = ref(null);

onMounted(() => {
  // Get user data from localStorage
  const userData = localStorage.getItem("userData");
  if (userData) {
    user.value = JSON.parse(userData);
  } else {
    // Redirect to login if no user data
    router.push("/login");
  }
});

function logout() {
  localStorage.removeItem("userToken");
  localStorage.removeItem("userData");
  router.push("/");
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <div class="bg-red-600 text-white p-4">
      <div class="flex justify-between items-center">
        <h1 class="text-xl font-bold">CanadaApp - User Dashboard</h1>
        <button
          @click="logout"
          class="bg-red-700 hover:bg-red-800 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto p-4">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-semibold mb-4">
          Welcome, {{ user?.first_name }}!
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Profile Card -->
          <div class="bg-blue-50 p-4 rounded-lg">
            <h3 class="font-semibold text-blue-800 mb-2">Profile</h3>
            <p class="text-sm text-gray-600">
              View and edit your profile information
            </p>
          </div>

          <!-- Job Applications -->
          <div class="bg-green-50 p-4 rounded-lg">
            <h3 class="font-semibold text-green-800 mb-2">Job Applications</h3>
            <p class="text-sm text-gray-600">Track your job applications</p>
          </div>

          <!-- Payments -->
          <div class="bg-yellow-50 p-4 rounded-lg">
            <h3 class="font-semibold text-yellow-800 mb-2">Payments</h3>
            <p class="text-sm text-gray-600">Manage your payments</p>
          </div>

          <!-- Chat -->
          <div class="bg-purple-50 p-4 rounded-lg">
            <h3 class="font-semibold text-purple-800 mb-2">Support Chat</h3>
            <p class="text-sm text-gray-600">Get help from our support team</p>
          </div>
        </div>

        <!-- User Info -->
        <div class="mt-6 bg-gray-50 p-4 rounded-lg" v-if="user">
          <h3 class="font-semibold mb-2">Your Information</h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium">Name:</span> {{ user.first_name }}
              {{ user.last_name }}
            </div>
            <div><span class="font-medium">Phone:</span> {{ user.phone }}</div>
            <div>
              <span class="font-medium">Status:</span>
              <span
                class="px-2 py-1 rounded text-xs"
                :class="
                  user.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                "
              >
                {{ user.status }}
              </span>
            </div>
            <div v-if="user.job_preferences?.length">
              <span class="font-medium">Job Preferences:</span>
              <span
                v-for="(pref, index) in user.jobPreferences"
                :key="index"
                class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1"
              >
                {{ pref.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
