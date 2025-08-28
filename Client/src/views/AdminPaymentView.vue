<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import AdminBottomNav from "../components/AdminBottomNav.vue";

const router = useRouter();
const currentTab = ref("payment");
const user = ref(null);
const payments = ref([]);
const loading = ref(false);
const showImageModal = ref(false);
const selectedImage = ref(null);

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

  loadPayments();
});

const loadPayments = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem("userToken");
    const response = await fetch(
      "https://canada.rohatechs.com/api/admin/payments",
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
      // Filter to only show "second" type payments
      payments.value = (data.data || []).filter(
        (payment) => payment.type === "second"
      );
    } else {
      console.error("Failed to load payments:", data.message);
    }
  } catch (error) {
    console.error("Error loading payments:", error);
  } finally {
    loading.value = false;
  }
};

const approvePayment = async (paymentId) => {
  try {
    const token = localStorage.getItem("userToken");
    const response = await fetch(
      `https://canada.rohatechs.com/api/admin/payments/${paymentId}/approve`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    const data = await response.json();
    if (response.ok && data.success) {
      alert("Payment approved successfully!");
      await loadPayments(); // Reload payments
    } else {
      alert("Failed to approve payment: " + (data.message || "Unknown error"));
    }
  } catch (error) {
    alert("Error approving payment: " + error.message);
  }
};

const rejectPayment = async (paymentId) => {
  const reason = prompt("Please provide a reason for rejection:");
  if (!reason) return;

  try {
    const token = localStorage.getItem("userToken");
    const response = await fetch(
      `https://canada.rohatechs.com/api/admin/payments/${paymentId}/reject`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ reason }),
      }
    );

    const data = await response.json();
    if (response.ok && data.success) {
      alert("Payment rejected successfully!");
      await loadPayments(); // Reload payments
    } else {
      alert("Failed to reject payment: " + (data.message || "Unknown error"));
    }
  } catch (error) {
    alert("Error rejecting payment: " + error.message);
  }
};

const handleTabChange = (tab) => {
  currentTab.value = tab;
  if (tab === "home") {
    router.push("/admin-home");
  } else if (tab === "job") {
    router.push("/admin-job-app");
  } else if (tab === "users") {
    router.push("/admin-users");
  } else if (tab === "chat") {
    router.push("/admin-chat");
  }
};

const logout = () => {
  localStorage.removeItem("userToken");
  localStorage.removeItem("userData");
  router.push("/");
};

const openImageModal = (imageUrl) => {
  selectedImage.value = imageUrl;
  showImageModal.value = true;
};

const closeImageModal = () => {
  showImageModal.value = false;
  selectedImage.value = null;
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 pb-20">
    <!-- Header -->
    <div class="bg-red-600 text-white p-3 md:p-4">
      <div class="flex justify-between items-center">
        <h1 class="text-lg md:text-xl font-bold">Payment Management</h1>
        <button
          @click="logout"
          class="bg-red-700 hover:bg-red-800 px-3 py-1.5 md:px-4 md:py-2 rounded text-xs md:text-sm"
        >
          Logout
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto p-3 md:p-4">
      <div v-if="loading" class="flex justify-center items-center py-6 md:py-8">
        <div
          class="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600"
        ></div>
      </div>

      <div v-else-if="payments.length === 0" class="text-center py-6 md:py-8">
        <div class="text-3xl md:text-4xl mb-3 md:mb-4">💳</div>
        <p class="text-gray-500 text-sm md:text-base">
          No payment submissions found
        </p>
      </div>

      <div v-else class="space-y-3 md:space-y-4">
        <div
          v-for="payment in payments"
          :key="payment.id"
          class="bg-white rounded-lg shadow p-3 md:p-4"
        >
          <div
            class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2"
          >
            <div class="flex-1">
              <div class="flex items-center gap-x-4">
                <h3 class="font-semibold text-base md:text-lg">
                  {{
                    payment.user
                      ? `${payment.user.first_name} ${payment.user.last_name}`
                      : "Unknown User"
                  }}
                </h3>
                <p class="text-sm text-gray-600">
                  {{ payment.user ? payment.user.phone : "N/A" }}
                </p>
              </div>
              <p class="text-sm text-gray-600 mt-2">
                <strong>Payment Status:</strong>
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium mt-1 inline-block',
                    payment.user && payment.user.paid === 'onprogress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800',
                  ]"
                >
                  {{
                    payment.user && payment.user.paid === "onprogress"
                      ? "In Progress"
                      : "Completed"
                  }}
                </span>
              </p>
            </div>
          </div>

          <div class="mb-3">
            <p class="text-sm text-gray-600 mb-2">
              <strong>Submitted:</strong>
              {{ new Date(payment.created_at).toLocaleDateString() }}
            </p>
            <p class="text-sm text-gray-600 mb-2">
              <strong>Type:</strong>
              <span
                :class="[
                  'px-2 py-1 ml-2 rounded-full text-xs font-medium self-start sm:self-auto',
                  payment.type === 'second'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800',
                ]"
              >
                {{ payment.type }} Payment
              </span>
            </p>
            <div v-if="payment.image_url" class="mt-3">
              <p class="text-sm font-medium text-gray-700 mb-2">
                Payment Receipt:
              </p>
              <img
                :src="payment.image_url"
                alt="Payment Receipt"
                class="w-8 h-8 md:w-32 md:h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                @click="openImageModal(payment.image_url)"
              />
              <p
                class="text-xs text-blue-600 mt-1 cursor-pointer hover:underline"
                @click="openImageModal(payment.image_url)"
              >
                Click to view larger
              </p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-2 mt-3">
            <button
              @click="approvePayment(payment.id)"
              class="bg-green-600 text-white px-3 py-2 md:px-4 md:py-2 rounded text-sm hover:bg-green-700 flex-1 sm:flex-none"
            >
              Approve
            </button>
            <button
              @click="rejectPayment(payment.id)"
              class="bg-red-600 text-white px-3 py-2 md:px-4 md:py-2 rounded text-sm hover:bg-red-700 flex-1 sm:flex-none"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div
      v-if="showImageModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4"
      @click="closeImageModal"
    >
      <div class="relative w-full max-w-4xl max-h-full">
        <img
          :src="selectedImage"
          alt="Payment Receipt - Large View"
          class="w-full h-auto max-h-[80vh] md:max-h-[90vh] object-contain rounded-lg"
          @click.stop
        />
        <button
          @click="closeImageModal"
          class="absolute top-1 right-1 md:top-2 md:right-2 bg-red-600 text-white rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center hover:bg-red-700 text-sm md:text-base"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Admin Bottom Navigation -->
    <AdminBottomNav :current-tab="currentTab" @tab-change="handleTabChange" />
  </div>
</template>
