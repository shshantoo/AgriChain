import express from 'express';
import db from '../db.js';

const router = express.Router();

// ── Markets ────────────────────────────────────────────────────

router.get('/markets', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT m.*, CONCAT(u.first_name, ' ', u.last_name) AS operator_name
       FROM market m
       JOIN users u ON m.operator_id = u.user_id
       ORDER BY m.city`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/markets', async (req, res) => {
  try {
    const { operator_id, city, zone, market_type } = req.body;
    if (!operator_id) return res.status(400).json({ error: 'operator_id is required' });
    const [result] = await db.query(
      'INSERT INTO market (operator_id, city, zone, market_type) VALUES (?,?,?,?)',
      [operator_id, city||null, zone||null, market_type||null]
    );
    res.json({ market_id: result.insertId, ...req.body });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/markets/:id', async (req, res) => {
  try {
    const { operator_id, city, zone, market_type } = req.body;
    await db.query(
      'UPDATE market SET operator_id=?, city=?, zone=?, market_type=? WHERE market_id=?',
      [operator_id, city, zone, market_type, req.params.id]
    );
    res.json({ message: 'Market updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/markets/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM market WHERE market_id=?', [req.params.id]);
    res.json({ message: 'Market deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Sales ──────────────────────────────────────────────────────

router.get('/sales', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.*, p.product_name, m.city AS market_city, m.zone AS market_zone
       FROM sales s
       JOIN product p ON s.product_id = p.product_id
       JOIN market m ON s.market_id = m.market_id
       ORDER BY s.sale_date DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/sales', async (req, res) => {
  try {
    const { batch_id, product_id, market_id, sale_date, sale_price } = req.body;
    if (!batch_id || !product_id || !market_id) return res.status(400).json({ error: 'batch_id, product_id, and market_id are required' });
    if (!sale_price || sale_price <= 0) return res.status(400).json({ error: 'sale_price must be positive' });
    const [result] = await db.query(
      'INSERT INTO sales (batch_id, product_id, market_id, sale_date, sale_price) VALUES (?,?,?,?,?)',
      [batch_id, product_id, market_id, sale_date, sale_price]
    );
    res.json({ sale_id: result.insertId, ...req.body });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/sales/:id', async (req, res) => {
  try {
    const { batch_id, product_id, market_id, sale_date, sale_price } = req.body;
    await db.query(
      'UPDATE sales SET batch_id=?, product_id=?, market_id=?, sale_date=?, sale_price=? WHERE sale_id=?',
      [batch_id, product_id, market_id, sale_date, sale_price, req.params.id]
    );
    res.json({ message: 'Sale updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/sales/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM sales WHERE sale_id=?', [req.params.id]);
    res.json({ message: 'Sale deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Lookup helper ──────────────────────────────────────────────

router.get('/markets-list', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT market_id, city, zone, market_type FROM market ORDER BY city');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/market-operators-list', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT u.user_id, CONCAT(u.first_name, ' ', u.last_name) AS name FROM users u WHERE u.role_type = 'MO'"
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
