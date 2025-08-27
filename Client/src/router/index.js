import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import UserHomeView from '../views/UserHomeView.vue'
import AdminHomeView from '../views/AdminHomeView.vue'



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

    if (to.meta.requiresAdmin) {
      const user = JSON.parse(userData)
      if (!user.is_admin && user.role !== 'admin') {
        // Redirect to user home if not admin
        next('/user-home')
        return
      }
    }
  }

  next()
})

export default router
