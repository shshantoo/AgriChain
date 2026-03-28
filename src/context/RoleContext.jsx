import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const RoleContext = createContext();

const ROLES = {
  farmer: {
    key: 'farmer', name: 'Farmer Hub', user: 'Farmer', avatar: '👨‍🌾', pill: 'Live Sensor Data Active', defaultPage: '/farmer',
    nav: [
      { label: 'Farm Dashboard', path: '/farmer', icon: '📊' },
      { label: 'Sowing Log', path: '/farmer/sowing', icon: '🌱' },
      { label: 'Harvest Tracking', path: '/farmer/harvest', icon: '🌾' },
      { label: 'Crop Predictions (AI)', path: '/farmer/predictions', icon: '📈' }
    ]
  },
  warehouse: {
    key: 'warehouse', name: 'Central Warehouse', user: 'WH_Manager', avatar: '🏭', pill: 'Capacity: 84%', defaultPage: '/warehouse',
    nav: [
      { label: 'Overview', path: '/warehouse', icon: '📊' },
      { label: 'Inventory Management', path: '/warehouse/inventory', icon: '📦' },
      { label: 'Throughput Analytics', path: '/warehouse/analytics', icon: '📈' }
    ]
  },
  processing: {
    key: 'processing', name: 'Processing Unit', user: 'Plant_Supervisor', avatar: '⚙️', pill: 'Lines Running: 3', defaultPage: '/processing',
    nav: [
      { label: 'Processing Status', path: '/processing', icon: '🔄' },
      { label: 'Batch Management', path: '/processing/batches', icon: '📋' },
      { label: 'Quality Control', path: '/processing/qc', icon: '🔬' }
    ]
  },
  supplier: {
    key: 'supplier', name: 'Supplier Portal', user: 'Supplier', avatar: '🚚', pill: '2 Orders Pending', defaultPage: '/supplier',
    nav: [
      { label: 'Fulfillment Dashboard', path: '/supplier', icon: '🚚' },
      { label: 'Purchase Orders', path: '/supplier/orders', icon: '📋' },
      { label: 'Stock Reorder Levels', path: '/supplier/stock', icon: '📦' }
    ]
  },
  admin: {
    key: 'admin', name: 'Admin Console', user: 'System_Admin', avatar: '🛡️', pill: 'System Normal', defaultPage: '/admin',
    nav: [
      { label: 'System Overview', path: '/admin', icon: '🌐' },
      { label: 'Predictive Analytics', path: '/admin/analytics', icon: '📈' },
      { section: 'MANAGEMENT' },
      { label: 'User Management', path: '/admin/users', icon: '👥' },
      { label: 'System Alerts & Config', path: '/admin/alerts', icon: '⚙️' }
    ]
  }
};

export const RoleProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  const login = (jwtToken, userData) => {
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  // On mount, apply token if exists
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const currentRole = user ? { ...ROLES[user.role], user: user.name } : null;

  return (
    <RoleContext.Provider value={{
      token,
      user,
      currentRole,
      login,
      logout
    }}>
      {children}
    </RoleContext.Provider>
  );
};
