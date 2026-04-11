import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const RoleContext = createContext();

const ROLES = {
  F: {
    key: 'F', name: 'Farmer Hub', avatar: '👨‍🌾', pill: 'Live Sensor Data Active', defaultPage: '/farmer',
    nav: [
      { label: 'Farm Dashboard', path: '/farmer', icon: '📊' },
      { label: 'Sowing Logs', path: '/farmer/sowing', icon: '🌱' },
      { label: 'Harvest Batches', path: '/farmer/harvest', icon: '🌾' },
      { label: 'Input Supplies Received', path: '/farmer/inputs', icon: '📦' },
    ]
  },
  S: {
    key: 'S', name: 'Supplier Portal', avatar: '🚚', pill: 'Supply Management', defaultPage: '/supplier',
    nav: [
      { label: 'Supplier Dashboard', path: '/supplier', icon: '📊' },
      { label: 'Input Supply Records', path: '/supplier/inputs', icon: '📦' },
    ]
  },
  WM: {
    key: 'WM', name: 'Central Warehouse', avatar: '🏭', pill: 'Warehouse Operations', defaultPage: '/warehouse',
    nav: [
      { label: 'Overview', path: '/warehouse', icon: '📊' },
      { label: 'Warehouses', path: '/warehouse/warehouses', icon: '🏗️' },
      { label: 'Inventory', path: '/warehouse/inventory', icon: '📦' },
      { label: 'Stock Movement', path: '/warehouse/stock-movement', icon: '🔄' },
      { label: 'Sensor Monitor', path: '/warehouse/sensors', icon: '📡' },
    ]
  },
  PM: {
    key: 'PM', name: 'Processing Unit', avatar: '⚙️', pill: 'Processing Operations', defaultPage: '/processing',
    nav: [
      { label: 'Processing Status', path: '/processing', icon: '🔄' },
      { label: 'Processing Plants', path: '/processing/plants', icon: '🏭' },
      { label: 'Batch Management', path: '/processing/batches', icon: '📋' },
    ]
  },
  QI: {
    key: 'QI', name: 'Quality Control', avatar: '🔬', pill: 'QC Lab Active', defaultPage: '/quality',
    nav: [
      { label: 'QC Dashboard', path: '/quality', icon: '📊' },
      { label: 'Quality Reports', path: '/quality/reports', icon: '🔬' },
    ]
  },
  LM: {
    key: 'LM', name: 'Logistics', avatar: '🚛', pill: 'Fleet Active', defaultPage: '/logistics',
    nav: [
      { label: 'Logistics Dashboard', path: '/logistics', icon: '📊' },
      { label: 'Delivery Management', path: '/logistics/delivery', icon: '🚚' },
    ]
  },
  MO: {
    key: 'MO', name: 'Market Portal', avatar: '🏪', pill: 'Market Operations', defaultPage: '/market',
    nav: [
      { label: 'Market Dashboard', path: '/market', icon: '📊' },
      { label: 'Markets', path: '/market/markets', icon: '🏪' },
      { label: 'Sales Records', path: '/market/sales', icon: '💰' },
    ]
  },
  A: {
    key: 'A', name: 'Admin Console', avatar: '🛡️', pill: 'System Normal', defaultPage: '/admin',
    nav: [
      { label: 'System Overview', path: '/admin', icon: '🌐' },
      { label: 'Predictive Analytics', path: '/admin/analytics', icon: '📈' },
      { section: 'DATA MANAGEMENT' },
      { label: 'Farmer Data', path: '/admin/farmer-data', icon: '🌱' },
      { label: 'Warehouse Data', path: '/admin/warehouse-data', icon: '📦' },
      { label: 'Processing Data', path: '/admin/processing-data', icon: '⚙️' },
      { label: 'Supplier Data', path: '/admin/supplier-data', icon: '🚚' },
      { label: 'Quality Data', path: '/admin/quality-data', icon: '🔬' },
      { label: 'Delivery Data', path: '/admin/delivery-data', icon: '🚛' },
      { label: 'Market & Sales', path: '/admin/market-data', icon: '💰' },
      { label: 'Batch Traceability', path: '/admin/batch-trace', icon: '🔗' },
      { section: 'MANAGEMENT' },
      { label: 'User Management', path: '/admin/users', icon: '👥' },
      { label: 'System Alerts', path: '/admin/alerts', icon: '⚙️' },
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

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const updateUser = (updates) => {
    const newUser = { ...user, ...updates };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const currentRole = user
    ? { ...ROLES[user.role_type], user: `${user.first_name} ${user.last_name}` }
    : null;

  return (
    <RoleContext.Provider value={{ token, user, currentRole, login, logout, updateUser }}>
      {children}
    </RoleContext.Provider>
  );
};
