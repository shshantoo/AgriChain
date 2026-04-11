import express from 'express';
import db from '../db.js';

const router = express.Router();

// ── Processing Plants ─────────────────────────────────────────

router.get('/plants', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT pp.*, CONCAT(u.first_name, ' ', u.last_name) AS manager_name
       FROM processing_plant pp
       JOIN users u ON pp.manager_id = u.user_id
       ORDER BY pp.district, pp.area`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/plants', async (req, res) => {
  try {
    const { manager_id, area, district, process_plants_type } = req.body;
    const [result] = await db.query(
      'INSERT INTO processing_plant (manager_id, area, district, process_plants_type) VALUES (?,?,?,?)',
      [manager_id, area||null, district||null, process_plants_type||null]
    );
    res.json({ plant_id: result.insertId, ...req.body });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/plants/:id', async (req, res) => {
  try {
    const { manager_id, area, district, process_plants_type } = req.body;
    await db.query(
      'UPDATE processing_plant SET manager_id=?, area=?, district=?, process_plants_type=? WHERE plant_id=?',
      [manager_id, area, district, process_plants_type, req.params.id]
    );
    res.json({ message: 'Processing plant updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/plants/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM processing_plant WHERE plant_id=?', [req.params.id]);
    res.json({ message: 'Processing plant deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Processing Batches ────────────────────────────────────────

router.get('/batches', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT pb.*, pp.area AS plant_area, pp.district AS plant_district, pp.process_plants_type,
              p.product_name, hb.harvest_date, hb.quantity
       FROM processing_batch pb
       JOIN processing_plant pp ON pb.plant_id = pp.plant_id
       JOIN harvest_batch hb ON pb.batch_id = hb.batch_id
       JOIN product p ON hb.product_id = p.product_id
       ORDER BY pb.processing_date DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/batches', async (req, res) => {
  try {
    const { batch_id, plant_id, processing_date } = req.body;
    if (!batch_id || !plant_id) return res.status(400).json({ error: 'batch_id and plant_id are required' });
    const [result] = await db.query(
      'INSERT INTO processing_batch (batch_id, plant_id, processing_date) VALUES (?,?,?)',
      [batch_id, plant_id, processing_date]
    );
    res.json({ processing_id: result.insertId, ...req.body });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/batches/:id', async (req, res) => {
  try {
    const { batch_id, plant_id, processing_date } = req.body;
    await db.query(
      'UPDATE processing_batch SET batch_id=?, plant_id=?, processing_date=? WHERE processing_id=?',
      [batch_id, plant_id, processing_date, req.params.id]
    );
    res.json({ message: 'Processing batch updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/batches/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM processing_batch WHERE processing_id=?', [req.params.id]);
    res.json({ message: 'Processing batch deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Lookup helpers ─────────────────────────────────────────────

router.get('/plants-list', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT plant_id, area, district, process_plants_type FROM processing_plant ORDER BY district');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/processing-managers-list', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT u.user_id, CONCAT(u.first_name, ' ', u.last_name) AS name FROM users u WHERE u.role_type = 'PM'"
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
