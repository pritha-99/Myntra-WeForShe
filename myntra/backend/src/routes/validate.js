const express = require('express');
const router = express.Router();
const validators = require('../validators/registry');

/**
 * POST /api/validate
 * Body: { validationType: string, value: string, language?: string }
 * Response: { valid: boolean, message: string, data: object|null }
 * The language param makes validators return errors in the user's language.
 */
router.post('/', (req, res) => {
  const { validationType, value, language = 'en' } = req.body;

  if (!validationType || value === undefined || value === null) {
    return res.status(400).json({ valid: false, message: 'validationType and value are required.', data: null });
  }

  const validator = validators[validationType];
  if (!validator) {
    return res.json({ valid: true, message: 'No validation rule defined for this type.', data: null });
  }

  try {
    const result = validator.validate(value, language);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ valid: false, message: 'Validation error.', data: null });
  }
});

module.exports = router;
