import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORY_ICONS = {
  'Sarees': '🥻',
  'Kurtas & Suits': '👘',
  'Ethnic Wear': '👗',
  'Home & Living': '🏺',
  'Jewellery & Accessories': '💍',
};

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const icon = CATEGORY_ICONS[product.category] || '🛍️';
  const hasImage = product.images && product.images.length > 0;
  // Use relative URL — /uploads/* is proxied through Vite to the main backend (localhost:4000)
  const imgSrc = hasImage ? product.images[0] : null;
  const price = product.price || 0;

  const handleCardClick = () => {
    if (product._id) {
      navigate(`/product/${product._id}`);
    }
  };

  return (
    <div
      id={`product-card-${product._id}`}
      onClick={handleCardClick}
      className="group bg-white rounded-md transition-all duration-300 hover:shadow-lg overflow-hidden border border-[#eaeaec] flex flex-col justify-between cursor-pointer"
    >
      {/* Product Image & Overlays */}
      <div>
        <div className="aspect-[3/4] w-full bg-[#f5f5f6] relative overflow-hidden">
          {hasImage ? (
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#7e818c]">
              <span className="text-5xl mb-2">{icon}</span>
              <span className="text-xs font-semibold uppercase tracking-wider">{product.category}</span>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-[#282c3f] hover:text-[#ff3f6c] transition-colors cursor-pointer"
            aria-label="Wishlist"
          >
            <svg
              className={`w-4 h-4 ${isWishlisted ? 'fill-[#ff3f6c] stroke-[#ff3f6c]' : 'fill-none stroke-currentColor'}`}
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>

          {/* Stock badge */}
          {product.quantity <= 5 && product.quantity > 0 && (
            <div className="absolute top-3 left-3 bg-[#ff3f6c] text-white text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider">
              Only {product.quantity} Left
            </div>
          )}
          {product.quantity === 0 && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
              <span className="text-[#282c3f] font-bold text-xs uppercase tracking-wider bg-white px-3 py-1.5 border border-[#eaeaec] rounded-xs">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-3.5 flex flex-col gap-1">
          {/* Category / Brand Name */}
          <h3 className="text-xs font-bold text-[#282c3f] uppercase tracking-wider truncate">
            {product.category || 'MYNTRA MADE ACROSS INDIA'}
          </h3>

          {/* Product Title */}
          <h4 className="text-xs font-normal text-[#535766] line-clamp-1 truncate">
            {product.name}
          </h4>

          {/* Price Section */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-sm font-bold text-[#282c3f]">
              ₹{price.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="px-3.5 pb-3.5 pt-1">
        <button
          disabled={product.quantity === 0}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/product/${product._id}`);
          }}
          className="w-full bg-[#ff3f6c] hover:bg-[#e73961] text-white text-xs font-bold py-2.5 rounded-xs tracking-wider uppercase transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] flex items-center justify-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
          </svg>
          <span>ADD TO BAG</span>
        </button>
      </div>
    </div>
  );
}
