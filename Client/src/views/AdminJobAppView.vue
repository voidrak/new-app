<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import AdminBottomNav from "../components/AdminBottomNav.vue";

const router = useRouter();
const currentTab = ref("job");
const user = ref(null);
const jobApplications = ref([]);
const loading = ref(false);

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

  loadJobApplications();
});

const loadJobApplications = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem("userToken");
    const response = await fetch(
      "https://canada.rohatechs.com/api/admin/job-applications",
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
      jobApplications.value = data.data || [];
      console.log("Loaded job applications:", jobApplications.value);
    } else {
      console.error("Failed to load job applications:", data.message);
    }
  } catch (error) {
    console.error("Error loading job applications:", error);
  } finally {
    loading.value = false;
  }
};

const approveApplication = async (applicationId) => {
  if (!confirm("Are you sure you want to approve this job application?")) {
    return;
  }

  try {
    const token = localStorage.getItem("userToken");
    const response = await fetch(
      `https://canada.rohatechs.com/api/admin/job-applications/${applicationId}/paid`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    const data = await response.json();
    if (response.ok && data.success) {
      alert("✅ Job application approved successfully!");
      await loadJobApplications(); // Refresh the list
    } else {
      alert(
        "❌ Failed to approve application: " + (data.message || "Unknown error")
      );
    }
  } catch (error) {
    console.error("Error approving application:", error);
    alert("❌ Error approving application: " + error.message);
  }
};

const deleteApplication = async (applicationId) => {
  if (
    !confirm(
      "Are you sure you want to delete this job application? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    const token = localStorage.getItem("userToken");
    const response = await fetch(
      `https://canada.rohatechs.com/api/admin/job-applications/${applicationId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (response.ok) {
      alert("✅ Job application deleted successfully!");
      await loadJobApplications(); // Refresh the list
    } else {
      const data = await response.json();
      alert(
        "❌ Failed to delete application: " + (data.message || "Unknown error")
      );
    }
  } catch (error) {
    console.error("Error deleting application:", error);
    alert("❌ Error deleting application: " + error.message);
  }
};

const getUserFullName = (user) => {
  if (!user) return "Unknown User";
  const parts = [user.first_name, user.middle_name, user.last_name].filter(
    Boolean
  );
  return parts.join(" ");
};

const handleTabChange = (tab) => {
  currentTab.value = tab;
  if (tab === "home") {
    router.push("/admin-home");
  } else if (tab === "users") {
    router.push("/admin-users");
  } else if (tab === "chat") {
    router.push("/admin-chat");
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
  <div class="min-h-screen bg-gray-100 pb-20">
    <!-- Header -->
    <div class="bg-red-600 text-white p-4">
      <div class="flex justify-between items-center">
        <h1 class="text-xl font-bold">Job Applications</h1>
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
      <div v-if="loading" class="flex justify-center items-center py-8">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"
        ></div>
      </div>

      <div v-else-if="jobApplications.length === 0" class="text-center py-8">
        <div class="text-4xl mb-4">📋</div>
        <p class="text-gray-500">No job applications found</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="application in jobApplications"
          :key="application.id"
          class="bg-white rounded-lg shadow p-4"
        >
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-semibold text-lg">{{ application.job_title }}</h3>
            <span
              :class="[
                'px-2 py-1 rounded-full text-xs font-medium',
                !application.is_paid
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800',
              ]"
            >
              {{ !application.is_paid ? "Payment Pending" : "Paid" }}
            </span>
          </div>

          <div class="text-sm text-gray-600 mb-2">
            <p>
              <strong>Applicant:</strong>
              {{ getUserFullName(application.user) }}
            </p>
            <p>
              <strong>Phone:</strong>
              {{ application.user ? application.user.phone : "N/A" }}
            </p>
            <p><strong>Salary Range:</strong> {{ application.salary_range }}</p>
          </div>

          <div class="text-sm text-gray-600 mb-3">
            <p>
              <strong>Applied on:</strong>
              {{ new Date(application.created_at).toLocaleDateString() }}
            </p>
          </div>

          <div class="flex space-x-2">
            <button
              v-if="!application.is_paid"
              @click="approveApplication(application.id)"
              class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Approve
            </button>
            <button
              @click="deleteApplication(application.id)"
              class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Bottom Navigation -->
    <AdminBottomNav :current-tab="currentTab" @tab-change="handleTabChange" />
  </div>
</template>
