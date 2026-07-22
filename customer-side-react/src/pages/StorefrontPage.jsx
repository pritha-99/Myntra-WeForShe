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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);

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

  function handleCheckPincode(e) {
    e.preventDefault();
    if (!pincode || pincode.length !== 6) {
      setPincodeStatus('Please enter a valid 6-digit PIN code');
      return;
    }
    setPincodeStatus(`Available for delivery at ${pincode} in 3-5 business days`);
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

  const story = generateStory(seller);

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

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-between">
            {/* Left: Brand Details */}
            <div className="flex-1">
              <div className="flex items-start gap-5 mb-6">
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
                  <h1 className="text-2xl sm:text-3xl font-black text-white mb-0.5 uppercase tracking-wider">{seller.brandName}</h1>
                  <p className="text-[#94969f] text-xs font-semibold mb-3">by {seller.founderName}</p>
                  
                  {/* Rating Badge (Matching Myntra Rating Style) */}
                  <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xs text-xs font-bold text-white border border-white/15">
                    <span>4.8</span>
                    <span className="text-[#03a685]">★</span>
                    <span className="text-[#94969f] font-normal text-[11px]">| 1.2k Ratings</span>
                  </div>
                </div>
              </div>

              {/* Story summary card */}
              <div className="bg-white/5 border border-white/10 rounded-md p-5 text-sm">
                <div className="inline-block text-[#ff3f6c] text-xs font-black uppercase tracking-wider mb-2">
                  ✦ Maker Story
                </div>
                <h2 className="text-base font-bold text-white mb-2">{story.title}</h2>
                <p className="text-[#94969f] text-xs leading-relaxed mb-4">{story.paragraphs[0]}</p>
                <button
                  onClick={scrollToCatalog}
                  className="bg-[#ff3f6c] hover:bg-[#e73961] text-white font-bold text-xs px-4 py-2 rounded-xs uppercase tracking-wider cursor-pointer transition-all"
                >
                  View Product Catalog →
                </button>
              </div>
            </div>

            {/* Right: Pincode & Delivery Box (Matching Myntra.png Delivery Options) */}
            <div className="lg:w-80 w-full flex-shrink-0">
              <div className="bg-white text-[#282c3f] border border-[#eaeaec] rounded-md p-5 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#282c3f] mb-2 flex items-center gap-1.5">
                  <span>DELIVERY OPTIONS</span>
                  <svg className="w-4 h-4 text-[#ff3f6c]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0C2.678 5.578 2.25 6.058 2.25 6.626v.958" />
                  </svg>
                </h3>

                <form onSubmit={handleCheckPincode} className="relative mb-3">
                  <input
                    type="text"
                    maxLength="6"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter pincode"
                    className="w-full bg-white border border-[#d4d5d9] text-xs font-semibold px-3 py-2.5 rounded-xs pr-16 focus:outline-none focus:border-[#ff3f6c] placeholder-[#94969f]"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 text-xs font-bold text-[#ff3f6c] hover:text-[#e73961] cursor-pointer"
                  >
                    Check
                  </button>
                </form>

                {pincodeStatus && (
                  <p className="text-[11px] font-semibold text-[#03a685] mb-3">{pincodeStatus}</p>
                )}

                <div className="space-y-2 text-[11px] text-[#535766] border-t border-[#eaeaec] pt-3 font-medium">
                  <p className="flex items-center gap-1.5">
                    <span className="text-[#03a685] font-bold">✓</span> 100% Original Artisan Products
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="text-[#03a685] font-bold">✓</span> Pay on delivery might be available
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="text-[#03a685] font-bold">✓</span> Easy 7 days returns & exchanges
                  </p>
                </div>
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
    `${founderName} is a acclaimed master artisan from ${city}, ${state}, specializing in traditional ${craftType.toLowerCase()}. Using time-honored techniques passed down through generations, each creation embodies centuries of Indian cultural heritage.`
  ];

  return { title, paragraphs };
}
