import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import UserHomeView from '../views/UserHomeView.vue'
import AdminHomeView from '../views/AdminHomeView.vue'
import AdminJobAppView from '../views/AdminJobAppView.vue'
import AdminChatView from '../views/AdminChatView.vue'
import AdminUsersView from '../views/AdminUsersView.vue'
import AdminPaymentView from '../views/AdminPaymentView.vue'
import UserJobListView from '../views/UserJobListView.vue'
import PaymentView from '../views/PaymentView.vue'
import ChatView from '../views/ChatView.vue'
import ProfileView from '../views/ProfileView.vue'
import PendingApprovalView from '../views/PendingApprovalView.vue'



const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'Register',
      component: RegisterView,
    },
    {
      path: '/pending-approval',
      name: 'PendingApproval',
      component: PendingApprovalView,
      meta: { requiresAuth: true }
    },
    {
      path: '/user-home',
      name: 'UserHome',
      component: UserHomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin-home',
      name: 'AdminHome',
      component: AdminHomeView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin-job-app',
      name: 'AdminJobApp',
      component: AdminJobAppView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin-chat',
      name: 'AdminChat',
      component: AdminChatView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin-users',
      name: 'AdminUsers',
      component: AdminUsersView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin-payment',
      name: 'AdminPayment',
      component: AdminPaymentView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/jobs',
      name: 'JobList',
      component: UserJobListView,
      meta: { requiresAuth: true }
    },
    {
      path: '/payment',
      name: 'Payment',
      component: PaymentView,
      meta: { requiresAuth: true }
    },
    {
      path: '/chat',
      name: 'Chat',
      component: ChatView,
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: ProfileView,
      meta: { requiresAuth: true }
    },
  ],
})

// Route guards
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('userToken')
  const userData = localStorage.getItem('userData')

  if (to.meta.requiresAuth) {
    if (!token || !userData) {
      // Redirect to login if not authenticated
      next('/login')
      return
    }

    const user = JSON.parse(userData)

    if (to.meta.requiresAdmin) {
      if (!user.is_admin && user.role !== 'admin') {
        // Redirect to user home if not admin
        next('/user-home')
        return
      }
    }

    // Check if user has pending status and is trying to access non-pending pages
    if (user.status === 'pending' && to.path !== '/pending-approval') {
      // Redirect pending users to pending approval page
      next('/pending-approval')
      return
    }

    // Prevent approved users from accessing pending approval page
    if (user.status !== 'pending' && to.path === '/pending-approval') {
      // Redirect approved users to user home
      next('/user-home')
      return
    }
  }

  next()
})

export default router
