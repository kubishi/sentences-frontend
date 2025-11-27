import { createRouter, createWebHistory } from 'vue-router'
import Builder from '../views/Builder.vue'
import Translator from '../views/Translator.vue'
import About from '../views/About.vue'

const routes = [
  {
    path: '/',
    redirect: '/builder'
  },
  {
    path: '/builder',
    name: 'builder',
    component: Builder
  },
  {
    path: '/translator',
    name: 'translator',
    component: Translator
  },
  {
    path: '/about',
    name: 'about',
    component: About
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
