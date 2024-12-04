import { ref } from 'vue'

export const websocketStore = {
  socket: null as WebSocket | null,
  isConnected: ref(false),
  
  connect() {
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      this.socket = new WebSocket('ws://localhost:3001')
      
      this.socket.onopen = () => {
        this.isConnected.value = true
        console.log('WebSocket Connected')
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
  }
} 