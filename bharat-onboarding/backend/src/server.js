require('dotenv').config();
const express = require('express');
const cors = require('cors');

const validateRouter = require('./routes/validate');
const explainRouter  = require('./routes/explain');
const lookupRouter   = require('./routes/lookup');
const chatRouter     = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/validate', validateRouter);
app.use('/api/explain',  explainRouter);
app.use('/api/lookup',   lookupRouter);
app.use('/api/chat',     chatRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'bharat-onboarding-backend' });
});

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

app.listen(PORT, () => {
  console.log(`✅  Bharat Onboarding backend running on http://localhost:${PORT}`);
  console.log(`   Routes: POST /api/validate | POST /api/explain | POST /api/chat | GET /api/lookup/...`);
});

module.exports = app;
