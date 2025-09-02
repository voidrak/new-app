<script setup>
	import { ref, onMounted } from "vue";
	import { useRouter } from "vue-router";
	import BottomNav from "../components/BottomNav.vue";

	const router = useRouter();
	const user = ref(null);
	const isApplying = ref(false);
	const currentTab = ref("jobs");
	const userApplications = ref([]);

	const jobListings = [
		{
			id: 1,
			title: "Construction Laborer",
			location: "Toronto, ON",
			salary: "$1,000 - $1200 CAD",
			type: "Full-time",
			description: "Help with building, carrying materials, and site cleanup",
		},
		{
			id: 2,
			title: "Package Handler",
			location: "Vancouver, BC",
			salary: "$1050 - $1500 CAD",
			type: "Full-time",
			description: "Load, unload, and sort packages in warehouses",
		},
		{
			id: 3,
			title: "Construction Worker",
			location: "Calgary, AB",
			salary: "$1500 - $2000 CAD",
			type: "Full-time",
			description:
				"No degree required. Assist with construction and infrastructure projects across Alberta.",
		},
		{
			id: 4,
			title: "Truck Driver",
			location: "Montreal, QC",
			salary: "$2000 - $2200 CAD",
			type: "Full-time",
			description: "Transport goods safely across Canadian provinces.",
		},
		{
			id: 5,
			title: "Kitchen Helper",
			location: "Ottawa, ON",
			salary: "$1,020 - $1,500 CAD",
			type: "Full-time",
			description:
				"No degree required. Prepare Canadian cuisine in a busy restaurant.",
		},
		{
			id: 6,
			title: "Delivery Driver",
			location: "Toronto, ON",
			salary: "$1325 - $1630 CAD",
			type: "Full-time",
			description:
				"No degree required. Deliver packages and goods to customers across the city.",
		},
		{
			id: 7,
			title: "Mover",
			location: "Winnipeg, MB",
			salary: "$1100 - $1350 CAD",
			type: "Full-time",
			description: "Lift, load, and move furniture or goods.",
		},
		{
			id: 8,
			title: "Factory / Assembly Line Worker",
			location: "Brampton, ON",
			salary: "$1200 - $1500 CAD",
			type: "Full-time",
			description: "Operate machines and package products.",
		},
		{
			id: 14,
			title: "Landscaper",
			location: "Victoria, BC",
			salary: "$1700 - $2350 CAD",
			type: "Full-time",
			description: "Maintain gardens, lawns, and outdoor areas.",
		},
		{
			id: 16,
			title: "Store Keeper",
			location: "Calgary, AB",
			salary: "$1800 - $2300 CAD",
			type: "Full-time",
			description:
				"No degree required. Manage inventory and assist customers in a retail store.",
		},
		{
			id: 17,
			title: "Child Taker",
			location: "Vancouver, BC",
			salary: "$35,000 - $50,000 CAD",
			type: "Full-time",
			description:
				"No degree required. Take care of children in daycare or home settings.",
		},
		{
			id: 18,
			title: "Farm Worker",
			location: "Saskatoon, SK",
			salary: "$1280 - $1400 CAD",
			type: "Full-time",
			description:
				"No degree required. Assist with farm operations and animal care.",
		},
		{
			id: 19,
			title: "Fruit Picker",
			location: "Kelowna, BC",
			salary: "$1000 - $1300 CAD",
			type: "Full-time",
			description:
				"No degree required. Pick and sort fruits during harvest season.",
		},
		{
			id: 20,
			title: "Security Guard",
			location: "Edmonton, AB",
			salary: "$2300 - $2500 CAD",
			type: "Full-time",
			description:
				"No degree required. Ensure safety and security at various locations.",
		},
		{
			id: 12,
			title: "Truck Driver",
			location: "Saskatoon, SK",
			salary: "$2300 - $2500 CAD",
			type: "Full-time",
			description: "Transport goods safely across Canadian provinces.",
		},
		{
			id: 13,
			title: "Receptionist",
			location: "Victoria, BC",
			salary: "$1800 - $2300 CAD",
			type: "Full-time",
			description: "Greet visitors and manage front desk operations.",
		},
		{
			id: 21,
			title: "Electrician",
			location: "St. John's, NL",
			salary: "$2200 - $2500 CAD",
			type: "Full-time",
			description: "Install and maintain electrical systems for clients.",
		},
		{
			id: 15,
			title: "Janitor",
			location: "Moncton, NB",
			salary: "$1280 - $1580 CAD",
			type: "Full-time",
			description: "Support individuals and families with social services.",
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

		// Fetch user's applications
		fetchUserApplications();
	});

	async function fetchUserApplications() {
		try {
			const token = localStorage.getItem("userToken");
			if (!token) return;

			const response = await fetch(
				"https://canada.rohatechs.com/api/job-applications",
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			const data = await response.json();
			if (response.ok && data.success) {
				userApplications.value = data.data || [];
			}
		} catch (error) {
			console.error("Error fetching applications:", error);
		}
	}

	async function handleApply(jobTitle, salary) {
		const limitStatus = getApplicationLimitStatus();

		// Check if user has reached the application limit
		if (limitStatus.isAtLimit) {
			alert(
				`❌ Application Limit Reached!\n\n` +
					`You have already applied for ${limitStatus.current} jobs (maximum allowed).\n\n` +
					`Please complete payment for your existing applications or contact admin for assistance.\n\n` +
					`💬 Send "hi" to admin via chat for help.`
			);
			return;
		}

		// Check if already applied to this specific job
		const status = getApplicationStatus(jobTitle);
		if (status !== null) {
			const statusMessage =
				status === "applied"
					? "Your application for this job has been approved!"
					: "Your application for this job is waiting for payment.";
			alert(`ℹ️ Already Applied\n\n${statusMessage}`);
			return;
		}

		// Show confirmation dialog
		const confirmed = confirm(
			`Are you sure you want to apply for "${jobTitle}"?\n\n` +
				`After applying, please send "hi" to admin via chat to ask about the application fee.`
		);

		if (confirmed) {
			await submitApplication(jobTitle, salary);
		}
	}

	async function submitApplication(jobTitle, salary) {
		if (isApplying.value) return;

		isApplying.value = true;

		try {
			const token = localStorage.getItem("userToken");

			if (!token) {
				alert("Please log in to apply for jobs");
				router.push("/login");
				return;
			}

			// Submit job application
			const response = await fetch(
				"https://canada.rohatechs.com/api/job-applications",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						job_title: jobTitle,
						salary_range: salary,
					}),
				}
			);

			const data = await response.json();

			if (response.ok && data.success) {
				alert(
					"✅ Application Submitted Successfully!\n\n" +
						'💬 Go to Chat → Send "hi" to admin to ask about the application fee and payment process.\n\n'
				);

				// Add the new application to local array immediately for instant UI update
				const newApplication = {
					id: data.data?.id || Date.now(), // Use server ID if available, otherwise temp ID
					user_id: user.value?.id,
					job_title: jobTitle,
					salary_range: salary,
					is_paid: false,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				};

				userApplications.value.unshift(newApplication); // Add to beginning of array

				// Still refresh from server to ensure data consistency
				await fetchUserApplications();
			} else {
				alert("❌ Error: " + (data.message || "Failed to submit application"));
			}
		} catch (error) {
			console.error("Application error:", error);
			alert("❌ Error: An error occurred while submitting your application");
		} finally {
			isApplying.value = false;
		}
	}

	function getApplicationStatus(jobTitle) {
		const application = userApplications.value.find(
			(app) => app.job_title === jobTitle
		);
		if (!application) return null;

		return application.is_paid ? "applied" : "waiting";
	}

	function getApplicationButtonText(jobTitle) {
		const status = getApplicationStatus(jobTitle);
		const limitStatus = getApplicationLimitStatus();

		if (status === "applied") return "✅ Applied";
		if (status === "waiting") return "⏳ Waiting for Payment";

		// If at limit and haven't applied to this job, show limit reached
		if (limitStatus.isAtLimit) return "❌ Limit Reached (2/2)";

		return "Apply Now";
	}

	function canApply(jobTitle) {
		const status = getApplicationStatus(jobTitle);
		const totalApplications = userApplications.value.length;
		const maxApplications = 2;

		// Can't apply if already applied to this job
		if (status !== null) return false;

		// Can't apply if reached the limit
		if (totalApplications >= maxApplications) return false;

		return true;
	}

	function getApplicationLimitStatus() {
		const totalApplications = userApplications.value.length;
		const maxApplications = 2;

		return {
			current: totalApplications,
			max: maxApplications,
			remaining: Math.max(0, maxApplications - totalApplications),
			isAtLimit: totalApplications >= maxApplications,
		};
	}

	function setActiveTab(tab) {
		currentTab.value = tab;

		// Navigate to different pages based on tab
		if (tab === "home") {
			router.push("/user-home");
		} else if (tab === "jobs") {
			// Already on jobs page
		} else if (tab === "payment") {
			router.push("/payment");
		} else if (tab === "chat") {
			router.push("/chat");
		} else if (tab === "profile") {
			router.push("/profile");
		} else {
			// For other tabs, could navigate or show placeholder
			alert(`${tab} feature coming soon!`);
		}
	}
</script>

<template>
	<div class="min-h-screen bg-white pb-20">
		<!-- Header -->
		<div class="bg-red-600 text-white px-4 py-4 shadow-lg">
			<div class="flex items-center justify-between pt-4">
				<button @click="goBack" class="flex items-center text-white">
					<svg
						class="w-6 h-6 mr-2"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 19l-7-7 7-7"
						/>
					</svg>
					Back
				</button>
				<h1 class="text-2xl font-semibold tracking-wide">Jobs</h1>
				<div class="w-16"></div>
			</div>
		</div>

		<!-- Main Content -->
		<div class="px-4 py-5">
			<!-- Search Section -->
			<div
				class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-5"
			>
				<h2 class="text-2xl font-bold text-gray-800 mb-2 text-center">
					Find Your Dream Job in Canada
				</h2>
				<p class="text-gray-600 text-center leading-6 mb-4">
					Discover opportunities across various industries and provinces
				</p>

				<!-- Application Limit Status -->
				<div class="bg-gray-50 p-3 rounded-lg">
					<div class="flex justify-between items-center text-sm">
						<span class="text-gray-700 font-medium">Application Status:</span>
						<span
							:class="[
								'px-3 py-1 rounded-full text-xs font-semibold',
								getApplicationLimitStatus().isAtLimit
									? 'bg-red-100 text-red-800'
									: 'bg-blue-100 text-blue-800',
							]"
						>
							{{ getApplicationLimitStatus().current }}/{{
								getApplicationLimitStatus().max
							}}
							Used
						</span>
					</div>
					<div class="mt-2">
						<div class="w-full bg-gray-200 rounded-full h-2">
							<div
								:class="[
									'h-2 rounded-full transition-all duration-300',
									getApplicationLimitStatus().isAtLimit
										? 'bg-red-500'
										: 'bg-blue-500',
								]"
								:style="{
									width:
										(getApplicationLimitStatus().current /
											getApplicationLimitStatus().max) *
											100 +
										'%',
								}"
							></div>
						</div>
						<p class="text-xs text-gray-500 mt-1 text-center">
							{{
								getApplicationLimitStatus().isAtLimit
									? "Application limit reached"
									: getApplicationLimitStatus().remaining +
									  " applications remaining"
							}}
						</p>
					</div>
				</div>
			</div>

			<!-- Job Listings -->
			<div class="space-y-4">
				<div
					v-for="job in jobListings"
					:key="job.id"
					class="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
				>
					<!-- Job Header -->
					<div class="flex justify-between items-start mb-2">
						<h3 class="text-xl font-bold text-gray-800 flex-1 pr-3">
							{{ job.title }}
						</h3>
					</div>

					<!-- Location -->
					<p class="text-sm text-gray-600 mb-1">📍 {{ job.location }}</p>

					<!-- Salary -->
					<p class="text-sm text-green-600 font-semibold mb-3">
						💰 {{ job.salary }}
					</p>

					<!-- Description -->
					<p class="text-sm text-gray-700 leading-5 mb-4">
						{{ job.description }}
					</p>

					<!-- Apply Button -->
					<div class="space-y-2">
						<!-- Status Info -->
						<div
							v-if="getApplicationStatus(job.title)"
							class="text-xs text-center"
						>
							<span
								:class="[
									'px-2 py-1 rounded-full text-xs font-medium',
									getApplicationStatus(job.title) === 'applied'
										? 'bg-green-100 text-green-800'
										: 'bg-yellow-100 text-yellow-800',
								]"
							>
								{{
									getApplicationStatus(job.title) === "applied"
										? "Application Approved"
										: "Payment Pending"
								}}
							</span>
						</div>

						<!-- Apply Button -->
						<button
							@click="
								canApply(job.title) ? handleApply(job.title, job.salary) : null
							"
							:disabled="isApplying || !canApply(job.title)"
							:class="[
								'w-full py-3 px-6 rounded-lg font-semibold transition-colors',
								canApply(job.title)
									? 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50'
									: getApplicationStatus(job.title) === 'applied'
									? 'bg-green-600 text-white cursor-default'
									: getApplicationLimitStatus().isAtLimit
									? 'bg-red-500 text-white cursor-not-allowed opacity-60'
									: 'bg-yellow-500 text-white cursor-default',
							]"
						>
							{{
								isApplying ? "Applying..." : getApplicationButtonText(job.title)
							}}
						</button>
					</div>
				</div>
			</div>

			<!-- Footer Section -->
			<div
				class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mt-5"
			>
				<p class="text-sm text-gray-600 text-center leading-5">
					Can't find what you're looking for? Check back regularly as new
					opportunities are posted daily across Canada.
				</p>
			</div>
		</div>

		<!-- Bottom Navigation -->
		<BottomNav :current-tab="currentTab" @tab-change="setActiveTab" />
	</div>
</template>
