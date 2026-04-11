import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT d.*, m.city AS market_city, m.zone AS market_zone,
              CONCAT(lu.first_name, ' ', lu.last_name) AS logistics_manager_name,
              p.product_name
       FROM delivery d
       JOIN market m ON d.market_id = m.market_id
       JOIN users lu ON d.logistics_manager_id = lu.user_id
       JOIN harvest_batch hb ON d.batch_id = hb.batch_id
       JOIN product p ON hb.product_id = p.product_id
       ORDER BY d.transport_date DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { batch_id, market_id, logistics_manager_id, source_area, source_district, destination_area, destination_district, status, transport_date } = req.body;
    if (!batch_id || !market_id || !logistics_manager_id) {
      return res.status(400).json({ error: 'batch_id, market_id, and logistics_manager_id are required' });
    }
    const [result] = await db.query(
      'INSERT INTO delivery (batch_id, market_id, logistics_manager_id, source_area, source_district, destination_area, destination_district, status, transport_date) VALUES (?,?,?,?,?,?,?,?,?)',
      [batch_id, market_id, logistics_manager_id, source_area||null, source_district||null, destination_area||null, destination_district||null, status||'Pending', transport_date||null]
    );
    res.json({ delivery_id: result.insertId, ...req.body });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { batch_id, market_id, logistics_manager_id, source_area, source_district, destination_area, destination_district, status, transport_date } = req.body;
    await db.query(
      'UPDATE delivery SET batch_id=?, market_id=?, logistics_manager_id=?, source_area=?, source_district=?, destination_area=?, destination_district=?, status=?, transport_date=? WHERE delivery_id=?',
      [batch_id, market_id, logistics_manager_id, source_area, source_district, destination_area, destination_district, status, transport_date, req.params.id]
    );
    res.json({ message: 'Delivery updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM delivery WHERE delivery_id=?', [req.params.id]);
    res.json({ message: 'Delivery deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Lookup helpers ─────────────────────────────────────────────

router.get('/logistics-managers-list', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT u.user_id, CONCAT(u.first_name, ' ', u.last_name) AS name, lm.transport_unit FROM users u JOIN logistics_managers lm ON u.user_id = lm.user_id"
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
