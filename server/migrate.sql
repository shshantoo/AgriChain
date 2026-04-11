-- ============================================================
-- AgriChain Migration Script — ERD v2 Full Overhaul
-- Run this ONCE against the agrichain database.
-- WARNING: Drops all existing data.
-- ============================================================

USE agrichain;

SET FOREIGN_KEY_CHECKS = 0;

-- Drop new (if partially run before)
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS delivery;
DROP TABLE IF EXISTS market;
DROP TABLE IF EXISTS stock_movement;
DROP TABLE IF EXISTS quality_report;
DROP TABLE IF EXISTS processing_batch;
DROP TABLE IF EXISTS processing_plant;
DROP TABLE IF EXISTS sensor_data;
DROP TABLE IF EXISTS sensor;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS harvest_batch;
DROP TABLE IF EXISTS product;
DROP TABLE IF EXISTS input_supply;
DROP TABLE IF EXISTS sowing_logs;
DROP TABLE IF EXISTS warehouse;

-- Drop subtype tables
DROP TABLE IF EXISTS logistics_managers;
DROP TABLE IF EXISTS market_operators;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS quality_inspectors;
DROP TABLE IF EXISTS processing_managers;
DROP TABLE IF EXISTS warehouse_managers;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS farmers;

-- Drop old legacy tables
DROP TABLE IF EXISTS system_alerts;
DROP TABLE IF EXISTS stock_settings;
DROP TABLE IF EXISTS purchase_orders;
DROP TABLE IF EXISTS qc_reports;
DROP TABLE IF EXISTS processing_batches;
DROP TABLE IF EXISTS inventory_items;
DROP TABLE IF EXISTS harvest_records;
DROP TABLE IF EXISTS sowing_records;

-- Drop users last
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================
-- 1. USERS AND SUBTYPES
-- =========================

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_type ENUM('F','S','WM','PM','QI','A','MO','LM') NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE farmers (
    user_id INT PRIMARY KEY,
    farm_village VARCHAR(100),
    farm_district VARCHAR(100),
    farm_size DECIMAL(10,2),
    crop_type VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE suppliers (
    user_id INT PRIMARY KEY,
    company_name VARCHAR(150),
    supply_crops_type VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE warehouse_managers (
    user_id INT PRIMARY KEY,
    warehouse_id INT NULL,
    warehouse_district VARCHAR(100),
    warehouse_area VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE processing_managers (
    user_id INT PRIMARY KEY,
    experience_years INT,
    specialization VARCHAR(150),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE quality_inspectors (
    user_id INT PRIMARY KEY,
    lab_id VARCHAR(100),
    specialty_research_field VARCHAR(150),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE admins (
    user_id INT PRIMARY KEY,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE market_operators (
    user_id INT PRIMARY KEY,
    market_city VARCHAR(100),
    market_zone VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE logistics_managers (
    user_id INT PRIMARY KEY,
    transport_unit VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================
-- 2. FARMING AND INPUTS
-- =========================

CREATE TABLE sowing_logs (
    sowing_id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id INT NOT NULL,
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE NOT NULL,
    seed_type VARCHAR(100) NOT NULL,
    used_quantity DECIMAL(10,2),
    FOREIGN KEY (farmer_id) REFERENCES farmers(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE input_supply (
    supply_id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id INT NOT NULL,
    supplier_id INT NOT NULL,
    input_type VARCHAR(100) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    supply_date DATE NOT NULL,
    cost DECIMAL(12,2),
    procurement_schedule DATE,
    current_stock_level DECIMAL(10,2),
    usage_rate DECIMAL(10,2),
    FOREIGN KEY (farmer_id) REFERENCES farmers(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================
-- 3. PRODUCT AND HARVEST
-- =========================

CREATE TABLE product (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    category VARCHAR(100),
    storage_requirement VARCHAR(150),
    shelf_life INT,
    packaging_details VARCHAR(150)
);

CREATE TABLE harvest_batch (
    batch_id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id INT NOT NULL,
    product_id INT NOT NULL,
    harvest_date DATE NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    quality_grade VARCHAR(50),
    FOREIGN KEY (farmer_id) REFERENCES farmers(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(product_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================
-- 4. WAREHOUSE / INVENTORY / SENSOR
-- =========================

CREATE TABLE warehouse (
    warehouse_id INT AUTO_INCREMENT PRIMARY KEY,
    area VARCHAR(100),
    district VARCHAR(100),
    capacity DECIMAL(12,2)
);

ALTER TABLE warehouse_managers
ADD CONSTRAINT fk_wm_warehouse
FOREIGN KEY (warehouse_id) REFERENCES warehouse(warehouse_id)
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    batch_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    shelf_life INT,
    remaining_shelf_life INT,
    packaging_details VARCHAR(150),
    reorder_level DECIMAL(10,2),
    max_stock_level DECIMAL(10,2),
    stock_status VARCHAR(50) DEFAULT 'In Stock',
    FOREIGN KEY (batch_id) REFERENCES harvest_batch(batch_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouse(warehouse_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE sensor (
    sensor_id INT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id INT NOT NULL,
    sensor_type VARCHAR(100) NOT NULL,
    FOREIGN KEY (warehouse_id) REFERENCES warehouse(warehouse_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE sensor_data (
    data_id INT AUTO_INCREMENT PRIMARY KEY,
    sensor_id INT NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    FOREIGN KEY (sensor_id) REFERENCES sensor(sensor_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================
-- 5. PROCESSING / QUALITY
-- =========================

CREATE TABLE processing_plant (
    plant_id INT AUTO_INCREMENT PRIMARY KEY,
    manager_id INT NOT NULL,
    area VARCHAR(100),
    district VARCHAR(100),
    process_plants_type VARCHAR(100),
    FOREIGN KEY (manager_id) REFERENCES processing_managers(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE processing_batch (
    processing_id INT AUTO_INCREMENT PRIMARY KEY,
    batch_id INT NOT NULL,
    plant_id INT NOT NULL,
    processing_date DATE NOT NULL,
    FOREIGN KEY (batch_id) REFERENCES harvest_batch(batch_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (plant_id) REFERENCES processing_plant(plant_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE quality_report (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    processing_id INT NOT NULL,
    inspector_id INT NOT NULL,
    moisture_content DECIMAL(5,2),
    purity DECIMAL(5,2),
    defect_level VARCHAR(100),
    grading_status VARCHAR(100),
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (processing_id) REFERENCES processing_batch(processing_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (inspector_id) REFERENCES quality_inspectors(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================
-- 6. STOCK MOVEMENT
-- =========================

CREATE TABLE stock_movement (
    movement_id INT AUTO_INCREMENT PRIMARY KEY,
    batch_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    movement_date DATE NOT NULL,
    quantity_removed DECIMAL(10,2) NOT NULL,
    from_location VARCHAR(150),
    to_location VARCHAR(150),
    movement_type VARCHAR(100),
    FOREIGN KEY (batch_id) REFERENCES harvest_batch(batch_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouse(warehouse_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================
-- 7. MARKET / DELIVERY / SALES
-- =========================

CREATE TABLE market (
    market_id INT AUTO_INCREMENT PRIMARY KEY,
    operator_id INT NOT NULL,
    city VARCHAR(100),
    zone VARCHAR(100),
    market_type VARCHAR(100),
    FOREIGN KEY (operator_id) REFERENCES market_operators(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE delivery (
    delivery_id INT AUTO_INCREMENT PRIMARY KEY,
    batch_id INT NOT NULL,
    market_id INT NOT NULL,
    logistics_manager_id INT NOT NULL,
    source_area VARCHAR(100),
    source_district VARCHAR(100),
    destination_area VARCHAR(100),
    destination_district VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Pending',
    transport_date DATE,
    FOREIGN KEY (batch_id) REFERENCES harvest_batch(batch_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (market_id) REFERENCES market(market_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (logistics_manager_id) REFERENCES logistics_managers(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE sales (
    sale_id INT AUTO_INCREMENT PRIMARY KEY,
    batch_id INT NOT NULL,
    product_id INT NOT NULL,
    market_id INT NOT NULL,
    sale_date DATE NOT NULL,
    sale_price DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (batch_id) REFERENCES harvest_batch(batch_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(product_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (market_id) REFERENCES market(market_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);
