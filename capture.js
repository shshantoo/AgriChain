import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// Define the URLs for each role to capture
const captures = {
  public: [
    { name: '1_Home', url: '/' },
    { name: '2_Login', url: '/login' },
    { name: '3_Register', url: '/register' }
  ],
  admin: [
    { name: '4_Admin_Dashboard', url: '/admin' },
    { name: '5_Admin_Analytics', url: '/admin/analytics' },
    { name: '6_Admin_Users', url: '/admin/users' },
    { name: '7_Admin_Alerts', url: '/admin/alerts' }
  ],
  farmer: [
    { name: '8_Farmer_Dashboard', url: '/farmer' },
    { name: '9_Farmer_Sowing', url: '/farmer/sowing' },
    { name: '10_Farmer_Harvest', url: '/farmer/harvest' },
    { name: '11_Farmer_Predictions', url: '/farmer/predictions' }
  ],
  warehouse: [
    { name: '12_Warehouse_Dashboard', url: '/warehouse' },
    { name: '13_Warehouse_Inventory', url: '/warehouse/inventory' },
    { name: '14_Warehouse_Analytics', url: '/warehouse/analytics' }
  ],
  processing: [
    { name: '15_Processing_Dashboard', url: '/processing' },
    { name: '16_Processing_Batches', url: '/processing/batches' },
    { name: '17_Processing_QC', url: '/processing/qc' }
  ],
  supplier: [
    { name: '18_Supplier_Dashboard', url: '/supplier' },
    { name: '19_Supplier_Orders', url: '/supplier/orders' },
    { name: '20_Supplier_Stock', url: '/supplier/stock' }
  ]
};

const BASE_URL = 'http://localhost:5173';

async function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

(async () => {
  const outDir = path.join(process.cwd(), 'screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }

  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Capture Public Pages
  console.log('Capturing Public Pages...');
  for (const item of captures.public) {
    await page.goto(`${BASE_URL}${item.url}`, { waitUntil: 'networkidle0' });
    await delay(1000); // Wait for animations
    await page.screenshot({ path: path.join(outDir, `${item.name}.png`), fullPage: true });
    console.log(`Saved ${item.name}.png`);
  }

  // Helper to mock login via localStorage
  async function mockLogin(roleKey) {
    console.log(`Mocking login for role: ${roleKey}...`);
    await page.evaluate((role) => {
      // Create a fake JWT token structure that the app expects
      // The app decodes the token payload, so we just create a base64 encoded payload
      const payload = {
        id: 999,
        name: `Test ${role}`,
        email: `test@${role}.com`,
        role: role
      };
      const token = 'header.' + btoa(JSON.stringify(payload)) + '.signature';
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(payload));
    }, roleKey);
    // Navigate to root to trigger the role redirect
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await delay(1500);
  }

  // 2. Capture Role Pages
  const roles = ['admin', 'farmer', 'warehouse', 'processing', 'supplier'];
  for (const role of roles) {
    await mockLogin(role);
    
    for (const item of captures[role]) {
      await page.goto(`${BASE_URL}${item.url}`, { waitUntil: 'networkidle0' });
      await delay(1000); // Let framer-motion animations finish
      await page.screenshot({ path: path.join(outDir, `${item.name}.png`), fullPage: true });
      console.log(`Saved ${item.name}.png`);
    }
    
    // Clear localStorage for next user
    await page.evaluate(() => localStorage.clear());
  }

  await browser.close();
  console.log('All screenshots captured successfully in /screenshots folder!');
})();
