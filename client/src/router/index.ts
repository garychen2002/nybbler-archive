import { signIn } from '@/services/auth'
import HomeView from '@/views/HomeView.vue'
import { createRouter, createWebHistory } from 'vue-router'

// route level code-splitting
// this generates a separate chunk (About.[hash].js) for this route
// which is lazy-loaded when the route is visited.
const AboutView = () => import('../views/AboutView.vue')
const ProjectView = () => import('../views/ProjectView.vue')
const ProjectsView = () => import('../views/ProjectsView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
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
      component: AboutView
    },
    {
      path: '/auth/callback',
      name: 'callback',
      component: {
        template: '<div>Loading...</div>',
        async created() {
          const code = new URLSearchParams(window.location.search).get('code')
          if (code) {
            await signIn(code)
            this.$router.push({ name: 'projects' })
          }
        }
      }
    }
  ]
})

export default router
