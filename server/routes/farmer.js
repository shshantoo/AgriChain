import express from 'express';
import db from '../db.js';

const router = express.Router();

// ── Sowing Logs ──────────────────────────────────────────────

router.get('/sowing', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT sl.*, CONCAT(u.first_name, ' ', u.last_name) AS farmer_name
       FROM sowing_logs sl
       JOIN users u ON sl.farmer_id = u.user_id
       ORDER BY sl.sowing_date DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/sowing', async (req, res) => {
  try {
    const { farmer_id, sowing_date, expected_harvest_date, seed_type, used_quantity } = req.body;
    const [result] = await db.query(
      'INSERT INTO sowing_logs (farmer_id, sowing_date, expected_harvest_date, seed_type, used_quantity) VALUES (?,?,?,?,?)',
      [farmer_id, sowing_date, expected_harvest_date, seed_type, used_quantity || null]
    );
    res.json({ sowing_id: result.insertId, ...req.body });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/sowing/:id', async (req, res) => {
  try {
    const { farmer_id, sowing_date, expected_harvest_date, seed_type, used_quantity } = req.body;
    await db.query(
      'UPDATE sowing_logs SET farmer_id=?, sowing_date=?, expected_harvest_date=?, seed_type=?, used_quantity=? WHERE sowing_id=?',
      [farmer_id, sowing_date, expected_harvest_date, seed_type, used_quantity || null, req.params.id]
    );
    res.json({ message: 'Sowing log updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/sowing/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM sowing_logs WHERE sowing_id=?', [req.params.id]);
    res.json({ message: 'Sowing log deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Harvest Batch ─────────────────────────────────────────────

router.get('/harvest', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT hb.*, CONCAT(u.first_name, ' ', u.last_name) AS farmer_name, p.product_name
       FROM harvest_batch hb
       JOIN users u ON hb.farmer_id = u.user_id
       JOIN product p ON hb.product_id = p.product_id
       ORDER BY hb.harvest_date DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/harvest', async (req, res) => {
  try {
    const { farmer_id, product_id, harvest_date, quantity, quality_grade } = req.body;
    if (!quantity || quantity <= 0) return res.status(400).json({ error: 'Quantity must be positive' });
    const [result] = await db.query(
      'INSERT INTO harvest_batch (farmer_id, product_id, harvest_date, quantity, quality_grade) VALUES (?,?,?,?,?)',
      [farmer_id, product_id, harvest_date, quantity, quality_grade || null]
    );
    res.json({ batch_id: result.insertId, ...req.body });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/harvest/:id', async (req, res) => {
  try {
    const { farmer_id, product_id, harvest_date, quantity, quality_grade } = req.body;
    await db.query(
      'UPDATE harvest_batch SET farmer_id=?, product_id=?, harvest_date=?, quantity=?, quality_grade=? WHERE batch_id=?',
      [farmer_id, product_id, harvest_date, quantity, quality_grade, req.params.id]
    );
    res.json({ message: 'Harvest batch updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/harvest/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM harvest_batch WHERE batch_id=?', [req.params.id]);
    res.json({ message: 'Harvest batch deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Input Supply (received by farmer) ────────────────────────

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

// ── Lookup helpers for dropdowns ──────────────────────────────

router.get('/farmers-list', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT u.user_id, CONCAT(u.first_name, ' ', u.last_name) AS name FROM users u WHERE u.role_type = 'F'"
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
