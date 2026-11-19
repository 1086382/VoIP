import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/:appdirectory/test-key',
      component: () => import('@/components/HardwarkeyTest.vue')
    },
    {
      path: '/404',
      component: () => import('@/components/ErrorPage.vue')
    },
    {
      path: '/',
      component: () => import('@/components/Login.vue')
    },
    {
      path: '/:appdirectory',
      component: () => import('@/components/Login.vue')
    },
    {
      path: '/:appdirectory/signup',
      component: () => import('@/components/Signup.vue')
    },
    {
      path: '/:appdirectory/dashboard',
      component: () => import('@/components/Dashboard.vue')
    },
    { path: '/:pathMatch(.*)*', component: () => import('@/components/ErrorPage.vue') }
  ]
})
