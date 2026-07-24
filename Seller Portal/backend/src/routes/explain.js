const express = require('express');
const router = express.Router();
const docs = require('../docs/registry');

/**
 * POST /api/explain
 * Body: { explainDocKey: string, language: string, question?: string }
 * Response: { answer: string, grounded: boolean }
 *
 * Performs a flat lookup by key — no distinction between field docs and general docs.
 * grounded: false triggers the "let's get you a person" UI path on the frontend.
 */
router.post('/', (req, res) => {
  const { explainDocKey, language, question } = req.body;

  if (!explainDocKey || !language) {
    return res.status(400).json({ answer: 'Missing explainDocKey or language.', grounded: false });
  }

  const doc = docs[explainDocKey];
  if (!doc) {
    return res.json({ answer: 'Sorry, I could not find an explanation for this. Please contact support.', grounded: false });
  }

  const supportedLanguages = ['en', 'ta', 'hi'];
  const lang = supportedLanguages.includes(language) ? language : 'en';
  const answer = doc[lang] || doc['en'];

  if (!answer) {
    return res.json({ answer: 'No explanation available in your language. Please contact support.', grounded: false });
  }

  return res.json({ answer, grounded: true });
});

module.exports = router;
