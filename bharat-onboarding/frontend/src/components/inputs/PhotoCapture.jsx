import { useState, useRef } from 'react';

/**
 * PhotoCapture — camera capture or file pick for signature/documents.
 * Used for: signature, cancelled cheque/passbook photo.
 * Props: entry, value, onChange, onSubmit, language, t
 */
export default function PhotoCapture({ entry, value, onChange, onSubmit, t }) {
  const [preview, setPreview] = useState(value || null);
  const inputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      onChange(ev.target.result);
    };
    reader.readAsDataURL(file);
  }

  function handleRetake() {
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="flex flex-col gap-5 w-full items-center animate-slideUp">
      {preview ? (
        <div style={{ width: '100%', maxWidth: 320 }}>
          <img
            src={preview}
            alt="Captured"
            style={{ width: '100%', borderRadius: 12, border: '2px solid var(--myntra-pink)' }}
          />
        </div>
      ) : (
        <button
          className="tile-btn"
          style={{ height: 140, fontSize: '3rem', flexDirection: 'column', gap: 8, border: '2px dashed var(--myntra-border)' }}
          onClick={() => inputRef.current && inputRef.current.click()}
        >
          📷
          <span style={{ fontSize: '0.9rem', color: 'var(--myntra-subtext)' }}>{t('photoCapture')}</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {preview && (
        <button className="tile-btn" onClick={handleRetake}>
          {t('retakePhoto')}
        </button>
      )}

      <button
        className="tile-btn primary w-full"
        onClick={onSubmit}
        disabled={!preview}
      >
        {t('next')}
      </button>
    </div>
  );
}
