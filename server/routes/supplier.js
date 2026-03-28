import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/orders', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM purchase_orders ORDER BY required_by ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/orders', async (req, res) => {
  try {
    const { supplier, item, quantity, unit, required_by, delivery_address } = req.body;
    const po_number = `PO-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const [result] = await db.query(
      'INSERT INTO purchase_orders (po_number, supplier, item, quantity, unit, required_by, delivery_address, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [po_number, supplier, item, quantity, unit, required_by, delivery_address, 'Pending']
    );
    res.json({ id: result.insertId, po_number, ...req.body, status: 'Pending' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stock', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM stock_settings');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/stock/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reorder_level, reorder_qty, auto_order_enabled, input_category, procurement_schedules } = req.body;
    await db.query(
      'UPDATE stock_settings SET reorder_level = ?, reorder_qty = ?, auto_order_enabled = ?, input_category = ?, procurement_schedules = ? WHERE id = ?',
      [reorder_level, reorder_qty, auto_order_enabled, input_category, procurement_schedules, id]
    );
    res.json({ message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
