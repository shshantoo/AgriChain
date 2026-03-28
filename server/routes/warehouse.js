import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/inventory', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM inventory_items');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/inventory', async (req, res) => {
  try {
    const { sku, product, category, qty_tonnes, capacity, location, expiry, storage_requirements, shelf_life, packaging_details, supplier_information } = req.body;
    const [result] = await db.query(
      `INSERT INTO inventory_items 
       (sku, product, category, qty_tonnes, capacity, location, expiry, storage_requirements, shelf_life, packaging_details, supplier_information, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sku, product, category, qty_tonnes, capacity, location, expiry, storage_requirements, shelf_life, packaging_details, supplier_information, 'In Stock']
    );
    res.json({ id: result.insertId, sku, product, category, qty_tonnes, capacity, location, expiry, storage_requirements, shelf_life, packaging_details, supplier_information, status: 'In Stock' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
