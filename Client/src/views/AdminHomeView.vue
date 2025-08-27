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
    // Check if user is actually an admin
    if (!user.value.is_admin && user.value.role !== "admin") {
      router.push("/user-home");
    }
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
        <h1 class="text-xl font-bold">CanadaApp - Admin Dashboard</h1>
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
          Welcome Admin, {{ user?.first_name }}!
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Users Management -->
          <div class="bg-blue-50 p-4 rounded-lg">
            <h3 class="font-semibold text-blue-800 mb-2">Users</h3>
            <p class="text-sm text-gray-600">
              Manage user accounts and approvals
            </p>
          </div>

          <!-- Job Applications -->
          <div class="bg-green-50 p-4 rounded-lg">
            <h3 class="font-semibold text-green-800 mb-2">Job Applications</h3>
            <p class="text-sm text-gray-600">Review and manage applications</p>
          </div>

          <!-- Payments -->
          <div class="bg-yellow-50 p-4 rounded-lg">
            <h3 class="font-semibold text-yellow-800 mb-2">Payments</h3>
            <p class="text-sm text-gray-600">Approve and manage payments</p>
          </div>

          <!-- Support Chat -->
          <div class="bg-purple-50 p-4 rounded-lg">
            <h3 class="font-semibold text-purple-800 mb-2">Support Chat</h3>
            <p class="text-sm text-gray-600">Manage user support requests</p>
          </div>

          <!-- Dashboard Stats -->
          <div class="bg-indigo-50 p-4 rounded-lg">
            <h3 class="font-semibold text-indigo-800 mb-2">Dashboard</h3>
            <p class="text-sm text-gray-600">View system statistics</p>
          </div>

          <!-- CBE Account -->
          <div class="bg-orange-50 p-4 rounded-lg">
            <h3 class="font-semibold text-orange-800 mb-2">CBE Account</h3>
            <p class="text-sm text-gray-600">Manage bank account settings</p>
          </div>
        </div>

        <!-- Admin Info -->
        <div class="mt-6 bg-gray-50 p-4 rounded-lg" v-if="user">
          <h3 class="font-semibold mb-2">Admin Information</h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium">Name:</span> {{ user.first_name }}
              {{ user.last_name }}
            </div>
            <div><span class="font-medium">Phone:</span> {{ user.phone }}</div>
            <div>
              <span class="font-medium">Role:</span>
              <span class="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                Administrator
              </span>
            </div>
            <div>
              <span class="font-medium">Status:</span>
              <span
                class="px-2 py-1 rounded text-xs bg-green-100 text-green-800"
              >
                {{ user.status || "Active" }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
