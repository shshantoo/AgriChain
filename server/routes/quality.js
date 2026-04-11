import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/reports', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT qr.*, CONCAT(u.first_name, ' ', u.last_name) AS inspector_name,
              p.product_name, pb.processing_date
       FROM quality_report qr
       JOIN users u ON qr.inspector_id = u.user_id
       JOIN processing_batch pb ON qr.processing_id = pb.processing_id
       JOIN harvest_batch hb ON pb.batch_id = hb.batch_id
       JOIN product p ON hb.product_id = p.product_id
       ORDER BY qr.created_at DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/reports', async (req, res) => {
  try {
    const { processing_id, inspector_id, moisture_content, purity, defect_level, grading_status, remarks } = req.body;
    if (!processing_id || !inspector_id) return res.status(400).json({ error: 'processing_id and inspector_id are required' });
    const [result] = await db.query(
      'INSERT INTO quality_report (processing_id, inspector_id, moisture_content, purity, defect_level, grading_status, remarks) VALUES (?,?,?,?,?,?,?)',
      [processing_id, inspector_id, moisture_content||null, purity||null, defect_level||null, grading_status||null, remarks||null]
    );
    res.json({ report_id: result.insertId, ...req.body });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/reports/:id', async (req, res) => {
  try {
    const { processing_id, inspector_id, moisture_content, purity, defect_level, grading_status, remarks } = req.body;
    await db.query(
      'UPDATE quality_report SET processing_id=?, inspector_id=?, moisture_content=?, purity=?, defect_level=?, grading_status=?, remarks=? WHERE report_id=?',
      [processing_id, inspector_id, moisture_content, purity, defect_level, grading_status, remarks, req.params.id]
    );
    res.json({ message: 'Quality report updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/reports/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM quality_report WHERE report_id=?', [req.params.id]);
    res.json({ message: 'Quality report deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Lookup helpers ─────────────────────────────────────────────

router.get('/inspectors-list', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT u.user_id, CONCAT(u.first_name, ' ', u.last_name) AS name, qi.lab_id FROM users u JOIN quality_inspectors qi ON u.user_id = qi.user_id"
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/processing-batches-list', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT pb.processing_id, pb.processing_date, pp.area, pp.district, p.product_name
       FROM processing_batch pb
       JOIN processing_plant pp ON pb.plant_id = pp.plant_id
       JOIN harvest_batch hb ON pb.batch_id = hb.batch_id
       JOIN product p ON hb.product_id = p.product_id
       ORDER BY pb.processing_date DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
