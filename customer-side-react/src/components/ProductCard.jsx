import React from 'react';

const CATEGORY_ICONS = {
  'Sarees': '🥻',
  'Kurtas & Suits': '👘',
  'Ethnic Wear': '👗',
  'Home & Living': '🏺',
  'Jewellery & Accessories': '💍',
};

export default function ProductCard({ product }) {
  const icon = CATEGORY_ICONS[product.category] || '🛍️';
  const hasImage = product.images && product.images.length > 0;
  const imgSrc = hasImage ? `http://localhost:4000${product.images[0]}` : null;

  return (
    <div
      id={`product-card-${product._id}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden border border-gray-100"
    >
      {/* Image / Placeholder */}
      <div className="aspect-[3/4] w-full bg-gradient-to-br from-pink-50 to-rose-100 relative overflow-hidden">
        {hasImage ? (
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
            <span className="text-5xl mb-2">{icon}</span>
            <span className="text-xs text-gray-300">{product.category}</span>
          </div>
        )}

        {/* Stock badge */}
        {product.quantity <= 5 && product.quantity > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Only {product.quantity} left
          </div>
        )}
        {product.quantity === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-gray-500 font-semibold text-sm">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{product.category}</p>
        <h4 className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2 mb-2 group-hover:text-pink-600 transition-colors">
          {product.name}
        </h4>
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-gray-900">
            ₹{(product.price || 0).toLocaleString('en-IN')}
          </span>
          <button
            disabled={product.quantity === 0}
            className="text-xs bg-pink-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-pink-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
