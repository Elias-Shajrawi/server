import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Download, Trash2, RefreshCw, Search, Filter } from 'lucide-react';

const ServerLogs = ({ logs }) => {
  const [mockLogs, setMockLogs] = useState([
    {
      id: 1,
      timestamp: new Date(Date.now() - 300000),
      level: 'info',
      message: 'Server started on port 80',
      source: 'server'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 250000),
      level: 'info',
      message: 'New client connected: abc123',
      source: 'client'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 200000),
      level: 'debug',
      message: 'Processing request for subdomain: abc123',
      source: 'proxy'
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 150000),
      level: 'warn',
      message: 'High memory usage detected: 85%',
      source: 'system'
    },
    {
      id: 5,
      timestamp: new Date(Date.now() - 100000),
      level: 'error',
      message: 'Failed to connect to upstream server',
      source: 'proxy'
    },
    {
      id: 6,
      timestamp: new Date(Date.now() - 50000),
      level: 'info',
      message: 'Client disconnected: def456',
      source: 'client'
    }
  ]);

  const [filteredLogs, setFilteredLogs] = useState(mockLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [filteredLogs, autoScroll]);

  useEffect(() => {
    let filtered = mockLogs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(log => log.source === sourceFilter);
    }

    setFilteredLogs(filtered);
  }, [mockLogs, searchTerm, levelFilter, sourceFilter]);

  const getLevelColor = (level) => {
    switch (level) {
      case 'error': return 'text-red-600 dark:text-red-400';
      case 'warn': return 'text-yellow-600 dark:text-yellow-400';
      case 'info': return 'text-blue-600 dark:text-blue-400';
      case 'debug': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getLevelBg = (level) => {
    switch (level) {
      case 'error': return 'bg-red-50 dark:bg-red-900/20';
      case 'warn': return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'info': return 'bg-blue-50 dark:bg-blue-900/20';
      case 'debug': return 'bg-gray-50 dark:bg-gray-900/20';
      default: return 'bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const clearLogs = () => {
    setMockLogs([]);
  };

  const refreshLogs = () => {
    // In a real implementation, this would fetch fresh logs from the server
    console.log('Refreshing logs...');
  };

  const downloadLogs = () => {
    const logText = mockLogs
      .map(log => `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}`)
      .join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `localtunnel-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Server Logs
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshLogs}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={downloadLogs}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button
              onClick={clearLogs}
              className="btn btn-danger flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Levels</option>
            <option value="error">Error</option>
            <option value="warn">Warning</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Sources</option>
            <option value="server">Server</option>
            <option value="client">Client</option>
            <option value="proxy">Proxy</option>
            <option value="system">System</option>
          </select>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Auto-scroll
            </span>
          </label>
        </div>
      </div>

      {/* Logs Display */}
      <div className="card">
        <div className="bg-black rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
          {filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Terminal className="w-12 h-12 mx-auto mb-4" />
                <p>No logs to display</p>
                {(searchTerm || levelFilter !== 'all' || sourceFilter !== 'all') && (
                  <p className="text-xs mt-2">Try adjusting your filters</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2 rounded ${getLevelBg(log.level)} hover:bg-opacity-75 transition-colors`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-gray-500 text-xs whitespace-nowrap">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                    <span className={`text-xs font-semibold uppercase px-2 py-1 rounded ${getLevelColor(log.level)}`}>
                      {log.level}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                      {log.source}
                    </span>
                    <span className="text-gray-900 dark:text-white flex-1">
                      {log.message}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
          <span>
            Showing {filteredLogs.length} of {mockLogs.length} logs
          </span>
          <span>
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ServerLogs;
