<script setup>
	import { ref, onMounted } from "vue";
	import { useRouter } from "vue-router";
	import AdminBottomNav from "../components/AdminBottomNav.vue";

	const router = useRouter();
	const currentTab = ref("users");
	const users = ref([]);
	const loading = ref(true);
	const filteredUsers = ref([]);
	const statusFilter = ref("all");
	const paymentModal = ref({ show: false, imageUrl: "", userName: "" });
	const usersWithPayments = ref(new Set());

	onMounted(async () => {
		// Check if user is admin
		const userData = localStorage.getItem("userData");
		if (userData) {
			const user = JSON.parse(userData);
			if (!user.is_admin && user.role !== "admin") {
				router.push("/user-home");
			}
		} else {
			router.push("/login");
		}

		await loadUsers();
	});

	const loadUsers = async () => {
		try {
			const token =
				localStorage.getItem("token") || localStorage.getItem("userToken");
			if (!token) {
				throw new Error("No authentication token found");
			}

			const response = await fetch("https://canada.rohatechs.com/api/users", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
					Accept: "application/json",
				},
			});

			if (response.ok) {
				const data = await response.json();
				if (data.users) {
					// Filter out users with admin role
					const filteredUsers = data.users.filter(
						(user) => user.role !== "admin"
					);
					// Sort users by created_at in descending order (latest first)
					users.value = filteredUsers.sort(
						(a, b) => new Date(b.created_at) - new Date(a.created_at)
					);

					// Check which users have payments
					await checkAllUsersPayments(filteredUsers);
					applyFilters();
				}
			} else {
				console.error("Failed to load users");
			}
		} catch (error) {
			console.error("Error loading users:", error);
		} finally {
			loading.value = false;
		}
	};

	const applyFilters = () => {
		let filtered = [...users.value];

		// Apply status filter
		if (statusFilter.value !== "all") {
			filtered = filtered.filter((user) => user.status === statusFilter.value);
		}

		filteredUsers.value = filtered;
	};

	const updateUserStatus = async (userId, newStatus) => {
		try {
			const token =
				localStorage.getItem("token") || localStorage.getItem("userToken");
			const response = await fetch(
				`https://canada.rohatechs.com/api/users/${userId}/status`,
				{
					method: "PATCH",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
						Accept: "application/json",
					},
					body: JSON.stringify({ status: newStatus }),
				}
			);

			if (response.ok) {
				// Update the user in the local array
				const userIndex = users.value.findIndex((user) => user.id === userId);
				if (userIndex !== -1) {
					users.value[userIndex].status = newStatus;
					applyFilters();
				}
			} else {
				console.error("Failed to update user status");
			}
		} catch (error) {
			console.error("Error updating user status:", error);
		}
	};

	const viewUserPayment = async (userId, userName) => {
		try {
			const token =
				localStorage.getItem("token") || localStorage.getItem("userToken");
			if (!token) {
				throw new Error("No authentication token found");
			}

			const response = await fetch(
				`https://canada.rohatechs.com/api/admin/payments?type=first&user_id=${userId}`,
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
						Accept: "application/json",
					},
				}
			);

			if (response.ok) {
				const data = await response.json();
				if (data.data && data.data.length > 0) {
					// Get the latest payment (first in the array since it's ordered by latest)
					const latestPayment = data.data[0];
					paymentModal.value = {
						show: true,
						imageUrl: latestPayment.image_url,
						userName: userName,
					};
				} else {
					alert("No payment found for this user");
				}
			} else {
				console.error("Failed to fetch payment");
				alert("Failed to fetch payment");
			}
		} catch (error) {
			console.error("Error fetching payment:", error);
			alert("Error fetching payment");
		}
	};

	const closePaymentModal = () => {
		paymentModal.value.show = false;
	};

	const checkUserHasPayment = async (userId) => {
		if (usersWithPayments.value.has(userId)) {
			return true;
		}

		try {
			const token =
				localStorage.getItem("token") || localStorage.getItem("userToken");
			if (!token) {
				return false;
			}

			const response = await fetch(
				`https://canada.rohatechs.com/api/admin/payments?type=first&user_id=${userId}`,
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
						Accept: "application/json",
					},
				}
			);

			if (response.ok) {
				const data = await response.json();
				const hasPayment = data.data && data.data.length > 0;
				if (hasPayment) {
					usersWithPayments.value.add(userId);
				}
				return hasPayment;
			}
			return false;
		} catch (error) {
			console.error("Error checking user payment:", error);
			return false;
		}
	};

	const checkAllUsersPayments = async (userList) => {
		try {
			const token =
				localStorage.getItem("token") || localStorage.getItem("userToken");
			if (!token) {
				return;
			}

			// Get all payments with type 'first'
			const response = await fetch(
				`https://canada.rohatechs.com/api/admin/payments?type=first`,
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
						Accept: "application/json",
					},
				}
			);

			if (response.ok) {
				const data = await response.json();
				if (data.data && data.data.length > 0) {
					// Create a set of user IDs that have payments
					const usersWithPaymentsSet = new Set(
						data.data.map((payment) => payment.user_id)
					);
					usersWithPayments.value = usersWithPaymentsSet;
				}
			}
		} catch (error) {
			console.error("Error checking all users payments:", error);
		}
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "approved":
				return "bg-green-100 text-green-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const handleTabChange = (tab) => {
		currentTab.value = tab;
		if (tab === "home") {
			router.push("/admin-home");
		} else if (tab === "job") {
			router.push("/admin-job-app");
		} else if (tab === "users") {
			// Already on users page, no navigation needed
			return;
		} else if (tab === "chat") {
			router.push("/admin-chat");
		} else if (tab === "payment") {
			router.push("/admin-payment");
		}
	};

	// Watch for filter changes
	const onStatusFilterChange = () => {
		applyFilters();
	};
</script>

<template>
	<div class="min-h-screen bg-gray-50 pb-20">
		<!-- Header -->
		<div class="bg-red-600 text-white p-4">
			<h1 class="text-2xl font-bold mb-2">User Management</h1>
		</div>

		<!-- Loading State -->
		<div v-if="loading" class="flex justify-center items-center h-64">
			<div class="text-center">
				<div
					class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"
				></div>
				<p class="text-gray-600">Loading users...</p>
			</div>
		</div>

		<!-- Main Content -->
		<div v-else class="container mx-auto p-4">
			<!-- Filters -->
			<div class="bg-white p-4 rounded-lg shadow-md mb-6">
				<div class="flex flex-col gap-4">
					<!-- Status Filter Buttons -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2"
							>Filter by Status</label
						>
						<div class="flex gap-2">
							<button
								@click="
									statusFilter = 'all';
									onStatusFilterChange();
								"
								:class="[
									'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
									statusFilter === 'all'
										? 'bg-red-600 text-white'
										: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
								]"
							>
								All
							</button>
							<button
								@click="
									statusFilter = 'pending';
									onStatusFilterChange();
								"
								:class="[
									'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
									statusFilter === 'pending'
										? 'bg-red-600 text-white'
										: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
								]"
							>
								Pending
							</button>
							<button
								@click="
									statusFilter = 'approved';
									onStatusFilterChange();
								"
								:class="[
									'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
									statusFilter === 'approved'
										? 'bg-red-600 text-white'
										: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
								]"
							>
								Approved
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Users Count -->
			<div class="mb-4">
				<p class="text-gray-600">
					Showing {{ filteredUsers.length }} of {{ users.length }} users
				</p>
			</div>

			<!-- Users List -->
			<div class="space-y-4">
				<div
					v-for="user in filteredUsers"
					:key="user.id"
					class="bg-white p-6 rounded-lg shadow-md border border-gray-200"
				>
					<div
						class="flex flex-col md:flex-row md:items-center justify-between gap-4"
					>
						<!-- User Info -->
						<div class="flex-1">
							<div class="flex items-center gap-3 mb-2">
								<h3 class="text-lg font-semibold text-gray-800">
									{{ user.first_name }} {{ user.last_name }}
								</h3>
								<span
									:class="[
										'px-2 py-1 rounded text-xs font-medium',
										getStatusColor(user.status),
									]"
								>
									{{ user.status || "Unknown" }}
								</span>
							</div>

							<div
								class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600"
							>
								<div v-if="user.phone">
									<span class="font-medium">Phone:</span> {{ user.phone }}
								</div>
								<div v-if="user.email">
									<span class="font-medium">Email:</span> {{ user.email }}
								</div>
								<div v-if="user.created_at">
									<span class="font-medium">Joined:</span>
									{{ new Date(user.created_at).toLocaleDateString() }}
								</div>
							</div>
						</div>

						<!-- Action Buttons -->
						<div class="flex flex-col gap-2">
							<div class="flex gap-2">
								<button
									v-if="user.status === 'pending'"
									@click="updateUserStatus(user.id, 'approved')"
									class="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition-colors text-sm"
								>
									Approve
								</button>

								<button
									v-if="user.status === 'approved'"
									@click="updateUserStatus(user.id, 'pending')"
									class="bg-yellow-600 text-white px-3 py-1.5 rounded-md hover:bg-yellow-700 transition-colors text-sm"
								>
									Set Pending
								</button>
							</div>

							<div class="flex justify-center">
								<div
									v-if="usersWithPayments.has(user.id)"
									class="flex justify-center"
								>
									<button
										@click="
											viewUserPayment(
												user.id,
												`${user.first_name} ${user.last_name}`
											)
										"
										class="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm"
									>
										View Payment
									</button>
								</div>
								<div v-else class="flex justify-center">
									<span
										class="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-md text-sm font-medium"
									>
										No Payment
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Empty State -->
				<div v-if="filteredUsers.length === 0" class="text-center py-12">
					<div class="text-gray-400 text-6xl mb-4">👥</div>
					<h3 class="text-lg font-medium text-gray-900 mb-2">No users found</h3>
					<p class="text-gray-600">
						{{
							statusFilter !== "all"
								? "Try adjusting your filters"
								: "No users available"
						}}
					</p>
				</div>
			</div>
		</div>

		<!-- Payment Modal -->
		<div
			v-if="paymentModal.show"
			class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
			@click="closePaymentModal"
		>
			<div
				class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
				@click.stop
			>
				<div class="flex justify-between items-center mb-4">
					<h3 class="text-lg font-semibold text-gray-800">
						Payment Receipt - {{ paymentModal.userName }}
					</h3>
					<button
						@click="closePaymentModal"
						class="text-gray-500 hover:text-gray-700 text-xl"
					>
						×
					</button>
				</div>

				<div class="flex justify-center">
					<img
						:src="paymentModal.imageUrl"
						alt="Payment Receipt"
						class="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
					/>
				</div>
			</div>
		</div>

		<!-- Admin Bottom Navigation -->
		<AdminBottomNav :current-tab="currentTab" @tab-change="handleTabChange" />
	</div>
</template>
