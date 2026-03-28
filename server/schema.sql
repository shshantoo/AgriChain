CREATE DATABASE IF NOT EXISTS agrichain;
USE agrichain;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('farmer', 'warehouse', 'processing', 'supplier', 'admin') NOT NULL,
  region VARCHAR(100),
  status VARCHAR(20) DEFAULT 'Active',
  last_login DATETIME
);

CREATE TABLE IF NOT EXISTS sowing_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plot VARCHAR(100) NOT NULL,
  crop_type VARCHAR(100) NOT NULL,
  seed_type VARCHAR(100),
  sowing_date DATE NOT NULL,
  expected_harvest_date DATE,
  seed_qty DECIMAL(10,2),
  variety VARCHAR(100),
  fertiliser VARCHAR(255),
  pesticides VARCHAR(255),
  usage_rates VARCHAR(100),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'Growing'
);

CREATE TABLE IF NOT EXISTS harvest_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch_id VARCHAR(50),
  plot VARCHAR(100) NOT NULL,
  harvest_date DATE NOT NULL,
  quantity_tonnes DECIMAL(10,2),
  grade VARCHAR(50),
  storage_conditions VARCHAR(255),
  movement_tracking VARCHAR(255),
  destination VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Delivered'
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(50) UNIQUE NOT NULL,
  product VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  qty_tonnes DECIMAL(10,2),
  capacity DECIMAL(10,2),
  location VARCHAR(100),
  expiry DATE,
  storage_requirements VARCHAR(255),
  shelf_life VARCHAR(100),
  packaging_details VARCHAR(255),
  supplier_information VARCHAR(255),
  status VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS processing_batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch_id VARCHAR(50) UNIQUE NOT NULL,
  raw_material VARCHAR(100),
  processing_type VARCHAR(100),
  input_qty DECIMAL(10,2),
  output_qty DECIMAL(10,2),
  line VARCHAR(50),
  start_time DATETIME,
  status VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS qc_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch_id VARCHAR(50) NOT NULL,
  inspector VARCHAR(100),
  inspection_date DATE,
  moisture_pct DECIMAL(5,2),
  foreign_matter_pct DECIMAL(5,2),
  grade VARCHAR(50),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  po_number VARCHAR(50) UNIQUE NOT NULL,
  supplier VARCHAR(100),
  item VARCHAR(100),
  quantity DECIMAL(10,2),
  unit VARCHAR(20),
  required_by DATE,
  delivery_address VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Pending'
);

CREATE TABLE IF NOT EXISTS stock_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item VARCHAR(100) NOT NULL,
  input_category VARCHAR(50),
  current_stock DECIMAL(10,2),
  reorder_level DECIMAL(10,2),
  reorder_qty DECIMAL(10,2),
  procurement_schedules VARCHAR(255),
  auto_order_enabled BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS system_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50),
  message TEXT,
  source VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE
);
