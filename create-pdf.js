import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const descriptions = {
  '1_Home': 'The public landing page showcasing the application\'s core propositions with a beautiful hero image slider.',
  '2_Login': 'Secure authentication portal where users securely sign into their respective role-based dashboards.',
  '3_Register': 'New user onboarding form for creating new accounts securely.',
  '4_Admin_Dashboard': 'The primary management overview displaying system health, active user metrics, and alerts.',
  '5_Admin_Analytics': 'Advanced system-wide predictive analytics modeling agricultural throughput and capacity.',
  '6_Admin_Users': 'The comprehensive CRUD management table for adding, editing, and deleting system users.',
  '7_Admin_Alerts': 'Global monitoring center displaying system warnings and notification logs.',
  '8_Farmer_Dashboard': 'The primary command center for farmers to view crop statuses and urgent agricultural alerts.',
  '9_Farmer_Sowing': 'Form for logging rigorous data on planting activities, seed usage rates, and expected harvest dates.',
  '10_Farmer_Harvest': 'Interface for tracing harvested crops, quantities, and their destination storage locations.',
  '11_Farmer_Predictions': 'AI-driven crop forecasting tool recommending optimized planting schedules based on historical yield data.',
  '12_Warehouse_Dashboard': 'Overview of live sensor data, warehouse storage capacities, and incoming inventory shipments.',
  '13_Warehouse_Inventory': 'The primary stock management table displaying explicit data on perishable products, shelf lives, and packaging requirements.',
  '14_Warehouse_Analytics': 'Analytics interface visualizing inventory turnover rates and storage efficiency metrics.',
  '15_Processing_Dashboard': 'The central plant interface for supervising active processing lines and equipment statuses.',
  '16_Processing_Batches': 'Detailed logs for tracking raw material to finished product conversion rates and durations.',
  '17_Processing_QC': 'Forms and records for rigorous quality control inspections on processed inventory.',
  '18_Supplier_Dashboard': 'Summary interface for monitoring pending purchase orders and general fulfillment progress.',
  '19_Supplier_Orders': 'Detailed view of comprehensive logistics and procurement purchase orders alongside their delivery status.',
  '20_Supplier_Stock': 'Procurement scheduling table showcasing real-time automated reorder levels for seeds, fertilizers, and pesticides.'
};

async function generatePDF() {
  const screenshotsDir = path.join(process.cwd(), 'screenshots');
  
  // Read all screenshot files
  const files = fs.readdirSync(screenshotsDir)
    .filter(f => f.endsWith('.png'))
    .sort((a, b) => parseInt(a.split('_')[0]) - parseInt(b.split('_')[0]));

  let htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #333; }
          .page-container { margin-bottom: 50px; page-break-after: always; text-align: center; }
          h2 { color: #2E7D32; font-size: 24px; border-bottom: 2px solid #2E7D32; padding-bottom: 10px; display: inline-block; }
          .image-wrapper { margin: 20px 0; border: 1px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
          img { max-width: 100%; height: auto; display: block; }
          .description { font-size: 16px; line-height: 1.6; color: #555; max-width: 800px; margin: 0 auto; padding: 15px; background: #f9f9f9; border-radius: 8px; }
          .cover { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 90vh; text-align: center; }
          .cover h1 { font-size: 48px; color: #2E7D32; margin-bottom: 10px; }
          .cover p { font-size: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="cover">
          <h1>AgriChain Platform Guide</h1>
          <p>Comprehensive Application Interface Documentation</p>
        </div>
  `;

  for (const file of files) {
    const key = file.replace('.png', '');
    const title = key.split('_').slice(1).join(' ').replace(/([A-Z])/g, ' $1').trim();
    const description = descriptions[key] || 'Detailed interface view for ' + title;
    
    // Read image as base64 so Puppeteer can embed it locally without a web server
    const imgPath = path.join(screenshotsDir, file);
    const imgBase64 = fs.readFileSync(imgPath).toString('base64');
    const imgSrc = `data:image/png;base64,${imgBase64}`;

    htmlContent += `
      <div class="page-container">
        <h2>${title}</h2>
        <div class="description">${description}</div>
        <div class="image-wrapper">
          <img src="${imgSrc}" />
        </div>
      </div>
    `;
  }

  htmlContent += `
      </body>
    </html>
  `;

  console.log('Launching Puppeteer to generate PDF...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Set explicit content instead of navigating
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
  const pdfPath = path.join(process.cwd(), 'AgriChain_Application_Guide.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
  });

  await browser.close();
  console.log(`Successfully generated PDF at: ${pdfPath}`);
}

generatePDF().catch(console.error);
