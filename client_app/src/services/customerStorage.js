// Simple local storage service for customer data
class CustomerStorage {
  constructor() {
    this.storageKey = 'localtunnel_customers';
    this.init();
  }

  init() {
    // Initialize storage if it doesn't exist
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  // Generate a random token
  generateToken() {
    return 'tk_' + Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
  }

  // Generate a unique subdomain
  generateSubdomain(customerName) {
    const base = customerName.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 10);
    const suffix = Math.random().toString(36).substr(2, 4);
    return `${base}${suffix}`;
  }

  // Get all customers
  getAllCustomers() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return JSON.parse(data) || [];
    } catch (error) {
      console.error('Error reading customers:', error);
      return [];
    }
  }

  // Add a new customer
  addCustomer(customerData) {
    try {
      const customers = this.getAllCustomers();
      const newCustomer = {
        id: Date.now().toString(),
        name: customerData.name,
        email: customerData.email,
        notes: customerData.notes || '',
        subdomain: customerData.subdomain || this.generateSubdomain(customerData.name),
        token: this.generateToken(),
        createdAt: new Date().toISOString(),
        lastSeen: null,
        isOnline: false
      };

      // Check if subdomain already exists
      const existingSubdomain = customers.find(c => c.subdomain === newCustomer.subdomain);
      if (existingSubdomain) {
        throw new Error(`Subdomain "${newCustomer.subdomain}" already exists`);
      }

      customers.push(newCustomer);
      localStorage.setItem(this.storageKey, JSON.stringify(customers));
      return newCustomer;
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  }

  // Update a customer
  updateCustomer(id, updates) {
    try {
      const customers = this.getAllCustomers();
      const index = customers.findIndex(c => c.id === id);
      
      if (index === -1) {
        throw new Error('Customer not found');
      }

      // Check if subdomain is being changed and if it conflicts
      if (updates.subdomain && updates.subdomain !== customers[index].subdomain) {
        const existingSubdomain = customers.find(c => c.subdomain === updates.subdomain && c.id !== id);
        if (existingSubdomain) {
          throw new Error(`Subdomain "${updates.subdomain}" already exists`);
        }
      }

      customers[index] = { ...customers[index], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(this.storageKey, JSON.stringify(customers));
      return customers[index];
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  // Delete a customer
  deleteCustomer(id) {
    try {
      const customers = this.getAllCustomers();
      const filteredCustomers = customers.filter(c => c.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(filteredCustomers));
      return true;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  // Get customer by ID
  getCustomerById(id) {
    const customers = this.getAllCustomers();
    return customers.find(c => c.id === id);
  }

  // Get customer by subdomain
  getCustomerBySubdomain(subdomain) {
    const customers = this.getAllCustomers();
    return customers.find(c => c.subdomain === subdomain);
  }

  // Update customer online status
  updateCustomerStatus(subdomain, isOnline) {
    try {
      const customers = this.getAllCustomers();
      const customer = customers.find(c => c.subdomain === subdomain);
      
      if (customer) {
        customer.isOnline = isOnline;
        customer.lastSeen = new Date().toISOString();
        localStorage.setItem(this.storageKey, JSON.stringify(customers));
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
    }
  }

  // Export data
  exportData() {
    return {
      customers: this.getAllCustomers(),
      exportedAt: new Date().toISOString()
    };
  }

  // Import data
  importData(data) {
    try {
      if (data.customers && Array.isArray(data.customers)) {
        localStorage.setItem(this.storageKey, JSON.stringify(data.customers));
        return true;
      }
      throw new Error('Invalid data format');
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  // Clear all data
  clearAll() {
    localStorage.setItem(this.storageKey, JSON.stringify([]));
  }
}

export default new CustomerStorage();
