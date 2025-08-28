<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const phone = ref("");
const password = ref("");
const loading = ref(false);
const errors = ref({
  phone: "",
  password: "",
  general: "",
});

function clearFieldError(field) {
  errors.value[field] = "";
}

function goBack() {
  router.back();
}

function goRegister() {
  router.push("/register");
}

async function onLogin() {
  // Clear previous errors
  errors.value = { phone: "", password: "", general: "" };

  // Basic validation
  if (!phone.value.trim()) {
    errors.value.phone = "Phone number is required";
    return;
  }
  if (!password.value) {
    errors.value.password = "Password is required";
    return;
  }

  loading.value = true;

  try {
    const loginData = {
      phone: phone.value,
      password: password.value,
    };

    const response = await fetch(
      "https://canada.rohatechs.com/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(loginData),
      }
    );

    const result = await response.json();

    if (response.ok && result.success) {
      // Store token and user data
      localStorage.setItem("userToken", result.data.token);
      localStorage.setItem("userData", JSON.stringify(result.data.user));

      // Redirect based on user type and status
      const user = result.data.user;
      if (user.is_admin || user.role === "admin") {
        router.push("/admin-home");
      } else if (user.status === "pending") {
        router.push("/pending-approval");
      } else {
        router.push("/user-home");
      }
    } else {
      // Handle specific error messages
      if (response.status === 404) {
        errors.value.phone =
          result.message || "No account found with this phone number";
      } else if (response.status === 401) {
        errors.value.password = result.message || "Incorrect password";
      } else if (result.errors) {
        // Handle validation errors
        if (result.errors.phone) errors.value.phone = result.errors.phone[0];
        if (result.errors.password)
          errors.value.password = result.errors.password[0];
        errors.value.general =
          result.message || "Login failed. Please check your credentials.";
      } else {
        errors.value.general =
          result.message || "Login failed. Please try again.";
      }
    }
  } catch (error) {
    console.error("Login error:", error);
    errors.value.general =
      "Network error. Please check your connection and try again.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-b from-red-600 to-red-100 flex flex-col items-center justify-start px-2 py-16"
  >
    <!-- Header -->
    <!-- Card -->
    <div class="w-full max-w-md mx-auto -mt-8">
      <div
        class="bg-white rounded-3xl shadow-2xl px-6 py-8 flex flex-col items-center"
      >
        <div class="mb-2">
          <span class="block text-3xl font-bold text-red-600 font-[cursive]"
            >CanadaApp</span
          >
          <span
            class="block text-sm tracking-wide text-gray-500 font-semibold mt-1"
            >FIND YOUR DREAM JOB</span
          >
        </div>

        <div class="mb-4 text-xl font-semibold text-red-600 text-center">
          Login Account
        </div>
        <form class="w-full text-sm space-y-6" @submit.prevent="onLogin">
          <div>
            <label class="block text-gray-500 font-medium mb-1" for="phone"
              >Phone Number</label
            >
            <input
              v-model="phone"
              @input="clearFieldError('phone')"
              id="phone"
              type="tel"
              class="w-full border-b border-gray-300 bg-transparent px-2 py-2 text-sm focus:outline-none focus:border-red-400"
              placeholder="Phone Number"
            />
            <span v-if="errors.phone" class="text-red-500 text-xs mt-1 block">{{
              errors.phone
            }}</span>
          </div>
          <div>
            <label class="block text-gray-500 font-medium mb-1" for="password"
              >Password</label
            >
            <input
              v-model="password"
              @input="clearFieldError('password')"
              id="password"
              type="password"
              class="w-full border-b border-gray-300 bg-transparent px-2 py-2 focus:outline-none focus:border-red-400"
              placeholder="Password"
            />
            <span
              v-if="errors.password"
              class="text-red-500 text-xs mt-1 block"
              >{{ errors.password }}</span
            >
          </div>

          <span
            v-if="errors.general"
            class="text-red-500 text-xs text-center block mb-2"
            >{{ errors.general }}</span
          >
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-full transition-colors duration-300 mt-2 mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Logging in...</span>
            <span v-else>LOG IN</span>
          </button>
        </form>
        <div class="flex flex-col items-center w-full mt-2">
          <div class="text-gray-400 text-sm mb-2">OR</div>
          <div class="text-gray-500 text-sm">Don't have an account ?</div>
          <button
            @click="goRegister"
            class="text-red-600 font-bold text-base mt-1 underline"
          >
            REGISTER
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
