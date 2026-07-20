const express = require('express');
const router = express.Router();

/**
 * Hardcoded sample lookup data — for the hackathon prototype only.
 * Real implementation would call India Post / RBI APIs.
 *
 * Documented sample values:
 *
 * PINCODE samples:
 *   560001 → Bengaluru, Karnataka, India
 *   400001 → Mumbai, Maharashtra, India
 *   110001 → New Delhi, Delhi, India
 *   600001 → Chennai, Tamil Nadu, India
 *   500001 → Hyderabad, Telangana, India
 *   302001 → Jaipur, Rajasthan, India
 *
 * IFSC samples:
 *   SBIN0001234 → State Bank of India, MG Road Bengaluru
 *   HDFC0000001 → HDFC Bank, Fort Mumbai
 *   ICIC0000001 → ICICI Bank, Bandra Mumbai
 *   KKBK0000001 → Kotak Mahindra Bank, Chennai Branch
 *   PUNB0001000 → Punjab National Bank, Connaught Place New Delhi
 */

const PINCODES = {
  '560001': { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
  '400001': { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
  '110001': { city: 'New Delhi', state: 'Delhi', country: 'India' },
  '600001': { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
  '500001': { city: 'Hyderabad', state: 'Telangana', country: 'India' },
  '302001': { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
};

const IFSC_CODES = {
  'SBIN0001234': { bankName: 'State Bank of India', branch: 'MG Road Bengaluru' },
  'HDFC0000001': { bankName: 'HDFC Bank', branch: 'Fort Mumbai' },
  'ICIC0000001': { bankName: 'ICICI Bank', branch: 'Bandra Mumbai' },
  'KKBK0000001': { bankName: 'Kotak Mahindra Bank', branch: 'Chennai Branch' },
  'PUNB0001000': { bankName: 'Punjab National Bank', branch: 'Connaught Place New Delhi' },
};

/**
 * GET /api/lookup/pincode/:pincode
 * Response: { city, state, country } or 404
 */
router.get('/pincode/:pincode', (req, res) => {
  const { pincode } = req.params;
  const result = PINCODES[pincode];
  if (!result) {
    return res.status(404).json({ error: `Pincode ${pincode} not found in sample data.` });
  }
  return res.json(result);
});

/**
 * GET /api/lookup/ifsc/:code
 * Response: { bankName, branch } or 404
 */
router.get('/ifsc/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const result = IFSC_CODES[code];
  if (!result) {
    return res.status(404).json({ error: `IFSC code ${code} not found in sample data.` });
  }
  return res.json(result);
});

module.exports = router;
