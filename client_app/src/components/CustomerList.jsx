import React, { useState } from 'react';
import { 
  Users, 
  Globe, 
  Mail, 
  Calendar, 
  Search, 
  Filter,
  Eye,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import tunnelApi from '../services/tunnelApi';

const CustomerList = ({ customers, onSelectCustomer, onDeleteCustomer, selectedCustomer, serverHost }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const filteredCustomers = customers
    .filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.subdomain.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'online' && customer.isOnline) ||
                           (statusFilter === 'offline' && !customer.isOnline);
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'email':
          return a.email.localeCompare(b.email);
        case 'subdomain':
          return a.subdomain.localeCompare(b.subdomain);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

  const getStatusInfo = (customer) => {
    if (customer.isOnline) {
      return {
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        text: 'Online'
      };
    } else {
      return {
        icon: XCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        text: 'Offline'
      };
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('Copied to clipboard:', text);
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Customers ({filteredCustomers.length})
        </h2>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="name">Sort by Name</option>
          <option value="email">Sort by Email</option>
          <option value="subdomain">Sort by Subdomain</option>
          <option value="created">Sort by Created Date</option>
        </select>
      </div>

      {/* Customer List */}
      <div className="space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {customers.length === 0 ? 'No customers yet' : 'No customers found'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {customers.length === 0 
                ? 'Add your first customer to get started with tunnel management.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
          </div>
        ) : (
          filteredCustomers.map((customer) => {
            const statusInfo = getStatusInfo(customer);
            const StatusIcon = statusInfo.icon;
            const isSelected = selectedCustomer && selectedCustomer.id === customer.id;
            const tunnelUrl = tunnelApi.generateTunnelUrl(customer, serverHost);

            return (
              <div
                key={customer.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => onSelectCustomer(customer)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {customer.name}
                      </h3>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${statusInfo.bgColor}`}>
                        <StatusIcon className={`w-3 h-3 ${statusInfo.color}`} />
                        <span className={statusInfo.color}>{statusInfo.text}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Globe className="w-3 h-3" />
                        <span className="truncate">{customer.subdomain}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(customer.subdomain);
                          }}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>Created {formatDate(customer.createdAt)}</span>
                      </div>

                      {customer.lastSeen && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>Last seen {formatDate(customer.lastSeen)}</span>
                        </div>
                      )}
                    </div>

                    {customer.notes && (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 truncate">
                        {customer.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCustomer(customer);
                      }}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(tunnelUrl);
                      }}
                      className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                      title="Copy Tunnel URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCustomer(customer.id);
                      }}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CustomerList;
