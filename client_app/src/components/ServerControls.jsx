import React, { useState } from 'react';
import { Play, Square, RotateCcw, Terminal, Download } from 'lucide-react';

const ServerControls = ({ onStatusChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState('');

  const executeDockerCommand = async (command, action) => {
    setIsLoading(true);
    setLastAction(action);
    
    try {
      // In a real implementation, you would call your backend API
      // For now, we'll simulate the action
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update status based on action
      if (action === 'start') {
        onStatusChange('running');
      } else if (action === 'stop') {
        onStatusChange('offline');
      }
      
      console.log(`Docker command executed: ${command}`);
    } catch (error) {
      console.error('Error executing command:', error);
      onStatusChange('error');
    } finally {
      setIsLoading(false);
      setLastAction('');
    }
  };

  const handleStartServer = () => {
    executeDockerCommand('docker start localtunnel-server', 'start');
  };

  const handleStopServer = () => {
    executeDockerCommand('docker stop localtunnel-server', 'stop');
  };

  const handleRestartServer = () => {
    executeDockerCommand('docker restart localtunnel-server', 'restart');
  };

  const handleViewLogs = () => {
    // This would open logs in a new tab or modal
    window.open('about:blank', '_blank');
    console.log('Opening server logs...');
  };

  const handleDownloadLogs = () => {
    // This would trigger a download of the log file
    console.log('Downloading server logs...');
  };

  return (
    <div className="card">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Server Controls
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <button
          onClick={handleStartServer}
          disabled={isLoading && lastAction === 'start'}
          className="btn btn-success flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4" />
          <span>{isLoading && lastAction === 'start' ? 'Starting...' : 'Start'}</span>
        </button>

        <button
          onClick={handleStopServer}
          disabled={isLoading && lastAction === 'stop'}
          className="btn btn-danger flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Square className="w-4 h-4" />
          <span>{isLoading && lastAction === 'stop' ? 'Stopping...' : 'Stop'}</span>
        </button>

        <button
          onClick={handleRestartServer}
          disabled={isLoading && lastAction === 'restart'}
          className="btn btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{isLoading && lastAction === 'restart' ? 'Restarting...' : 'Restart'}</span>
        </button>

        <button
          onClick={handleViewLogs}
          className="btn btn-secondary flex items-center justify-center space-x-2"
        >
          <Terminal className="w-4 h-4" />
          <span>View Logs</span>
        </button>

        <button
          onClick={handleDownloadLogs}
          className="btn btn-secondary flex items-center justify-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Download Logs</span>
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Quick Commands
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Container Name:</span>
            <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-xs">
              localtunnel-server
            </code>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Port Mapping:</span>
            <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-xs">
              3000:80
            </code>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Image:</span>
            <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-xs">
              localtunnel-server
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerControls;
