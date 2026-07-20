import { useState, useRef } from 'react';

/**
 * PhotoCapture — camera capture or file pick for signature/documents.
 * Includes:
 *   1. File size check (max 10 MB)
 *   2. Simulated LLM content verification for signature / trademark_certificate / bank_document
 *
 * entry.inputConfig.verify can be: 'signature' | 'trademark_certificate' | 'bank_document'
 */

const MAX_SIZE_MB = 10;
const MAX_BYTES   = MAX_SIZE_MB * 1024 * 1024;

// Simulated LLM check — in production, replace with a real API call
async function simulateContentCheck(verifyType, dataUrl) {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 1200));

  // In the prototype we always pass, but reject zero-byte or tiny (< 2 KB) images
  // as they are likely corrupt or blank — a crude but useful heuristic
  const base64 = dataUrl.split(',')[1] || '';
  const approxBytes = Math.ceil((base64.length * 3) / 4);
  if (approxBytes < 2000) {
    const docName = (verifyType || 'document').replace('_', ' ');
    return { ok: false, reason: `The uploaded image does not appear to be a valid ${docName}. Please ensure it is clear and correctly photographed.` };
  }
  return { ok: true };
}

const VERIFY_LABELS = {
  signature: {
    en: 'Verifying this is a signature…',
    ta: 'இது கையொப்பம் என்று சரிபார்க்கிறது…',
    hi: 'यह सत्यापित किया जा रहा है कि यह हस्ताक्षर है…',
  },
  trademark_certificate: {
    en: 'Verifying this is a trademark certificate…',
    ta: 'இது Trademark சான்றிதழ் என்று சரிபார்க்கிறது…',
    hi: 'यह सत्यापित किया जा रहा है कि यह ट्रेडमार्क प्रमाणपत्र है…',
  },
  bank_document: {
    en: 'Verifying this is a bank document…',
    ta: 'இது வங்கி ஆவணம் என்று சரிபார்க்கிறது…',
    hi: 'यह सत्यापित किया जा रहा है कि यह बैंक दस्तावेज़ है…',
  },
};

export default function PhotoCapture({ entry, value, onChange, onSubmit, language, t }) {
  const [preview, setPreview]     = useState(value || null);
  const [checking, setChecking]   = useState(false);
  const [checkError, setCheckError] = useState(null);
  const [sizeError, setSizeError] = useState(null);
  const inputRef = useRef(null);

  const verifyType = entry?.inputConfig?.verify || null;
  const verifyLabel = verifyType ? (VERIFY_LABELS[verifyType]?.[language] || VERIFY_LABELS[verifyType]?.en) : null;

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setCheckError(null);
    setSizeError(null);

    // 1. Size check
    if (file.size > MAX_BYTES) {
      setSizeError(
        language === 'ta'
          ? `படம் ${MAX_SIZE_MB} MB-ஐ விட பெரியது. சிறிய படத்தை தேர்வு செய்யவும்.`
          : language === 'hi'
          ? `तस्वीर ${MAX_SIZE_MB} MB से बड़ी है। कृपया एक छोटी तस्वीर चुनें।`
          : `Image is larger than ${MAX_SIZE_MB} MB. Please choose a smaller photo.`
      );
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    // Read file
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = (ev) => resolve(ev.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // 2. LLM content check (only when verifyType is set)
    if (verifyType) {
      setChecking(true);
      setPreview(dataUrl); // show preview while checking
      const result = await simulateContentCheck(verifyType, dataUrl);
      setChecking(false);
      if (!result.ok) {
        setCheckError(result.reason);
        setPreview(null);
        onChange(null);
        if (inputRef.current) inputRef.current.value = '';
        return;
      }
    }

    setPreview(dataUrl);
    onChange(dataUrl);
  }

  function handleRetake() {
    setPreview(null);
    setCheckError(null);
    setSizeError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="flex flex-col gap-5 w-full items-center animate-slideUp">
      {/* Error messages */}
      {sizeError && (
        <div style={{
          background: 'rgba(255,82,82,0.12)', border: '1.5px solid var(--myntra-error)',
          borderRadius: 10, padding: '12px 16px', color: 'var(--myntra-error)', fontSize: '0.9rem', width: '100%',
        }}>
          ❌ {sizeError}
        </div>
      )}
      {checkError && (
        <div style={{
          background: 'rgba(255,82,82,0.12)', border: '1.5px solid var(--myntra-error)',
          borderRadius: 10, padding: '12px 16px', color: 'var(--myntra-error)', fontSize: '0.9rem', width: '100%',
        }}>
          ❌ {checkError}
        </div>
      )}

      {/* Checking indicator */}
      {checking && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,63,108,0.08)', border: '1.5px solid var(--myntra-border)',
          borderRadius: 10, padding: '12px 16px', width: '100%',
        }}>
          <div style={{
            width: 20, height: 20, border: '3px solid var(--myntra-pink)',
            borderTopColor: 'transparent', borderRadius: '50%',
          }} className="animate-spin" />
          <span style={{ fontSize: '0.88rem', color: 'var(--myntra-subtext)' }}>
            {verifyLabel || 'Verifying…'}
          </span>
        </div>
      )}

      {/* Preview or capture button */}
      {preview && !checking ? (
        <div style={{ width: '100%', maxWidth: 320 }}>
          <img
            src={preview}
            alt="Captured"
            style={{ width: '100%', borderRadius: 12, border: '2px solid var(--myntra-pink)' }}
          />
          {/* Verified badge */}
          <div style={{
            marginTop: 8, display: 'flex', alignItems: 'center', gap: 6,
            color: 'var(--myntra-success)', fontSize: '0.85rem', fontWeight: 600,
          }}>
            ✅ {language === 'ta' ? 'படம் சரிபார்க்கப்பட்டது' :
                language === 'hi' ? 'तस्वीर सत्यापित' :
                'Image verified'}
          </div>
        </div>
      ) : !checking ? (
        <button
          className="tile-btn"
          style={{ height: 140, fontSize: '3rem', flexDirection: 'column', gap: 8, border: '2px dashed var(--myntra-border)' }}
          onClick={() => inputRef.current && inputRef.current.click()}
        >
          📷
          <span style={{ fontSize: '0.9rem', color: 'var(--myntra-subtext)' }}>{t('photoCapture')}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--myntra-muted)' }}>
            {language === 'ta' ? `அதிகபட்சம் ${MAX_SIZE_MB} MB` :
             language === 'hi' ? `अधिकतम ${MAX_SIZE_MB} MB` :
             `Max ${MAX_SIZE_MB} MB`}
          </span>
        </button>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {preview && !checking && (
        <button className="tile-btn" onClick={handleRetake}>
          {t('retakePhoto')}
        </button>
      )}

      <button
        className="tile-btn primary w-full"
        onClick={onSubmit}
        disabled={!preview || checking}
      >
        {checking ? (verifyLabel || 'Verifying…') : t('next')}
      </button>
    </div>
  );
}
