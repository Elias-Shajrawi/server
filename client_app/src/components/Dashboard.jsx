import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Activity, 
  Users, 
  Globe, 
  RefreshCw, 
  Play, 
  Square, 
  Terminal,
  Settings,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import ServerStatus from './ServerStatus';
import ConnectionManager from './ConnectionManager';
import ServerLogs from './ServerLogs';
import ServerControls from './ServerControls';

const Dashboard = () => {
  const [serverStatus, setServerStatus] = useState('unknown');
  const [connections, setConnections] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Check server status on component mount
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const checkServerStatus = async () => {
    try {
      const response = await fetch('/health');
      if (response.ok) {
        setServerStatus('running');
      } else {
        setServerStatus('error');
      }
    } catch (error) {
      setServerStatus('offline');
    }
  };

  const getStatusColor = () => {
    switch (serverStatus) {
      case 'running': return 'text-green-500';
      case 'offline': return 'text-red-500';
      case 'error': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (serverStatus) {
      case 'running': return <CheckCircle className="w-5 h-5" />;
      case 'offline': return <XCircle className="w-5 h-5" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      default: return <RefreshCw className="w-5 h-5 animate-spin" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'connections', label: 'Connections', icon: Users },
    { id: 'logs', label: 'Logs', icon: Terminal },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Server className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  LocalTunnel Server Dashboard
                </h1>
                <div className={`flex items-center space-x-2 text-sm ${getStatusColor()}`}>
                  {getStatusIcon()}
                  <span className="capitalize">{serverStatus}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={checkServerStatus}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ServerStatus status={serverStatus} />
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Active Connections
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {connections.length}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Server Port
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      3000
                    </p>
                  </div>
                  <Globe className="w-8 h-8 text-green-500" />
                </div>
              </div>
            </div>
            <ServerControls onStatusChange={setServerStatus} />
          </div>
        )}

        {activeTab === 'connections' && (
          <ConnectionManager connections={connections} />
        )}

        {activeTab === 'logs' && (
          <ServerLogs logs={logs} />
        )}

        {activeTab === 'settings' && (
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Server Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Server Port
                </label>
                <input
                  type="number"
                  defaultValue="3000"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Max Connections
                </label>
                <input
                  type="number"
                  defaultValue="10"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Enable HTTPS
                  </span>
                </label>
              </div>
              <button className="btn btn-primary">
                Save Settings
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
