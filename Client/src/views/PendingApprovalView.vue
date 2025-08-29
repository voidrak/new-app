<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const receiptImage = ref(null);
const isUploading = ref(false);
const isSubmitted = ref(false);
const accountNumber = ref("");
const phoneNumber = ref("");
const telegram = ref("");

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = "dqxy77qks";
const CLOUDINARY_UPLOAD_PRESET = "canada_app_uploads";

const handleBackToLogin = () => {
  router.push("/login");
};

onMounted(() => {
  getCbeAccount();
});

const uploadToCloudinary = async (file) => {
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
};

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

const pickImage = () => {
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
};

const handleSubmitReceipt = async () => {
  if (!receiptImage.value) {
    alert("Please upload your payment receipt first.");
    return;
  }

  try {
    isUploading.value = true;
    const token = localStorage.getItem("userToken");
    if (!token) {
      alert(
        "Session Expired: Your session has expired. Please login again to submit your receipt."
      );
      router.push("/login");
      return;
    }

    const apiUrl = "https://canada.rohatechs.com/api/payments";
    const requestBody = {
      image_url: receiptImage.value,
      type: "first",
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
};
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-4 py-4">
      <button
        @click="handleBackToLogin"
        class="text-blue-600 font-medium text-base hover:text-blue-700 transition-colors"
      >
        ← Back to Login
      </button>
    </div>

    <!-- Main Content -->
    <div class="flex-1 px-6 py-8">
      <div class="max-w-md mx-auto">
        <!-- Warning Message -->
        <div
          class="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 mx-auto max-w-md"
        >
          <div class="text-center">
            <p class="text-red-700 font-bold text-lg mb-2">
              ⚠️ IMPORTANT NOTICE
            </p>
            <p class="text-red-600 font-semibold">
              Please do not send your payment receipt twice if you have already
              submitted one.
            </p>
            <p class="text-red-600 font-semibold mt-1">
              Wait patiently for admin approval.
            </p>
          </div>
        </div>

        <!-- Title and Message -->
        <div class="text-center mb-10">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">
            Payment Required
          </h1>
          <p class="text-gray-600 text-lg leading-relaxed">
            To complete your registration, please make the required payment and
            upload your receipt for approval.
          </p>
        </div>

        <!-- Upload Section -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-gray-900 text-center mb-6">
            Upload Payment Receipt
          </h2>

          <!-- Account Info -->
          <div class="bg-gray-50 rounded-lg p-4 mt-4 text-center">
            <p class="font-semibold text-red-600 mb-1">CBE Account Number:</p>
            <p class="text-lg font-bold text-gray-800">{{ accountNumber }}</p>
          </div>

          <div v-if="receiptImage" class="text-center">
            <img
              :src="receiptImage"
              alt="Receipt"
              class="w-48 h-48 mx-auto rounded-lg mb-4 object-cover border border-gray-200"
            />
            <button
              @click="pickImage"
              :disabled="isUploading"
              class="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              Change Receipt
            </button>
          </div>

          <div v-else class="text-center">
            <button
              @click="pickImage"
              :disabled="isUploading"
              class="w-full border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-blue-400 transition-colors disabled:opacity-50"
            >
              <div v-if="isUploading" class="flex justify-center">
                <div
                  class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
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
        </div>

        <!-- Submit Button -->
        <div v-if="receiptImage && !isSubmitted" class="mb-8">
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
          class="bg-green-50 border border-green-200 rounded-xl p-6 mb-8"
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

        <!-- Footer -->
        <div class="text-center">
          <button
            @click="handleBackToLogin"
            class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
