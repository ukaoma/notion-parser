<template>
  <div class="max-w-4xl mx-auto p-4">
    <div v-if="isLoading" class="text-center py-8">
      <p>Loading history...</p>
    </div>
    
    <div v-else-if="error" class="text-center py-8 text-red-500">
      <p>Error loading history: {{ error.message }}</p>
    </div>
    
    <div v-else-if="jobHistory.length === 0" class="text-center py-8">
      <p>No processing history available</p>
    </div>
    
    <div v-else class="space-y-4">
      <div v-for="job in jobHistory" :key="job.id" class="border p-4 rounded-lg">
        <p>Job ID: {{ job.id }}</p>
        <p>Status: {{ job.status }}</p>
        <p>Time: {{ new Date(job.timestamp).toLocaleString() }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface JobHistoryItem {
  id: string
  timestamp: Date
  status: string
  // Add other fields as needed
}

// Initialize with proper typing and default values
const jobHistory = ref<JobHistoryItem[]>([])
const isLoading = ref<boolean>(true)
const error = ref<Error | null>(null)

// Add proper initialization
onMounted(async () => {
  try {
    isLoading.value = true
    // Fetch history data here
    // For now, initialize with empty state
    jobHistory.value = []
  } catch (err) {
    error.value = err instanceof Error ? err : new Error('Unknown error')
    console.error('Failed to load history:', err)
  } finally {
    isLoading.value = false
  }
})
</script> 