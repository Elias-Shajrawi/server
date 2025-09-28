import React, { useState, useEffect } from 'react';
import { Users, Globe, Clock, X, Eye, EyeOff } from 'lucide-react';

const ConnectionManager = ({ connections }) => {
  const [mockConnections, setMockConnections] = useState([
    {
      id: '1',
      subdomain: 'abc123',
      clientId: 'client-001',
      connectedAt: new Date(Date.now() - 300000), // 5 minutes ago
      status: 'active',
      requests: 42,
      lastActivity: new Date(Date.now() - 30000), // 30 seconds ago
      url: 'https://abc123.loca.lt'
    },
    {
      id: '2',
      subdomain: 'def456',
      clientId: 'client-002',
      connectedAt: new Date(Date.now() - 120000), // 2 minutes ago
      status: 'idle',
      requests: 8,
      lastActivity: new Date(Date.now() - 120000),
      url: 'https://def456.loca.lt'
    }
  ]);

  const [selectedConnection, setSelectedConnection] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-100 dark:bg-green-900/20';
      case 'idle': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20';
      case 'disconnected': return 'text-red-500 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const formatDuration = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const disconnectClient = (connectionId) => {
    setMockConnections(prev => 
      prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, status: 'disconnected' }
          : conn
      )
    );
  };

  const viewConnectionDetails = (connection) => {
    setSelectedConnection(connection);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Connections
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockConnections.length}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Tunnels
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockConnections.filter(c => c.status === 'active').length}
              </p>
            </div>
            <Globe className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Requests
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockConnections.reduce((sum, conn) => sum + conn.requests, 0)}
              </p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Connections Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Active Connections
          </h2>
          <button className="btn btn-primary">
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Subdomain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Client ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Requests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {mockConnections.map((connection) => (
                <tr key={connection.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {connection.subdomain}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {connection.url}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                      {connection.clientId}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(connection.status)}`}>
                      {connection.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatDuration(connection.connectedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {connection.requests}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => viewConnectionDetails(connection)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => disconnectClient(connection.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {mockConnections.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No active connections
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Waiting for clients to connect to the tunnel server.
            </p>
          </div>
        )}
      </div>

      {/* Connection Details Modal */}
      {selectedConnection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Connection Details
              </h3>
              <button
                onClick={() => setSelectedConnection(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subdomain
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedConnection.subdomain}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Client ID
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedConnection.clientId}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Public URL
                  </label>
                  <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                    <a href={selectedConnection.url} target="_blank" rel="noopener noreferrer">
                      {selectedConnection.url}
                    </a>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <p className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedConnection.status)}`}>
                      {selectedConnection.status}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedConnection(null)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    disconnectClient(selectedConnection.id);
                    setSelectedConnection(null);
                  }}
                  className="btn btn-danger"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionManager;
