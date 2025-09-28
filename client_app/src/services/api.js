import axios from 'axios';

// Base URL for the localtunnel server (use same origin to avoid CORS)
const BASE_URL = window.location.origin;

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service functions
export const serverApi = {
  // Check server health/status
  async checkHealth() {
    try {
      const response = await api.get('/health');
      return { status: 'running', data: response.data };
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        return { status: 'offline', error: error.message };
      }
      return { status: 'error', error: error.message };
    }
  },

  // Get server statistics
  async getStats() {
    try {
      const response = await api.get('/stats');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get active connections
  async getConnections() {
    try {
      const response = await api.get('/connections');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get server logs
  async getLogs(limit = 100) {
    try {
      const response = await api.get(`/logs?limit=${limit}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Disconnect a specific client
  async disconnectClient(clientId) {
    try {
      const response = await api.delete(`/connections/${clientId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// Docker management API (would need a backend service)
export const dockerApi = {
  // Start the server container
  async startServer() {
    try {
      const response = await api.post('/docker/start');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Stop the server container
  async stopServer() {
    try {
      const response = await api.post('/docker/stop');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Restart the server container
  async restartServer() {
    try {
      const response = await api.post('/docker/restart');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get container status
  async getContainerStatus() {
    try {
      const response = await api.get('/docker/status');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get container logs
  async getContainerLogs() {
    try {
      const response = await api.get('/docker/logs');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default api;
