import { ref } from 'vue'

interface ProcessingJob {
  id: string;
  timestamp: number;
  status: 'completed' | 'processing';
  processedFiles: number;
  totalFiles: number;
  cost: number;
  totalTokens: number;
}

export const websocketStore = {
  socket: null as WebSocket | null,
  isConnected: ref(false),
  processingHistory: ref<ProcessingJob[]>([]),
  
  connect() {
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      this.socket = new WebSocket('ws://localhost:3001')
      
      this.socket.onopen = () => {
        this.isConnected.value = true
        console.log('WebSocket Connected')
        // Load history when connected
        this.loadHistory()
      }
      
      this.socket.onclose = () => {
        this.isConnected.value = false
        console.log('WebSocket Disconnected')
      }
    }
    return this.socket
  },
  
  disconnect() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  },

  addToHistory(job: ProcessingJob) {
    console.log('Adding job to history:', job)
    // Add to front of array
    this.processingHistory.value = [job, ...this.processingHistory.value]
    // Store in localStorage
    this.saveHistory()
    console.log('Current history:', this.processingHistory.value)
  },

  loadHistory() {
    try {
      const stored = localStorage.getItem('processingHistory')
      if (stored) {
        this.processingHistory.value = JSON.parse(stored)
        console.log('Loaded history:', this.processingHistory.value)
      }
    } catch (error) {
      console.error('Error loading history:', error)
      this.processingHistory.value = []
    }
  },

  saveHistory() {
    try {
      localStorage.setItem('processingHistory', JSON.stringify(this.processingHistory.value))
    } catch (error) {
      console.error('Error saving history:', error)
    }
  },

  // Debug method
  clearHistory() {
    this.processingHistory.value = []
    localStorage.removeItem('processingHistory')
    console.log('History cleared')
  }
} 