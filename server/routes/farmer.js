import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get sowing records
router.get('/sowing', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM sowing_records ORDER BY sowing_date DESC LIMIT 50');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add sowing record
router.post('/sowing', async (req, res) => {
  try {
    const { plot, crop_type, seed_type, sowing_date, expected_harvest_date, seed_qty, variety, fertiliser, pesticides, usage_rates, notes } = req.body;
    const [result] = await db.query(
      `INSERT INTO sowing_records 
       (plot, crop_type, seed_type, sowing_date, expected_harvest_date, seed_qty, variety, fertiliser, pesticides, usage_rates, notes, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [plot, crop_type, seed_type, sowing_date, expected_harvest_date, seed_qty, variety, fertiliser, pesticides, usage_rates, notes, 'Growing']
    );
    res.json({ id: result.insertId, plot, crop_type, seed_type, sowing_date, expected_harvest_date, seed_qty, variety, fertiliser, pesticides, usage_rates, notes, status: 'Growing' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get harvest records
router.get('/harvest', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM harvest_records ORDER BY harvest_date DESC LIMIT 50');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add harvest record
router.post('/harvest', async (req, res) => {
  try {
    const { batch_id, plot, harvest_date, quantity_tonnes, grade, storage_conditions, movement_tracking, destination } = req.body;
    const [result] = await db.query(
      `INSERT INTO harvest_records 
       (batch_id, plot, harvest_date, quantity_tonnes, grade, storage_conditions, movement_tracking, destination, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [batch_id, plot, harvest_date, quantity_tonnes, grade, storage_conditions, movement_tracking, destination, 'Delivered']
    );
    res.json({ id: result.insertId, batch_id, plot, harvest_date, quantity_tonnes, grade, storage_conditions, movement_tracking, destination, status: 'Delivered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
