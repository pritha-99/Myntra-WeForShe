import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getSellerId, getState } from '../state/sessionStore';

export default function MyStoryPage() {
  const { t } = useOutletContext ? useOutletContext() : { t: (k) => k };

  const sessionData = getState();
  const storedSellerId = localStorage.getItem('sellerId') || getSellerId();
  const gstin = sessionData.answers?.gstin || '';
  const sellerId = storedSellerId || 'SLR-DEMO01';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  // Fetch existing story on mount
  useEffect(() => {
    fetch(`/api/seller/story/${sellerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.story) {
          setTitle(data.story.title || '');
          setDescription(data.story.description || '');
          setImages(data.story.images || []);
        }
      })
      .catch((err) => console.error('Failed to load story:', err));
  }, [sellerId]);

  // Handle file uploads (max 5 images total)
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (images.length + files.length > 5) {
      setStatusMsg({ type: 'error', text: 'You can upload a maximum of 5 images for your story.' });
      return;
    }

    setUploading(true);
    setStatusMsg(null);

    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    try {
      const res = await fetch('/api/seller/story/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload images');

      setImages((prev) => [...prev, ...data.urls].slice(0, 5));
      setStatusMsg({ type: 'success', text: 'Image(s) uploaded successfully!' });
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveStory = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setStatusMsg({ type: 'error', text: 'Please write a story description.' });
      return;
    }

    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/seller/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId,
          gstin: gstin || sellerId,
          title: title.trim() || 'Our Heritage & Craft Journey',
          description: description.trim(),
          images,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save story');

      setStatusMsg({ type: 'success', text: '✨ Story saved successfully to MongoDB! It will now feature on Made Across India.' });
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: 20, borderBottom: '1px solid var(--myntra-border, #eaeaec)', paddingBottom: 16 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 20, background: 'rgba(255, 63, 108, 0.1)', color: '#ff3f6c', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
          📖 Made Across India Feature
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--myntra-text, #282c3f)', margin: '4px 0 8px' }}>
          My Brand Story
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--myntra-muted, #7e818c)', lineHeight: 1.5 }}>
          Share your artisan origin, regional craft heritage, and weaving traditions. Your story images and description will be showcased to customers when they discover your brand.
        </p>
      </div>

      {/* Seller ID Info Box */}
      <div style={{
        padding: '12px 16px',
        borderRadius: 8,
        marginBottom: 20,
        background: sellerId === 'SLR-DEMO01' ? 'rgba(255, 63, 108, 0.08)' : 'rgba(3, 166, 133, 0.08)',
        border: `1px solid ${sellerId === 'SLR-DEMO01' ? '#ff3f6c' : '#03a685'}`,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: '0.85rem',
      }}>
        <span style={{ fontSize: 18 }}>{sellerId === 'SLR-DEMO01' ? '⚠️' : '🆔'}</span>
        <div>
          {sellerId === 'SLR-DEMO01' ? (
            <span style={{ color: '#d32f2f', fontWeight: 700 }}>
              You are not logged in — story will be saved under demo ID <code>SLR-DEMO01</code>. Please log in to save your real story.
            </span>
          ) : (
            <span style={{ color: '#282c3f' }}>
              Your Seller ID: <strong style={{ color: '#03a685', fontFamily: 'monospace', fontSize: '0.9rem' }}>{sellerId}</strong>
              <span style={{ color: '#7e818c', marginLeft: 8 }}>— Customers will see your story at <code>/storefront/{sellerId}</code></span>
            </span>
          )}
        </div>
      </div>

      {/* Alert Status Banner */}
      {statusMsg && (
        <div style={{
          padding: '14px 18px',
          borderRadius: 8,
          marginBottom: 24,
          fontSize: '0.875rem',
          fontWeight: 600,
          background: statusMsg.type === 'error' ? 'rgba(255, 63, 108, 0.1)' : 'rgba(3, 166, 133, 0.1)',
          border: `1px solid ${statusMsg.type === 'error' ? '#ff3f6c' : '#03a685'}`,
          color: statusMsg.type === 'error' ? '#d32f2f' : '#03a685',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: 'inherit' }}>✕</button>
        </div>
      )}

      {/* Main Story Form */}
      <form onSubmit={handleSaveStory} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Story Title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--myntra-text, #282c3f)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Story Title / Headline
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Traditional Banarasi Silk Handloom Weavers"
            style={{
              padding: '12px 16px',
              borderRadius: 6,
              border: '1px solid var(--myntra-border, #d4d5d9)',
              fontSize: '0.9rem',
              outline: 'none',
              background: 'var(--myntra-bg, #fff)',
              color: 'var(--myntra-text, #282c3f)',
            }}
          />
        </div>

        {/* Story Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--myntra-text, #282c3f)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Story Description <span style={{ color: '#ff3f6c' }}>*</span>
          </label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell your story! Mention your region, how your brand empowers local women artisans, traditional techniques used, and your passion for preserving regional heritage..."
            style={{
              padding: '14px 16px',
              borderRadius: 6,
              border: '1px solid var(--myntra-border, #d4d5d9)',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              outline: 'none',
              resize: 'vertical',
              background: 'var(--myntra-bg, #fff)',
              color: 'var(--myntra-text, #282c3f)',
            }}
          />
        </div>

        {/* Image Upload Section (Up to 5 images) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--myntra-text, #282c3f)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Story Gallery Images (5 or less)
            </label>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: images.length >= 5 ? '#ff3f6c' : '#7e818c', marginLeft: 'auto' }}>
              {images.length} / 5 uploaded
            </span>
          </div>

          {/* Image Previews Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
            {images.map((imgUrl, idx) => (
              <div key={idx} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden', border: '1px solid #eaeaec', background: '#f5f5f6' }}>
                <img src={imgUrl} alt={`Story ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.75)',
                    color: '#fff',
                    border: 'none',
                    fontSize: 12,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Remove image"
                >
                  ✕
                </button>
                <div style={{ position: 'absolute', bottom: 4, left: 6, fontSize: 10, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: 4 }}>
                  Photo {idx + 1}
                </div>
              </div>
            ))}

            {/* Upload Button Box if < 5 images */}
            {images.length < 5 && (
              <label style={{
                aspectRatio: '4/3',
                borderRadius: 8,
                border: '2px dashed #ff3f6c',
                background: 'rgba(255, 63, 108, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: uploading ? 'wait' : 'pointer',
                transition: 'all 0.2s',
                padding: 12,
                textAlign: 'center',
              }}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: 24, marginBottom: 4 }}>📸</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#ff3f6c', textTransform: 'uppercase' }}>
                  {uploading ? 'Uploading...' : '+ Add Photo'}
                </span>
                <span style={{ fontSize: 9, color: '#7e818c', marginTop: 2 }}>
                  (Max 5 photos)
                </span>
              </label>
            )}
          </div>
        </div>

        {/* Submit / Save Button */}
        <div style={{ marginTop: 12, paddingTop: 16, borderTop: '1px solid var(--myntra-border, #eaeaec)' }}>
          <button
            type="submit"
            disabled={saving || uploading}
            style={{
              padding: '14px 32px',
              borderRadius: 6,
              background: '#ff3f6c',
              color: '#fff',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: saving ? 'wait' : 'pointer',
              boxShadow: '0 4px 12px rgba(255, 63, 108, 0.25)',
              transition: 'all 0.2s',
            }}
          >
            {saving ? 'Saving Story...' : 'Save & Publish Story'}
          </button>
        </div>

      </form>
    </div>
  );
}
