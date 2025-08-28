<script setup>
import { useRouter } from "vue-router";
const router = useRouter();
function goToLogin() {
  router.push("/login");
}
</script>

<template>
  <UserLayout>
    <!-- Mobile-first job search hero section -->
    <div class="relative min-h-screen flex flex-col">
      <!-- Background image with overlay -->
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style="
          background-image: linear-gradient(
              rgba(0, 0, 0, 0.5),
              rgba(0, 0, 0, 0.6)
            ),
            url('/images/onboarding_image.webp');
        "
      ></div>

      <!-- Content overlay -->
      <div class="relative z-10 flex flex-col justify-between min-h-screen">
        <!-- Main content centered -->
        <div
          class="flex-1 flex flex-col justify-center px-6 py-8 sm:px-8 md:px-12"
        >
          <div class="max-w-md mx-auto md:max-w-2xl">
            <!-- Main heading -->
            <h1
              class="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-tight text-left"
            >
              Find the
              <br />
              <span class="text-white">Right Job for</span>
              <br />
              <span class="text-white">You in</span>
              <br />
              <span class="text-red-500 font-black">Canada</span>
            </h1>

            <!-- Subtitle -->
            <div
              class="text-2xl sm:text-5xl mt-4 md:text-6xl lg:text-7xl text-white font-medium space-y-2 mb-12 text-left"
            >
              <p>See jobs</p>
              <p>Apply fast</p>
              <p>Get hired.</p>
            </div>
          </div>
        </div>

        <!-- Bottom button -->
        <div class="px-6 pb-8 sm:px-8 md:px-12">
          <div class="max-w-md mx-auto md:max-w-2xl">
            <button
              class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full text-xl sm:text-2xl transition-colors duration-300 shadow-lg"
              @click="goToLogin"
            >
              Explore Jobs
            </button>
          </div>
        </div>
      </div>
    </div>
  </UserLayout>
</template>
