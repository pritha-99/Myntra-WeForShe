import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchProductDetail } from '../api/client';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];

// Fallback high quality product gallery images for different categories to fill the 2-column grid if seller provided only 1 image
const CATEGORY_GALLERY = {
  'Sarees': [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
  ],
  'Kurtas & Suits': [
    'https://images.unsplash.com/photo-1583391733975-ac9996b79758?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
  ],
  'Ethnic Wear': [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
  ],
  'Jewellery & Accessories': [
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
  ],
  'default': [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
  ]
};

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSize, setSelectedSize] = useState('M');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToBag, setAddedToBag] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeMsg, setPincodeMsg] = useState('');
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Overlay Lightbox state
  const [overlayIdx, setOverlayIdx] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError(null);
    fetchProductDetail(productId)
      .then((data) => {
        setProduct(data.product);
        setSeller(data.seller);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-10 h-10 border-3 border-[#f5f5f6] border-t-[#ff3f6c] rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-[#7e818c] uppercase tracking-wider">Loading Product Details…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center bg-[#f5f5f6] border border-[#eaeaec] rounded-md p-8 max-w-md w-full">
          <div className="text-4xl mb-3">🛍️</div>
          <p className="text-sm font-bold text-[#282c3f] uppercase tracking-wider mb-2">
            {error || 'Product details not found'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-5 py-2.5 bg-[#ff3f6c] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#e73961]"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Construct images list
  const productImages = [...(product.images || [])];
  const fallbackList = CATEGORY_GALLERY[product.category] || CATEGORY_GALLERY['default'];
  
  // Guarantee at least 2 images for the Myntra 2-col image layout
  while (productImages.length < 2) {
    const nextFallback = fallbackList[productImages.length % fallbackList.length];
    if (!productImages.includes(nextFallback)) {
      productImages.push(nextFallback);
    } else {
      productImages.push('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80');
    }
  }

  const brandName = seller?.brandName || product.category || 'MYNTRA MADE ACROSS INDIA';
  const price = product.price || 0;
  const mrp = Math.round(price * 3.34); // Match ~70% discount matching screenshot
  const discountPercent = Math.round(((mrp - price) / mrp) * 100);

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      setPincodeMsg('Please enter a valid 6-digit PIN code');
      return;
    }
    setPincodeMsg(`Get it by ${new Date(Date.now() + 86400000 * 3).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} | Free Delivery`);
  };

  const handleAddToBag = () => {
    setAddedToBag(true);
    setTimeout(() => setAddedToBag(false), 3000);
  };

  const handlePrevOverlay = (e) => {
    e.stopPropagation();
    setOverlayIdx((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextOverlay = (e) => {
    e.stopPropagation();
    setOverlayIdx((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-white text-[#282c3f]">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-xs text-[#535766]">
        <div className="flex flex-wrap items-center gap-1.5 font-normal">
          <Link to="/" className="hover:text-[#282c3f]">Home</Link>
          <span>/</span>
          <Link to="/" className="hover:text-[#282c3f]">Clothing</Link>
          <span>/</span>
          <span>{product.category || 'Women Clothing'}</span>
          <span>/</span>
          <Link to={seller?.sellerId ? `/storefront/${seller.sellerId}` : '#'} className="font-bold text-[#282c3f] hover:underline">
            {brandName}
          </Link>
          <span>/</span>
          <span className="font-bold text-[#282c3f] truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      {/* Main Container: 2 Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE: Image Gallery Grid (Click opens fullscreen overlay) */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {productImages.map((img, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setOverlayIdx(idx)}
                  className="aspect-[3/4] bg-[#f5f5f6] overflow-hidden border border-[#eaeaec] relative group cursor-zoom-in"
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Click to zoom indicator badge */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="bg-white/90 text-[#282c3f] text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                      </svg>
                      Click to View Full
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: Product Info & Purchase Actions */}
          <div className="lg:col-span-5 space-y-6 lg:pl-4">
            
            {/* Header: Brand Name & Title */}
            <div>
              <h1 className="text-2xl font-bold text-[#282c3f] uppercase tracking-wider mb-1">
                {brandName}
              </h1>
              <p className="text-base text-[#535766] font-normal leading-snug">
                {product.name}
              </p>
            </div>

            {/* Rating Pill */}
            <div className="inline-flex items-center gap-1.5 bg-white border border-[#eaeaec] px-2.5 py-1 rounded-xs text-xs font-bold text-[#282c3f]">
              <span className="flex items-center gap-0.5">
                4.3 <span className="text-[#03a685] text-sm">★</span>
              </span>
              <span className="text-[#7e818c]">|</span>
              <span className="text-[#7e818c] font-normal">3.1k Ratings</span>
            </div>

            <hr className="border-[#eaeaec]" />

            {/* Price Section */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-[#282c3f]">
                  ₹{price.toLocaleString('en-IN')}
                </span>
                <span className="text-base text-[#7e818c] line-through font-normal">
                  MRP ₹{mrp.toLocaleString('en-IN')}
                </span>
                <span className="text-base font-bold text-[#ff905a]">
                  ({discountPercent}% OFF)
                </span>
              </div>
              <p className="text-xs font-bold text-[#03a685]">
                inclusive of all taxes
              </p>
            </div>

            {/* Select Size Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#282c3f]">
                  SELECT SIZE
                </h3>
                <button
                  onClick={() => setShowSizeChart(true)}
                  className="text-xs font-bold text-[#ff3f6c] hover:underline uppercase tracking-wider cursor-pointer"
                >
                  SIZE CHART &gt;
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-full border flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'border-[#ff3f6c] text-[#ff3f6c] bg-[#ff3f6c]/5 ring-1 ring-[#ff3f6c]'
                        : 'border-[#bfc0c6] text-[#282c3f] hover:border-[#ff3f6c]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Buttons (ADD TO BAG & WISHLIST) */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleAddToBag}
                disabled={product.quantity === 0}
                className="flex-1 bg-[#ff3f6c] hover:bg-[#e73961] text-white text-sm font-bold py-4 rounded-xs tracking-wider uppercase transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                </svg>
                <span>{addedToBag ? 'ADDED TO BAG! ✓' : 'ADD TO BAG'}</span>
              </button>

              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`flex-1 border text-sm font-bold py-4 rounded-xs tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isWishlisted
                    ? 'border-[#ff3f6c] bg-[#ff3f6c]/5 text-[#ff3f6c]'
                    : 'border-[#d4d5d9] text-[#282c3f] hover:border-[#282c3f]'
                }`}
              >
                <svg
                  className={`w-5 h-5 ${isWishlisted ? 'fill-[#ff3f6c] stroke-[#ff3f6c]' : 'fill-none stroke-currentColor'}`}
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                <span>{isWishlisted ? 'WISHLISTED' : 'WISHLIST'}</span>
              </button>
            </div>

            <hr className="border-[#eaeaec]" />

            {/* Delivery Options */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#282c3f]">
                  DELIVERY OPTIONS
                </h3>
                <svg className="w-4 h-4 text-[#282c3f]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0C2.678 5.578 2.25 6.058 2.25 6.626v.958" />
                </svg>
              </div>

              <form onSubmit={handlePincodeCheck} className="flex gap-2 max-w-sm mb-2">
                <input
                  type="text"
                  maxLength="6"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter pincode"
                  className="flex-1 bg-white border border-[#d4d5d9] px-3.5 py-2.5 rounded-xs text-xs font-semibold focus:outline-none focus:border-[#ff3f6c]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 text-xs font-bold text-[#ff3f6c] hover:text-[#e73961] uppercase tracking-wider cursor-pointer"
                >
                  Check
                </button>
              </form>

              {pincodeMsg ? (
                <p className="text-xs font-semibold text-[#03a685] mb-3">{pincodeMsg}</p>
              ) : (
                <p className="text-[11px] text-[#7e818c] mb-3">
                  Please enter PIN code to check delivery time & Pay on Delivery Availability
                </p>
              )}

              <div className="space-y-2 text-xs text-[#282c3f] pt-2 font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-base">🚚</span>
                  <span>100% Original Artisan Handmade Product</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base">💵</span>
                  <span>Pay on delivery available</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base">🔄</span>
                  <span>Easy 14 days returns & exchanges</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Fullscreen Image Overlay Lightbox Modal */}
      {overlayIdx !== null && (
        <div 
          onClick={() => setOverlayIdx(null)}
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn"
        >
          {/* Close button */}
          <button
            onClick={() => setOverlayIdx(null)}
            className="absolute top-5 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-11 h-11 flex items-center justify-center text-xl font-bold transition-all cursor-pointer z-10"
            aria-label="Close image overlay"
          >
            ✕
          </button>

          {/* Left Arrow */}
          {productImages.length > 1 && (
            <button
              onClick={handlePrevOverlay}
              className="absolute left-4 sm:left-8 text-white bg-black/40 hover:bg-black/70 rounded-full w-12 h-12 flex items-center justify-center text-2xl transition-all cursor-pointer z-10"
              aria-label="Previous image"
            >
              ‹
            </button>
          )}

          {/* Full Image Container */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-4xl max-h-[88vh] flex flex-col items-center justify-center"
          >
            <img
              src={productImages[overlayIdx]}
              alt={`${product.name} enlarged view`}
              className="max-h-[82vh] max-w-[90vw] object-contain rounded-md shadow-2xl"
            />
            {/* Image counter indicator */}
            <div className="mt-3 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-bold tracking-wider uppercase">
              {overlayIdx + 1} of {productImages.length}
            </div>
          </div>

          {/* Right Arrow */}
          {productImages.length > 1 && (
            <button
              onClick={handleNextOverlay}
              className="absolute right-4 sm:right-8 text-white bg-black/40 hover:bg-black/70 rounded-full w-12 h-12 flex items-center justify-center text-2xl transition-all cursor-pointer z-10"
              aria-label="Next image"
            >
              ›
            </button>
          )}
        </div>
      )}

      {/* Size Chart Modal */}
      {showSizeChart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-md max-w-md w-full p-6 relative shadow-xl">
            <button
              onClick={() => setShowSizeChart(false)}
              className="absolute top-4 right-4 text-[#7e818c] hover:text-[#282c3f] font-bold text-lg cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-base font-bold text-[#282c3f] uppercase tracking-wider mb-4">
              Size Chart & Measurements (in inches)
            </h3>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#f5f5f6] text-[#282c3f] font-bold border-b border-[#eaeaec]">
                  <th className="py-2 px-3 text-left">Size</th>
                  <th className="py-2 px-3 text-left">Bust</th>
                  <th className="py-2 px-3 text-left">Waist</th>
                  <th className="py-2 px-3 text-left">Shoulder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaeaec]">
                <tr><td className="py-2 px-3 font-bold">S</td><td className="py-2 px-3">34</td><td className="py-2 px-3">28</td><td className="py-2 px-3">14.0</td></tr>
                <tr><td className="py-2 px-3 font-bold">M</td><td className="py-2 px-3">36</td><td className="py-2 px-3">30</td><td className="py-2 px-3">14.5</td></tr>
                <tr><td className="py-2 px-3 font-bold">L</td><td className="py-2 px-3">38</td><td className="py-2 px-3">32</td><td className="py-2 px-3">15.0</td></tr>
                <tr><td className="py-2 px-3 font-bold">XL</td><td className="py-2 px-3">40</td><td className="py-2 px-3">34</td><td className="py-2 px-3">15.5</td></tr>
                <tr><td className="py-2 px-3 font-bold">XXL</td><td className="py-2 px-3">42</td><td className="py-2 px-3">36</td><td className="py-2 px-3">16.0</td></tr>
                <tr><td className="py-2 px-3 font-bold">3XL</td><td className="py-2 px-3">44</td><td className="py-2 px-3">38</td><td className="py-2 px-3">16.5</td></tr>
              </tbody>
            </table>
            <button
              onClick={() => setShowSizeChart(false)}
              className="mt-6 w-full bg-[#ff3f6c] text-white text-xs font-bold py-2.5 rounded-xs uppercase tracking-wider hover:bg-[#e73961] cursor-pointer"
            >
              Close Size Chart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
