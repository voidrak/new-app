<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
const phone = ref("");
const password = ref("");
function goBack() {
  router.back();
}
function goRegister() {
  router.push("/register");
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-b from-red-600 to-red-100 flex flex-col items-center justify-start px-2 py-16"
  >
    <!-- Header -->
    <div class="w-full max-w-md mx-auto">
      <div class="bg-red-600 rounded-b-3xl pt-4 pb-2 px-4 flex items-center">
        <button @click="goBack" class="text-white text-lg font-bold mr-2">
          &larr; Back
        </button>
      </div>
    </div>
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
        <div class="mt-6 mb-2 text-gray-500 text-center text-base">
          Fill The Below Information to Log In
        </div>
        <div class="mb-4 text-xl font-semibold text-red-600 text-center">
          Login Account
        </div>
        <form class="w-full space-y-6">
          <div>
            <label class="block text-gray-500 font-medium mb-1" for="phone"
              >Phone Number</label
            >
            <input
              v-model="phone"
              id="phone"
              type="tel"
              class="w-full border-b border-gray-300 bg-transparent px-2 py-2 text-lg focus:outline-none focus:border-red-400"
              placeholder="Phone Number"
            />
          </div>
          <div>
            <label class="block text-gray-500 font-medium mb-1" for="password"
              >Password</label
            >
            <input
              v-model="password"
              id="password"
              type="password"
              class="w-full border-b border-gray-300 bg-transparent px-2 py-2 text-lg focus:outline-none focus:border-red-400"
              placeholder="Password"
            />
          </div>
          <div class="text-right text-xs text-gray-400 mt-1 mb-2">
            In case you forget password ?
          </div>
          <button
            type="submit"
            class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-full text-lg transition-colors duration-300 mt-2 mb-2"
          >
            LOG IN
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
