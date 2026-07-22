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
 *
 * Maps the flat manifest-keyed answers object (e.g. answers.brand_name,
 * answers.warehouse_pincode) into the explicit fields the Seller schema expects.
 *
 * Returns { sellerId }
 */
export function submitSeller(answers, language) {
  // Derive founderName from confirm_name step (stored as object or string)
  const confirmName = answers.confirm_name || {};
  const founderFirstName =
    typeof confirmName === 'object' ? confirmName.first_name : '';
  const founderLastName =
    typeof confirmName === 'object' ? confirmName.last_name : '';

  // Derive GST-looked-up fields from confirm_business_details step
  const confirmBiz = answers.confirm_business_details || {};
  const companyName =
    typeof confirmBiz === 'object' ? confirmBiz.company_name : '';
  const pan =
    typeof confirmBiz === 'object' ? confirmBiz.pan : '';
  const gstState =
    typeof confirmBiz === 'object' ? confirmBiz.state : '';
  const entityType =
    typeof answers.entity_type_confirm === 'object'
      ? answers.entity_type_confirm?.entity_type
      : answers.entity_type_confirm || '';

  // Build payload with explicit fields matching the Seller schema
  const payload = {
    language,

    // Part 1 — Registration
    phone:  answers.phone,
    email:  answers.email,
    gstin:  answers.gstin,
    password: answers.password || null,
    companyName,
    pan,
    gstState,
    founderFirstName,
    founderLastName,
    signaturePath: answers.signature || null,

    // Part 2A — Basic Information
    primaryContactIsOwner:     answers.primary_contact_is_owner,
    businessOwnerIsRegistrant: answers.business_owner_is_registrant,
    existingMyntraPartner:     answers.existing_myntra_partner,
    entityType,
    tdsOptional: answers.tds_optional,
    tanNumber:   answers.tan_number || null,

    // Part 2B — Business Details
    omsChoice:            answers.b2_oms_choice,
    operationalReadiness: answers.b3_operational_readiness || [],

    // Part 2C — Warehouse (nested object)
    warehouse: {
      pincode:  answers.warehouse_pincode,
      address:  answers.warehouse_address,
      hours:    answers.warehouse_hours,
      contact:  answers.warehouse_contact,
      capacity: answers.warehouse_capacity
        ? Number(answers.warehouse_capacity)
        : undefined,
    },

    // Part 2D — Bank Details (nested object)
    bank: {
      accountHolder:   answers.bank_account_holder,
      accountNumber:   answers.bank_account_number,
      ifsc:            answers.bank_ifsc,
      accountType:     answers.bank_account_type,
      chequePhotoPath: answers.bank_cheque_photo || null,
    },

    // Part 2E — Brand Details
    brandName:          answers.brand_name,
    natureOfBusiness:   answers.nature_of_business,
    trademarkProofPath: answers.trademark_proof || null,
    avgMrp:             answers.brand_mrp ? Number(answers.brand_mrp) : undefined,
    avgSellingPrice:    answers.brand_selling_price
      ? Number(answers.brand_selling_price)
      : undefined,
    brandUsp: answers.brand_usp,
    ecoTags:  answers.myntra_for_earth || [],

    // Part 2F — Category & Sizing
    categoryTypes: answers.category_type || [],

    // Part 2G — Online Presence
    sellsElsewhere: answers.sells_elsewhere || [],

    // Part 2H — APOB
    apobNeeded: answers.apob_needed,
  };

  return post('/seller/submit', payload);
}

/**
 * GET /api/seller/:sellerId — fetch seller record for dashboard.
 * Returns { sellerId, answers, language, status, createdAt }
 */
export function fetchSeller(sellerId) {
  return get(`/seller/${encodeURIComponent(sellerId)}`);
}

/**
 * POST /api/seller/login — validate credentials against MongoDB.
 * Returns { sellerId, brandName, companyName, status, email } on success.
 * Throws on 401 (invalid credentials) or 500 (server error).
 */
export async function loginSeller(email, password) {
  const res = await fetch(`${BASE}/seller/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({ error: 'Network error' }));
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
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
