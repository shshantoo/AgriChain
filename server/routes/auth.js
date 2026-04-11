import express from 'express';
import db from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();
export const JWT_SECRET = process.env.JWT_SECRET || 'agrichain_super_secret_key_2025';

// Role-type to friendly label map
const ROLE_LABELS = {
  F: 'Farmer', S: 'Supplier', WM: 'Warehouse Manager',
  PM: 'Processing Manager', QI: 'Quality Inspector',
  A: 'Admin', MO: 'Market Operator', LM: 'Logistics Manager'
};

// Insert into subtype table after user creation
async function insertSubtype(role_type, user_id, extras) {
  switch (role_type) {
    case 'F':
      await db.query(
        'INSERT INTO farmers (user_id, farm_village, farm_district, farm_size, crop_type) VALUES (?,?,?,?,?)',
        [user_id, extras.farm_village||null, extras.farm_district||null, extras.farm_size||null, extras.crop_type||null]
      );
      break;
    case 'S':
      await db.query(
        'INSERT INTO suppliers (user_id, company_name, supply_crops_type) VALUES (?,?,?)',
        [user_id, extras.company_name||null, extras.supply_crops_type||null]
      );
      break;
    case 'WM':
      await db.query(
        'INSERT INTO warehouse_managers (user_id, warehouse_district, warehouse_area) VALUES (?,?,?)',
        [user_id, extras.warehouse_district||null, extras.warehouse_area||null]
      );
      break;
    case 'PM':
      await db.query(
        'INSERT INTO processing_managers (user_id, experience_years, specialization) VALUES (?,?,?)',
        [user_id, extras.experience_years||null, extras.specialization||null]
      );
      break;
    case 'QI':
      await db.query(
        'INSERT INTO quality_inspectors (user_id, lab_id, specialty_research_field) VALUES (?,?,?)',
        [user_id, extras.lab_id||null, extras.specialty_research_field||null]
      );
      break;
    case 'A':
      await db.query(
        'INSERT INTO admins (user_id) VALUES (?)',
        [user_id]
      );
      break;
    case 'MO':
      await db.query(
        'INSERT INTO market_operators (user_id, market_city, market_zone) VALUES (?,?,?)',
        [user_id, extras.market_city||null, extras.market_zone||null]
      );
      break;
    case 'LM':
      await db.query(
        'INSERT INTO logistics_managers (user_id, transport_unit) VALUES (?,?)',
        [user_id, extras.transport_unit||null]
      );
      break;
    default:
      break;
  }
}

// Register
router.post('/register', async (req, res) => {
  const { first_name, last_name, email, password, role_type, ...extras } = req.body;

  if (!first_name || !last_name || !email || !password || !role_type) {
    return res.status(400).json({ message: 'first_name, last_name, email, password, and role_type are required' });
  }

  if (!ROLE_LABELS[role_type]) {
    return res.status(400).json({ message: 'Invalid role_type' });
  }

  try {
    const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (first_name, last_name, email, password, role_type, status) VALUES (?,?,?,?,?,?)',
      [first_name, last_name, email, hashed, role_type, 'Active']
    );
    const user_id = result.insertId;
    await insertSubtype(role_type, user_id, extras);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (user.status !== 'Active') return res.status(403).json({ message: 'Account is deactivated' });

    const payload = {
      user: {
        user_id: user.user_id,
        role_type: user.role_type,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      }
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: payload.user });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Middleware
export const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Update own profile
router.put('/profile', authenticateToken, async (req, res) => {
  const { first_name, last_name, email } = req.body;
  const { user_id } = req.user;
  if (!first_name || !last_name || !email) {
    return res.status(400).json({ message: 'first_name, last_name, and email are required' });
  }
  try {
    const [existing] = await db.query(
      'SELECT user_id FROM users WHERE email = ? AND user_id != ?', [email, user_id]
    );
    if (existing.length > 0) return res.status(400).json({ message: 'Email already taken' });
    await db.query(
      'UPDATE users SET first_name=?, last_name=?, email=? WHERE user_id=?',
      [first_name, last_name, email, user_id]
    );
    res.json({ message: 'Profile updated', first_name, last_name, email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
