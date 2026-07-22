import React, { useEffect, useState } from 'react';

/**
 * StoreStoryModal - Bottom sheet modal showing artisan story
 * Slides up from bottom with artisan story and "View Catalogue" button
 */
export default function StoreStoryModal({ seller, onClose, onViewCatalogue }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setIsVisible(true), 10);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  function handleClose() {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  const initials = (seller.brandName || '??').slice(0, 2).toUpperCase();

  // Generate artisan story from available data
  const story = generateStory(seller);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
          isVisible ? 'opacity-60' : 'opacity-0'
        }`}
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '85vh' }}
      >
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-t-3xl shadow-2xl overflow-hidden">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-md z-10"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Scrollable content */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 180px)' }}>
            <div className="px-6 sm:px-8 pb-6">
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white font-black text-xl">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-black text-gray-900 mb-1">
                    {seller.brandName}
                  </h2>
                  <p className="text-sm text-gray-600 mb-2">
                    📍 {seller.city}, {seller.state}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      ✓ Verified Seller
                    </span>
                    {seller.categoryTypes?.includes('GI-Tagged') && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        🏷 GI-Tagged
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      {seller.categoryTypes?.[0] || 'Textiles'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category tag */}
              <div className="inline-block bg-amber-900 text-amber-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                ✦ {seller.categoryTypes?.[0] || 'TEXTILES'}
              </div>

              {/* Story title */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {story.title}
              </h3>

              {/* Story content */}
              <div className="text-gray-700 leading-relaxed space-y-4 mb-6">
                {story.paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-sm">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Highlights */}
              {story.highlights.length > 0 && (
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-4 border border-amber-200">
                  <div className="space-y-2">
                    {story.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span className="text-sm text-gray-700">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Eco tags */}
              {seller.ecoTags && seller.ecoTags.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Sustainability
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {seller.ecoTags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-200"
                      >
                        🌿 {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer with action button */}
          <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent px-6 sm:px-8 py-5 border-t border-gray-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Starting from</p>
                <p className="text-2xl font-black text-gray-900">
                  ₹{(seller.avgSellingPrice || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={onViewCatalogue}
                className="flex-1 max-w-xs bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold py-4 px-6 rounded-xl hover:from-pink-700 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                View Catalogue →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Generate artisan story from seller data
 */
function generateStory(seller) {
  const craftType = seller.categoryTypes?.[0] || 'Textiles';
  const founderName = seller.founderName || 'The artisan';
  const city = seller.city || 'their hometown';
  const state = seller.state || 'India';
  
  // Base title
  const title = `Drawing the Mahabharata with a pen`;
  
  // Generate story paragraphs
  const paragraphs = [];
  
  // Intro paragraph about the craft
  if (craftType.toLowerCase().includes('kalamkari')) {
    paragraphs.push(
      `Kalamkari — pen-on-cloth — is a 3,000-year-old art form. ${founderName} uses a bamboo pen dipped in fermented iron-jaggery solution to draw epic mythological narratives on cotton.`
    );
  } else if (craftType.toLowerCase().includes('textile') || craftType.toLowerCase().includes('silk')) {
    paragraphs.push(
      `${founderName} practices the ancient art of ${craftType.toLowerCase()} in ${city}, ${state}. Each piece is created using traditional techniques passed down through generations, preserving centuries-old craftsmanship.`
    );
  } else {
    paragraphs.push(
      `${founderName} is a master artisan from ${city}, ${state}, specializing in ${craftType.toLowerCase()}. Using traditional methods and natural materials, each creation tells a unique story of India's rich cultural heritage.`
    );
  }
  
  // Add USP if available
  if (seller.brandUsp) {
    paragraphs.push(seller.brandUsp);
  }
  
  // Add craft-specific details
  if (seller.ecoTags && seller.ecoTags.some(tag => tag.toLowerCase().includes('handmade'))) {
    paragraphs.push(
      `Every piece is meticulously handcrafted, with attention to the smallest details. A single piece can take 40+ hours to complete, depicting intricate scenes that showcase the artist's dedication and skill.`
    );
  }
  
  // Highlights
  const highlights = [];
  
  if (seller.ecoTags && seller.ecoTags.length > 0) {
    highlights.push(`🌿 Eco-friendly: ${seller.ecoTags.join(', ')}`);
  }
  
  if (seller.categoryTypes?.includes('GI-Tagged')) {
    highlights.push('🏷 Geographical Indication (GI) Tagged - Authentic regional craft');
  }
  
  highlights.push(`📦 Easy 7-day returns`);
  highlights.push(`✋ 100% Handmade guarantee`);
  
  return {
    title,
    paragraphs,
    highlights,
  };
}
