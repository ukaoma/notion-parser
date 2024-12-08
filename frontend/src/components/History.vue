<template>
  <div class="max-w-4xl mx-auto p-4">
    <div v-if="!jobHistory.length" class="text-center py-8">
      <p class="text-gray-400">No processing history available</p>
      <p class="text-sm text-gray-500 mt-2">Process some files to see them here</p>
    </div>
    
    <div v-else class="space-y-4">
      <div v-for="job in jobHistory" 
           :key="job.id" 
           class="border border-gray-700 p-4 rounded-lg bg-gray-800">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-medium text-white">
              Batch Process {{ new Date(job.timestamp).toLocaleString() }}
            </h3>
            <p class="text-sm text-gray-400">
              Files: {{ job.processedFiles }}/{{ job.totalFiles }}
            </p>
          </div>
          <span class="px-2 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-green-900 text-green-200': job.status === 'completed',
                  'bg-yellow-900 text-yellow-200': job.status === 'processing'
                }">
            {{ job.status }}
          </span>
        </div>
        
        <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-gray-400">Total Cost</p>
            <p class="text-green-400">${{ job.cost.toFixed(4) }}</p>
          </div>
          <div>
            <p class="text-gray-400">Total Tokens</p>
            <p class="text-white">{{ job.totalTokens.toLocaleString() }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { websocketStore } from '../utils/websocketStore'

onMounted(() => {
  console.log('History component mounted')
  websocketStore.loadHistory()
  console.log('Current history:', websocketStore.processingHistory.value)
})

const jobHistory = computed(() => {
  const history = websocketStore.processingHistory.value
  console.log('Job history computed:', history)
  return history
})
</script> 