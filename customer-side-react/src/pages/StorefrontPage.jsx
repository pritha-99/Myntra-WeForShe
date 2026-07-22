import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSellerDetail, fetchSellerProducts } from '../api/client';
import ProductCard from '../components/ProductCard';

const CRAFT_COLORS = {
  'GI-Tagged': 'bg-amber-100 text-amber-800 border-amber-200',
  'Meet the Maker': 'bg-purple-100 text-purple-800 border-purple-200',
  'Dying Art': 'bg-red-100 text-red-700 border-red-200',
  'Freshly Onboarded': 'bg-green-100 text-green-700 border-green-200',
  'Textiles': 'bg-blue-100 text-blue-700 border-blue-200',
  'Pottery': 'bg-orange-100 text-orange-700 border-orange-200',
  'Woodwork': 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

const HERO_GRADIENTS = [
  'from-rose-950 via-pink-900 to-rose-900',
  'from-violet-950 via-purple-900 to-indigo-900',
  'from-amber-950 via-orange-900 to-red-900',
  'from-teal-950 via-cyan-900 to-sky-900',
  'from-emerald-950 via-teal-900 to-green-900',
];

function getHeroGradient(sellerId) {
  const idx = Math.abs((sellerId || '').charCodeAt(1) || 0) % HERO_GRADIENTS.length;
  return HERO_GRADIENTS[idx];
}

function CategoryFilter({ categories, active, onChange }) {
  if (!categories.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
          !active
            ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
            : 'bg-white text-gray-600 border-gray-200 hover:border-pink-400 hover:text-pink-600'
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
            active === cat
              ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-pink-400 hover:text-pink-600'
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([fetchSellerDetail(sellerId), fetchSellerProducts(sellerId)])
      .then(([sellerData, prodData]) => {
        setSeller(sellerData);
        setProducts(prodData.products || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sellerId]);

  function scrollToCatalog() {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
          <p className="text-sm">Loading storefront…</p>
        </div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <p className="font-semibold text-gray-700">{error || 'Seller not found'}</p>
        </div>
      </div>
    );
  }

  const heroGradient = getHeroGradient(sellerId);
  const initials = (seller.brandName || '??').slice(0, 2).toUpperCase();

  // All unique product categories
  const productCategories = [...new Set(products.map((p) => p.category).filter(Boolean))];
  const filteredProducts = categoryFilter
    ? products.filter((p) => p.category === categoryFilter)
    : products;

  // Generate artisan story
  const story = generateStory(seller);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Story */}
      <div className={`relative bg-gradient-to-br ${heroGradient} overflow-hidden`}>
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left: Brand info */}
            <div className="flex-1">
              <div className="flex items-start gap-6 mb-6">
                {/* Avatar */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0 shadow-2xl">
                  <span className="text-white font-black text-3xl">{initials}</span>
                </div>

                {/* Brand details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-white/60 text-xs font-medium">{seller.city} · {seller.state}</span>
                    {seller.categoryTypes?.includes('GI-Tagged') && (
                      <span className="bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        🏷 GI-Tagged
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-white mb-1">{seller.brandName}</h1>
                  <p className="text-white/60 text-sm mb-3">by {seller.founderName}</p>
                  
                  {/* Craft tags */}
                  <div className="flex flex-wrap gap-2">
                    {(seller.categoryTypes || []).map((tag) => (
                      <span
                        key={tag}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border ${CRAFT_COLORS[tag] || 'bg-white/10 text-white/70 border-white/20'}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Artisan Story Section */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <div className="inline-block bg-amber-400/20 text-amber-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                  ✦ Artisan Story
                </div>
                
                <h2 className="text-xl font-bold text-white mb-4">{story.title}</h2>
                
                <div className="text-white/80 leading-relaxed space-y-3 text-sm mb-5">
                  {story.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>

                {/* Highlights */}
                {story.highlights.length > 0 && (
                  <div className="bg-white/5 rounded-xl p-4 mb-5 space-y-2">
                    {story.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-start gap-2 text-white/70 text-sm">
                        <span className="text-amber-300 mt-0.5">•</span>
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Scroll to catalog button */}
                <button
                  onClick={scrollToCatalog}
                  className="w-full bg-white text-gray-900 font-bold py-3 px-6 rounded-xl hover:bg-white/90 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  Swipe up to view catalogue
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right: Price stat card */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center sticky top-6">
                <p className="text-white/60 text-xs uppercase tracking-widest mb-2">Starting at</p>
                <p className="text-white font-black text-4xl mb-2">₹{(seller.avgSellingPrice || 0).toLocaleString('en-IN')}</p>
                <p className="text-white/40 text-xs mb-4">avg. MRP ₹{(seller.avgMrp || 0).toLocaleString('en-IN')}</p>
                
                {/* Quick stats */}
                <div className="border-t border-white/20 pt-4 space-y-2">
                  <div className="text-white/70 text-sm">
                    <span className="text-white/50 text-xs">Products:</span>
                    <span className="ml-2 font-semibold text-white">{products.length}</span>
                  </div>
                  {seller.ecoTags && seller.ecoTags.length > 0 && (
                    <div className="text-white/70 text-sm">
                      <span className="text-white/50 text-xs">Eco-friendly</span>
                      <span className="ml-2">🌿</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div ref={catalogRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Product Collection</h2>
            <p className="text-sm text-gray-400 mt-1">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              {categoryFilter ? ` in "${categoryFilter}"` : ''}
            </p>
          </div>

          {/* Category filter pills */}
          <CategoryFilter
            categories={productCategories}
            active={categoryFilter}
            onChange={setCategoryFilter}
          />
        </div>

        {/* Products grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🛍️</div>
            <p className="text-gray-500 font-semibold">No products listed yet</p>
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

/**
 * Generate artisan story from seller data
 */
function generateStory(seller) {
  const craftType = seller.categoryTypes?.[0] || 'Textiles';
  const founderName = seller.founderName || 'The artisan';
  const city = seller.city || 'their hometown';
  const state = seller.state || 'India';
  
  const title = seller.brandUsp || `Drawing the Mahabharata with a pen`;
  
  const paragraphs = [];
  
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
  
  if (seller.ecoTags && seller.ecoTags.some(tag => tag.toLowerCase().includes('handmade'))) {
    paragraphs.push(
      `Every piece is meticulously handcrafted, with attention to the smallest details. A single piece can take 40+ hours to complete, depicting intricate scenes that showcase the artist's dedication and skill.`
    );
  }
  
  const highlights = [];
  if (seller.ecoTags && seller.ecoTags.length > 0) {
    highlights.push(`🌿 ${seller.ecoTags.join(', ')}`);
  }
  if (seller.categoryTypes?.includes('GI-Tagged')) {
    highlights.push('🏷 Geographical Indication (GI) Tagged');
  }
  highlights.push(`📦 Easy 7-day returns`);
  highlights.push(`✋ 100% Handmade guarantee`);
  
  return { title, paragraphs, highlights };
}
