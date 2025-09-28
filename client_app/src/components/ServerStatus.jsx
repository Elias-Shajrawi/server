import React from 'react';
import { Server, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

const ServerStatus = ({ status }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'running':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          text: 'Server is running',
          description: 'All systems operational'
        };
      case 'offline':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          text: 'Server is offline',
          description: 'Unable to connect to server'
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          text: 'Server has issues',
          description: 'Server responding with errors'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          text: 'Checking status...',
          description: 'Please wait'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`card border-2 ${statusInfo.borderColor} ${statusInfo.bgColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <StatusIcon className={`w-8 h-8 ${statusInfo.color}`} />
          <div>
            <p className={`font-semibold ${statusInfo.color}`}>
              {statusInfo.text}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {statusInfo.description}
            </p>
          </div>
        </div>
        <Server className="w-6 h-6 text-gray-400" />
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Last checked: {new Date().toLocaleTimeString()}</span>
          <span>Uptime: --:--:--</span>
        </div>
      </div>
    </div>
  );
};

export default ServerStatus;
