import db from './db.js';

async function patchDatabase() {
  try {
    console.log('Applying ALTER TABLE patch to agrichain database...');
    
    // sowing_records
    await db.query(`ALTER TABLE sowing_records ADD COLUMN seed_type VARCHAR(100) AFTER crop_type;`).catch(()=>console.log('Skipping seed_type'));
    await db.query(`ALTER TABLE sowing_records ADD COLUMN expected_harvest_date DATE AFTER sowing_date;`).catch(()=>console.log('Skipping expected_harvest_date'));
    await db.query(`ALTER TABLE sowing_records ADD COLUMN pesticides VARCHAR(255) AFTER fertiliser;`).catch(()=>console.log('Skipping pesticides'));
    await db.query(`ALTER TABLE sowing_records ADD COLUMN usage_rates VARCHAR(100) AFTER pesticides;`).catch(()=>console.log('Skipping usage_rates'));

    // harvest_records
    await db.query(`ALTER TABLE harvest_records ADD COLUMN storage_conditions VARCHAR(255) AFTER grade;`).catch(()=>console.log('Skipping storage_conditions'));
    await db.query(`ALTER TABLE harvest_records ADD COLUMN movement_tracking VARCHAR(255) AFTER storage_conditions;`).catch(()=>console.log('Skipping movement_tracking'));

    // inventory_items
    await db.query(`ALTER TABLE inventory_items ADD COLUMN storage_requirements VARCHAR(255) AFTER expiry;`).catch(()=>console.log('Skipping storage_requirements'));
    await db.query(`ALTER TABLE inventory_items ADD COLUMN shelf_life VARCHAR(100) AFTER storage_requirements;`).catch(()=>console.log('Skipping shelf_life'));
    await db.query(`ALTER TABLE inventory_items ADD COLUMN packaging_details VARCHAR(255) AFTER shelf_life;`).catch(()=>console.log('Skipping packaging_details'));
    await db.query(`ALTER TABLE inventory_items ADD COLUMN supplier_information VARCHAR(255) AFTER packaging_details;`).catch(()=>console.log('Skipping supplier_information'));

    // stock_settings
    await db.query(`ALTER TABLE stock_settings ADD COLUMN input_category VARCHAR(50) AFTER item;`).catch(()=>console.log('Skipping input_category'));
    await db.query(`ALTER TABLE stock_settings ADD COLUMN procurement_schedules VARCHAR(255) AFTER reorder_qty;`).catch(()=>console.log('Skipping procurement_schedules'));

    console.log('Database schema patched successfully.');
    process.exit(0);
  } catch(e) {
    console.error('Migration error:', e);
    process.exit(1);
  }
}

patchDatabase();
