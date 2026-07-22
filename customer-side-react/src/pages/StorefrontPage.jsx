import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className={`relative bg-gradient-to-br ${heroGradient} overflow-hidden`}>
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0 shadow-2xl">
              <span className="text-white font-black text-3xl">{initials}</span>
            </div>

            {/* Brand info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-white/60 text-xs font-medium">{seller.city} · {seller.state}</span>
                {seller.categoryTypes?.includes('GI-Tagged') && (
                  <span className="bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    🏷 GI-Tagged
                  </span>
                )}
                {seller.categoryTypes?.includes('Dying Art') && (
                  <span className="bg-red-400/20 border border-red-400/40 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    🎭 Dying Art
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-1">{seller.brandName}</h1>
              <p className="text-white/60 text-sm mb-3">by {seller.founderName}</p>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-2xl">{seller.brandUsp}</p>

              {/* Craft tags */}
              <div className="flex flex-wrap gap-2 mt-4">
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

            {/* Price stat card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center flex-shrink-0 min-w-[120px]">
              <p className="text-white/60 text-[10px] uppercase tracking-widest mb-1">Starting at</p>
              <p className="text-white font-black text-2xl">₹{(seller.avgSellingPrice || 0).toLocaleString('en-IN')}</p>
              <p className="text-white/40 text-[10px] mt-1">avg. MRP ₹{(seller.avgMrp || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
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
