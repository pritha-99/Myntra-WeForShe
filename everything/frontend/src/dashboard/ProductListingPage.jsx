import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { createProduct, fetchProducts } from '../api/client';
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
  const sellerId = getSellerId();

  // Form state
  const [name, setName]         = useState('');
  const [price, setPrice]       = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [images, setImages]     = useState([]); // File objects
  const [previews, setPreviews] = useState([]); // Data URLs
  const [errors, setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]       = useState(null); // { type: 'success'|'error', msg }

  // Products list
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const fileInputRef = useRef();

  // Load existing products
  useEffect(() => {
    if (!sellerId) { setLoadingProducts(false); return; }
    fetchProducts(sellerId)
      .then((res) => setProducts(res.products || []))
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, [sellerId]);

  // Image selection
  function handleImageSelect(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const combined = [...images, ...files].slice(0, 10); // max 10
    setImages(combined);

    // Build preview URLs
    const readers = combined.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(setPreviews);
  }

  function removeImage(idx) {
    const newImgs = images.filter((_, i) => i !== idx);
    const newPrvs = previews.filter((_, i) => i !== idx);
    setImages(newImgs);
    setPreviews(newPrvs);
  }

  // Validation
  function validate() {
    const errs = {};
    if (!name.trim()) errs.name = 'Product name is required.';
    if (!price || isNaN(Number(price)) || Number(price) < 0) errs.price = 'Enter a valid price.';
    if (!category) errs.category = 'Please select a category.';
    if (!quantity || isNaN(Number(quantity)) || !Number.isInteger(Number(quantity)) || Number(quantity) < 0)
      errs.quantity = 'Enter a valid whole-number quantity.';
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

    setSubmitting(true);
    const formData = new FormData();
    formData.append('sellerId', sellerId);
    formData.append('name', name.trim());
    formData.append('price', price);
    formData.append('category', category);
    formData.append('quantity', quantity);
    images.forEach((img) => formData.append('images', img));

    try {
      const res = await createProduct(formData);
      setProducts((prev) => [res.product, ...prev]);
      // Reset form
      setName(''); setPrice(''); setCategory(''); setQuantity('');
      setImages([]); setPreviews([]);
      const msg = t('listingSuccess');
      showToast('success', msg);
      speak(msg, lang);
    } catch (err) {
      const msg = t('listingError');
      showToast('error', msg);
      speak(msg, lang);
    } finally {
      setSubmitting(false);
    }
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

            {/* Images */}
            <Field label={t('productImages')}>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${images.length ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`,
                  borderRadius: 12,
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: images.length ? 'rgba(255,63,108,0.04)' : 'var(--myntra-card)',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>📷</div>
                <p style={{ fontSize: '0.82rem', color: 'var(--myntra-muted)' }}>
                  Click to upload images (max 10, 10MB each)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleImageSelect}
              />

              {/* Image previews */}
              {previews.length > 0 && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                  {previews.map((src, i) => (
                    <div key={i} style={{ position: 'relative', width: 72, height: 72 }}>
                      <img
                        src={src}
                        alt={`preview-${i}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '1.5px solid var(--myntra-border)' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
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
                      style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--myntra-border)', flexShrink: 0 }}
                    />
                  ) : (
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
    </div>
  );
}
