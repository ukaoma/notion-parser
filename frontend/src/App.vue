<script setup lang="ts">
import FileUpload from './components/FileUpload.vue'
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 text-white">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Logo and Header -->
      <div class="text-center mb-12">
        <img src="/quilt-logo.png" alt="Quilt Logo" class="h-12 mx-auto mb-8" />
        <h1 class="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Knowledge Base Parser
        </h1>
        <p class="text-gray-300 text-lg max-w-2xl mx-auto">
          Transform your Notion documentation into structured data for AI integration. 
          Export your pages from Notion as HTML with sub-pages, then upload the ZIP to receive JSON output for the Knowledge Bot.
        </p>
      </div>
      <FileUpload />
    </div>
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
