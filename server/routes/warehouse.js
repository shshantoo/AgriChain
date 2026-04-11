import express from 'express';
import db from '../db.js';

const router = express.Router();

// ── Warehouse CRUD ─────────────────────────────────────────────

router.get('/warehouses', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM warehouse ORDER BY district, area');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/warehouses', async (req, res) => {
  try {
    const { area, district, capacity } = req.body;
    const [result] = await db.query(
      'INSERT INTO warehouse (area, district, capacity) VALUES (?,?,?)',
      [area||null, district||null, capacity||null]
    );
    res.json({ warehouse_id: result.insertId, ...req.body });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/warehouses/:id', async (req, res) => {
  try {
    const { area, district, capacity } = req.body;
    await db.query(
      'UPDATE warehouse SET area=?, district=?, capacity=? WHERE warehouse_id=?',
      [area, district, capacity, req.params.id]
    );
    res.json({ message: 'Warehouse updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/warehouses/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM warehouse WHERE warehouse_id=?', [req.params.id]);
    res.json({ message: 'Warehouse deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Inventory CRUD ─────────────────────────────────────────────

router.get('/inventory', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT inv.*, w.area AS warehouse_area, w.district AS warehouse_district,
              p.product_name, hb.harvest_date, hb.quality_grade
       FROM inventory inv
       JOIN warehouse w ON inv.warehouse_id = w.warehouse_id
       JOIN harvest_batch hb ON inv.batch_id = hb.batch_id
       JOIN product p ON hb.product_id = p.product_id
       ORDER BY inv.inventory_id DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/inventory', async (req, res) => {
  try {
    const { batch_id, warehouse_id, quantity, shelf_life, remaining_shelf_life, packaging_details, reorder_level, max_stock_level, stock_status } = req.body;

    // Validate quantity vs warehouse capacity
    const [[wh]] = await db.query('SELECT capacity FROM warehouse WHERE warehouse_id=?', [warehouse_id]);
    if (!wh) return res.status(400).json({ error: 'Warehouse not found' });
    if (quantity > wh.capacity) return res.status(400).json({ error: `Quantity (${quantity}) exceeds warehouse capacity (${wh.capacity})` });

    const [result] = await db.query(
      'INSERT INTO inventory (batch_id, warehouse_id, quantity, shelf_life, remaining_shelf_life, packaging_details, reorder_level, max_stock_level, stock_status) VALUES (?,?,?,?,?,?,?,?,?)',
      [batch_id, warehouse_id, quantity, shelf_life||null, remaining_shelf_life||null, packaging_details||null, reorder_level||null, max_stock_level||null, stock_status||'In Stock']
    );
    res.json({ inventory_id: result.insertId, ...req.body });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/inventory/:id', async (req, res) => {
  try {
    const { batch_id, warehouse_id, quantity, shelf_life, remaining_shelf_life, packaging_details, reorder_level, max_stock_level, stock_status } = req.body;
    await db.query(
      'UPDATE inventory SET batch_id=?, warehouse_id=?, quantity=?, shelf_life=?, remaining_shelf_life=?, packaging_details=?, reorder_level=?, max_stock_level=?, stock_status=? WHERE inventory_id=?',
      [batch_id, warehouse_id, quantity, shelf_life||null, remaining_shelf_life||null, packaging_details||null, reorder_level||null, max_stock_level||null, stock_status, req.params.id]
    );
    res.json({ message: 'Inventory updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/inventory/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM inventory WHERE inventory_id=?', [req.params.id]);
    res.json({ message: 'Inventory item deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Stock Movement ─────────────────────────────────────────────

router.get('/stock-movement', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT sm.*, w.area AS warehouse_area, w.district AS warehouse_district,
              p.product_name
       FROM stock_movement sm
       JOIN warehouse w ON sm.warehouse_id = w.warehouse_id
       JOIN harvest_batch hb ON sm.batch_id = hb.batch_id
       JOIN product p ON hb.product_id = p.product_id
       ORDER BY sm.movement_date DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/stock-movement', async (req, res) => {
  try {
    const { batch_id, warehouse_id, movement_date, quantity_removed, from_location, to_location, movement_type } = req.body;

    // Validate available inventory
    const [[inv]] = await db.query(
      'SELECT SUM(quantity) AS total FROM inventory WHERE batch_id=? AND warehouse_id=?',
      [batch_id, warehouse_id]
    );
    if (inv.total === null || quantity_removed > inv.total) {
      return res.status(400).json({ error: `Quantity removed (${quantity_removed}) exceeds available inventory (${inv.total || 0})` });
    }

    const [result] = await db.query(
      'INSERT INTO stock_movement (batch_id, warehouse_id, movement_date, quantity_removed, from_location, to_location, movement_type) VALUES (?,?,?,?,?,?,?)',
      [batch_id, warehouse_id, movement_date, quantity_removed, from_location||null, to_location||null, movement_type||null]
    );
    res.json({ movement_id: result.insertId, ...req.body });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/stock-movement/:id', async (req, res) => {
  try {
    const { batch_id, warehouse_id, movement_date, quantity_removed, from_location, to_location, movement_type } = req.body;
    await db.query(
      'UPDATE stock_movement SET batch_id=?, warehouse_id=?, movement_date=?, quantity_removed=?, from_location=?, to_location=?, movement_type=? WHERE movement_id=?',
      [batch_id, warehouse_id, movement_date, quantity_removed, from_location, to_location, movement_type, req.params.id]
    );
    res.json({ message: 'Stock movement updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/stock-movement/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM stock_movement WHERE movement_id=?', [req.params.id]);
    res.json({ message: 'Stock movement deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Sensors ───────────────────────────────────────────────────

router.get('/sensors', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.*, w.area, w.district FROM sensor s
       JOIN warehouse w ON s.warehouse_id = w.warehouse_id
       ORDER BY s.sensor_id`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/sensors', async (req, res) => {
  try {
    const { warehouse_id, sensor_type } = req.body;
    const [result] = await db.query(
      'INSERT INTO sensor (warehouse_id, sensor_type) VALUES (?,?)',
      [warehouse_id, sensor_type]
    );
    res.json({ sensor_id: result.insertId, ...req.body });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/sensors/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM sensor WHERE sensor_id=?', [req.params.id]);
    res.json({ message: 'Sensor deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Sensor Data ───────────────────────────────────────────────

router.get('/sensor-data', async (req, res) => {
  try {
    const { sensor_id } = req.query;
    const query = sensor_id
      ? 'SELECT * FROM sensor_data WHERE sensor_id=? ORDER BY timestamp DESC LIMIT 100'
      : 'SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 200';
    const params = sensor_id ? [sensor_id] : [];
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/sensor-data', async (req, res) => {
  try {
    const { sensor_id, temperature, humidity } = req.body;
    const [result] = await db.query(
      'INSERT INTO sensor_data (sensor_id, temperature, humidity) VALUES (?,?,?)',
      [sensor_id, temperature ?? null, humidity ?? null]
    );
    res.json({ data_id: result.insertId, ...req.body });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Lookup helpers ─────────────────────────────────────────────

router.get('/warehouses-list', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT warehouse_id, area, district, capacity FROM warehouse ORDER BY district');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
