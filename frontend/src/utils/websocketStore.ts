import { ref } from 'vue'

export interface ProcessedDocument {
  document_id: string;
  title: string;
  content: string;
  tags: string[];
  source_url: string;
  related_documents: string[] | null;
  last_edited_time: string;
  summary: string;
}

export interface ProcessingJob {
  id: string;
  timestamp: number;
  status: 'completed' | 'processing';
  processedFiles: number;
  totalFiles: number;
  cost: number;
  totalTokens: number;
  output?: {
    documents: ProcessedDocument[];
  };
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
    console.log('Adding job to history:', job);
    // Ensure we're creating a new array reference
    this.processingHistory.value = [job, ...this.processingHistory.value];
    this.saveHistory();
  },

  loadHistory() {
    try {
      const stored = localStorage.getItem('processingHistory');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.processingHistory.value = parsed;
        console.log('Loaded history:', this.processingHistory.value);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      this.processingHistory.value = [];
    }
  },

  saveHistory() {
    try {
      localStorage.setItem('processingHistory', JSON.stringify(this.processingHistory.value));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  },

  // Debug method
  clearHistory() {
    this.processingHistory.value = []
    localStorage.removeItem('processingHistory')
    console.log('History cleared')
  }
} 