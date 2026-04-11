import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM product ORDER BY product_name');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { product_name, category, storage_requirement, shelf_life, packaging_details } = req.body;
    if (!product_name) return res.status(400).json({ error: 'product_name is required' });
    const [result] = await db.query(
      'INSERT INTO product (product_name, category, storage_requirement, shelf_life, packaging_details) VALUES (?,?,?,?,?)',
      [product_name, category||null, storage_requirement||null, shelf_life||null, packaging_details||null]
    );
    res.json({ product_id: result.insertId, ...req.body });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { product_name, category, storage_requirement, shelf_life, packaging_details } = req.body;
    await db.query(
      'UPDATE product SET product_name=?, category=?, storage_requirement=?, shelf_life=?, packaging_details=? WHERE product_id=?',
      [product_name, category||null, storage_requirement||null, shelf_life||null, packaging_details||null, req.params.id]
    );
    res.json({ message: 'Product updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM product WHERE product_id=?', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
