<template>
  <div class="max-w-4xl mx-auto p-4">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-100 mb-2">Processing History</h2>
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div class="text-gray-400 text-sm">Total Cost</div>
          <div class="text-2xl font-mono text-green-400">
            ${{ fileStore.totalCost.toFixed(4) }}
          </div>
        </div>
        <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div class="text-gray-400 text-sm">Total Documents</div>
          <div class="text-2xl font-mono text-gray-100">
            {{ fileStore.totalDocuments.toLocaleString() }}
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <div v-for="batch in fileStore.processedBatches" 
           :key="batch.id" 
           class="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div class="flex justify-between items-start mb-3">
          <div>
            <h3 class="font-semibold text-gray-200">{{ batch.title }}</h3>
            <div class="text-sm text-gray-400">
              {{ new Date(batch.timestamp).toLocaleString() }}
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="downloadBatch(batch)"
              class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm"
            >
              Download JSON
            </button>
            <button
              @click="fileStore.deleteBatch(batch.id)"
              class="text-gray-400 hover:text-red-400"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div class="text-gray-400">Documents</div>
            <div class="text-gray-200">{{ batch.documentCount }}</div>
          </div>
          <div>
            <div class="text-gray-400">Tokens</div>
            <div class="text-gray-200">{{ batch.totalTokens.toLocaleString() }}</div>
          </div>
          <div>
            <div class="text-gray-400">Cost</div>
            <div class="text-green-400">${{ batch.cost.toFixed(4) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useFileStore } from '../store/fileStore';

export default defineComponent({
  name: 'History',
  
  setup() {
    const fileStore = useFileStore();

    const downloadBatch = (batch: any) => {
      const data = JSON.stringify(batch.documents, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notion-export-${batch.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    return {
      fileStore,
      downloadBatch,
    };
  },
});
</script> 