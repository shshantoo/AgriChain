import express from 'express';
import db from '../db.js';

const router = express.Router();

// ── Input Supply ──────────────────────────────────────────────

router.get('/input-supply', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT is2.*, CONCAT(fu.first_name, ' ', fu.last_name) AS farmer_name,
              CONCAT(su.first_name, ' ', su.last_name) AS supplier_name
       FROM input_supply is2
       JOIN users fu ON is2.farmer_id = fu.user_id
       JOIN users su ON is2.supplier_id = su.user_id
       ORDER BY is2.supply_date DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/input-supply', async (req, res) => {
  try {
    const { farmer_id, supplier_id, input_type, quantity, supply_date, cost, procurement_schedule, current_stock_level, usage_rate } = req.body;
    if (!quantity || quantity <= 0) return res.status(400).json({ error: 'Quantity must be positive' });
    const [result] = await db.query(
      'INSERT INTO input_supply (farmer_id, supplier_id, input_type, quantity, supply_date, cost, procurement_schedule, current_stock_level, usage_rate) VALUES (?,?,?,?,?,?,?,?,?)',
      [farmer_id, supplier_id, input_type, quantity, supply_date, cost||null, procurement_schedule||null, current_stock_level||null, usage_rate||null]
    );
    res.json({ supply_id: result.insertId, ...req.body });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/input-supply/:id', async (req, res) => {
  try {
    const { farmer_id, supplier_id, input_type, quantity, supply_date, cost, procurement_schedule, current_stock_level, usage_rate } = req.body;
    await db.query(
      'UPDATE input_supply SET farmer_id=?, supplier_id=?, input_type=?, quantity=?, supply_date=?, cost=?, procurement_schedule=?, current_stock_level=?, usage_rate=? WHERE supply_id=?',
      [farmer_id, supplier_id, input_type, quantity, supply_date, cost||null, procurement_schedule||null, current_stock_level||null, usage_rate||null, req.params.id]
    );
    res.json({ message: 'Input supply record updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/input-supply/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM input_supply WHERE supply_id=?', [req.params.id]);
    res.json({ message: 'Input supply record deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Lookup helpers ────────────────────────────────────────────

router.get('/suppliers-list', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT u.user_id, CONCAT(u.first_name, ' ', u.last_name) AS name, s.company_name FROM users u JOIN suppliers s ON u.user_id = s.user_id"
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
