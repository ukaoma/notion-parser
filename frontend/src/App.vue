<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import FileUpload from './components/FileUpload.vue'
import History from './components/History.vue'
import { websocketStore } from './utils/websocketStore'

const currentComponent = ref(FileUpload)
const activeTab = ref('upload')

onMounted(() => {
  websocketStore.connect()
})

onUnmounted(() => {
  websocketStore.disconnect()
})

const switchTab = (tab: string) => {
  activeTab.value = tab
  currentComponent.value = tab === 'upload' ? FileUpload : History
}
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <!-- Header with Description -->
    <header class="border-b border-gray-800 mb-0">
      <div class="max-w-4xl mx-auto px-4 py-6 text-center">
        <div class="flex flex-col items-center space-y-4 mb-4">
          <img 
            src="/quilt-logo.png" 
            alt="Quilt Logo" 
            class="h-12 mb-2"
          />
          <h1 class="text-2xl font-bold text-purple-500">Notion Parser</h1>
        </div>
        <p class="text-gray-400 max-w-2xl mx-auto">
          Upload your Notion export files and convert them into structured JSON for AI processing
        </p>
      </div>
    </header>

    <!-- Navigation -->
    <div class="border-b border-gray-800">
      <nav class="max-w-4xl mx-auto px-4 py-3">
        <button 
          @click="switchTab('upload')"
          :class="[
            'px-4 py-2 rounded-md text-sm font-medium mr-2',
            activeTab === 'upload' 
              ? 'bg-purple-600 text-white' 
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          ]"
        >
          Upload
        </button>
        <button 
          @click="switchTab('history')"
          :class="[
            'px-4 py-2 rounded-md text-sm font-medium',
            activeTab === 'history' 
              ? 'bg-purple-600 text-white' 
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          ]"
        >
          Job History
        </button>
      </nav>
    </div>

    <!-- Component Display -->
    <keep-alive :include="['FileUpload', 'History']">
      <component 
        :is="currentComponent" 
      />
    </keep-alive>
  </div>
</template>

<style>
body {
  @apply bg-gray-900;
}

.gradient-border {
  position: relative;
  border-radius: 0.5rem;
}

.gradient-border::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #3b82f6, #8b5cf6);
  border-radius: 0.6rem;
  z-index: -1;
}
</style>
