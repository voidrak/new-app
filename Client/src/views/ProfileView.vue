<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import BottomNav from "../components/BottomNav.vue";

const router = useRouter();
const user = ref(null);
const loading = ref(true);
const logoutLoading = ref(false);
const currentTab = ref("profile");

onMounted(() => {
  loadUserProfile();
});

const loadUserProfile = async () => {
  try {
    const token = localStorage.getItem("userToken");
    if (!token) {
      router.push("/login");
      return;
    }

    const response = await fetch("https://canada.rohatechs.com/api/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok && data.user) {
      user.value = data.user;

      // Check if user status is pending and redirect to pending approval page
      if (data.user.status === "pending") {
        router.push("/pending-approval");
        return;
      }
    } else {
      throw new Error("Failed to load user profile");
    }
  } catch (error) {
    console.error("Failed to load user profile:", error);
    alert("Failed to load profile. Please try logging in again.");
    localStorage.removeItem("userToken");
    router.push("/login");
  } finally {
    loading.value = false;
  }
};

const doLogout = async () => {
  try {
    logoutLoading.value = true;
    const token = localStorage.getItem("userToken");
    if (token) {
      try {
        await fetch("https://canada.rohatechs.com/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.log(
          "Logout API failed, but continuing with local logout:",
          error
        );
      }
    }

    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    router.push("/login");
  } catch (error) {
    console.error("Logout error:", error);
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    router.push("/login");
  } finally {
    logoutLoading.value = false;
  }
};

const handleLogout = () => {
  if (confirm("Are you sure you want to logout?")) {
    doLogout();
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case "approved":
      return "#10b981"; // Green
    case "pending":
      return "#f59e0b"; // Yellow
    default:
      return "#6b7280"; // Gray
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "approved":
      return "Approved";
    case "pending":
      return "Pending Review";
    default:
      return "Unknown";
  }
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
    router.push("/chat");
  } else if (tab === "profile") {
    // Already on profile page
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
  <div class="min-h-screen bg-white pb-20">
    <!-- Header -->
    <div class="bg-red-600 text-white p-4 shadow-lg">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-xl font-bold">🍁 Canada Jobs</h1>
          <p class="text-red-100 text-sm">Profile</p>
        </div>
        <button
          @click="handleLogout"
          :disabled="logoutLoading"
          class="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors text-sm disabled:opacity-50"
        >
          <span v-if="logoutLoading" class="flex items-center">
            <div
              class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"
            ></div>
            Logging out...
          </span>
          <span v-else>Logout</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex items-center justify-center px-4">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">Loading profile...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="!user" class="flex-1 flex items-center justify-center px-4">
      <div class="text-center">
        <p class="text-red-600 text-lg mb-4">Failed to load profile</p>
        <button
          @click="loadUserProfile"
          class="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>

    <!-- Profile Content -->
    <div v-else class="flex-1 overflow-y-auto px-4 py-6">
      <!-- Profile Image Section -->
      <div class="text-center mb-8">
        <div v-if="user.profile_image" class="mb-4">
          <img
            :src="user.profile_image"
            alt="Profile"
            class="w-32 h-32 rounded-full mx-auto object-cover border-4 border-red-100"
          />
        </div>
        <div
          v-else
          class="w-32 h-32 bg-red-600 rounded-full mx-auto mb-4 flex items-center justify-center"
        >
          <span class="text-white text-3xl font-bold">
            {{ user.first_name?.charAt(0) }}{{ user.last_name?.charAt(0) }}
          </span>
        </div>
        <h2 class="text-2xl font-bold text-red-600 mb-2">
          {{ user.first_name }} {{ user.middle_name }} {{ user.last_name }}
        </h2>
        <div
          class="inline-block px-4 py-2 rounded-full text-white text-sm font-semibold"
          :style="{ backgroundColor: getStatusColor(user.status) }"
        >
          {{ getStatusText(user.status) }}
        </div>
      </div>

      <!-- Personal Information -->
      <div class="mb-8">
        <h3 class="text-xl font-bold text-red-600 mb-4">
          Personal Information
        </h3>
        <div class="space-y-3">
          <div
            class="flex justify-between items-center py-3 border-b border-gray-200"
          >
            <span class="text-gray-600 font-medium">Phone Number</span>
            <span class="text-red-600 font-semibold">{{ user.phone }}</span>
          </div>

          <div
            v-if="user.dob"
            class="flex justify-between items-center py-3 border-b border-gray-200"
          >
            <span class="text-gray-600 font-medium">Date of Birth</span>
            <span class="text-red-600 font-semibold">{{
              formatDate(user.dob)
            }}</span>
          </div>

          <div
            v-if="user.address"
            class="flex justify-between items-center py-3 border-b border-gray-200"
          >
            <span class="text-gray-600 font-medium">Address</span>
            <span class="text-red-600 font-semibold">{{ user.address }}</span>
          </div>

          <div
            class="flex justify-between items-center py-3 border-b border-gray-200"
          >
            <span class="text-gray-600 font-medium">Member Since</span>
            <span class="text-red-600 font-semibold">{{
              formatDate(user.created_at)
            }}</span>
          </div>
        </div>
      </div>

      <!-- Job Preferences -->
      <div
        v-if="user.jobPreferences && user.jobPreferences.length > 0"
        class="mb-8"
      >
        <h3 class="text-xl font-bold text-red-600 mb-4">Job Preferences</h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="pref in user.jobPreferences"
            :key="pref.id"
            class="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium"
          >
            {{ pref.name }}
          </span>
        </div>
      </div>

      <!-- Documents -->
      <div class="mb-8">
        <h3 class="text-xl font-bold text-red-600 mb-4">Documents</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 class="font-semibold text-gray-800 mb-2">Profile Image</h4>
            <span
              :class="[
                'text-sm font-semibold',
                user.profile_image ? 'text-green-600' : 'text-red-600',
              ]"
            >
              {{ user.profile_image ? "✓ Uploaded" : "Not uploaded" }}
            </span>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 class="font-semibold text-gray-800 mb-2">Passport</h4>
            <span
              :class="[
                'text-sm font-semibold',
                user.passport_image ? 'text-green-600' : 'text-red-600',
              ]"
            >
              {{ user.passport_image ? "✓ Uploaded" : "Not uploaded" }}
            </span>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 class="font-semibold text-gray-800 mb-2">Grade 8 Card</h4>
            <span
              :class="[
                'text-sm font-semibold',
                user.grade8_card_image ? 'text-green-600' : 'text-red-600',
              ]"
            >
              {{ user.grade8_card_image ? "✓ Uploaded" : "Not uploaded" }}
            </span>
          </div>
        </div>
      </div>

      <!-- Account Actions -->
      <div class="mb-8">
        <h3 class="text-xl font-bold text-red-600 mb-4">Account</h3>
        <div class="space-y-3">
          <button
            @click="
              () =>
                alert(
                  'Coming Soon: Edit profile functionality will be available soon.'
                )
            "
            class="w-full flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <span class="font-semibold text-gray-800">Edit Profile</span>
            <span class="text-gray-500 text-xl">›</span>
          </button>

          <button
            @click="
              () =>
                alert(
                  'Coming Soon: Change password functionality will be available soon.'
                )
            "
            class="w-full flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <span class="font-semibold text-gray-800">Change Password</span>
            <span class="text-gray-500 text-xl">›</span>
          </button>

          <button
            @click="handleLogout"
            :disabled="logoutLoading"
            class="w-full flex justify-between items-center bg-red-50 p-4 rounded-lg border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <span
              v-if="logoutLoading"
              class="flex items-center font-semibold text-red-600"
            >
              <div
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"
              ></div>
              Logging out...
            </span>
            <span v-else class="font-semibold text-red-600">Logout</span>
            <span class="text-red-500 text-xl">›</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNav :current-tab="currentTab" @tab-change="setActiveTab" />
  </div>
</template>
