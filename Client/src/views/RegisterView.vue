<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const CLOUDINARY_CLOUD_NAME = "dqxy77qks";
const CLOUDINARY_UPLOAD_PRESET = "canada_app_uploads";
const JOB_PREFERENCES = [
  "Software Development",
  "Healthcare",
  "Construction",
  "Education",
  "Hospitality",
  "Agriculture",
  "Manufacturing",
  "Transportation",
  "Finance",
  "Retail",
];

const router = useRouter();
const firstName = ref("");
const middleName = ref("");
const lastName = ref("");
const dob = ref("");
const address = ref("");
const phone = ref("");
const password = ref("");
const confirmPassword = ref("");
const profileImage = ref("");
const passportImage = ref("");
const grade8CardImage = ref("");
const selectedJobPreferences = ref([]);
const loading = ref(false);
const uploadingImage = ref("");
const errors = ref({
  firstName: "",
  lastName: "",
  dob: "",
  phone: "",
  password: "",
  confirmPassword: "",
  jobPreferences: "",
  profileImage: "",
  passportImage: "",
  general: "",
});

function clearFieldError(field) {
  errors.value[field] = "";
}

async function uploadToCloudinary(file) {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary credentials not configured.");
  }
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );
  const data = await response.json();
  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message || "Upload failed");
  }
  return data.secure_url;
}

async function pickImage(type) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadingImage.value = type;
      try {
        const url = await uploadToCloudinary(file);
        if (type === "profile") profileImage.value = url;
        if (type === "passport") passportImage.value = url;
        if (type === "grade8") grade8CardImage.value = url;
        alert(
          type.charAt(0).toUpperCase() + type.slice(1) + " image uploaded!"
        );
      } catch (err) {
        alert("Upload failed: " + err.message);
      } finally {
        uploadingImage.value = "";
      }
    }
  };
  input.click();
}

function toggleJobPreference(pref) {
  if (selectedJobPreferences.value.includes(pref)) {
    selectedJobPreferences.value = selectedJobPreferences.value.filter(
      (p) => p !== pref
    );
  } else {
    if (selectedJobPreferences.value.length < 2) {
      selectedJobPreferences.value.push(pref);
    } else {
      alert("You can select a maximum of 2 job preferences.");
    }
  }
  if (errors.value.jobPreferences) clearFieldError("jobPreferences");
}

function validateForm() {
  const newErrors = {
    firstName: "",
    lastName: "",
    dob: "",
    phone: "",
    password: "",
    confirmPassword: "",
    jobPreferences: "",
    profileImage: "",
    passportImage: "",
    general: "",
  };
  let isValid = true;
  if (!firstName.value.trim()) {
    newErrors.firstName = "First name is required";
    isValid = false;
  }
  if (!lastName.value.trim()) {
    newErrors.lastName = "Last name is required";
    isValid = false;
  }
  if (!phone.value.trim()) {
    newErrors.phone = "Phone number is required";
    isValid = false;
  }
  if (!password.value) {
    newErrors.password = "Password is required";
    isValid = false;
  } else if (password.value.length < 6) {
    newErrors.password = "Password must be at least 6 characters";
    isValid = false;
  }
  if (!confirmPassword.value) {
    newErrors.confirmPassword = "Please confirm your password";
    isValid = false;
  } else if (password.value !== confirmPassword.value) {
    newErrors.confirmPassword = "Passwords do not match";
    isValid = false;
  }
  if (selectedJobPreferences.value.length === 0) {
    newErrors.jobPreferences = "Please select at least one job preference";
    isValid = false;
  }
  if (!profileImage.value) {
    newErrors.profileImage = "Profile picture is required";
    isValid = false;
  }
  if (!passportImage.value) {
    newErrors.passportImage = "Passport image is required";
    isValid = false;
  }
  errors.value = newErrors;
  return isValid;
}

async function onSignUp() {
  if (!validateForm()) return;
  loading.value = true;

  try {
    const userData = {
      first_name: firstName.value,
      middle_name: middleName.value || null,
      last_name: lastName.value,
      dob: dob.value || null,
      address: address.value || null,
      phone: phone.value,
      password: password.value,
      job_preferences: selectedJobPreferences.value,
      profile_image: profileImage.value,
      passport_image: passportImage.value,
      grade8_card_image: grade8CardImage.value || null,
    };

    const response = await fetch(
      "https://canada.rohatechs.com/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(userData),
      }
    );

    const result = await response.json();

    if (response.ok && result.success) {
      // Store token if provided
      if (result.data?.token) {
        localStorage.setItem("userToken", result.data.token);
      }
      alert("Registration successful!");
      router.push("/login");
    } else {
      // Handle validation errors from backend
      if (result.errors) {
        const newErrors = { ...errors.value };

        // Map backend errors to frontend field names
        if (result.errors.first_name)
          newErrors.firstName = result.errors.first_name[0];
        if (result.errors.last_name)
          newErrors.lastName = result.errors.last_name[0];
        if (result.errors.phone) newErrors.phone = result.errors.phone[0];
        if (result.errors.password)
          newErrors.password = result.errors.password[0];
        if (result.errors.dob) newErrors.dob = result.errors.dob[0];
        if (result.errors.job_preferences)
          newErrors.jobPreferences = result.errors.job_preferences[0];
        if (result.errors.profile_image)
          newErrors.profileImage = result.errors.profile_image[0];
        if (result.errors.passport_image)
          newErrors.passportImage = result.errors.passport_image[0];

        // Set general error message
        newErrors.general =
          result.message ||
          "Registration failed. Please check your information.";
        errors.value = newErrors;
      } else {
        errors.value.general =
          result.message || "Registration failed. Please try again.";
      }
    }
  } catch (error) {
    console.error("Registration error:", error);
    errors.value.general =
      "Network error. Please check your connection and try again.";
  } finally {
    loading.value = false;
  }
}

function onBackToLogin() {
  router.push("/login");
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-b from-red-600 to-red-100 flex flex-col items-center justify-start px-2 py-0"
  >
    <div class="w-full max-w-md mx-auto">
      <div class="bg-red-600 rounded-b-3xl pt-4 pb-2 px-4 flex items-center">
        <button
          @click="onBackToLogin"
          class="text-white text-lg font-bold mr-2"
        >
          &larr; Back
        </button>
        <span class="ml-auto text-white font-bold text-xl">Register</span>
      </div>
    </div>
    <div class="w-full max-w-md mx-auto -mt-8">
      <div
        class="bg-white rounded-3xl shadow-2xl px-6 py-8 flex flex-col items-center"
      >
        <span class="block text-3xl font-bold text-red-600 font-[cursive] mb-1"
          >CanadaApp</span
        >
        <span
          class="block text-sm tracking-wide text-gray-500 font-semibold mb-4"
          >FIND YOUR DREAM JOB</span
        >
        <form class="w-full space-y-4" @submit.prevent="onSignUp">
          <input
            v-model="firstName"
            @input="clearFieldError('firstName')"
            class="w-full border-b border-gray-300 bg-transparent px-2 py-2 text-lg focus:outline-none focus:border-red-400"
            placeholder="First Name *"
          />
          <span v-if="errors.firstName" class="text-red-500 text-xs">{{
            errors.firstName
          }}</span>
          <input
            v-model="middleName"
            class="w-full border-b border-gray-300 bg-transparent px-2 py-2 text-lg focus:outline-none focus:border-red-400"
            placeholder="Middle Name (Optional)"
          />
          <input
            v-model="lastName"
            @input="clearFieldError('lastName')"
            class="w-full border-b border-gray-300 bg-transparent px-2 py-2 text-lg focus:outline-none focus:border-red-400"
            placeholder="Last Name *"
          />
          <span v-if="errors.lastName" class="text-red-500 text-xs">{{
            errors.lastName
          }}</span>
          <input
            v-model="dob"
            @input="clearFieldError('dob')"
            class="w-full border-b border-gray-300 bg-transparent px-2 py-2 text-lg focus:outline-none focus:border-red-400"
            placeholder="Date of Birth (YYYY-MM-DD)"
          />
          <span v-if="errors.dob" class="text-red-500 text-xs">{{
            errors.dob
          }}</span>
          <input
            v-model="address"
            class="w-full border-b border-gray-300 bg-transparent px-2 py-2 text-lg focus:outline-none focus:border-red-400"
            placeholder="Address"
          />
          <input
            v-model="phone"
            @input="clearFieldError('phone')"
            class="w-full border-b border-gray-300 bg-transparent px-2 py-2 text-lg focus:outline-none focus:border-red-400"
            placeholder="Phone Number *"
          />
          <span v-if="errors.phone" class="text-red-500 text-xs">{{
            errors.phone
          }}</span>
          <input
            v-model="password"
            type="password"
            @input="clearFieldError('password')"
            class="w-full border-b border-gray-300 bg-transparent px-2 py-2 text-lg focus:outline-none focus:border-red-400"
            placeholder="Password *"
          />
          <span v-if="errors.password" class="text-red-500 text-xs">{{
            errors.password
          }}</span>
          <input
            v-model="confirmPassword"
            type="password"
            @input="clearFieldError('confirmPassword')"
            class="w-full border-b border-gray-300 bg-transparent px-2 py-2 text-lg focus:outline-none focus:border-red-400"
            placeholder="Confirm Password *"
          />
          <span v-if="errors.confirmPassword" class="text-red-500 text-xs">{{
            errors.confirmPassword
          }}</span>
          <div class="mt-4 mb-2 text-lg font-semibold text-gray-700">
            Job Preferences *
          </div>
          <div class="grid grid-cols-2 gap-2 mb-2">
            <button
              v-for="pref in JOB_PREFERENCES"
              :key="pref"
              type="button"
              @click="toggleJobPreference(pref)"
              :class="[
                'px-3 py-2 rounded-lg border text-sm font-medium text-center min-h-[44px] flex items-center justify-center',
                selectedJobPreferences.includes(pref)
                  ? 'bg-red-100 border-red-600 text-red-600 font-bold'
                  : 'bg-gray-100 border-gray-300 text-gray-700',
              ]"
            >
              {{ pref }}
            </button>
          </div>
          <span v-if="errors.jobPreferences" class="text-red-500 text-xs">{{
            errors.jobPreferences
          }}</span>
          <div class="mt-4 mb-2 text-lg font-semibold text-gray-700">
            Document Uploads
          </div>
          <div class="space-y-4 mb-4 w-full">
            <!-- First row: Profile and Passport -->
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col items-center">
                <button
                  type="button"
                  @click="pickImage('profile')"
                  :disabled="uploadingImage === 'profile'"
                  class="w-28 h-28 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 mb-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div
                    v-if="uploadingImage === 'profile'"
                    class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"
                  ></div>
                  <img
                    v-else-if="profileImage"
                    :src="profileImage"
                    class="w-24 h-24 rounded-lg object-cover"
                  />
                  <span v-else class="text-3xl text-gray-400">👤</span>
                </button>
                <span class="text-sm text-gray-600 text-center font-medium"
                  >Profile Photo</span
                >
                <span
                  v-if="uploadingImage === 'profile'"
                  class="text-blue-600 text-xs text-center"
                  >Uploading...</span
                >
                <span
                  v-else-if="errors.profileImage"
                  class="text-red-500 text-xs text-center"
                  >{{ errors.profileImage }}</span
                >
              </div>
              <div class="flex flex-col items-center">
                <button
                  type="button"
                  @click="pickImage('passport')"
                  :disabled="uploadingImage === 'passport'"
                  class="w-28 h-28 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 mb-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div
                    v-if="uploadingImage === 'passport'"
                    class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"
                  ></div>
                  <img
                    v-else-if="passportImage"
                    :src="passportImage"
                    class="w-24 h-24 rounded-lg object-cover"
                  />
                  <span v-else class="text-3xl text-gray-400">🛂</span>
                </button>
                <span class="text-sm text-gray-600 text-center font-medium"
                  >Passport</span
                >
                <span
                  v-if="uploadingImage === 'passport'"
                  class="text-blue-600 text-xs text-center"
                  >Uploading...</span
                >
                <span
                  v-else-if="errors.passportImage"
                  class="text-red-500 text-xs text-center"
                  >{{ errors.passportImage }}</span
                >
              </div>
            </div>
            <!-- Second row: Grade 8 Card centered -->
            <div class="flex justify-center">
              <div class="flex flex-col items-center">
                <button
                  type="button"
                  @click="pickImage('grade8')"
                  :disabled="uploadingImage === 'grade8'"
                  class="w-28 h-28 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 mb-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div
                    v-if="uploadingImage === 'grade8'"
                    class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"
                  ></div>
                  <img
                    v-else-if="grade8CardImage"
                    :src="grade8CardImage"
                    class="w-24 h-24 rounded-lg object-cover"
                  />
                  <span v-else class="text-3xl text-gray-400">🎓</span>
                </button>
                <span class="text-sm text-gray-600 text-center font-medium"
                  >Grade 8 Card</span
                >
                <span
                  v-if="uploadingImage === 'grade8'"
                  class="text-blue-600 text-xs text-center"
                  >Uploading...</span
                >
              </div>
            </div>
          </div>
          <span
            v-if="errors.general"
            class="text-red-500 text-xs text-center block"
            >{{ errors.general }}</span
          >
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-full text-lg transition-colors duration-300 mt-2 mb-2"
          >
            <span v-if="loading">Registering...</span>
            <span v-else>Create Account</span>
          </button>
        </form>
        <button
          @click="onBackToLogin"
          class="text-red-600 font-bold text-base mt-4 underline"
        >
          Already have an account? Sign In
        </button>
        <span class="text-2xl mt-4">🍁</span>
      </div>
    </div>
  </div>
</template>
