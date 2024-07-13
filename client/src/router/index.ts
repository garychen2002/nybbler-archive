import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import ProjectView from '@/views/ProjectView.vue'
import ProjectsView from '@/views/ProjectsView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/projects',
      name: 'projects',
      component: ProjectsView
    },
    {
      path: '/projects/:projectId',
      name: 'project',
      component: ProjectView,
      props: true
    },
    {
      path: '/projects/:projectId/binaries/:binaryId',
      name: 'project-binary',
      component: ProjectView,
      props: true
    },
    {
      path: '/projects/:projectId/binaries/:binaryId/address/:address',
      name: 'project-binary-address',
      component: ProjectView,
      props: true
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    { path: '/auth/callback',
      name: 'callback',
      component: { 
        template: '<div>Loading...</div>',
        created() {
          const code = new URLSearchParams(window.location.search).get('code');
          if (code) {
            this.getToken(code);
          }
        },
        methods: {
          async getToken(code: string) {
            try {
              const { VITE_API_BASE_URL } = import.meta.env
              await axios.get(`${VITE_API_BASE_URL}/auth/callback?code=${code}`);
              this.$router.push({ name: 'projects' })
            } catch (error) {
              console.error('Failed to get access token', error);
            }
          },
        },
      }
    },
  ]
})

export default router
