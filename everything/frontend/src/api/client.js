/**
 * client.js — thin HTTP wrapper for all backend API calls.
 * All components import from here; the base URL is the Vite proxy target.
 */

const BASE = '/api';

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Network error' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Network error' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

/** POST /api/validate — pass language so errors come back in the user's language */
export function validateField(validationType, value, language = 'en') {
  return post('/validate', { validationType, value, language });
}

/** POST /api/explain */
export function explainField(explainDocKey, language, question = '') {
  return post('/explain', { explainDocKey, language, question });
}

/** GET /api/lookup/pincode/:pincode */
export function lookupPincode(pincode) {
  return get(`/lookup/pincode/${encodeURIComponent(pincode)}`);
}

/** GET /api/lookup/ifsc/:code */
export function lookupIfsc(code) {
  return get(`/lookup/ifsc/${encodeURIComponent(code)}`);
}

/**
 * POST /api/chat — Gemini 2.5 Flash multi-turn chat
 * messages: [{ role: 'user'|'model', content: string }]
 */
export function chatWithGemini({ explainDocKey, language, questionText, messages }) {
  return post('/chat', { explainDocKey, language, questionText, messages });
}

/**
 * POST /api/seller/submit — persist seller onboarding answers to MongoDB.
 * Returns { sellerId }
 */
export function submitSeller(answers, language) {
  return post('/seller/submit', { answers, language });
}

/**
 * GET /api/seller/:sellerId — fetch seller record for dashboard.
 * Returns { sellerId, answers, language, status, createdAt }
 */
export function fetchSeller(sellerId) {
  return get(`/seller/${encodeURIComponent(sellerId)}`);
}

/**
 * POST /api/products — create a product listing (multipart/form-data with images).
 * formData must include: sellerId, name, price, category, quantity, images[]
 * Returns { product }
 */
export async function createProduct(formData) {
  const res = await fetch(`${BASE}/products`, {
    method: 'POST',
    body: formData, // no Content-Type header — browser sets it with boundary
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Network error' }));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * GET /api/products/:sellerId — list all products for a seller.
 * Returns { products: [] }
 */
export function fetchProducts(sellerId) {
  return get(`/products/${encodeURIComponent(sellerId)}`);
}
