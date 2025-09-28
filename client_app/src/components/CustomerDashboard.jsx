import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Settings, 
  Globe, 
  Activity,
  RefreshCw,
  Server,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import CustomerList from './CustomerList';
import AddCustomerModal from './AddCustomerModal';
import CustomerDetails from './CustomerDetails';
import ServerStatus from './ServerStatus';
import customerStorage from '../services/customerStorage';
import tunnelApi from '../services/tunnelApi';

const CustomerDashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [activeTab, setActiveTab] = useState('customers');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');
  const [serverHost, setServerHost] = useState(() => {
    // Load server host from localStorage or use environment variable default
    return localStorage.getItem('localtunnel_server_host') || 
           import.meta.env.VITE_DEFAULT_SERVER_HOST || 
           'YOUR_IP_ADDRESS';
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadCustomers();
    checkServerStatus();
    
    // Check server status every 30 seconds
    const statusInterval = setInterval(checkServerStatus, 30000);
    
    // Check tunnel status every 60 seconds
    const tunnelInterval = setInterval(checkTunnelStatuses, 60000);
    
    return () => {
      clearInterval(statusInterval);
      clearInterval(tunnelInterval);
    };
  }, []);

  const loadCustomers = () => {
    const loadedCustomers = customerStorage.getAllCustomers();
    setCustomers(loadedCustomers);
  };

  const checkServerStatus = async () => {
    const result = await tunnelApi.checkServerHealth();
    setServerStatus(result.success ? 'online' : 'offline');
  };

  const checkTunnelStatuses = async () => {
    const updatedCustomers = [...customers];
    
    for (const customer of updatedCustomers) {
      const status = await tunnelApi.checkSubdomainStatus(customer.subdomain);
      customer.isOnline = status.isOnline;
      customerStorage.updateCustomerStatus(customer.subdomain, status.isOnline);
    }
    
    setCustomers(updatedCustomers);
  };

  const handleAddCustomer = (customerData) => {
    try {
      const newCustomer = customerStorage.addCustomer(customerData);
      setCustomers([...customers, newCustomer]);
      setShowAddModal(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUpdateCustomer = (id, updates) => {
    try {
      const updatedCustomer = customerStorage.updateCustomer(id, updates);
      setCustomers(customers.map(c => c.id === id ? updatedCustomer : c));
      setSelectedCustomer(updatedCustomer);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteCustomer = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      customerStorage.deleteCustomer(id);
      setCustomers(customers.filter(c => c.id !== id));
      if (selectedCustomer && selectedCustomer.id === id) {
        setSelectedCustomer(null);
      }
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await checkServerStatus();
    await checkTunnelStatuses();
    loadCustomers();
    setIsRefreshing(false);
  };


  const getServerStatusInfo = () => {
    switch (serverStatus) {
      case 'online':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          text: 'Server Online'
        };
      case 'offline':
        return {
          icon: XCircle,
          color: 'text-red-500',
          text: 'Server Offline'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-yellow-500',
          text: 'Checking...'
        };
    }
  };

  const statusInfo = getServerStatusInfo();
  const StatusIcon = statusInfo.icon;
  const onlineCustomers = customers.filter(c => c.isOnline).length;

  const tabs = [
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Globe className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  LocalTunnel Customer Manager
                </h1>
                <div className={`flex items-center space-x-2 text-sm ${statusInfo.color}`}>
                  <StatusIcon className="w-4 h-4" />
                  <span>{statusInfo.text}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Stats */}
              <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{customers.length} customers</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Activity className="w-4 h-4" />
                  <span>{onlineCustomers} online</span>
                </div>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="btn btn-secondary flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Customer</span>
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
        {activeTab === 'customers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CustomerList
                customers={customers}
                onSelectCustomer={setSelectedCustomer}
                onDeleteCustomer={handleDeleteCustomer}
                selectedCustomer={selectedCustomer}
                serverHost={serverHost}
              />
            </div>
            <div className="lg:col-span-1">
              {selectedCustomer ? (
                <CustomerDetails
                  customer={selectedCustomer}
                  onUpdateCustomer={handleUpdateCustomer}
                  onDeleteCustomer={handleDeleteCustomer}
                  serverHost={serverHost}
                />
              ) : (
                <div className="card text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Select a Customer
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Choose a customer from the list to view details and manage their tunnel.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Server Configuration
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Server Host Domain
                  </label>
                  <input
                    type="text"
                    value={serverHost}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                  />
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                      📝 Configuration Note
                    </p>
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                      To change the server host domain, update the <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded text-xs">VITE_DEFAULT_SERVER_HOST</code> environment variable in your <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded text-xs">docker-compose.yml</code> file and restart the containers.
                    </p>
                    <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                      Example: <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded">VITE_DEFAULT_SERVER_HOST=192.168.1.100</code>
                    </p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                    Data Management
                  </h3>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        const data = customerStorage.exportData();
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `customers-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="btn btn-secondary"
                    >
                      Export Data
                    </button>
                    
                    <button
                      onClick={() => {
                        if (window.confirm('This will delete all customer data. Are you sure?')) {
                          customerStorage.clearAll();
                          setCustomers([]);
                          setSelectedCustomer(null);
                        }
                      }}
                      className="btn btn-danger"
                    >
                      Clear All Data
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <ServerStatus serverStatus={serverStatus} />
          </div>
        )}
      </main>

      {/* Add Customer Modal */}
      {showAddModal && (
        <AddCustomerModal
          onClose={() => setShowAddModal(false)}
          onAddCustomer={handleAddCustomer}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
