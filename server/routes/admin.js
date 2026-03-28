import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

import bcrypt from 'bcryptjs';

router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role, region } = req.body;
    
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ message: 'Email already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'password123', salt);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, region, status, last_login) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [name, email, hashedPassword, role, region || 'Not Specified', 'Active']
    );
    res.json({ id: result.insertId, name, email, role, region, status: 'Active' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, region, status } = req.body;
    await db.query(
      'UPDATE users SET name = ?, email = ?, role = ?, region = ?, status = ? WHERE id = ?',
      [name, email, role, region, status, id]
    );
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/alerts', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM system_alerts ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    res.json({
      totalFarmers: 127,
      totalWarehouses: 6,
      iotSensors: 284,
      monthlyVolume: 1240
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
