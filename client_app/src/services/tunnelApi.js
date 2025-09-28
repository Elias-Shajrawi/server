import axios from 'axios';

// API service for LocalTunnel server communication
class TunnelApi {
  constructor() {
    // Use same origin to avoid CORS issues
    // The nginx proxy will forward requests to the tunnel server
    this.baseURL = window.location.origin;
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Check if tunnel server is accessible
  async checkServerHealth() {
    try {
      const response = await this.api.get('/health');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Tunnel server health check failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get server status and stats
  async getServerStats() {
    try {
      const response = await this.api.get('/api/status');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to get server stats:', error);
      return { success: false, error: error.message };
    }
  }

  // Get active tunnels/connections
  async getActiveTunnels() {
    try {
      const response = await this.api.get('/api/tunnels');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to get active tunnels:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if a specific subdomain is active
  async checkSubdomainStatus(subdomain) {
    try {
      // Check if the tunnel exists in the active tunnels list
      const tunnelsResponse = await this.getActiveTunnels();
      if (tunnelsResponse.success) {
        const tunnel = tunnelsResponse.data.find(t => t.id === subdomain);
        if (tunnel) {
          return { success: true, isOnline: tunnel.connected_sockets > 0 };
        }
      }
      return { success: true, isOnline: false };
    } catch (error) {
      return { success: true, isOnline: false, error: error.message };
    }
  }

  // Generate connection command for customer
  generateConnectionCommand(customer, serverHost = 'YOUR_IP_ADDRESS', localPort = 3000) {
    const command = `lt --host https://${serverHost} --subdomain ${customer.subdomain} --port ${localPort} --header "X-Tunnel-Token=${customer.token}"`;
    return command;
  }

  // Generate connection URL for customer
  generateTunnelUrl(customer, serverHost = 'YOUR_IP_ADDRESS') {
    return `https://${customer.subdomain}.${serverHost}`;
  }

  // Validate subdomain format
  validateSubdomain(subdomain) {
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    
    if (!subdomain) {
      return { valid: false, error: 'Subdomain is required' };
    }
    
    if (subdomain.length < 3) {
      return { valid: false, error: 'Subdomain must be at least 3 characters long' };
    }
    
    if (subdomain.length > 63) {
      return { valid: false, error: 'Subdomain must be less than 64 characters long' };
    }
    
    if (!subdomainRegex.test(subdomain)) {
      return { valid: false, error: 'Subdomain can only contain lowercase letters, numbers, and hyphens' };
    }
    
    if (subdomain.startsWith('-') || subdomain.endsWith('-')) {
      return { valid: false, error: 'Subdomain cannot start or end with a hyphen' };
    }

    // Reserved subdomains
    const reserved = ['www', 'api', 'admin', 'mail', 'ftp', 'localhost', 'test'];
    if (reserved.includes(subdomain)) {
      return { valid: false, error: 'This subdomain is reserved' };
    }
    
    return { valid: true };
  }

  // Get tunnel logs (if supported by server)
  async getTunnelLogs(subdomain, limit = 100) {
    try {
      const response = await this.api.get(`/api/tunnels/${subdomain}/logs?limit=${limit}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to get tunnel logs:', error);
      return { success: false, error: error.message };
    }
  }

  // Force disconnect a tunnel (if supported by server)
  async disconnectTunnel(subdomain) {
    try {
      const response = await this.api.delete(`/api/tunnels/${subdomain}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to disconnect tunnel:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new TunnelApi();
