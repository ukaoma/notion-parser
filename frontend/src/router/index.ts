import { createRouter, createWebHistory } from 'vue-router'
import FileUpload from '../components/FileUpload.vue'
import History from '../components/History.vue'

const routes = [
  {
    path: '/',
    name: 'FileUpload',
    component: FileUpload
  },
  {
    path: '/history',
    name: 'History',
    component: History
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
}) 