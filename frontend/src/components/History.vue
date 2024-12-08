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
          <div class="flex space-x-2">
            <button 
              @click="toggleDetails(job.id)"
              class="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
            >
              {{ expandedJobs.includes(job.id) ? 'Hide Details' : 'Show Details' }}
            </button>
            <button 
              @click="downloadJSON(job)"
              class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm"
            >
              Download JSON
            </button>
            <span class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="{
                    'bg-green-900 text-green-200': job.status === 'completed',
                    'bg-yellow-900 text-yellow-200': job.status === 'processing'
                  }">
              {{ job.status }}
            </span>
          </div>
        </div>
        
        <!-- Basic Stats -->
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

        <!-- Expanded Details Section -->
        <div v-if="expandedJobs.includes(job.id)" class="mt-4 border-t border-gray-700 pt-4">
          <div v-if="job.output?.documents?.length" class="space-y-4">
            <div v-for="doc in job.output.documents" :key="doc.document_id"
                 class="bg-gray-900 p-3 rounded">
              <h4 class="text-white font-medium">{{ doc.title }}</h4>
              <p class="text-gray-400 text-sm mt-1">{{ doc.summary }}</p>
              <div class="mt-2 text-xs text-gray-500">
                <span>Document ID: {{ doc.document_id }}</span>
                <span class="mx-2">|</span>
                <span>Last Edited: {{ doc.last_edited_time }}</span>
              </div>
              <div class="mt-2">
                <p class="text-xs text-gray-400">Tags:</p>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span v-for="tag in doc.tags" 
                        :key="tag"
                        class="px-2 py-0.5 bg-gray-700 rounded-full text-xs text-gray-300">
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-400 text-sm">
            No document details available
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { websocketStore } from '../utils/websocketStore'
import type { ProcessingJob } from '../utils/websocketStore'

const expandedJobs = ref<string[]>([])

onMounted(() => {
  websocketStore.loadHistory()
})

const jobHistory = computed(() => {
  return websocketStore.processingHistory.value
})

function toggleDetails(jobId: string) {
  const index = expandedJobs.value.indexOf(jobId)
  if (index === -1) {
    expandedJobs.value.push(jobId)
  } else {
    expandedJobs.value.splice(index, 1)
  }
}

function downloadJSON(job: ProcessingJob) {
  const outputData = job.output?.documents ? {
    documents: job.output.documents,
    metadata: {
      processedFiles: job.processedFiles,
      totalFiles: job.totalFiles,
      cost: job.cost,
      totalTokens: job.totalTokens,
      timestamp: job.timestamp
    }
  } : job;
  
  const dataStr = JSON.stringify(outputData, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
  
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', `batch-${job.id}-${new Date(job.timestamp).toISOString()}.json`)
  document.body.appendChild(linkElement)
  linkElement.click()
  document.body.removeChild(linkElement)
}
</script> 