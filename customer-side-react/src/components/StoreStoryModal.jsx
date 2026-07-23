import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * StoreStoryModal - Short story slideshow modal when a seller is chosen.
 * Features 5-or-less image slideshow with description, top story progress bars,
 * and a prominent "Skip" button at the bottom right landing on the seller's page.
 */
export default function StoreStoryModal({ seller, onClose, onViewCatalogue }) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  const sellerId = seller?.sellerId;

  // Fetch story from backend
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
    document.body.style.overflow = 'hidden';

    if (sellerId) {
      fetch(`/api/customer/sellers/${sellerId}/story`)
        .then((res) => res.json())
        .then((data) => {
          if (data.story) {
            setStory(data.story);
          }
        })
        .catch((err) => console.error('Error fetching seller story:', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sellerId]);

  // Slideshow auto-advance timer (5 seconds per slide)
  const images = story?.images && story.images.length > 0
    ? story.images
    : [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      ];

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);


  function handleSkipToStorefront() {
    setIsVisible(false);
    setTimeout(() => {
      if (onViewCatalogue) {
        onViewCatalogue();
      } else if (sellerId) {
        navigate(`/storefront/${sellerId}`);
      }
      if (onClose) onClose();
    }, 200);
  }

  function handleClose() {
    setIsVisible(false);
    setTimeout(onClose, 200);
  }

  const initials = (seller?.brandName || '??').slice(0, 2).toUpperCase();
  const storyTitle = story?.title || `${seller?.brandName || 'Artisan'} Craft Journey`;
  const storyDesc = story?.description || `${seller?.founderName || 'Our master artisan'} creates traditional handcrafted heritage products from ${seller?.city || ''}, ${seller?.state || 'India'}.`;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Story Slideshow Dialog Card */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="bg-[#1a1c29] text-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-white/10 relative flex flex-col max-h-[92vh]"
        >
          {/* Top Story Progress Bars */}
          <div className="flex items-center gap-2 p-4 pb-2 z-10">
            {images.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer"
              >
                <div
                  className={`h-full bg-[#ff3f6c] transition-all duration-500 ${
                    idx === activeSlide ? 'w-full' : idx < activeSlide ? 'w-full opacity-60' : 'w-0'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Close X Top Right */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 text-white/90 hover:text-white flex items-center justify-center text-base font-bold transition-all cursor-pointer border border-white/20"
          >
            ✕
          </button>

          {/* Slide Image Box (Uncropped full image display) */}
          <div className="relative h-[48vh] sm:h-[54vh] bg-[#12131c] flex items-center justify-center overflow-hidden">
            <img
              src={images[activeSlide]}
              alt={`Story slide ${activeSlide + 1}`}
              className="max-h-full max-w-full w-auto h-auto object-contain transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1c29] via-transparent to-black/30 pointer-events-none" />

            {/* Seller Brand Badge overlay on image */}
            <div className="absolute top-4 left-4 flex items-center gap-3 bg-black/75 backdrop-blur-md px-4 py-2 rounded-full border border-white/15">
              <div className="w-9 h-9 rounded-full bg-[#ff3f6c] flex items-center justify-center font-black text-xs text-white">
                {initials}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{seller?.brandName}</h4>
                <p className="text-[11px] text-[#94969f] font-semibold">{seller?.city}, {seller?.state}</p>
              </div>
            </div>

            {/* Slide Navigation Controls */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center text-2xl transition-all cursor-pointer border border-white/20 shadow-lg z-10"
                >
                  ‹
                </button>
                <button
                  onClick={() => setActiveSlide((prev) => (prev + 1) % images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center text-2xl transition-all cursor-pointer border border-white/20 shadow-lg z-10"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* Story Title & Enlarged Description */}
          <div className="p-5 sm:p-6 overflow-y-auto max-h-[25vh] space-y-2">
            <div className="inline-block bg-[#ff3f6c]/20 border border-[#ff3f6c]/40 text-[#ff3f6c] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              ✦ Maker Story ({activeSlide + 1} of {images.length})
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-snug tracking-tight">
              {storyTitle}
            </h3>
            <p className="text-base sm:text-lg text-white/95 leading-relaxed font-medium">
              {storyDesc}
            </p>
          </div>

          {/* Bottom Bar with Prominent SKIP BUTTON at bottom right */}
          <div className="p-4 px-6 border-t border-white/10 bg-[#151722] flex items-center justify-between">
            <div className="text-xs font-semibold text-[#94969f]">
              Artisan Heritage Storefront
            </div>

            {/* Prominent SKIP BUTTON at bottom right */}
            <button
              onClick={handleSkipToStorefront}
              className="bg-[#ff3f6c] hover:bg-[#e73961] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-md uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <span>Skip to Storefront</span>
              <span className="text-lg">→</span>
            </button>
          </div>

        </div>
      </div>

    </>
  );
}
