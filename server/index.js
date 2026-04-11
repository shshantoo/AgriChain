import express from 'express';
import cors from 'cors';
import farmerRoutes from './routes/farmer.js';
import warehouseRoutes from './routes/warehouse.js';
import processingRoutes from './routes/processing.js';
import supplierRoutes from './routes/supplier.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/product.js';
import qualityRoutes from './routes/quality.js';
import deliveryRoutes from './routes/delivery.js';
import marketRoutes from './routes/market.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/processing', processingRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/product', productRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/market', marketRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '2.0' }));

const PORT = 3001;
app.listen(PORT, () => console.log(`AgriChain backend v2.0 running on port ${PORT}`));
