<template>
  <div class="max-w-4xl mx-auto p-4">
    <!-- Server Status -->
    <div class="mb-4 flex items-center justify-end">
      <div class="flex items-center space-x-2">
        <div :class="{
          'w-2 h-2 rounded-full': true,
          'bg-green-500': serverStatus === 'connected',
          'bg-red-500': serverStatus === 'disconnected',
          'bg-yellow-500 animate-pulse': serverStatus === 'checking'
        }"></div>
        <span class="text-sm text-gray-400">{{ serverStatus }}</span>
      </div>
    </div>

    <!-- Upload Area -->
    <div
      class="border-dashed border-2 border-gray-600 p-8 rounded-lg text-center cursor-pointer bg-gray-800 hover:bg-gray-700"
      @drop.prevent="handleDrop"
      @dragover.prevent
      @click="$refs.fileInput.click()"
    >
      <input
        type="file"
        accept=".zip"
        class="hidden"
        ref="fileInput"
        @change="handleFileInput"
      />
      <div class="text-lg mb-2 text-gray-200">
        Drag and drop a ZIP file here, or <span class="text-blue-400">browse</span>
      </div>
    </div>

    <!-- Progress Display -->
    <div v-if="uploading || processingLogs.length" class="mt-4">
      <div class="mb-4">
        <div class="flex justify-between mb-1">
          <span class="text-sm font-medium text-gray-200">Overall Progress</span>
          <span class="text-sm font-medium text-gray-200">
            {{ processedFiles }}/{{ totalFiles }} HTML files ({{ overallProgress }}%)
            <span v-if="estimatedTimeRemaining" class="text-gray-400 ml-2">
              • {{ estimatedTimeRemaining }} remaining
            </span>
          </span>
        </div>
        <!-- Progress bar -->
        <div class="w-full bg-gray-700 rounded-lg h-4 overflow-hidden">
          <div 
            class="bg-gradient-to-r from-[#7C3AED] via-[#A78BFA] to-[#C4B5FD] h-full rounded-lg transition-all duration-500"
            :style="{ width: `${overallProgress}%` }"
          >
          </div>
        </div>
      </div>
    </div>

    <!-- Add real-time stats before logs -->
    <div class="grid grid-cols-2 gap-4 mt-3 mb-4">
      <div class="bg-gray-800 rounded-lg p-3 border border-gray-700">
        <div class="flex justify-between items-center">
          <span class="text-gray-400 text-sm">Current File</span>
          <span class="text-gray-200 font-mono truncate max-w-[200px]">
            {{ currentDocument?.title || 'None' }}
          </span>
        </div>
        <div class="flex justify-between items-center mt-1">
          <span class="text-gray-400 text-sm">Processing Rate</span>
          <span class="text-gray-200 font-mono">{{ processingRate }} files/sec</span>
        </div>
      </div>
      
      <div class="bg-gray-800 rounded-lg p-3 border border-gray-700">
        <div class="flex justify-between items-center">
          <span class="text-gray-400 text-sm">Current Cost</span>
          <span class="text-green-400 font-mono">${{ runningCost.toFixed(4) }}</span>
        </div>
        <div class="flex justify-between items-center mt-1">
          <span class="text-gray-400 text-sm">Total Tokens</span>
          <span class="text-gray-200 font-mono">{{ totalTokens.toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <!-- Processing Logs -->
    <div class="terminal-window bg-black text-green-400 font-mono text-sm rounded-lg p-4 overflow-hidden">
      <div 
        ref="logsContainerRef"
        @scroll="handleScroll"
        class="logs-container overflow-y-auto"
      >
        <div v-for="(log, index) in processingLogs" :key="index">{{ log }}</div>
      </div>
    </div>

    <!-- Update download button -->
    <div v-if="processingComplete" class="fixed bottom-4 right-4 flex flex-col items-end gap-2 z-50">
      <div class="bg-gray-900 p-4 rounded-lg shadow-xl border border-purple-500">
        <div class="text-sm text-gray-300 mb-2">
          ✨ Your Knowledge Base is ready!
        </div>
        <button
          @click="downloadJSON"
          class="download-button bg-gradient-to-r from-[#7C3AED] to-[#C4B5FD] text-white px-6 py-3 rounded-lg 
                 hover:opacity-90 transition-all flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          Download JSON for Knowledge Bot
        </button>
      </div>
    </div>

    <!-- Summary Stats -->
    <div v-if="processingComplete && parsedData?.documents?.length > 0" class="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-600"
         @vue:mounted="() => console.log('Summary mounted:', {
           processingComplete: processingComplete,
           documentsLength: parsedData?.documents?.length,
           firstDocument: parsedData?.documents?.[0]
         })">
      <div class="text-2xl font-bold text-gray-100 mb-6 flex items-center">
        <svg class="w-6 h-6 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Processing Complete
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-gray-900 p-4 rounded-lg">
          <div class="text-gray-400 text-sm">Total Time</div>
          <div class="text-gray-100 text-lg font-mono">{{ totalProcessingTime }}</div>
        </div>
        <div class="bg-gray-900 p-4 rounded-lg">
          <div class="text-gray-400 text-sm">Documents Processed</div>
          <div class="text-gray-100 text-lg font-mono">{{ processedFiles }}/{{ totalFiles }}</div>
        </div>
        <div class="bg-gray-900 p-4 rounded-lg">
          <div class="text-gray-400 text-sm">Total Tokens</div>
          <div class="text-gray-100 text-lg font-mono">{{ totalTokens.toLocaleString() }}</div>
        </div>
        <div class="bg-gray-900 p-4 rounded-lg">
          <div class="text-gray-400 text-sm">Total Cost</div>
          <div class="text-gray-100 text-lg font-mono">${{ runningCost.toFixed(4) }}</div>
        </div>
      </div>

      <!-- Document Previews -->
      <div class="mt-6 space-y-4">
        <h3 class="text-xl font-semibold text-gray-200 mb-4">Processed Documents</h3>
        <div v-for="doc in parsedData.documents" :key="doc.document_id" 
             class="border border-gray-700 rounded-lg p-4 bg-gray-900">
          <h3 class="font-semibold text-gray-200">{{ doc.title }}</h3>
          <div class="text-sm text-gray-400 mt-1">{{ doc.last_edited_time }}</div>
          <div class="mt-2">
            <span v-for="tag in doc.tags" :key="tag"
                  class="inline-block bg-gray-700 text-gray-200 rounded-full px-3 py-1 text-sm mr-2 mb-2">
              {{ tag }}
            </span>
          </div>
          <div class="text-sm mt-2 text-gray-300">{{ doc.summary }}</div>
        </div>
      </div>
    </div>

    <!-- Add after the Summary Stats section (after line 166) -->

  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch, isRef } from 'vue';
import { config } from '../config';
import { useFileStore } from '../store/fileStore';
import type { ProcessedDocument } from '../store/fileStore';
import { websocketStore } from '../utils/websocketStore'

interface ServerMessage {
  type: string;
  chunkIndex?: number;
  chunk?: any[];
  data?: {
    progress?: {
      current: number;
      total: number;
      estimatedRemaining?: number;
    }
  };
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total?: number;
    cost?: number;
  };
  message?: string;
  documents?: any[];
  count?: number;
  totalChunks?: number;
}

// Add constants at top
const MAX_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB

export default {
  name: 'FileUpload',
  setup() {
    // Existing refs
    const fileInput = ref<HTMLInputElement | null>(null);
    const parsedData = ref<{ documents?: any[] }>({});
    const uploading = ref(false);
    const processingLogs = ref<string[]>([]);
    const processedFiles = ref(0);
    const totalFiles = ref(0);
    const serverStatus = ref('checking');
    const processingComplete = ref(false);
    const documentChunks = ref<Document[][]>([]);
    const totalDocuments = ref(0);
    const tokenUsage = ref<{
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
      estimated_cost: number;
    } | null>(null);
    const logsContainerRef = ref<HTMLElement | null>(null);
    const autoScroll = ref(true);
    const currentDocument = ref<any>(null);
    const runningCost = ref<number>(0);
    const totalTokens = ref<number>(0);
    const startTime = ref(0);
    const DEBUG = true;  // Enable logging
    const estimatedTime = ref('');
    const estimatedTimeRemaining = ref('');

    // Add chunk tracking
    const chunksReceived = ref<number>(0);
    const totalChunks = ref<number>(0);
    const documentsByChunk = ref<Map<number, any[]>>(new Map());

    // Add after documentsByChunk declaration
    const chunkValidationStats = ref({
      totalDocuments: 0,
      validDocuments: 0,
      invalidChunks: [],
      chunkSizes: new Map()
    });

    // Add at top with other refs
    const memoryStats = ref({
      lastHeapSize: 0,
      peakHeapSize: 0,
      chunkSizes: new Map()
    });

    // File handling
    const handleDrop = async (event: DragEvent) => {
      if (!event.dataTransfer?.files) return;
      const file = event.dataTransfer.files[0];
      if (file.type !== 'application/zip') {
        alert('Please upload a valid ZIP file.');
        return;
      }
      await uploadFile(file);
    };

    const handleFileInput = async (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) await uploadFile(file);
    };

    // Upload handling
    const uploadFile = async (file: File) => {
      try {
        // Reset states
        uploading.value = true;
        processingLogs.value = [];
        startTime.value = Date.now();
        
        // Check server connection first
        const apiUrl = await config.apiUrl();
        const healthCheck = await fetch(apiUrl);
        if (!healthCheck.ok) {
          throw new Error('Server not responding. Please check connection.');
        }
        
        const formData = new FormData();
        formData.append('zipFile', file);

        const response = await fetch(`${apiUrl}/upload`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error('No response body received');
        }

        await handleServerStream(response.body.getReader());
        
      } catch (error) {
        console.error('Upload error:', error);
        processingLogs.value.push('❌ Upload failed. Please try again.');
        processingLogs.value.push(`Error: ${error instanceof Error ? error.message : String(error)}`);
        uploading.value = false;
      }
    };

    // Download handling
    const downloadJSON = () => {
      if (!parsedData.value?.documents) {
        console.error('No documents available for download');
        return;
      }

      try {
        const data = JSON.stringify(parsedData.value, null, 2);
        const sizeInMB = data.length / 1024 / 1024;
        
        if (sizeInMB > 100) { // 100MB warning threshold
          if (!confirm(`Large file detected (${sizeInMB.toFixed(2)}MB). Continue?`)) {
            return;
          }
        }

        // Stream to file instead of loading entirely in memory
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notion-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        processingLogs.value.push('📥 JSON file downloaded successfully!');
      } catch (error) {
        console.error('Download failed:', error);
        processingLogs.value.push('❌ Download failed. File may be too large.');
      }
    };

    // Add after uploadFile function
    const handleServerMessage = (data: any) => {
      try {
        if (DEBUG) console.log('Received server message:', data.type);
        
        switch (data.type) {
          case 'metadata':
            if (DEBUG) console.log('Metadata received:', data);
            totalFiles.value = data.count;
            totalChunks.value = data.totalChunks;
            if (DEBUG) {
              console.log('Expected chunks:', {
                totalDocuments: data.count,
                chunks: data.totalChunks
              });
            }
            break;

          case 'tokenUpdate':
            if (DEBUG) console.log('Token update:', data);
            if (data.usage) {
              // Handle direct token update message
              if (data.usage.total && data.usage.cost) {
                totalTokens.value = (totalTokens.value || 0) + data.usage.total;
                runningCost.value = (runningCost.value || 0) + data.usage.cost;
              }
              // Handle prompt/completion format
              else if (data.usage.prompt_tokens && data.usage.completion_tokens) {
                const promptTokens = data.usage.prompt_tokens;
                const completionTokens = data.usage.completion_tokens;
                totalTokens.value = (totalTokens.value || 0) + promptTokens + completionTokens;
                const cost = (promptTokens * 0.01 + completionTokens * 0.03) / 1000;
                runningCost.value = (runningCost.value || 0) + cost;
              }
              if (DEBUG) {
                console.log('Token state updated:', {
                  totalTokens: totalTokens.value,
                  runningCost: runningCost.value
                });
              }
            }
            break;

          case 'documents_chunk':
            if (DEBUG) {
              console.log('Chunk Processing:', {
                chunkIndex: data.chunkIndex,
                documentsInChunk: data.chunk?.length,
                totalExpectedChunks: totalChunks.value,
              });
            }
            
            if (Array.isArray(data.chunk)) {
              try {
                const chunk = data.chunk;
                const chunkIndex = data.chunkIndex;
                
                // Store chunk
                documentsByChunk.value.set(chunkIndex, chunk);
                chunksReceived.value++;
                
                // Update progress
                processedFiles.value = Math.min(
                  Array.from(documentsByChunk.value.values())
                    .reduce((acc, chunk) => acc + chunk.length, 0),
                  totalFiles.value
                );
                
                // Track memory usage
                const chunkSize = JSON.stringify(chunk).length / 1024 / 1024;
                memoryStats.value.chunkSizes.set(chunkIndex, chunkSize);
                
                if (chunkSize > 50) { // 50MB warning threshold
                  console.warn(`Large chunk detected: ${chunkSize.toFixed(2)}MB`);
                  processingLogs.value.push(`[WARNING] Large chunk (${chunkSize.toFixed(1)}MB)`);
                }
              } catch (error) {
                console.error('Error processing chunk:', error);
                processingLogs.value.push(`⚠️ Warning: Error processing chunk ${data.chunkIndex + 1}`);
              }
            }
            break;

          case 'chunks_complete':
            if (DEBUG) {
              console.log('Final Processing State:', {
                receivedChunks: chunksReceived.value,
                expectedChunks: totalChunks.value,
                documentsReceived: parsedData.value?.documents?.length || 0,
                expectedDocuments: totalFiles.value,
                missingDocuments: totalFiles.value - (parsedData.value?.documents?.length || 0)
              });
            }

            try {
              // Keep existing completion logic
              if (!estimatedTimeRemaining.value.startsWith('computed')) {  // Check if it's not a computed prop
                estimatedTimeRemaining.value = '';
              }
              if (chunksReceived.value === totalChunks.value) {
                const documents = [];
                for (let i = 0; i < totalChunks.value; i++) {
                  const chunk = documentsByChunk.value.get(i);
                  if (chunk) documents.push(...chunk);
                }
                
                // Validate document count
                if (documents.length !== totalFiles.value) {
                  console.warn('Document count mismatch:', {
                    received: documents.length,
                    expected: totalFiles.value
                  });
                  processingLogs.value.push(`⚠️ Warning: Received ${documents.length}/${totalFiles.value} documents`);
                }
                
                // Set state in correct order, only if they're not computed
                if (isRef(parsedData)) {
                  parsedData.value = { documents };
                }
                if (isRef(processingComplete)) {
                  processingComplete.value = true;
                }
                if (isRef(uploading)) {
                  uploading.value = false;
                }

                // Add debug logging
                if (DEBUG) {
                  console.log('Final assembly complete:', {
                    documentsAssembled: documents.length,
                    processingComplete: processingComplete.value,
                    parsedDataExists: !!parsedData.value?.documents
                  });
                }

                if (documents.length > 0) {
                  const endTime = Date.now();
                  const processingTime = endTime - startTime.value;
                  
                  fileStore.saveBatch({
                    documentCount: documents.length,
                    totalTokens: totalTokens.value,
                    cost: runningCost.value,
                    documents: documents as ProcessedDocument[],
                    title: documents[0]?.title || 'Untitled Batch',
                    processingTime: `${Math.floor(processingTime / 60000)}m ${Math.floor((processingTime % 60000) / 1000)}s`,
                    stats: {
                      avgTokensPerDoc: Math.round(totalTokens.value / documents.length),
                      totalProcessingTime: totalProcessingTime.value,
                      startTime: startTime.value,
                      endTime: endTime
                    }
                  });
                }
              }
            } catch (error) {
              console.error('Error assembling final documents:', error);
              processingLogs.value.push('❌ Error: Failed to assemble documents');
            }
            break;

          case 'log':
            if (data.message) {
              processingLogs.value.push(data.message);
              
              // Update token costs from log messages
              const tokenMatch = data.message.match(/Token usage for summary - Prompt: (\d+), Completion: (\d+)/);
              if (tokenMatch) {
                const promptTokens = parseInt(tokenMatch[1]) || 0;
                const completionTokens = parseInt(tokenMatch[2]) || 0;
                // Ensure we're working with numbers
                if (!isNaN(promptTokens) && !isNaN(completionTokens)) {
                  totalTokens.value = (totalTokens.value || 0) + promptTokens + completionTokens;
                  // Calculate cost ($0.01/1K prompt, $0.03/1K completion)
                  const promptCost = (promptTokens * 0.01) / 1000;
                  const completionCost = (completionTokens * 0.03) / 1000;
                  runningCost.value = (runningCost.value || 0) + promptCost + completionCost;
                  if (DEBUG) {
                    console.log('Token update:', {
                      promptTokens,
                      completionTokens,
                      totalTokens: totalTokens.value,
                      runningCost: runningCost.value
                    });
                  }
                }
              }

              // Update progress
              const progressMatch = data.message.match(/Progress: (\d+)\/(\d+) files/);
              if (progressMatch) {
                processedFiles.value = parseInt(progressMatch[1]);
                totalFiles.value = parseInt(progressMatch[2]);
              }

              // Update current file
              const fileMatch = data.message.match(/Found title: ([^\n]+)/);
              if (fileMatch) {
                currentDocument.value = { title: fileMatch[1].trim() };
              }
            }
            break;

          case 'progress':
            console.log('Raw progress data:', JSON.stringify(data, null, 2));
            
            // Try both data structures
            const progressData = data.data?.progress || data.progress;
            console.log('Progress data:', progressData);
            
            // Handle both percentage and current/total formats
            if (progressData) {
              let currentFiles = processedFiles.value;
              let totalFileCount = totalFiles.value;

              if (progressData.current != null && progressData.total != null) {
                currentFiles = Number(progressData.current);
                totalFileCount = Number(progressData.total);
              } else if (progressData.percentage != null && totalFiles.value > 0) {
                const percentage = Number(progressData.percentage);
                if (!isNaN(percentage)) {
                  currentFiles = Math.round((percentage / 100) * totalFiles.value);
                }
              }

              // Only update if we have valid numbers
              if (!isNaN(currentFiles) && !isNaN(totalFileCount) && totalFileCount > 0) {
                processedFiles.value = currentFiles;
                totalFiles.value = totalFileCount;
                
                const remainingFiles = totalFileCount - currentFiles;
                if (remainingFiles > 0) {
                  estimatedTimeRemaining.value = calculateEstimatedTime(remainingFiles);
                }
              }
            }
            break;

          case 'complete':
            if (DEBUG) {
              console.log('Complete message received:', data);
            }
            
            if (data.data?.documents) {
              parsedData.value = { documents: data.data.documents };
              processingComplete.value = true;
              uploading.value = false;
              
              // Force reactivity update
              nextTick(() => {
                console.log('State after completion:', {
                  documentsSet: !!parsedData.value?.documents,
                  documentsLength: parsedData.value?.documents?.length,
                  processingComplete: processingComplete.value,
                  uploading: uploading.value
                });
              });
            }
            break;
        }
      } catch (error) {
        console.error('Error in handleServerMessage:', error);
      }
    };

    // Server status checking
    const checkServerStatus = async () => {
      try {
        const apiUrl = await config.apiUrl();
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        serverStatus.value = response.ok ? 'connected' : 'disconnected';
        
        if (!response.ok) {
          console.error('Server responded with status:', response.status);
        }
      } catch (error) {
        console.error('Server check error:', error);
        serverStatus.value = 'disconnected';
      }
    };

    // Add initial check and interval
    onMounted(() => {
      // Check immediately
      checkServerStatus();
      
      // Then check every 30 seconds
      const interval = setInterval(checkServerStatus, 30000);
      
      // Cleanup on unmount
      onUnmounted(() => {
        clearInterval(interval);
      });
    });

    // Add time estimation function (simplified)
    const calculateEstimatedTime = (fileCount) => {
      console.log('Calculating time for files:', fileCount);
      if (!fileCount || fileCount <= 0) {
        console.log('Invalid file count, returning empty string');
        return '';
      }
      
      const avgSecondsPerFile = 3;
      const totalSeconds = fileCount * avgSecondsPerFile;
      const estimate = `~${Math.ceil(totalSeconds / 60)}m`;
      console.log('Time estimate calculated:', estimate);
      return estimate;
    };

    // Update computed property
    const overallProgress = computed(() => {
      if (!uploading.value) return 100;
      if (!totalFiles.value || totalFiles.value === 0) return 0;
      return Math.round((processedFiles.value / totalFiles.value) * 100);
    });

    // Add scroll handling
    const scrollToLatest = () => {
      nextTick(() => {
        const logsContainer = logsContainerRef.value;
        if (logsContainer && autoScroll.value) {
          logsContainer.scrollTo({
            top: logsContainer.scrollHeight,
            behavior: 'instant'
          });
        }
      });
    };

    // Add watch for logs
    watch(() => processingLogs.value.length, () => {
      if (autoScroll.value) {
        scrollToLatest();
      }
    });

    // Add scroll handler
    const handleScroll = (event: Event) => {
      const container = event.target as HTMLElement;
      const atBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
      autoScroll.value = atBottom;
    };

    // Add computed for processing rate
    const processingRate = computed(() => {
      if (!startTime.value || !processedFiles.value) return '0.00';
      const elapsed = (Date.now() - startTime.value) / 1000;
      return (processedFiles.value / elapsed).toFixed(2);
    });

    // Add totalProcessingTime computation
    const totalProcessingTime = computed(() => {
      if (!startTime.value || !processingComplete.value) return '0s';
      const totalSeconds = Math.floor((Date.now() - startTime.value) / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}m ${seconds}s`;
    });

    // Update the message parsing function
    const parseServerMessage = (msg: string): ServerMessage | null => {
      try {
        const cleanedMsg = msg.replace('data: ', '');
        const data = JSON.parse(cleanedMsg);
        
        // Validate message structure
        if (typeof data !== 'object' || data === null) {
          console.error('Invalid message format:', data);
          return null;
        }

        // Ensure type exists
        if (!data.type || typeof data.type !== 'string') {
          console.error('Message missing type:', data);
          return null;
        }

        return data;
      } catch (e) {
        console.error('Error parsing message:', {
          error: e instanceof Error ? e.message : String(e),
          messageStart: msg.substring(0, 200),
          messageEnd: msg.substring(msg.length - 200)
        });
        return null;
      }
    };

    // Update the SSE handling section
    const handleServerStream = async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
      const textDecoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += textDecoder.decode(value, { stream: true });
        const messages = buffer.split('\n\n');
        
        // Keep the last incomplete message in the buffer
        buffer = messages[messages.length - 1];

        // Process complete messages
        for (const msg of messages.slice(0, -1)) {
          if (msg.startsWith('data: ')) {
            const data = parseServerMessage(msg);
            if (data) {
              handleServerMessage(data);
            } else {
              processingLogs.value.push('⚠️ Warning: Invalid message format received');
            }
          }
        }
      }

      // Process any remaining complete message
      if (buffer.startsWith('data: ')) {
        const data = parseServerMessage(buffer);
        if (data) {
          handleServerMessage(data);
        }
      }
    };

    // Add to the documents_chunk case before processing
    const validateAndStoreChunk = (chunk, index) => {
      if (!checkMemoryUsage()) {
        processingLogs.value.push('⚠️ Warning: High memory usage detected');
      }

      const chunkSize = JSON.stringify(chunk).length / 1024 / 1024;
      memoryStats.value.chunkSizes.set(index, chunkSize);

      if (chunkSize > 50) { // 50MB chunk threshold
        console.warn('Large chunk detected:', chunkSize.toFixed(2), 'MB');
        processingLogs.value.push('⚠️ Warning: Large data chunk detected');
      }

      return chunk.every(doc => 
        doc && 
        typeof doc === 'object' && 
        'document_id' in doc && 
        'title' in doc && 
        'content' in doc && 
        Object.keys(doc).length <= 10 // Sanity check for object size
      );
    };

    // Add to chunks_complete case before final assembly
    const totalSize = Array.from(documentsByChunk.value.values())
      .reduce((acc, chunk) => acc + JSON.stringify(chunk).length, 0);

    if (totalSize > MAX_TOTAL_SIZE) {
      console.error('Total document size exceeds limit:', totalSize / 1024 / 1024, 'MB');
      processingLogs.value.push('⚠️ Warning: Total document size exceeds limit');
    }

    // Add final validation summary
    if (DEBUG) {
      console.log('Chunk Validation Summary:', {
        totalDocuments: chunkValidationStats.value.totalDocuments,
        validDocuments: chunkValidationStats.value.validDocuments,
        invalidChunks: chunkValidationStats.value.invalidChunks,
        totalSize: totalSize / 1024 / 1024,
        chunkSizes: Array.from(chunkValidationStats.value.chunkSizes.entries())
      });
    }

    // Add memory check function
    const checkMemoryUsage = () => {
      if (window.performance?.memory) {
        const heapSize = window.performance.memory.usedJSHeapSize / 1024 / 1024;
        memoryStats.value.lastHeapSize = heapSize;
        memoryStats.value.peakHeapSize = Math.max(heapSize, memoryStats.value.peakHeapSize);
        
        if (heapSize > 100) { // 100MB threshold
          console.warn('High memory usage detected:', heapSize.toFixed(2), 'MB');
          return false;
        }
      }
      return true;
    };

    // Replace existing assembly code in chunks_complete case
    const assembleDocuments = () => {
      const allDocuments = [];
      let totalSize = 0;
      
      for (let i = 0; i < totalChunks.value; i++) {
        const chunk = documentsByChunk.value.get(i);
        if (!chunk) {
          console.warn(`Missing chunk ${i}`);
          continue;
        }
        
        totalSize += JSON.stringify(chunk).length;
        if (totalSize > 100 * 1024 * 1024) { // 100MB total limit
          processingLogs.value.push('⚠️ Warning: Total document size exceeds recommended limit');
          break;
        }
        
        allDocuments.push(...chunk);
        // Clear chunk from memory after adding
        documentsByChunk.value.delete(i);
      }
      
      return allDocuments;
    };

    // Add watch for estimatedTimeRemaining
    watch(() => estimatedTimeRemaining.value, (newVal, oldVal) => {
      console.log('Time estimate changed:', {
        from: oldVal,
        to: newVal,
        processedFiles: processedFiles.value,
        totalFiles: totalFiles.value
      });
    });

    // Add near other watch statements
    watch(() => processingComplete.value, (newVal) => {
      if (DEBUG) {
        console.log('Processing complete changed:', {
          value: newVal,
          documentsExist: !!parsedData.value?.documents?.length,
          uploading: uploading.value
        });
      }
    });

    // Add this function to handle downloads
    const downloadResults = () => {
      if (!parsedData.value?.documents) return;
      
      const jsonString = JSON.stringify(parsedData.value.documents, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'processed-documents.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    // Add debug watch for visibility conditions
    watch([() => processingComplete.value, () => parsedData.value?.documents], ([complete, docs]) => {
      console.log('Visibility conditions changed:', {
        processingComplete: complete,
        hasDocuments: !!docs?.length,
        documentsCount: docs?.length || 0
      });
    }, { immediate: true });

    // Add this function
    const assembleDocumentsProgressively = async () => {
      const assembled = [];
      const sortedChunks = Array.from(documentsByChunk.value.entries())
        .sort(([a], [b]) => a - b);
        
      for (const [index, chunk] of sortedChunks) {
        assembled.push(...chunk);
        // Clear processed chunk
        documentsByChunk.value.delete(index);
        
        // Allow UI updates every 50 documents
        if (assembled.length % 50 === 0) {
          await nextTick();
        }
      }
      
      return assembled;
    };

    // Modify the existing completion handler
    watch(chunksReceived, async (newValue) => {
      if (newValue === totalChunks.value && totalChunks.value > 0) {
        try {
          console.log('Starting final assembly:', {
            chunksReceived: newValue,
            totalChunks: totalChunks.value,
            documentsInMemory: documentsByChunk.value.size
          });

          const documents = await assembleDocumentsProgressively();
          console.log('Documents assembled:', documents.length);

          // Set the state in this specific order
          parsedData.value = { documents };
          processedFiles.value = totalFiles.value;
          uploading.value = false;
          processingComplete.value = true;

          // Calculate final stats
          const endTime = Date.now();
          const totalTime = endTime - startTime.value;
          totalProcessingTime.value = `${Math.floor(totalTime / 60000)}m ${Math.floor((totalTime % 60000) / 1000)}s`;

          console.log('Final state set:', {
            documentsLength: parsedData.value?.documents?.length,
            processingComplete: processingComplete.value,
            uploading: uploading.value
          });
        } catch (error) {
          console.error('Error assembling documents:', error);
          processingLogs.value.push('❌ Error: Failed to assemble documents');
        }
      }
    });

    // Add this watch near the other watchers (around line 900)
    watch([chunksReceived, totalChunks], ([received, total]) => {
      if (DEBUG) {
        console.log('Chunks state:', { received, total });
      }
      
      if (received === total && total > 0 && !processingComplete.value) {
        try {
          // Use existing documents from documentsByChunk
          const documents = Array.from(documentsByChunk.value.values()).flat();
          
          // Set state using existing properties
          parsedData.value = { documents };
          processingComplete.value = true;
          uploading.value = false;
          
          if (DEBUG) {
            console.log('Summary state updated:', {
              documentsLength: documents.length,
              processingComplete: processingComplete.value,
              uploading: uploading.value
            });
          }
        } catch (error) {
          console.error('Error updating final state:', error);
        }
      }
    }, { immediate: true });

    // Add this watch near the other watchers
    watch([() => processingComplete.value, () => parsedData.value?.documents], ([complete, docs]) => {
      if (DEBUG) {
        console.log('Download button visibility:', {
          processingComplete: complete,
          hasDocuments: !!docs?.length,
          documentsCount: docs?.length || 0,
          parsedDataExists: !!parsedData.value,
          documentsByChunkSize: documentsByChunk.value.size
        });
      }
    }, { immediate: true });

    // Add near the other debug watches
    watch([
      () => processingComplete.value,
      () => parsedData.value?.documents,
      () => processedFiles.value,
      () => totalProcessingTime.value,
      () => estimatedTimeRemaining.value,
      () => uploading.value
    ], ([
      complete,
      docs,
      processed,
      time,
      estimate,
      upload
    ]) => {
      if (DEBUG) {
        console.log('State changes:', {
          processingComplete: {
            value: complete,
            isComputed: !isRef(processingComplete)
          },
          processedFiles: {
            value: processed,
            isComputed: !isRef(processedFiles)
          },
          totalProcessingTime: {
            value: time,
            isComputed: !isRef(totalProcessingTime)
          },
          estimatedTimeRemaining: {
            value: estimate,
            isComputed: !isRef(estimatedTimeRemaining)
          },
          uploading: {
            value: upload,
            isComputed: !isRef(uploading)
          }
        });
      }
    }, { immediate: true });

    // Safe to add - pure observation, no state changes
    watch([
      () => estimatedTimeRemaining.value,
      () => totalProcessingTime.value
    ], ([estimate, time]) => {
      if (DEBUG) {
        console.log('Time estimation debug:', {
          estimatedTimeRemaining: {
            value: estimate,
            dependencies: {
              processedFiles: processedFiles.value,
              totalFiles: totalFiles.value,
              uploading: uploading.value
            }
          },
          totalProcessingTime: {
            value: time,
            startTime: startTime.value
          }
        });
      }
    }, { immediate: true });

    // Add near other debug watches - completely safe, no state modifications
    watch([
      () => estimatedTimeRemaining.value,
      () => processedFiles.value,
      () => uploading.value
    ], ([timeEstimate, processed, isUploading], [oldTimeEstimate, oldProcessed, wasUploading]) => {
      if (DEBUG) {
        console.log('Time estimation flow:', {
          timeEstimate: {
            from: oldTimeEstimate,
            to: timeEstimate,
            isComputed: true
          },
          processed: {
            from: oldProcessed,
            to: processed
          },
          uploading: {
            from: wasUploading,
            to: isUploading
          }
        });
      }
    }, { immediate: true });

    // Add near other debug watches - pure observation
    watch(() => ({
      docs: parsedData.value?.documents?.length,
      complete: processingComplete.value,
      time: estimatedTimeRemaining.value,
      processed: processedFiles.value
    }), (newState, oldState) => {
      if (DEBUG && oldState) {  // Skip initial undefined state
        console.log('State transition:', {
          from: oldState,
          to: newState,
          changes: Object.keys(newState).filter(key => newState[key] !== oldState[key])
        });
      }
    }, { deep: true, immediate: true });

    // Add near the top of the setup function - pure debugging
    const debugComputedProps = () => {
      if (DEBUG) {
        console.log('Computed property definitions:', {
          estimatedTimeRemaining: {
            value: estimatedTimeRemaining.value,
            deps: {
              processedFiles: processedFiles.value,
              totalFiles: totalFiles.value,
              startTime: startTime.value
            }
          },
          totalProcessingTime: {
            value: totalProcessingTime.value,
            deps: {
              startTime: startTime.value,
              processingComplete: processingComplete.value
            }
          },
          stack: new Error().stack?.split('\n').slice(1, 3)
        });
      }
    };

    // Add safe watcher for computed property updates
    watch([
      () => estimatedTimeRemaining.value,
      () => totalProcessingTime.value,
      () => processedFiles.value
    ], () => {
      debugComputedProps();
    }, { immediate: true });

    const fileStore = useFileStore();

    onMounted(() => {
      const socket = websocketStore.socket
      if (socket) {
        socket.onmessage = handleWebSocketMessage
      }
    })

    onUnmounted(() => {
      // Only remove message handler, don't close the socket
      if (websocketStore.socket) {
        websocketStore.socket.onmessage = null
      }
    })

    // Update the send function to use the shared socket
    const sendMessage = (message: any) => {
      if (websocketStore.socket && websocketStore.socket.readyState === WebSocket.OPEN) {
        websocketStore.socket.send(JSON.stringify(message))
      } else {
        console.error('WebSocket is not connected')
      }
    }

    return {
      fileInput,
      handleDrop,
      handleFileInput,
      downloadJSON,
      processingLogs,
      processedFiles,
      totalFiles,
      serverStatus,
      processingComplete,
      parsedData,
      tokenUsage,
      logsContainerRef,
      autoScroll,
      overallProgress,
      currentDocument,
      runningCost,
      totalTokens,
      processingRate,
      uploading,
      totalProcessingTime,
      estimatedTimeRemaining,
      downloadResults,
    };
  }
};
</script>

<style scoped>
.whitespace-pre-wrap {
  white-space: pre-wrap;
}

.terminal-window {
  height: 400px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.logs-container {
  flex-grow: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
  padding-bottom: 2rem;
}
</style> 
}; 