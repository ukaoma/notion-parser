import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { useFileStore } from './store/fileStore'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

const fileStore = useFileStore()
await fileStore.initialize()

app.mount('#app')
