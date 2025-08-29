<template>
  <div class="bg-gray-50 rounded-lg p-4 mt-4 text-center">
    <p class="font-semibold text-red-600 mb-1">CBE Account Number:</p>
    <p class="text-lg font-bold text-gray-800">{{ accountNumber }}</p>
    <div class="flex justify-center gap-6 mt-2">
      <div>
        <span class="font-semibold text-red-600">Phone:</span>
        <span class="ml-1">{{ phoneNumber }}</span>
      </div>
      <div>
        <span class="font-semibold text-red-600">Telegram:</span>
        <span class="ml-1">{{ telegram }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const accountNumber = ref("");
const phoneNumber = ref("");
const telegram = ref("");

onMounted(async () => {
  try {
    const response = await fetch(
      "https://canada.rohatechs.com/api/cbe-account"
    );
    const data = await response.json();
    if (response.ok && data.account_number) {
      accountNumber.value = data.account_number;
      phoneNumber.value = data.phone_number_1 || "";
      telegram.value = data.telegram || "@CanadaAppSupport";
    } else {
      accountNumber.value = "Unavailable";
      phoneNumber.value = "Unavailable";
      telegram.value = "@CanadaAppSupport";
    }
  } catch (error) {
    accountNumber.value = "1000232902397";
    phoneNumber.value = "0929782484";
    telegram.value = "@CanadaAppSupport";
  }
});
</script>
