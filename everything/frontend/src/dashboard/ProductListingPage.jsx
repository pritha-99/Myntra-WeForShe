import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { createProduct, fetchProducts, generateAiImage, generateProductTitle } from '../api/client';
import { getSellerId } from '../state/sessionStore';
import { speak } from '../api/ttsProvider';

const CATEGORIES = [
  'Kurtas & Suits', 'Sarees', 'Lehengas', 'Western Wear',
  'Ethnic Wear', 'Footwear', 'Jewellery & Accessories',
  'Sports & Activewear', 'Kids Wear', 'Home & Living',
];

function InputLabel({ children, required }) {
  return (
    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--myntra-muted)', display: 'block', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      {children} {required && <span style={{ color: 'var(--myntra-pink)' }}>*</span>}
    </label>
  );
}

function Field({ label, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <InputLabel required={required}>{label}</InputLabel>
      {children}
    </div>
  );
}

export default function ProductListingPage() {
  const { lang, t } = useOutletContext();
  const sellerId = localStorage.getItem('sellerId') || getSellerId();

  // Form state
  const [name, setName]         = useState('');
  const [price, setPrice]       = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  
  // Garment catalog state
  const [frontImage, setFrontImage] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);
  const [priceTagConfirmed, setPriceTagConfirmed] = useState(false);

  // Per-image AI/upload mode: 'upload' | 'ai'
  const [frontImageMode, setFrontImageMode] = useState('upload');
  const [backImageMode, setBackImageMode] = useState('upload');
  // AI generation loading state per slot
  const [generatingFront, setGeneratingFront] = useState(false);
  const [generatingBack, setGeneratingBack] = useState(false);
  
  const [errors, setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]       = useState(null); // { type: 'success'|'error', msg }
  const [catalogModal, setCatalogModal] = useState(null); // For showing catalog results

  // Title generation modal state
  const [titleModalOpen, setTitleModalOpen]       = useState(false);
  const [generatingTitle, setGeneratingTitle]     = useState(false);
  const [suggestedTitle, setSuggestedTitle]       = useState('');
  const [titleGenError, setTitleGenError]         = useState(null);
  const [pendingFormData, setPendingFormData]     = useState(null); // deferred FormData

  // Products list
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const frontInputRef = useRef();
  const backInputRef = useRef();
  const additionalInputRef = useRef();

  // Load existing products
  useEffect(() => {
    if (!sellerId) { setLoadingProducts(false); return; }
    fetchProducts(sellerId)
      .then((res) => setProducts(res.products || []))
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, [sellerId]);

  // ── Image slot mode toggle styles ──────────────────────────────────────────
  function modeToggle(slot, mode, setMode) {
    const tabs = [
      { id: 'upload', label: '📁 Upload' },
      { id: 'ai',     label: '✨ Generate with AI' },
    ];
    return (
      <div style={{ display: 'flex', gap: 0, marginBottom: 10, borderRadius: 10, overflow: 'hidden', border: '1.5px solid var(--myntra-border)', width: 'fit-content' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            id={`${slot}-mode-${tab.id}`}
            onClick={() => setMode(tab.id)}
            style={{
              padding: '7px 16px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              outline: 'none',
              transition: 'background 0.15s, color 0.15s',
              background: mode === tab.id
                ? 'linear-gradient(90deg, var(--myntra-pink), #ff6b9d)'
                : 'var(--myntra-card)',
              color: mode === tab.id ? '#fff' : 'var(--myntra-muted)',
              letterSpacing: '0.02em',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  // Image selection handlers
  function handleFrontImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFrontImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setFrontPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleBackImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setBackPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleAdditionalImagesSelect(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const combined = [...additionalImages, ...files].slice(0, 5); // max 5
    setAdditionalImages(combined);

    const readers = combined.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(setAdditionalPreviews);
  }

  function removeAdditionalImage(idx) {
    const newImgs = additionalImages.filter((_, i) => i !== idx);
    const newPrvs = additionalPreviews.filter((_, i) => i !== idx);
    setAdditionalImages(newImgs);
    setAdditionalPreviews(newPrvs);
  }

  // Validation
  function validate() {
    const errs = {};
    if (!name.trim()) errs.name = 'Product name is required.';
    if (!price || isNaN(Number(price)) || Number(price) < 0) errs.price = 'Enter a valid price.';
    if (!category) errs.category = 'Please select a category.';
    if (!quantity || isNaN(Number(quantity)) || !Number.isInteger(Number(quantity)) || Number(quantity) < 0)
      errs.quantity = 'Enter a valid whole-number quantity.';
    if (!frontImage) errs.frontImage = 'Front flat-lay photo is required.';
    if (!backImage) errs.backImage = 'Back flat-lay photo is required.';
    if (additionalImages.length > 5) errs.additionalImages = 'Maximum 5 additional images allowed.';
    return errs;
  }

  // Show toast helper
  function showToast(type, msg) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    if (!sellerId) {
      showToast('error', 'No seller session found. Please complete onboarding first.');
      return;
    }

    // Build the FormData now (deferred — actual submission happens after title confirm)
    const formData = new FormData();
    formData.append('sellerId', sellerId);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('quantity', quantity);
    formData.append('frontImage', frontImage);
    formData.append('backImage', backImage);
    formData.append('priceTagConfirmed', priceTagConfirmed);
    formData.append('frontImageMode', frontImageMode);
    formData.append('backImageMode', backImageMode);
    additionalImages.forEach((img) => formData.append('additionalImages', img));

    // Store FormData for deferred submission and open the title modal
    setPendingFormData(formData);
    setSuggestedTitle('');
    setTitleGenError(null);
    setTitleModalOpen(true);
    setGeneratingTitle(true);

    // Call Gemini to generate the SEO title
    try {
      const { title } = await generateProductTitle(frontImage, name.trim());
      setSuggestedTitle(title);
    } catch (err) {
      setTitleGenError(err.message || 'Could not generate title. You can enter one manually.');
      setSuggestedTitle(name.trim()); // fallback to user's original name
    } finally {
      setGeneratingTitle(false);
    }
  }

  // Called when the user confirms the (possibly edited) title in the modal
  async function handleConfirmTitle() {
    const finalTitle = suggestedTitle.trim() || name.trim();
    if (!finalTitle) {
      setTitleGenError('Please enter a product title before confirming.');
      return;
    }

    // Append the confirmed title to the deferred FormData
    pendingFormData.append('name', finalTitle);

    setTitleModalOpen(false);
    setSubmitting(true);

    try {
      const res = await createProduct(pendingFormData);
      setProducts((prev) => [res.product, ...prev]);

      // Show catalog modal if garmentCatalog exists
      if (res.product.garmentCatalog) {
        setCatalogModal(res.product.garmentCatalog);
      }

      // Reset form
      setName(''); setPrice(''); setCategory(''); setQuantity('');
      setFrontImage(null); setFrontPreview(null);
      setBackImage(null); setBackPreview(null);
      setAdditionalImages([]); setAdditionalPreviews([]);
      setPriceTagConfirmed(false);
      setFrontImageMode('upload');
      setBackImageMode('upload');
      setGeneratingFront(false);
      setGeneratingBack(false);
      setPendingFormData(null);
      setSuggestedTitle('');

      const msg = t('listingSuccess');
      showToast('success', msg);
      speak(msg, lang);
    } catch (err) {
      const msg = err.response?.data?.error || t('listingError');
      showToast('error', msg);
      speak(msg, lang);
    } finally {
      setSubmitting(false);
    }
  }

  // Called when user cancels the title modal — no product is created
  function handleCancelTitleModal() {
    setTitleModalOpen(false);
    setPendingFormData(null);
    setSuggestedTitle('');
    setTitleGenError(null);
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--myntra-card)',
    border: '1.5px solid var(--myntra-border)',
    borderRadius: 10,
    padding: '11px 14px',
    fontSize: '0.93rem',
    color: 'var(--myntra-text)',
    outline: 'none',
    transition: 'border-color 0.15s',
  };

  const errStyle = { fontSize: '0.78rem', color: 'var(--myntra-error)', marginTop: 5, display: 'block' };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* ── AI Title Confirmation Modal ── */}
      {titleModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{
            background: 'var(--myntra-surface)',
            border: '1px solid var(--myntra-border)',
            borderRadius: 20,
            padding: '36px 32px',
            maxWidth: 500,
            width: '100%',
            boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.5rem' }}>✨</span>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--myntra-text)', letterSpacing: '0.01em' }}>
                  AI-Suggested SEO Title
                </h2>
                <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: 'var(--myntra-muted)' }}>
                  Generated by Gemini Vision · Review and edit before listing
                </p>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--myntra-border)', margin: 0 }} />

            {/* Spinner while generating */}
            {generatingTitle ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '20px 0' }}>
                <div style={{
                  width: 38, height: 38,
                  border: '3px solid var(--myntra-border)',
                  borderTopColor: 'var(--myntra-pink)',
                  borderRadius: '50%',
                  animation: 'spin 0.75s linear infinite',
                }} />
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--myntra-muted)', fontWeight: 600 }}>
                  Analysing image with Gemini…
                </p>
              </div>
            ) : (
              <>
                {/* Error banner (non-blocking) */}
                {titleGenError && (
                  <div style={{
                    background: 'rgba(255,82,82,0.1)',
                    border: '1px solid rgba(255,82,82,0.3)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    fontSize: '0.78rem',
                    color: '#ff5252',
                    fontWeight: 600,
                  }}>
                    ⚠️ {titleGenError}
                  </div>
                )}

                {/* Editable title input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--myntra-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Product Title
                  </label>
                  <input
                    id="ai-suggested-title-input"
                    type="text"
                    value={suggestedTitle}
                    onChange={(e) => setSuggestedTitle(e.target.value)}
                    placeholder="Enter or edit the product title…"
                    style={{
                      width: '100%',
                      background: 'var(--myntra-card)',
                      border: '2px solid var(--myntra-pink)',
                      borderRadius: 10,
                      padding: '13px 14px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--myntra-text)',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s',
                    }}
                    autoFocus
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--myntra-muted)' }}>
                    💡 Feel free to edit this title before confirming. It will be used as your product listing name.
                  </span>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  <button
                    id="confirm-title-btn"
                    type="button"
                    onClick={handleConfirmTitle}
                    disabled={submitting}
                    style={{
                      flex: 1,
                      padding: '13px 0',
                      background: submitting
                        ? 'var(--myntra-border)'
                        : 'linear-gradient(90deg, var(--myntra-pink), #ff6b9d)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      letterSpacing: '0.03em',
                      textTransform: 'uppercase',
                      transition: 'opacity 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    {submitting ? (
                      <>
                        <div style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
                        Listing…
                      </>
                    ) : '✓ Confirm & List Product'}
                  </button>
                  <button
                    id="cancel-title-btn"
                    type="button"
                    onClick={handleCancelTitleModal}
                    disabled={submitting}
                    style={{
                      flex: 1,
                      padding: '13px 0',
                      background: 'transparent',
                      color: 'var(--myntra-muted)',
                      border: '1.5px solid var(--myntra-border)',
                      borderRadius: 10,
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      letterSpacing: '0.03em',
                      textTransform: 'uppercase',
                      transition: 'border-color 0.15s, color 0.15s',
                    }}
                    onMouseEnter={(e) => { e.target.style.borderColor = 'var(--myntra-text)'; e.target.style.color = 'var(--myntra-text)'; }}
                    onMouseLeave={(e) => { e.target.style.borderColor = 'var(--myntra-border)'; e.target.style.color = 'var(--myntra-muted)'; }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed', top: 80, right: 24, zIndex: 9999,
            background: toast.type === 'success' ? 'rgba(0,196,140,0.95)' : 'rgba(255,82,82,0.95)',
            color: '#fff', padding: '14px 24px', borderRadius: 12,
            fontWeight: 700, fontSize: '0.9rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            animation: 'slideUp 0.3s ease',
          }}
        >
          {toast.type === 'success' ? '✓ ' : '✕ '}{toast.msg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start' }}>

        {/* ── Left: Add product form ── */}
        <div style={{ background: 'var(--myntra-surface)', border: '1px solid var(--myntra-border)', borderRadius: 20, padding: '32px 28px' }}>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--myntra-text)', marginBottom: 24 }}>
            📦 {t('addProduct')}
          </h1>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Product Name */}
            <Field label={t('productName')} required>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Handloom Cotton Kurta"
                style={{ ...inputStyle, borderColor: errors.name ? 'var(--myntra-error)' : 'var(--myntra-border)' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--myntra-pink)'}
                onBlur={(e) => e.target.style.borderColor = errors.name ? 'var(--myntra-error)' : 'var(--myntra-border)'}
              />
              {errors.name && <span style={errStyle}>{errors.name}</span>}
            </Field>

            {/* Price + Quantity side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label={t('productPrice')} required>
                <input
                  type="number"
                  value={price}
                  min={0}
                  step="0.01"
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  style={{ ...inputStyle, borderColor: errors.price ? 'var(--myntra-error)' : 'var(--myntra-border)' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--myntra-pink)'}
                  onBlur={(e) => e.target.style.borderColor = errors.price ? 'var(--myntra-error)' : 'var(--myntra-border)'}
                />
                {errors.price && <span style={errStyle}>{errors.price}</span>}
              </Field>

              <Field label={t('productQuantity')} required>
                <input
                  type="number"
                  value={quantity}
                  min={0}
                  step={1}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  style={{ ...inputStyle, borderColor: errors.quantity ? 'var(--myntra-error)' : 'var(--myntra-border)' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--myntra-pink)'}
                  onBlur={(e) => e.target.style.borderColor = errors.quantity ? 'var(--myntra-error)' : 'var(--myntra-border)'}
                />
                {errors.quantity && <span style={errStyle}>{errors.quantity}</span>}
              </Field>
            </div>

            {/* Category */}
            <Field label={t('productCategory')} required>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`tile-btn${category === cat ? ' selected' : ''}`}
                    style={{ minHeight: 40, padding: '8px 10px', fontSize: '0.78rem', fontWeight: category === cat ? 700 : 500 }}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {errors.category && <span style={errStyle}>{errors.category}</span>}
            </Field>

            {/* Front Image - Required */}
            <Field label="Front Flat-Lay Photo" required>
              {modeToggle('front', frontImageMode, setFrontImageMode)}

              {/* Upload mode */}
              {frontImageMode === 'upload' && (
                <div
                  onClick={() => frontInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${frontImage ? 'var(--myntra-pink)' : errors.frontImage ? 'var(--myntra-error)' : 'var(--myntra-border)'}`,
                    borderRadius: 12,
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: frontImage ? 'rgba(255,63,108,0.04)' : 'var(--myntra-card)',
                    transition: 'all 0.15s',
                  }}
                >
                  {frontPreview ? (
                    <img src={frontPreview} alt="front" style={{ maxHeight: 120, borderRadius: 8 }} />
                  ) : (
                    <>
                      <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>📷</div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--myntra-muted)' }}>
                        Front garment photo (flat-lay)
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* AI generation mode */}
              {frontImageMode === 'ai' && (
                <div style={{
                  border: '2px dashed var(--myntra-pink)',
                  borderRadius: 12,
                  padding: '16px',
                  background: 'rgba(255,63,108,0.03)',
                }}
                >
                  <p style={{ fontSize: '0.78rem', color: 'var(--myntra-muted)', marginBottom: 10 }}>
                    Upload a flat-lay garment photo, then click <strong>Generate with AI</strong> to create an on-model preview image.
                  </p>
                  <div
                    onClick={() => frontInputRef.current?.click()}
                    style={{
                      border: `1.5px dashed ${frontImage ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`,
                      borderRadius: 10,
                      padding: '12px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: frontImage ? 'rgba(255,63,108,0.06)' : 'var(--myntra-card)',
                      marginBottom: 12,
                    }}
                  >
                    {frontPreview ? (
                      <img src={frontPreview} alt="front garment" style={{ maxHeight: 120, borderRadius: 8 }} />
                    ) : (
                      <>
                        <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>🧥</div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--myntra-muted)' }}>Upload garment flat-lay photo</p>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!frontImage || generatingFront}
                    onClick={async () => {
                      if (!frontImage) return;
                      setGeneratingFront(true);
                      try {
                        const res = await generateAiImage(frontImage, 'front');
                        setFrontPreview(res.imageUrl);
                        showToast('success', 'Front on-model image generated successfully!');
                      } catch (err) {
                        showToast('error', err.message || 'AI Generation failed');
                      } finally {
                        setGeneratingFront(false);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 0',
                      borderRadius: 8,
                      border: 'none',
                      background: frontImage && !generatingFront
                        ? 'linear-gradient(90deg, var(--myntra-pink), #ff6b9d)'
                        : 'var(--myntra-border)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: frontImage && !generatingFront ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    {generatingFront ? (
                      <>
                        <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        Generating on-model image with FLUX…
                      </>
                    ) : (
                      '✨ Generate Front On-Model Image'
                    )}
                  </button>
                </div>
              )}

              <input
                ref={frontInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFrontImageSelect}
              />
              {errors.frontImage && <span style={errStyle}>{errors.frontImage}</span>}
            </Field>

            {/* Back Image - Required */}
            <Field label="Back Flat-Lay Photo" required>
              {modeToggle('back', backImageMode, setBackImageMode)}

              {/* Upload mode */}
              {backImageMode === 'upload' && (
                <div
                  onClick={() => backInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${backImage ? 'var(--myntra-pink)' : errors.backImage ? 'var(--myntra-error)' : 'var(--myntra-border)'}`,
                    borderRadius: 12,
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: backImage ? 'rgba(255,63,108,0.04)' : 'var(--myntra-card)',
                    transition: 'all 0.15s',
                  }}
                >
                  {backPreview ? (
                    <img src={backPreview} alt="back" style={{ maxHeight: 120, borderRadius: 8 }} />
                  ) : (
                    <>
                      <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>📷</div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--myntra-muted)' }}>
                        Back garment photo (flat-lay)
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* AI generation mode */}
              {backImageMode === 'ai' && (
                <div style={{
                  border: '2px dashed var(--myntra-pink)',
                  borderRadius: 12,
                  padding: '16px',
                  background: 'rgba(255,63,108,0.03)',
                }}
                >
                  <p style={{ fontSize: '0.78rem', color: 'var(--myntra-muted)', marginBottom: 10 }}>
                    Upload a flat-lay garment photo, then click <strong>Generate with AI</strong> to create an on-model preview image.
                  </p>
                  <div
                    onClick={() => backInputRef.current?.click()}
                    style={{
                      border: `1.5px dashed ${backImage ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`,
                      borderRadius: 10,
                      padding: '12px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: backImage ? 'rgba(255,63,108,0.06)' : 'var(--myntra-card)',
                      marginBottom: 12,
                    }}
                  >
                    {backPreview ? (
                      <img src={backPreview} alt="back garment" style={{ maxHeight: 120, borderRadius: 8 }} />
                    ) : (
                      <>
                        <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>🧥</div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--myntra-muted)' }}>Upload garment flat-lay photo</p>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!backImage || generatingBack}
                    onClick={async () => {
                      if (!backImage) return;
                      setGeneratingBack(true);
                      try {
                        const res = await generateAiImage(backImage, 'back');
                        setBackPreview(res.imageUrl);
                        showToast('success', 'Back on-model image generated successfully!');
                      } catch (err) {
                        showToast('error', err.message || 'AI Generation failed');
                      } finally {
                        setGeneratingBack(false);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 0',
                      borderRadius: 8,
                      border: 'none',
                      background: backImage && !generatingBack
                        ? 'linear-gradient(90deg, var(--myntra-pink), #ff6b9d)'
                        : 'var(--myntra-border)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: backImage && !generatingBack ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    {generatingBack ? (
                      <>
                        <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        Generating on-model image with FLUX…
                      </>
                    ) : (
                      '✨ Generate Back On-Model Image'
                    )}
                  </button>
                </div>
              )}

              <input
                ref={backInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleBackImageSelect}
              />
              {errors.backImage && <span style={errStyle}>{errors.backImage}</span>}
            </Field>

            {/* Additional Images - Optional */}
            <Field label="Additional Reference Photos (Optional, max 5)">
              <div
                onClick={() => additionalInputRef.current?.click()}
                style={{
                  border: `2px dashed ${additionalImages.length ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`,
                  borderRadius: 12,
                  padding: '16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: additionalImages.length ? 'rgba(255,63,108,0.04)' : 'var(--myntra-card)',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>📷</div>
                <p style={{ fontSize: '0.78rem', color: 'var(--myntra-muted)' }}>
                  Fabric detail, embroidery, or other angles
                </p>
              </div>
              <input
                ref={additionalInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleAdditionalImagesSelect}
              />

              {/* Additional previews */}
              {additionalPreviews.length > 0 && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                  {additionalPreviews.map((src, i) => (
                    <div key={i} style={{ position: 'relative', width: 72, height: 72 }}>
                      <img
                        src={src}
                        alt={`additional-${i}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '1.5px solid var(--myntra-border)' }}
                      />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeAdditionalImage(i); }}
                        style={{
                          position: 'absolute', top: -6, right: -6,
                          width: 20, height: 20, borderRadius: '50%',
                          background: 'var(--myntra-error)', color: '#fff',
                          border: 'none', cursor: 'pointer', fontSize: '0.7rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {errors.additionalImages && <span style={errStyle}>{errors.additionalImages}</span>}
            </Field>

            {/* Price Tag Confirmation */}
            <Field label="">
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={priceTagConfirmed}
                  onChange={(e) => setPriceTagConfirmed(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <span>I confirm no price tags or stickers are visible on garments</span>
              </label>
            </Field>

            <button
              type="submit"
              className="tile-btn primary"
              style={{ padding: '14px 0', fontSize: '0.95rem', fontWeight: 700, marginTop: 4 }}
              disabled={submitting}
            >
              {submitting ? t('submittingListing') : t('submitListing')}
            </button>
          </form>
        </div>

        {/* ── Right: Product list ── */}
        <div style={{ background: 'var(--myntra-surface)', border: '1px solid var(--myntra-border)', borderRadius: 20, padding: '32px 28px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--myntra-text)', marginBottom: 20 }}>
            🗂️ {t('yourListings')}
            {products.length > 0 && (
              <span style={{ marginLeft: 10, background: 'rgba(255,63,108,0.12)', color: 'var(--myntra-pink)', borderRadius: 20, padding: '2px 12px', fontSize: '0.8rem', fontWeight: 700 }}>
                {products.length}
              </span>
            )}
          </h2>

          {loadingProducts ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--myntra-muted)', fontSize: '0.9rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 8 }} className="animate-spin">⟳</div>
              Loading...
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--myntra-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>{t('noListings')}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 580, overflowY: 'auto' }}>
              {products.map((p) => (
                <div
                  key={p._id}
                  style={{
                    background: 'var(--myntra-card)',
                    border: '1px solid var(--myntra-border)',
                    borderRadius: 14,
                    padding: '14px 16px',
                    display: 'flex',
                    gap: 14,
                    alignItems: 'center',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--myntra-pink)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--myntra-border)'}
                >
                  {/* Thumbnail or placeholder */}
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--myntra-border)', flexShrink: 0 }}
                    />
                  ) : null}
                  {(!p.images?.[0]) && (
                    <div style={{ width: 56, height: 56, borderRadius: 10, background: 'var(--myntra-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0, border: '1px solid var(--myntra-border)' }}>
                      📦
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--myntra-text)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </p>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--myntra-muted)' }}>
                      <span>🏷️ {p.category}</span>
                      <span>📦 Qty: {p.quantity}</span>
                    </div>
                  </div>

                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: 'var(--myntra-pink)', fontSize: '1.05rem' }}>
                      ₹{Number(p.price).toLocaleString('en-IN')}
                    </div>
                    {p.images?.length > 1 && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--myntra-muted)', marginTop: 2 }}>
                        +{p.images.length - 1} image{p.images.length > 2 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Catalog Review Modal */}
      {catalogModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
          onClick={() => setCatalogModal(null)}
        >
          <div
            style={{
              background: 'var(--myntra-surface)',
              borderRadius: 20,
              maxWidth: 900,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '32px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 24, color: 'var(--myntra-text)' }}>
              ✨ Generated Catalog Images
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
              {/* Front View */}
              {catalogModal.front && (
                <div style={{ background: 'var(--myntra-card)', borderRadius: 12, padding: 16, border: '1px solid var(--myntra-border)' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 10, color: 'var(--myntra-text)' }}>
                    Front View
                    {catalogModal.front.generationStatus === 'success' && <span style={{ marginLeft: 8, color: 'green' }}>✓</span>}
                    {catalogModal.front.generationStatus === 'failed' && <span style={{ marginLeft: 8, color: 'var(--myntra-error)' }}>✕</span>}
                  </h3>
                  <img
                    src={catalogModal.front.onModel || catalogModal.front.original}
                    alt="front"
                    style={{ width: '100%', borderRadius: 8, marginBottom: 12 }}
                  />
                  {catalogModal.front.complianceReport && (
                    <ComplianceChecklist report={catalogModal.front.complianceReport} />
                  )}
                </div>
              )}

              {/* Back View */}
              {catalogModal.back && (
                <div style={{ background: 'var(--myntra-card)', borderRadius: 12, padding: 16, border: '1px solid var(--myntra-border)' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 10, color: 'var(--myntra-text)' }}>
                    Back View
                    {catalogModal.back.generationStatus === 'success' && <span style={{ marginLeft: 8, color: 'green' }}>✓</span>}
                    {catalogModal.back.generationStatus === 'failed' && <span style={{ marginLeft: 8, color: 'var(--myntra-error)' }}>✕</span>}
                  </h3>
                  <img
                    src={catalogModal.back.onModel || catalogModal.back.original}
                    alt="back"
                    style={{ width: '100%', borderRadius: 8, marginBottom: 12 }}
                  />
                  {catalogModal.back.complianceReport && (
                    <ComplianceChecklist report={catalogModal.back.complianceReport} />
                  )}
                </div>
              )}

              {/* Side View */}
              {catalogModal.side && catalogModal.side.onModel && (
                <div style={{ background: 'var(--myntra-card)', borderRadius: 12, padding: 16, border: '1px solid var(--myntra-border)' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 10, color: 'var(--myntra-text)' }}>
                    Side View
                    {catalogModal.side.generationStatus === 'success' && <span style={{ marginLeft: 8, color: 'green' }}>✓</span>}
                    {catalogModal.side.generationStatus === 'failed' && <span style={{ marginLeft: 8, color: 'var(--myntra-error)' }}>✕</span>}
                  </h3>
                  <img
                    src={catalogModal.side.onModel}
                    alt="side"
                    style={{ width: '100%', borderRadius: 8, marginBottom: 12 }}
                  />
                  {catalogModal.side.complianceReport && (
                    <ComplianceChecklist report={catalogModal.side.complianceReport} />
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setCatalogModal(null)}
              className="tile-btn primary"
              style={{ marginTop: 24, width: '100%', padding: '12px', fontSize: '0.9rem', fontWeight: 700 }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ComplianceChecklist({ report }) {
  const getStatusIcon = (status) => {
    if (status === 'pass') return '✓';
    if (status === 'warning') return '⚠';
    if (status === 'fail') return '✕';
    return '?';
  };

  const getStatusColor = (status) => {
    if (status === 'pass') return 'green';
    if (status === 'warning') return 'orange';
    if (status === 'fail') return 'var(--myntra-error)';
    return 'var(--myntra-muted)';
  };

  return (
    <div style={{ fontSize: '0.75rem' }}>
      {Object.entries(report).map(([key, value]) => (
        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: getStatusColor(value) }}>
          <span style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
          <span style={{ fontWeight: 700 }}>{getStatusIcon(value)}</span>
        </div>
      ))}
    </div>
  );
}
