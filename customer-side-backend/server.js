require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const customerRouter = require('./routes/customer');

const app = express();
const PORT = process.env.PORT || 4001;
const MONGODB_URI = process.env.MONGODB_URI;

// ── Connect to MongoDB ──────────────────────────────────────────────────────
mongoose.connect(MONGODB_URI)
  .then(() => console.log('🍃  MongoDB connected (customer-side-backend)'))
  .catch((err) => {
    console.error('❌  MongoDB connection failed:', err.message);
  });

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Serve product images uploaded by the main backend ──────────────────────
// Images stored in everything/backend/uploads/ are served as /uploads/* here
// so customers can see product photos without cross-origin issues.
const uploadsPath = path.join(__dirname, '../everything/backend/uploads');
app.use('/uploads', express.static(uploadsPath));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/customer', customerRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'customer-side-backend',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

app.listen(PORT, () => {
  console.log(`✅  Customer-side backend running on http://localhost:${PORT}`);
  console.log(`   Routes:`);
  console.log(`     GET /api/health`);
  console.log(`     GET /api/customer/sellers-grouped`);
  console.log(`     GET /api/customer/sellers/:sellerId`);
  console.log(`     GET /api/customer/sellers/:sellerId/products`);
});

module.exports = app;
