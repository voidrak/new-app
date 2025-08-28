<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import BottomNav from "../components/BottomNav.vue";

const router = useRouter();
const user = ref(null);
const currentTab = ref("payment");
const receiptImage = ref(null);
const isUploading = ref(false);
const isSubmitted = ref(false);
const accountNumber = ref("");
const phoneNumber = ref("");
const telegram = ref("");

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = "dqxy77qks";
const CLOUDINARY_UPLOAD_PRESET = "canada_app_uploads";

onMounted(() => {
  // Get user data from localStorage
  const userData = localStorage.getItem("userData");
  if (userData) {
    user.value = JSON.parse(userData);
  } else {
    // Redirect to login if no user data
    router.push("/login");
  }

  // Get CBE account info
  getCbeAccount();
});

async function getCbeAccount() {
  try {
    const response = await fetch(
      "https://canada.rohatechs.com/api/cbe-account"
    );

    const data = await response.json();
    if (response.ok && data.account_number) {
      accountNumber.value = data.account_number;
      phoneNumber.value = data.phone_number_1 || "";
      telegram.value = data.telegram || "";
    } else {
      accountNumber.value = "Unavailable";
      phoneNumber.value = "Unavailable";
      telegram.value = "@CanadaAppSupport";
    }
  } catch (error) {
    console.error("Error fetching CBE account:", error);
    accountNumber.value = "1000232902397";
    phoneNumber.value = "0929782484";
    telegram.value = "@CanadaAppSupport";
  }
}

async function uploadToCloudinary(file) {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary credentials not configured.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (data.error && data.error.message) {
        throw new Error(`Cloudinary Error: ${data.error.message}`);
      } else {
        throw new Error(
          `Upload failed with status ${response.status}: ${
            data.message || "Unknown error"
          }`
        );
      }
    }

    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error("No secure URL returned from Cloudinary");
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Upload failed: ${error.message}`);
    } else {
      throw new Error("Failed to upload image to Cloudinary");
    }
  }
}

function pickImage() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      isUploading.value = true;
      try {
        const cloudinaryUrl = await uploadToCloudinary(file);
        receiptImage.value = cloudinaryUrl;
        alert("Success: Receipt uploaded successfully!");
      } catch (error) {
        alert(
          "Error: " +
            (error instanceof Error ? error.message : "Unknown error occurred")
        );
      } finally {
        isUploading.value = false;
      }
    }
  };
  input.click();
}

async function handleSubmitReceipt() {
  if (!receiptImage.value) {
    alert("Please upload your payment receipt first.");
    return;
  }

  try {
    isUploading.value = true;
    const token = localStorage.getItem("userToken");
    if (!token) {
      alert("Session Expired: Please login again to submit your receipt.");
      router.push("/login");
      return;
    }

    const apiUrl = "https://canada.rohatechs.com/api/payments";
    const requestBody = {
      image_url: receiptImage.value,
      type: "second",
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      isSubmitted.value = true;
      alert(
        "Receipt Submitted: Your payment receipt has been submitted for review. You will be notified once approved."
      );
    } else if (response.status === 401) {
      alert(
        "Authentication Failed: Your session has expired. Please login again."
      );
      router.push("/login");
    } else {
      alert(
        "Error: " +
          (data.message ||
            `Failed to submit payment receipt. Status: ${response.status}`)
      );
    }
  } catch (error) {
    alert(
      "Error: " +
        (error instanceof Error ? error.message : "Unknown error occurred")
    );
  } finally {
    isUploading.value = false;
  }
}

function setActiveTab(tab) {
  currentTab.value = tab;

  // Navigate to different pages based on tab
  if (tab === "home") {
    router.push("/user-home");
  } else if (tab === "jobs") {
    router.push("/jobs");
  } else if (tab === "payment") {
    // Already on payment page
  } else if (tab === "chat") {
    router.push("/chat");
  } else if (tab === "profile") {
    router.push("/profile");
  } else {
    // For other tabs, could navigate or show placeholder
    alert(`${tab} feature coming soon!`);
  }
}

function logout() {
  localStorage.removeItem("userToken");
  localStorage.removeItem("userData");
  router.push("/");
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Header -->
    <div class="bg-red-600 text-white p-4 shadow-lg">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-xl font-bold">🍁 Canada Jobs</h1>
          <p class="text-red-100 text-sm">Second Payment</p>
        </div>
        <button
          @click="logout"
          class="bg-red-700 hover:bg-red-800 px-3 py-2 rounded-lg transition-colors text-sm"
        >
          Logout
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="px-4 py-6 space-y-6">
      <!-- Upload Section -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 class="text-xl font-bold text-gray-800 mb-4 text-center">
          Upload Payment Receipt
        </h2>

        <div v-if="receiptImage" class="text-center">
          <img
            :src="receiptImage"
            alt="Receipt"
            class="w-48 h-48 mx-auto rounded-lg mb-4 object-cover"
          />
          <button
            @click="pickImage"
            :disabled="isUploading"
            class="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            Change Receipt
          </button>
        </div>

        <div v-else class="text-center">
          <button
            @click="pickImage"
            :disabled="isUploading"
            class="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-red-400 transition-colors disabled:opacity-50"
          >
            <div v-if="isUploading" class="flex justify-center">
              <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"
              ></div>
            </div>
            <div v-else>
              <div class="text-4xl mb-2">📷</div>
              <p class="text-lg font-medium text-gray-700 mb-1">
                Tap to upload receipt
              </p>
              <p class="text-sm text-gray-500">JPG, PNG formats supported</p>
            </div>
          </button>
        </div>

        <!-- Account Info -->
        <div class="bg-gray-50 rounded-lg p-4 mt-4 text-center">
          <p class="font-semibold text-red-600 mb-1">CBE Account Number:</p>
          <p class="text-lg font-bold text-gray-800">{{ accountNumber }}</p>
        </div>
      </div>

      <!-- Contact Section -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-red-600 mb-3">Contact Us</h3>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="font-semibold text-red-600">Phone:</span>
            <span>{{ phoneNumber || "+1 647-123-4567" }}</span>
          </div>
          <div class="flex justify-between">
            <span class="font-semibold text-red-600">Telegram:</span>
            <span>{{ telegram || "@CanadaAppSupport" }}</span>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div v-if="receiptImage && !isSubmitted" class="px-4">
        <button
          @click="handleSubmitReceipt"
          :disabled="isUploading"
          class="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isUploading" class="flex items-center justify-center">
            <div
              class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
            ></div>
            Processing...
          </span>
          <span v-else>Submit Receipt for Approval</span>
        </button>
      </div>

      <!-- Status Card -->
      <div
        v-if="isSubmitted"
        class="bg-green-50 border border-green-200 rounded-xl p-6 mx-4"
      >
        <div class="text-center">
          <div class="text-4xl mb-2">✅</div>
          <h3 class="text-lg font-bold text-green-800 mb-2">
            Receipt Submitted
          </h3>
          <p class="text-green-700">
            Your payment receipt has been submitted. Admin will review and
            approve your account soon.
          </p>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNav :current-tab="currentTab" @tab-change="setActiveTab" />
  </div>
</template>
