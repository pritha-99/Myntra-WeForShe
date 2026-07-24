import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSellerDetail, fetchSellerProducts } from '../api/client';
import ProductCard from '../components/ProductCard';

function CategoryFilter({ categories, active, onChange }) {
  if (!categories.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-4 py-1.5 rounded-xs text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
          !active
            ? 'bg-[#ff3f6c] text-white border-[#ff3f6c] shadow-xs'
            : 'bg-white text-[#282c3f] border-[#d4d5d9] hover:border-[#ff3f6c] hover:text-[#ff3f6c]'
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-1.5 rounded-xs text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
            active === cat
              ? 'bg-[#ff3f6c] text-white border-[#ff3f6c] shadow-xs'
              : 'bg-white text-[#282c3f] border-[#d4d5d9] hover:border-[#ff3f6c] hover:text-[#ff3f6c]'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export default function StorefrontPage() {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const catalogRef = useRef(null);

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [storyData, setStoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);

  // Right-side story image slideshow state (5-second auto timer + manual controls)
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchSellerDetail(sellerId), 
      fetchSellerProducts(sellerId),
      fetch(`/api/customer/sellers/${sellerId}/story`).then(r => r.json()).catch(() => ({ story: null }))
    ])
      .then(([sellerData, prodData, storyRes]) => {
        setSeller(sellerData);
        setProducts(prodData.products || []);
        setStoryData(storyRes?.story || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sellerId]);

  const storyImages = storyData?.images && storyData.images.length > 0
    ? storyData.images
    : [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      ];

  // 5-second automatic slideshow timer for right side story images
  useEffect(() => {
    if (storyImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveStoryIdx((prev) => (prev + 1) % storyImages.length);
    }, 5000); // 5 seconds per image
    return () => clearInterval(interval);
  }, [storyImages.length]);

  function scrollToCatalog() {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-10 h-10 border-3 border-[#f5f5f6] border-t-[#ff3f6c] rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-[#7e818c] uppercase tracking-wider">Loading Storefront…</p>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center bg-[#f5f5f6] border border-[#eaeaec] rounded-md p-8 max-w-md w-full">
          <div className="text-4xl mb-3">🛍️</div>
          <p className="text-sm font-bold text-[#282c3f] uppercase tracking-wider mb-2">
            {error || 'Artisan store not found'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-5 py-2.5 bg-[#ff3f6c] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#e73961]"
          >
            Explore All Brands
          </button>
        </div>
      </div>
    );
  }

  const initials = (seller.brandName || '??').slice(0, 2).toUpperCase();
  const productCategories = [...new Set(products.map((p) => p.category).filter(Boolean))];
  const filteredProducts = categoryFilter
    ? products.filter((p) => p.category === categoryFilter)
    : products;

  const storyTitle = storyData?.title || generateStory(seller).title;
  const storyDescription = storyData?.description || generateStory(seller).paragraphs[0];

  return (
    <div className="min-h-screen bg-white">
      {/* Brand Hero Header */}
      <div className="bg-[#282c3f] text-white border-b border-[#eaeaec] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-[#94969f] font-semibold mb-6">
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Home</button>
            <span>/</span>
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Brands</button>
            <span>/</span>
            <span className="text-[#ff3f6c] font-bold">{seller.brandName}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* LEFT SIDE: Store Info & Highlighted Story Description right under Store Name */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              
              <div className="space-y-6">
                {/* Store Name & Header */}
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xs bg-[#ff3f6c] flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-white font-black text-2xl">{initials}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[#94969f] text-xs font-bold uppercase tracking-wider">{seller.city} · {seller.state}</span>
                      {seller.categoryTypes?.includes('GI-Tagged') && (
                        <span className="bg-[#ff905a]/20 border border-[#ff905a]/40 text-[#ff905a] text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase">
                          🏷 GI-Tagged
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white mb-0.5 uppercase tracking-wider">
                      {seller.brandName}
                    </h1>
                    <p className="text-[#94969f] text-xs font-semibold mb-2">by {seller.founderName}</p>
                    
                    {/* Rating Badge */}
                    <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xs text-xs font-bold text-white border border-white/15">
                      <span>4.8</span>
                      <span className="text-[#03a685]">★</span>
                      <span className="text-[#94969f] font-normal text-[11px]">| 1.2k Ratings</span>
                    </div>
                  </div>
                </div>

                {/* HIGHLIGHTED STORY DESCRIPTION RIGHT UNDER STORE NAME */}
                <div className="border-l-4 border-[#ff3f6c] pl-4 sm:pl-6 py-2 space-y-3">
                  <div className="inline-flex items-center gap-2 text-[#ff3f6c] text-xs font-bold uppercase tracking-wider">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff3f6c] animate-pulse" />
                    OUR HERITAGE STORY
                  </div>
                  {storyTitle && (
                    <h2 className="text-lg sm:text-xl font-black text-white leading-snug tracking-tight">
                      {storyTitle}
                    </h2>
                  )}
                  <p className="text-base sm:text-lg text-white/95 leading-relaxed font-medium">
                    {storyDescription}
                  </p>
                </div>
              </div>

              {/* View Catalog CTA */}
              <div className="pt-4">
                <button
                  onClick={scrollToCatalog}
                  className="bg-[#ff3f6c] hover:bg-[#e73961] text-white font-bold text-xs sm:text-sm px-7 py-3.5 rounded-xs uppercase tracking-wider cursor-pointer transition-all shadow-md flex items-center gap-2"
                >
                  <span>View Product Catalog</span>
                  <span>↓</span>
                </button>
              </div>

            </div>

            {/* RIGHT SIDE: Story Box Occupying Entire Height of Hero Section */}
            <div className="lg:col-span-5 w-full flex flex-col items-stretch">
              <div className="relative w-full h-full min-h-[420px] sm:min-h-[460px] bg-[#12131c] rounded-xl overflow-hidden border border-white/15 shadow-2xl flex items-center justify-center group">
                
                {/* Active Full Image (Uncropped, filling entire right side height) */}
                <img
                  src={storyImages[activeStoryIdx]}
                  alt={`Story Image ${activeStoryIdx + 1}`}
                  className="max-h-full max-w-full w-auto h-auto object-contain transition-all duration-500"
                />
                
                {/* Overlay gradient for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

                {/* Counter Pill */}
                <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold tracking-wider uppercase border border-white/15">
                  Story Photo {activeStoryIdx + 1} of {storyImages.length}
                </div>

                {/* Top 5-Second Timer Bar Indicator */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/20">
                  <div 
                    key={activeStoryIdx} 
                    className="h-full bg-[#ff3f6c] transition-all duration-500" 
                  />
                </div>

                {/* Previous (‹) Button */}
                {storyImages.length > 1 && (
                  <button
                    onClick={() => setActiveStoryIdx((prev) => (prev === 0 ? storyImages.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center text-2xl transition-all cursor-pointer border border-white/20 z-10 shadow-lg"
                    aria-label="Previous story photo"
                  >
                    ‹
                  </button>
                )}

                {/* Next (›) Button */}
                {storyImages.length > 1 && (
                  <button
                    onClick={() => setActiveStoryIdx((prev) => (prev + 1) % storyImages.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center text-2xl transition-all cursor-pointer border border-white/20 z-10 shadow-lg"
                    aria-label="Next story photo"
                  >
                    ›
                  </button>
                )}

                {/* Slide Indicator Dots */}
                {storyImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                    {storyImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveStoryIdx(i)}
                        className={`h-2.5 rounded-full transition-all cursor-pointer ${
                          i === activeStoryIdx ? 'bg-[#ff3f6c] w-6' : 'bg-white/50 hover:bg-white w-2.5'
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Product Catalog Grid Section */}
      <div ref={catalogRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#eaeaec]">
          <div>
            <h2 className="text-lg font-black text-[#282c3f] uppercase tracking-wider">Product Collection</h2>
            <p className="text-xs text-[#7e818c] font-semibold mt-0.5">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          <CategoryFilter
            categories={productCategories}
            active={categoryFilter}
            onChange={setCategoryFilter}
          />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-[#f5f5f6] border border-[#eaeaec] rounded-md">
            <div className="text-4xl mb-3">🛍️</div>
            <p className="text-xs font-bold text-[#7e818c] uppercase tracking-wider">No products available in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function generateStory(seller) {
  const craftType = seller.categoryTypes?.[0] || 'Textiles';
  const founderName = seller.founderName || 'The artisan';
  const city = seller.city || 'their hometown';
  const state = seller.state || 'India';
  const title = seller.brandUsp || `Traditional ${craftType} Craftsmanship`;

  const paragraphs = [
    `${founderName} is an acclaimed master artisan from ${city}, ${state}, specializing in traditional ${craftType.toLowerCase()}. Using time-honored techniques passed down through generations, each creation embodies centuries of Indian cultural heritage.`
  ];

  return { title, paragraphs };
}
