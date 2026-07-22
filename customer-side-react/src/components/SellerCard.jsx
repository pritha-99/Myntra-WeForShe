import React from 'react';
import { useNavigate } from 'react-router-dom';

const CRAFT_COLORS = {
  'GI-Tagged': 'bg-amber-100 text-amber-800',
  'Meet the Maker': 'bg-purple-100 text-purple-800',
  'Dying Art': 'bg-red-100 text-red-700',
  'Freshly Onboarded': 'bg-green-100 text-green-700',
  'Textiles': 'bg-blue-100 text-blue-700',
  'Pottery': 'bg-orange-100 text-orange-700',
  'Woodwork': 'bg-yellow-100 text-yellow-700',
};

const SELLER_GRADIENTS = [
  'from-rose-400 to-pink-600',
  'from-fuchsia-400 to-purple-600',
  'from-amber-400 to-orange-500',
  'from-teal-400 to-cyan-600',
  'from-violet-400 to-indigo-600',
  'from-emerald-400 to-teal-600',
];

function getGradient(sellerId) {
  const idx = Math.abs(sellerId.charCodeAt(1) || 0) % SELLER_GRADIENTS.length;
  return SELLER_GRADIENTS[idx];
}

export default function SellerCard({ seller, index }) {
  const navigate = useNavigate();
  const gradient = getGradient(seller.sellerId || String(index));
  const initials = (seller.brandName || '??').slice(0, 2).toUpperCase();

  return (
    <div
      id={`seller-card-${seller.sellerId}`}
      onClick={() => navigate(`/storefront/${seller.sellerId}`)}
      className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden border border-gray-100"
    >
      {/* Top gradient avatar strip */}
      <div className={`h-2 w-full bg-gradient-to-r ${gradient}`} />

      <div className="p-5">
        {/* Avatar + Name row */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow`}>
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 text-sm leading-tight truncate group-hover:text-pink-600 transition-colors">
              {seller.brandName}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {seller.city || seller.state} · by {seller.founderName}
            </p>
          </div>
        </div>

        {/* USP */}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
          {seller.brandUsp}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(seller.categoryTypes || []).slice(0, 3).map((tag) => (
            <span
              key={tag}
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${CRAFT_COLORS[tag] || 'bg-gray-100 text-gray-600'}`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-[10px] text-gray-400 block">Starting from</span>
            <span className="text-base font-bold text-pink-600">
              ₹{(seller.avgSellingPrice || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <button className="text-xs bg-pink-50 text-pink-600 font-semibold px-3 py-1.5 rounded-lg group-hover:bg-pink-600 group-hover:text-white transition-all duration-200">
            Visit Store →
          </button>
        </div>
      </div>
    </div>
  );
}
