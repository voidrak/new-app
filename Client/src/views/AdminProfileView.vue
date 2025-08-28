<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import AdminBottomNav from "../components/AdminBottomNav.vue";

const router = useRouter();
const currentTab = ref("profile");
const user = ref(null);
const loading = ref(false);
const editing = ref(false);
const formData = ref({
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
});

onMounted(() => {
  // Get user data from localStorage
  const userData = localStorage.getItem("userData");
  if (userData) {
    user.value = JSON.parse(userData);
    // Check if user is actually an admin
    if (!user.value.is_admin && user.value.role !== "admin") {
      router.push("/user-home");
    }

    // Populate form data
    formData.value = {
      first_name: user.value.first_name || "",
      last_name: user.value.last_name || "",
      email: user.value.email || "",
      phone: user.value.phone || "",
    };
  } else {
    // Redirect to login if no user data
    router.push("/login");
  }
});

const handleTabChange = (tab) => {
  currentTab.value = tab;
  if (tab === "home") {
    router.push("/admin-home");
  } else if (tab === "job") {
    router.push("/admin-job-app");
  } else if (tab === "chat") {
    router.push("/admin-chat");
  } else if (tab === "payment") {
    router.push("/admin-payment");
  }
};

const startEditing = () => {
  editing.value = true;
};

const cancelEditing = () => {
  editing.value = false;
  // Reset form data
  formData.value = {
    first_name: user.value.first_name || "",
    last_name: user.value.last_name || "",
    email: user.value.email || "",
    phone: user.value.phone || "",
  };
};

const saveProfile = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem("userToken");
    const response = await fetch(
      "https://canada.rohatechs.com/api/admin/profile",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(formData.value),
      }
    );

    const data = await response.json();
    if (response.ok && data.success) {
      // Update local storage
      const updatedUser = { ...user.value, ...formData.value };
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      user.value = updatedUser;

      editing.value = false;
      alert("Profile updated successfully!");
    } else {
      alert("Failed to update profile: " + (data.message || "Unknown error"));
    }
  } catch (error) {
    alert("Error updating profile: " + error.message);
  } finally {
    loading.value = false;
  }
};

const logout = () => {
  localStorage.removeItem("userToken");
  localStorage.removeItem("userData");
  router.push("/");
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 pb-20">
    <!-- Header -->
    <div class="bg-red-600 text-white p-4">
      <div class="flex justify-between items-center">
        <h1 class="text-xl font-bold">Admin Profile</h1>
        <button
          @click="logout"
          class="bg-red-700 hover:bg-red-800 px-4 py-2 rounded text-sm"
        >
          Logout
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto p-4">
      <div class="max-w-md mx-auto">
        <div class="bg-white rounded-lg shadow p-6">
          <!-- Profile Header -->
          <div class="text-center mb-6">
            <div
              class="w-24 h-24 bg-red-600 rounded-full mx-auto mb-4 flex items-center justify-center"
            >
              <span class="text-3xl text-white font-bold">
                {{ user?.first_name?.charAt(0)
                }}{{ user?.last_name?.charAt(0) }}
              </span>
            </div>
            <h2 class="text-xl font-semibold">
              {{ user?.first_name }} {{ user?.last_name }}
            </h2>
            <p class="text-gray-500">Administrator</p>
          </div>

          <!-- Profile Form -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                v-model="formData.first_name"
                :disabled="!editing"
                type="text"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                v-model="formData.last_name"
                :disabled="!editing"
                type="text"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                v-model="formData.email"
                :disabled="!editing"
                type="email"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                v-model="formData.phone"
                :disabled="!editing"
                type="tel"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 disabled:bg-gray-100"
              />
            </div>

            <div class="pt-4">
              <p class="text-sm text-gray-500 mb-2">
                <strong>Account Status:</strong> {{ user?.status || "Active" }}
              </p>
              <p class="text-sm text-gray-500 mb-2">
                <strong>Member Since:</strong>
                {{
                  user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "N/A"
                }}
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-6 space-y-3">
            <div v-if="!editing" class="flex space-x-3">
              <button
                @click="startEditing"
                class="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Edit Profile
              </button>
            </div>

            <div v-else class="flex space-x-3">
              <button
                @click="cancelEditing"
                class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="saveProfile"
                :disabled="loading"
                class="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <span v-if="loading">Saving...</span>
                <span v-else>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Bottom Navigation -->
    <AdminBottomNav :current-tab="currentTab" @tab-change="handleTabChange" />
  </div>
</template>
