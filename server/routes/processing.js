import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/batches', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM processing_batches ORDER BY start_time DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/batches', async (req, res) => {
  try {
    const { batch_id, raw_material, processing_type, input_qty, line, start_time } = req.body;
    const [result] = await db.query(
      'INSERT INTO processing_batches (batch_id, raw_material, processing_type, input_qty, line, start_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [batch_id, raw_material, processing_type, input_qty, line, start_time, 'Active']
    );
    res.json({ id: result.insertId, ...req.body, status: 'Active' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/qc', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM qc_reports ORDER BY inspection_date DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/qc', async (req, res) => {
  try {
    const { batch_id, inspector, inspection_date, moisture_pct, foreign_matter_pct, grade, notes } = req.body;
    const [result] = await db.query(
      'INSERT INTO qc_reports (batch_id, inspector, inspection_date, moisture_pct, foreign_matter_pct, grade, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [batch_id, inspector, inspection_date, moisture_pct, foreign_matter_pct, grade, notes]
    );
    res.json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
