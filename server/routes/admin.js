import express from 'express';
import db from '../db.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

const SUBTYPE_TABLE = {
  F: 'farmers', S: 'suppliers', WM: 'warehouse_managers',
  PM: 'processing_managers', QI: 'quality_inspectors',
  A: 'admins', MO: 'market_operators', LM: 'logistics_managers'
};

// ── Users CRUD ─────────────────────────────────────────────────

router.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT user_id, first_name, last_name, email, role_type, status, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/users', async (req, res) => {
  try {
    const { first_name, last_name, email, password, role_type, ...extras } = req.body;
    const [existing] = await db.query('SELECT user_id FROM users WHERE email=?', [email]);
    if (existing.length > 0) return res.status(400).json({ message: 'Email already exists' });

    const hashed = await bcrypt.hash(password || 'agrichain123', 10);
    const [result] = await db.query(
      'INSERT INTO users (first_name, last_name, email, password, role_type, status) VALUES (?,?,?,?,?,?)',
      [first_name, last_name, email, hashed, role_type, 'Active']
    );
    const user_id = result.insertId;

    // Insert subtype row
    const tbl = SUBTYPE_TABLE[role_type];
    if (tbl) {
      await db.query(`INSERT INTO ${tbl} (user_id) VALUES (?)`, [user_id]);
    }
    res.json({ user_id, first_name, last_name, email, role_type, status: 'Active' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { first_name, last_name, email, role_type, status } = req.body;
    await db.query(
      'UPDATE users SET first_name=?, last_name=?, email=?, role_type=?, status=? WHERE user_id=?',
      [first_name, last_name, email, role_type, status, req.params.id]
    );
    res.json({ message: 'User updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE user_id=?', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── System Stats (real DB data) ────────────────────────────────

router.get('/stats', async (req, res) => {
  try {
    const [[userCount]] = await db.query('SELECT COUNT(*) AS total FROM users');
    const [[batchCount]] = await db.query('SELECT COUNT(*) AS total FROM harvest_batch');
    const [[invQty]] = await db.query('SELECT COALESCE(SUM(quantity),0) AS total FROM inventory');
    const [[lowStock]] = await db.query("SELECT COUNT(*) AS total FROM inventory WHERE stock_status IN ('Low Stock','Critical','Out of Stock')");
    const [[deliveries]] = await db.query('SELECT COUNT(*) AS total FROM delivery');
    const [[salesTotal]] = await db.query('SELECT COALESCE(SUM(sale_price),0) AS total FROM sales');
    const [[products]] = await db.query('SELECT COUNT(*) AS total FROM product');
    const [[movements]] = await db.query('SELECT COUNT(*) AS total FROM stock_movement');

    res.json({
      totalUsers: userCount.total,
      totalHarvestBatches: batchCount.total,
      totalInventoryQty: parseFloat(invQty.total).toFixed(2),
      lowStockItems: lowStock.total,
      totalDeliveries: deliveries.total,
      totalSalesValue: parseFloat(salesTotal.total).toFixed(2),
      totalProducts: products.total,
      totalMovements: movements.total
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Batch Traceability ─────────────────────────────────────────

router.get('/batch/:batch_id/trace', async (req, res) => {
  try {
    const id = req.params.batch_id;

    const [[batch]] = await db.query(
      `SELECT hb.*, CONCAT(u.first_name, ' ', u.last_name) AS farmer_name,
              f.farm_village, f.farm_district, f.farm_size,
              p.product_name, p.category, p.storage_requirement, p.shelf_life
       FROM harvest_batch hb
       JOIN users u ON hb.farmer_id = u.user_id
       JOIN farmers f ON hb.farmer_id = f.user_id
       JOIN product p ON hb.product_id = p.product_id
       WHERE hb.batch_id = ?`, [id]
    );
    if (!batch) return res.status(404).json({ error: 'Batch not found' });

    const [inventory] = await db.query(
      `SELECT inv.*, w.area, w.district, w.capacity FROM inventory inv
       JOIN warehouse w ON inv.warehouse_id = w.warehouse_id WHERE inv.batch_id=?`, [id]
    );
    const [movements] = await db.query(
      `SELECT sm.*, w.area, w.district FROM stock_movement sm
       JOIN warehouse w ON sm.warehouse_id = w.warehouse_id WHERE sm.batch_id=? ORDER BY sm.movement_date`, [id]
    );
    const [processing] = await db.query(
      `SELECT pb.*, pp.area, pp.district, pp.process_plants_type FROM processing_batch pb
       JOIN processing_plant pp ON pb.plant_id = pp.plant_id WHERE pb.batch_id=? ORDER BY pb.processing_date`, [id]
    );
    const processingIds = processing.map(p => p.processing_id);
    let qualityReports = [];
    if (processingIds.length > 0) {
      [qualityReports] = await db.query(
        `SELECT qr.*, CONCAT(u.first_name, ' ', u.last_name) AS inspector_name FROM quality_report qr
         JOIN users u ON qr.inspector_id = u.user_id WHERE qr.processing_id IN (?)`, [processingIds]
      );
    }
    const [deliveries] = await db.query(
      `SELECT d.*, m.city, m.zone, CONCAT(u.first_name, ' ', u.last_name) AS logistics_manager
       FROM delivery d JOIN market m ON d.market_id = m.market_id
       JOIN users u ON d.logistics_manager_id = u.user_id WHERE d.batch_id=?`, [id]
    );
    const [sales] = await db.query(
      `SELECT s.*, m.city, m.zone FROM sales s
       JOIN market m ON s.market_id = m.market_id WHERE s.batch_id=?`, [id]
    );

    res.json({ batch, inventory, movements, processing, qualityReports, deliveries, sales });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Harvest batches list (for dropdowns) ──────────────────────

router.get('/batches-list', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT hb.batch_id, hb.harvest_date, hb.quantity, hb.quality_grade,
              p.product_name, CONCAT(u.first_name, ' ', u.last_name) AS farmer_name
       FROM harvest_batch hb
       JOIN product p ON hb.product_id = p.product_id
       JOIN users u ON hb.farmer_id = u.user_id
       ORDER BY hb.harvest_date DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
