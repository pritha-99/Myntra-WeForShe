require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const validateRouter = require('./routes/validate');
const explainRouter  = require('./routes/explain');
const lookupRouter   = require('./routes/lookup');
const chatRouter     = require('./routes/chat');
const sellerRouter   = require('./routes/seller');
const productsRouter = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bharat_onboarding';

// ── Connect to MongoDB ──
mongoose.connect(MONGODB_URI)
  .then(() => console.log(`🍃  MongoDB connected: ${MONGODB_URI}`))
  .catch((err) => {
    console.error('❌  MongoDB connection failed:', err.message);
    console.warn('   Server will still start but /api/seller and /api/products routes will not work.');
  });

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ── Serve uploaded product images as static files ──
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Existing routes (unchanged) ──
app.use('/api/validate', validateRouter);
app.use('/api/explain',  explainRouter);
app.use('/api/lookup',   lookupRouter);
app.use('/api/chat',     chatRouter);

// ── New MongoDB-backed routes ──
app.use('/api/seller',   sellerRouter);
app.use('/api/products', productsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'bharat-onboarding-backend', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

app.listen(PORT, () => {
  console.log(`✅  Bharat Onboarding backend running on http://localhost:${PORT}`);
  console.log(`   Routes: POST /api/validate | POST /api/explain | POST /api/chat | GET /api/lookup/...`);
  console.log(`   New:    POST /api/seller/submit | GET /api/seller/:id | POST /api/products | GET /api/products/:id`);
});

module.exports = app;
