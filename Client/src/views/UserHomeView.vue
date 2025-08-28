<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import BottomNav from "../components/BottomNav.vue";

const router = useRouter();
const user = ref(null);
const currentTab = ref("home");

const newsArticles = [
  {
    title: "15,000 No-Degree Required Jobs Opening in Major Cities",
    date: "January 15, 2025",
    summary:
      "Warehouse workers, delivery drivers, retail associates, and customer service roles - no degree needed, training provided.",
    category: "Entry Level",
    image: "�",
  },
  {
    title: "Healthcare Workers in High Demand Across All Provinces",
    date: "January 12, 2025",
    summary:
      "Nurses, doctors, and healthcare assistants needed urgently as Canada expands healthcare services.",
    category: "Healthcare",
    image: "🏥",
  },
  {
    title: "Construction Boom Creates 25,000 Job Opportunities",
    date: "January 10, 2025",
    summary:
      "Major infrastructure projects in Ontario and British Columbia are creating thousands of construction jobs.",
    category: "Construction",
    image: "🏗️",
  },
  {
    title: "Special Programs for African Immigrants and Newcomers",
    date: "January 8, 2025",
    summary:
      "Canada offers dedicated job placement programs, language support, and mentorship for African professionals and skilled workers.",
    category: "Immigration",
    image: "�",
  },
];

onMounted(() => {
  // Get user data from localStorage
  const userData = localStorage.getItem("userData");
  if (userData) {
    user.value = JSON.parse(userData);
  } else {
    // Redirect to login if no user data
    router.push("/login");
  }
});

function logout() {
  localStorage.removeItem("userToken");
  localStorage.removeItem("userData");
  router.push("/");
}

function setActiveTab(tab) {
  currentTab.value = tab;

  // Navigate to different pages based on tab
  if (tab === "jobs") {
    router.push("/jobs");
  } else if (tab === "payment") {
    router.push("/payment");
  } else if (tab === "chat") {
    router.push("/chat");
  } else if (tab === "profile") {
    router.push("/profile");
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Header -->
    <div class="bg-red-600 text-white p-4 shadow-lg">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-xl font-bold">🍁 Canada Jobs</h1>
          <p class="text-red-100 text-sm">
            Your Gateway to Canadian Opportunities
          </p>
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
      <!-- Welcome Section -->
      <div
        class="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-6"
      >
        <h2 class="text-2xl font-bold mb-2">
          Welcome to Canada, {{ user?.first_name }}! 🇨🇦
        </h2>
        <p class="text-red-100">
          Discover amazing job opportunities in the land of maple leaves and
          endless possibilities.
        </p>
      </div>

      <!-- Canada Facts -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">🇨🇦 About Canada</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-red-600">38M+</div>
            <div class="text-sm text-gray-600">Population</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-red-600">2nd</div>
            <div class="text-sm text-gray-600">Largest Country</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-red-600">10</div>
            <div class="text-sm text-gray-600">Provinces</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-red-600">$1.9T</div>
            <div class="text-sm text-gray-600">GDP</div>
          </div>
        </div>
      </div>

      <!-- Job Market Highlights -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">
          📈 Job Market Highlights
        </h3>
        <div class="space-y-3">
          <div class="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <span class="text-2xl">📊</span>
            <div>
              <div class="font-semibold text-green-800">
                Employment Rate: 96.2%
              </div>
              <div class="text-sm text-green-600">Highest in 5 years</div>
            </div>
          </div>
          <div class="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <span class="text-2xl">💼</span>
            <div>
              <div class="font-semibold text-blue-800">
                500,000+ Job Openings
              </div>
              <div class="text-sm text-blue-600">Across all sectors</div>
            </div>
          </div>
          <div class="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <span class="text-2xl">💰</span>
            <div>
              <div class="font-semibold text-purple-800">
                Average Salary: $20,000
              </div>
              <div class="text-sm text-purple-600">Annual starting salary</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Latest Job News -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">
          📰 Latest Job Opportunities
        </h3>
        <div class="space-y-4">
          <div
            v-for="article in newsArticles"
            :key="article.title"
            class="border-l-4 border-red-500 pl-4 py-2"
          >
            <div class="flex items-start space-x-3">
              <span class="text-2xl">{{ article.image }}</span>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-800 text-sm leading-tight">
                  {{ article.title }}
                </h4>
                <p class="text-xs text-gray-600 mt-1">{{ article.summary }}</p>
                <div class="flex items-center space-x-2 mt-2">
                  <span
                    class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded"
                    >{{ article.category }}</span
                  >
                  <span class="text-xs text-gray-500">{{ article.date }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Opportunities for African Newcomers -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">
          🌍 Opportunities for African Newcomers
        </h3>
        <div class="space-y-3">
          <div class="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
            <span class="text-2xl">🤝</span>
            <div>
              <div class="font-semibold text-orange-800">
                Mentorship Programs
              </div>
              <div class="text-sm text-orange-600">
                Connect with African professionals already established in Canada
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
            <span class="text-2xl">🎓</span>
            <div>
              <div class="font-semibold text-indigo-800">
                Skills Recognition
              </div>
              <div class="text-sm text-indigo-600">
                Get your African qualifications recognized in Canada
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <span class="text-2xl">💬</span>
            <div>
              <div class="font-semibold text-green-800">Language Support</div>
              <div class="text-sm text-green-600">
                Free English and French classes for job seekers
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <span class="text-2xl">🏢</span>
            <div>
              <div class="font-semibold text-purple-800">
                Job Placement Assistance
              </div>
              <div class="text-sm text-purple-600">
                Specialized services for African immigrants in tech, healthcare,
                and skilled trades
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNav :current-tab="currentTab" @tab-change="setActiveTab" />
  </div>
</template>
