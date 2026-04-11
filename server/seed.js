// AgriChain — Sample Data Seeder
// Usage: node server/seed.js
import bcrypt from 'bcryptjs';
import db from './db.js';

async function seed() {
  const [[{ c }]] = await db.query('SELECT COUNT(*) AS c FROM users');
  if (c > 1) {
    console.log('✅ Database already has sample data. Skipping seed.');
    await db.end?.();
    process.exit(0);
  }

  console.log('🌱 Seeding AgriChain with Bangladesh sample data...\n');
  const hash = await bcrypt.hash('agrichain123', 10);

  // ── 1. Users ───────────────────────────────────────────────────
  const users = [
    ['Rahim', 'Uddin',    'rahim@agrichain.com',      'F'],
    ['Karim', 'Ali',      'karim@agrichain.com',       'F'],
    ['Bashir','Ahmed',    'bashir@agrichain.com',      'S'],
    ['Nasreen','Akter',   'nasreen@agrichain.com',     'WM'],
    ['Rafique','Islam',   'rafique@agrichain.com',     'PM'],
    ['Salma', 'Khatun',   'salma@agrichain.com',       'QI'],
    ['Jahangir','Alam',   'jahangir@agrichain.com',    'MO'],
    ['Mosharraf','Khan',  'mosharraf@agrichain.com',   'LM'],
  ];

  const ids = [];
  for (const [fn, ln, email, role] of users) {
    const [r] = await db.query(
      'INSERT INTO users (first_name,last_name,email,password,role_type,status) VALUES (?,?,?,?,?,?)',
      [fn, ln, email, hash, role, 'Active']
    );
    ids.push(r.insertId);
    console.log(`  ✓ User: ${fn} ${ln} (${role})`);
  }

  const [farmer1, farmer2, supplier1, wm1, pm1, qi1, mo1, lm1] = ids;

  // ── 2. Subtypes ────────────────────────────────────────────────
  await db.query('INSERT INTO farmers VALUES (?,?,?,?,?)', [farmer1, 'Tangail Sadar', 'Tangail', 10.5, 'Rice']);
  await db.query('INSERT INTO farmers VALUES (?,?,?,?,?)', [farmer2, 'Bogura Sadar', 'Bogura', 8.0, 'Wheat']);
  await db.query('INSERT INTO suppliers VALUES (?,?,?)', [supplier1, 'AgriSupply Ltd.', 'Fertilizer & Seeds']);
  await db.query('INSERT INTO warehouse_managers (user_id,warehouse_district,warehouse_area) VALUES (?,?,?)', [wm1, 'Dhaka', 'Tongi']);
  await db.query('INSERT INTO processing_managers (user_id,experience_years,specialization) VALUES (?,?,?)', [pm1, 5, 'Rice Milling']);
  await db.query('INSERT INTO quality_inspectors (user_id,lab_id,specialty_research_field) VALUES (?,?,?)', [qi1, 'QC-BD-001', 'Grain Quality & Safety']);
  await db.query('INSERT INTO market_operators (user_id,market_city,market_zone) VALUES (?,?,?)', [mo1, 'Dhaka', 'Karwan Bazar']);
  await db.query('INSERT INTO logistics_managers (user_id,transport_unit) VALUES (?,?)', [lm1, 'Fleet A — 6 Trucks']);
  console.log('  ✓ Subtypes inserted');

  // ── 3. Products ────────────────────────────────────────────────
  const products = [
    ['Aman Rice',  'Grain',    'Cool & dry, <15% moisture',  180, 'Jute bags 50kg'],
    ['Wheat',      'Grain',    'Dry, <13% moisture',          150, 'Polypropylene bags'],
    ['Maize',      'Grain',    'Ventilated, <14% moisture',   120, 'Bulk bin'],
    ['Potato',     'Vegetable','Cold storage 4–10°C',         60,  'Mesh bags 25kg'],
    ['Onion',      'Vegetable','Dry & ventilated',            90,  'Net bags 20kg'],
  ];
  const productIds = [];
  for (const [nm, cat, sr, sl, pkg] of products) {
    const [r] = await db.query('INSERT INTO product (product_name,category,storage_requirement,shelf_life,packaging_details) VALUES (?,?,?,?,?)', [nm, cat, sr, sl, pkg]);
    productIds.push(r.insertId);
    console.log(`  ✓ Product: ${nm}`);
  }
  const [pRice, pWheat, pMaize, pPotato, pOnion] = productIds;

  // ── 4. Warehouses ──────────────────────────────────────────────
  const warehouses = [
    ['Tongi Industrial Area',    'Dhaka',     5000],
    ['Agrabad Commercial Area',  'Chittagong', 3000],
    ['Sunamganj Town Centre',    'Sylhet',    2000],
  ];
  const whIds = [];
  for (const [area, dist, cap] of warehouses) {
    const [r] = await db.query('INSERT INTO warehouse (area,district,capacity) VALUES (?,?,?)', [area, dist, cap]);
    whIds.push(r.insertId);
    console.log(`  ✓ Warehouse: ${area}, ${dist}`);
  }
  const [wDhaka, wChitt, wSylhet] = whIds;

  // ── 5. Sowing Logs ─────────────────────────────────────────────
  const sowings = [
    [farmer1, '2025-01-10', '2025-04-20', 'BR-29 Aman Paddy', 120],
    [farmer1, '2024-11-05', '2025-03-10', 'BARI Wheat-30',     80],
    [farmer2, '2025-02-01', '2025-05-15', 'BARI Maize-9',      90],
    [farmer2, '2024-10-15', '2025-01-20', 'Diamant Potato',    75],
    [farmer1, '2024-12-01', '2025-03-25', 'Taherpuri Onion',   40],
  ];
  for (const [fid, sd, ehd, st, uq] of sowings) {
    await db.query('INSERT INTO sowing_logs (farmer_id,sowing_date,expected_harvest_date,seed_type,used_quantity) VALUES (?,?,?,?,?)', [fid, sd, ehd, st, uq]);
  }
  console.log('  ✓ Sowing logs inserted (5)');

  // ── 6. Harvest Batches ─────────────────────────────────────────
  const harvests = [
    [farmer1, pRice,   '2025-04-18', 52.5, 'Grade A'],
    [farmer1, pWheat,  '2025-03-08', 31.0, 'Grade B'],
    [farmer2, pMaize,  '2025-05-20', 42.0, 'Grade A'],
    [farmer2, pPotato, '2025-01-18', 26.5, 'Grade B'],
    [farmer1, pOnion,  '2025-03-22', 16.0, 'Grade C'],
    [farmer2, pRice,   '2025-04-22', 47.0, 'Grade A'],
    [farmer1, pMaize,  '2025-05-25', 33.0, 'Grade B'],
    [farmer2, pWheat,  '2025-03-12', 28.0, 'Grade A'],
  ];
  const batchIds = [];
  for (const [fid, pid, hd, qty, grd] of harvests) {
    const [r] = await db.query('INSERT INTO harvest_batch (farmer_id,product_id,harvest_date,quantity,quality_grade) VALUES (?,?,?,?,?)', [fid, pid, hd, qty, grd]);
    batchIds.push(r.insertId);
  }
  console.log(`  ✓ Harvest batches inserted (${batchIds.length})`);
  const [b1, b2, b3, b4, b5, b6, b7, b8] = batchIds;

  // ── 7. Input Supply ────────────────────────────────────────────
  const inputs = [
    [farmer1, supplier1, 'Urea Fertilizer',   500, '2025-03-05', 25000, '2025-03-01', 180, 2.5],
    [farmer2, supplier1, 'DAP Fertilizer',    300, '2025-02-15', 18000, '2025-02-10', 120, 1.8],
    [farmer1, supplier1, 'Pesticide (Cypro)', 50,  '2025-04-02', 12000, '2025-04-01', 20, 0.3],
    [farmer2, supplier1, 'BARI Wheat Seeds',  200, '2024-10-20', 15000, '2024-10-15', 150, 1.0],
    [farmer1, supplier1, 'Potash Fertilizer', 250, '2025-01-10', 14000, '2025-01-05', 200, 1.5],
  ];
  for (const [fid, sid, it, qty, sd, cost, ps, csl, ur] of inputs) {
    await db.query('INSERT INTO input_supply (farmer_id,supplier_id,input_type,quantity,supply_date,cost,procurement_schedule,current_stock_level,usage_rate) VALUES (?,?,?,?,?,?,?,?,?)',
      [fid, sid, it, qty, sd, cost, ps, csl, ur]);
  }
  console.log('  ✓ Input supplies inserted (5)');

  // ── 8. Inventory ───────────────────────────────────────────────
  const inventory = [
    [b1, wDhaka,  48.0, 180, 170, 'Jute bags 50kg', 5.0, 5000, 'In Stock'],
    [b2, wDhaka,  28.0, 150, 140, 'PP bags',         4.0, 3000, 'In Stock'],
    [b3, wChitt,  38.0, 120, 115, 'Bulk bin',        3.0, 3000, 'In Stock'],
    [b4, wSylhet, 22.0, 60,  55,  'Mesh bags 25kg',  2.0, 2000, 'Low Stock'],
    [b6, wChitt,  43.0, 180, 172, 'Jute bags 50kg',  5.0, 3000, 'In Stock'],
    [b7, wDhaka,  29.0, 120, 118, 'Bulk bin',        3.0, 5000, 'In Stock'],
    [b8, wSylhet, 24.0, 150, 145, 'PP bags',         4.0, 2000, 'In Stock'],
  ];
  for (const [bid, wid, qty, sl, rsl, pkg, rl, msl, ss] of inventory) {
    await db.query('INSERT INTO inventory (batch_id,warehouse_id,quantity,shelf_life,remaining_shelf_life,packaging_details,reorder_level,max_stock_level,stock_status) VALUES (?,?,?,?,?,?,?,?,?)',
      [bid, wid, qty, sl, rsl, pkg, rl, msl, ss]);
  }
  console.log('  ✓ Inventory inserted (7)');

  // ── 9. Sensors + Data ──────────────────────────────────────────
  const [sR1] = await db.query('INSERT INTO sensor (warehouse_id,sensor_type) VALUES (?,?)', [wDhaka, 'Temperature & Humidity']);
  const [sR2] = await db.query('INSERT INTO sensor (warehouse_id,sensor_type) VALUES (?,?)', [wChitt, 'Temperature & Humidity']);
  const s1 = sR1.insertId, s2 = sR2.insertId;
  const readings = [
    [s1,'2025-04-10 08:00:00',22.5,65.0],[s1,'2025-04-10 14:00:00',26.1,68.2],
    [s1,'2025-04-10 20:00:00',23.8,64.5],[s2,'2025-04-10 08:00:00',28.3,72.0],
    [s2,'2025-04-10 14:00:00',31.2,75.5],[s2,'2025-04-10 20:00:00',29.0,71.0],
  ];
  for (const [sid, ts, temp, hum] of readings) {
    await db.query('INSERT INTO sensor_data (sensor_id,timestamp,temperature,humidity) VALUES (?,?,?,?)', [sid, ts, temp, hum]);
  }
  console.log('  ✓ Sensors & data inserted');

  // ── 10. Processing Plants ──────────────────────────────────────
  const [pR1] = await db.query('INSERT INTO processing_plant (manager_id,area,district,process_plants_type) VALUES (?,?,?,?)', [pm1, 'Tongi Industrial Area', 'Dhaka', 'Milling']);
  const [pR2] = await db.query('INSERT INTO processing_plant (manager_id,area,district,process_plants_type) VALUES (?,?,?,?)', [pm1, 'Agrabad Commercial Area', 'Chittagong', 'Sorting']);
  const plant1 = pR1.insertId, plant2 = pR2.insertId;
  console.log('  ✓ Processing plants inserted (2)');

  // ── 11. Processing Batches ─────────────────────────────────────
  const pBatches = [
    [b1, plant1, '2025-04-22'],
    [b3, plant2, '2025-05-23'],
    [b6, plant1, '2025-04-25'],
    [b2, plant2, '2025-03-12'],
    [b7, plant1, '2025-05-28'],
    [b8, plant2, '2025-03-15'],
  ];
  const pbIds = [];
  for (const [bid, plid, pd] of pBatches) {
    const [r] = await db.query('INSERT INTO processing_batch (batch_id,plant_id,processing_date) VALUES (?,?,?)', [bid, plid, pd]);
    pbIds.push(r.insertId);
  }
  console.log(`  ✓ Processing batches inserted (${pbIds.length})`);
  const [pb1, pb2, pb3, pb4, pb5, pb6] = pbIds;

  // ── 12. Quality Reports ────────────────────────────────────────
  const reports = [
    [pb1, qi1, 12.5, 98.5, 'None',     'Pass',                  'Excellent grain quality, ready for market'],
    [pb2, qi1, 14.2, 94.8, 'Moderate', 'Fail',                  'High moisture content, requires re-drying'],
    [pb3, qi1, 13.0, 97.2, 'Minor',    'Pass',                  'Minor surface impurities, acceptable'],
    [pb4, qi1, 11.8, 99.0, 'None',     'Pass',                  'Premium wheat batch, export quality'],
    [pb5, qi1, 13.5, 96.5, 'Minor',    'Pass with Conditions',  'Slight discolouration, approve for local market'],
    [pb6, qi1, 12.1, 98.8, 'None',     'Pass',                  'Good quality batch'],
  ];
  for (const [pid, iid, mc, pur, dl, gs, rem] of reports) {
    await db.query('INSERT INTO quality_report (processing_id,inspector_id,moisture_content,purity,defect_level,grading_status,remarks) VALUES (?,?,?,?,?,?,?)', [pid, iid, mc, pur, dl, gs, rem]);
  }
  console.log('  ✓ Quality reports inserted (6)');

  // ── 13. Markets ────────────────────────────────────────────────
  const [mR1] = await db.query('INSERT INTO market (operator_id,city,zone,market_type) VALUES (?,?,?,?)', [mo1, 'Dhaka', 'Karwan Bazar', 'Wholesale']);
  const [mR2] = await db.query('INSERT INTO market (operator_id,city,zone,market_type) VALUES (?,?,?,?)', [mo1, 'Chittagong', 'Khatunganj', 'Wholesale']);
  const [mR3] = await db.query('INSERT INTO market (operator_id,city,zone,market_type) VALUES (?,?,?,?)', [mo1, 'Sylhet', 'Bandarbazar', 'Retail']);
  const m1 = mR1.insertId, m2 = mR2.insertId, m3 = mR3.insertId;
  console.log('  ✓ Markets inserted (3)');

  // ── 14. Stock Movements ────────────────────────────────────────
  const movements = [
    [b1, wDhaka,  '2025-04-23', 5.0, 'Bay A',  'Loading Dock 1', 'Dispatch'],
    [b3, wChitt,  '2025-05-24', 4.0, 'Bay B',  'Gate 2',          'Dispatch'],
    [b6, wChitt,  '2025-04-26', 3.0, 'Bay A',  'Loading Dock 2', 'Transfer'],
    [b8, wSylhet, '2025-03-16', 2.5, 'Section C','Gate 1',        'Dispatch'],
  ];
  for (const [bid, wid, md, qty, fl, tl, mt] of movements) {
    await db.query('INSERT INTO stock_movement (batch_id,warehouse_id,movement_date,quantity_removed,from_location,to_location,movement_type) VALUES (?,?,?,?,?,?,?)', [bid, wid, md, qty, fl, tl, mt]);
  }
  console.log('  ✓ Stock movements inserted (4)');

  // ── 15. Deliveries ─────────────────────────────────────────────
  const deliveries = [
    [b1, m1, lm1, 'Tongi', 'Dhaka',     'Karwan Bazar', 'Dhaka',     'Delivered', '2025-04-23'],
    [b3, m2, lm1, 'Agrabad', 'Chittagong','Khatunganj',  'Chittagong','Delivered', '2025-05-24'],
    [b6, m1, lm1, 'Agrabad', 'Chittagong','Karwan Bazar','Dhaka',     'In Transit','2025-04-26'],
    [b2, m2, lm1, 'Tongi',   'Dhaka',    'Khatunganj',  'Chittagong','Delivered', '2025-03-12'],
    [b4, m3, lm1, 'Sunamganj','Sylhet',  'Bandarbazar', 'Sylhet',    'Pending',   '2025-05-01'],
    [b8, m2, lm1, 'Sunamganj','Sylhet',  'Khatunganj',  'Chittagong','Delivered', '2025-03-16'],
  ];
  for (const [bid, mid, lid, sa, sd, da, dd, st, td] of deliveries) {
    await db.query('INSERT INTO delivery (batch_id,market_id,logistics_manager_id,source_area,source_district,destination_area,destination_district,status,transport_date) VALUES (?,?,?,?,?,?,?,?,?)',
      [bid, mid, lid, sa, sd, da, dd, st, td]);
  }
  console.log('  ✓ Deliveries inserted (6)');

  // ── 16. Sales ──────────────────────────────────────────────────
  const sales = [
    [b1, pRice,  m1, '2025-04-25', 95000],
    [b3, pMaize, m2, '2025-05-25', 63000],
    [b2, pWheat, m2, '2025-03-14', 51000],
    [b6, pRice,  m1, '2025-04-28', 87500],
    [b4, pPotato,m3, '2025-01-25', 38500],
    [b8, pWheat, m2, '2025-03-18', 43000],
    [b7, pMaize, m1, '2025-05-30', 49500],
  ];
  for (const [bid, pid, mid, sd, sp] of sales) {
    await db.query('INSERT INTO sales (batch_id,product_id,market_id,sale_date,sale_price) VALUES (?,?,?,?,?)', [bid, pid, mid, sd, sp]);
  }
  console.log('  ✓ Sales inserted (7)');

  console.log('\n🎉 Seeding complete! All sample data inserted successfully.');
  console.log('   Login with any seeded user: password = agrichain123');
  console.log('   Admin: admin@agrichain.com / admin123');
  process.exit(0);
}

seed().catch(err => { console.error('❌ Seed failed:', err); process.exit(1); });
