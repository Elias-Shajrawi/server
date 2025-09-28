import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Globe, 
  FileText, 
  Calendar, 
  Clock,
  Copy,
  Edit,
  Save,
  X,
  Terminal,
  ExternalLink,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import tunnelApi from '../services/tunnelApi';

const CustomerDetails = ({ customer, onUpdateCustomer, onDeleteCustomer, serverHost }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: customer.name,
    email: customer.email,
    subdomain: customer.subdomain,
    notes: customer.notes || ''
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const tunnelUrl = tunnelApi.generateTunnelUrl(customer, serverHost);
  const connectionCommand = tunnelApi.generateConnectionCommand(customer, serverHost);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      name: customer.name,
      email: customer.email,
      subdomain: customer.subdomain,
      notes: customer.notes || ''
    });
    setErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: customer.name,
      email: customer.email,
      subdomain: customer.subdomain,
      notes: customer.notes || ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!editData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!editData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editData.email)) {
        newErrors.email = 'Invalid email format';
      }
    }

    if (!editData.subdomain.trim()) {
      newErrors.subdomain = 'Subdomain is required';
    } else {
      const validation = tunnelApi.validateSubdomain(editData.subdomain);
      if (!validation.valid) {
        newErrors.subdomain = validation.error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      await onUpdateCustomer(customer.id, {
        name: editData.name.trim(),
        email: editData.email.trim(),
        subdomain: editData.subdomain.trim().toLowerCase(),
        notes: editData.notes.trim()
      });
      setIsEditing(false);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
      console.log('Copied to clipboard');
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = () => {
    if (customer.isOnline) {
      return {
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        text: 'Tunnel Online'
      };
    } else {
      return {
        icon: XCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        text: 'Tunnel Offline'
      };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className={`card border-2 ${statusInfo.borderColor} ${statusInfo.bgColor}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
            <div>
              <h3 className={`font-semibold ${statusInfo.color}`}>
                {statusInfo.text}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {customer.lastSeen 
                  ? `Last seen: ${formatDate(customer.lastSeen)}`
                  : 'Never connected'
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => window.open(tunnelUrl, '_blank')}
            className="btn btn-secondary flex items-center space-x-2"
            disabled={!customer.isOnline}
          >
            <ExternalLink className="w-4 h-4" />
            <span>Visit</span>
          </button>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center justify-between">
            <span>Tunnel URL:</span>
            <button
              onClick={() => copyToClipboard(tunnelUrl)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="font-mono text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1 break-all">
            {tunnelUrl}
          </p>
        </div>
      </div>

      {/* Customer Details Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Customer Details
          </h3>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="btn btn-secondary"
                disabled={isSaving}
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary flex items-center space-x-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <User className="w-4 h-4 inline mr-2" />
              Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.name ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{customer.name}</p>
            )}
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.email ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{customer.email}</p>
            )}
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Subdomain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Globe className="w-4 h-4 inline mr-2" />
              Subdomain
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editData.subdomain}
                onChange={(e) => setEditData(prev => ({ ...prev, subdomain: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.subdomain ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-gray-900 dark:text-white font-mono">{customer.subdomain}</p>
                <button
                  onClick={() => copyToClipboard(customer.subdomain)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            )}
            {errors.subdomain && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subdomain}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FileText className="w-4 h-4 inline mr-2" />
              Notes
            </label>
            {isEditing ? (
              <textarea
                value={editData.notes}
                onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Additional notes..."
              />
            ) : (
              <p className="text-gray-900 dark:text-white">
                {customer.notes || <span className="text-gray-500 italic">No notes</span>}
              </p>
            )}
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Created: {formatDate(customer.createdAt)}</span>
              </div>
              
              {customer.updatedAt && (
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Updated: {formatDate(customer.updatedAt)}</span>
                </div>
              )}

              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Terminal className="w-4 h-4" />
                <span>Token: {customer.token.substring(0, 12)}...</span>
                <button
                  onClick={() => copyToClipboard(customer.token)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
            </div>
          )}
        </div>
      </div>

      {/* Connection Command Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Connection Command
          </h3>
          <button
            onClick={() => copyToClipboard(connectionCommand)}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <Copy className="w-4 h-4" />
            <span>Copy</span>
          </button>
        </div>

        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
          <pre className="whitespace-pre-wrap break-all">{connectionCommand}</pre>
        </div>

        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          <p>Share this command with your customer to establish the tunnel connection.</p>
          <p className="mt-1">They should run this command in their project directory.</p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-200 dark:border-red-800">
        <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-4">
          Danger Zone
        </h3>
        <button
          onClick={() => onDeleteCustomer(customer.id)}
          className="btn btn-danger"
        >
          Delete Customer
        </button>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          This action cannot be undone. The customer's tunnel will be permanently removed.
        </p>
      </div>
    </div>
  );
};

export default CustomerDetails;
