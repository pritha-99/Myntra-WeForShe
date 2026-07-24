import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StoreStoryModal from './StoreStoryModal';

const CRAFT_BADGES = {
  'GI-Tagged': 'bg-[#03a685]/10 text-[#03a685] border-[#03a685]/20',
  'Meet the Maker': 'bg-[#ff3f6c]/10 text-[#ff3f6c] border-[#ff3f6c]/20',
  'Dying Art': 'bg-[#ff905a]/10 text-[#ff905a] border-[#ff905a]/20',
  'Freshly Onboarded': 'bg-[#03a685]/10 text-[#03a685] border-[#03a685]/20',
};

export default function SellerCard({ seller, index }) {
  const navigate = useNavigate();
  const [showStoryModal, setShowStoryModal] = useState(false);
  const initials = (seller.brandName || '??').slice(0, 2).toUpperCase();

  const handleOpenStory = (e) => {
    e.stopPropagation();
    setShowStoryModal(true);
  };

  return (
    <>
      <div
        id={`seller-card-${seller.sellerId}`}
        onClick={handleOpenStory}
        className="group bg-white rounded-md transition-all duration-300 hover:shadow-md cursor-pointer overflow-hidden border border-[#eaeaec] flex flex-col justify-between"
      >
        {/* Top Brand Banner Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#ff3f6c] via-[#ff905a] to-[#ff3f6c]" />

        <div className="p-4 flex flex-col justify-between flex-1">
          <div>
            {/* Avatar + Brand Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xs bg-[#f5f5f6] border border-[#eaeaec] flex items-center justify-center text-[#ff3f6c] font-black text-sm flex-shrink-0 shadow-xs">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h3 className="font-bold text-[#282c3f] text-sm truncate group-hover:text-[#ff3f6c] transition-colors">
                    {seller.brandName}
                  </h3>
                  <span className="text-[#03a685] text-xs font-bold" title="Verified Artisan">✓</span>
                </div>
                <p className="text-[11px] text-[#7e818c] font-medium truncate mt-0.5">
                  {seller.city || seller.state} · by {seller.founderName}
                </p>
              </div>
            </div>

            {/* USP */}
            <p className="text-xs text-[#535766] leading-relaxed line-clamp-2 mb-3">
              {seller.brandUsp}
            </p>

            {/* Craft Badges */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {(seller.categoryTypes || []).slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-xs border ${CRAFT_BADGES[tag] || 'bg-[#f5f5f6] text-[#535766] border-[#eaeaec]'}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between pt-3 border-t border-[#eaeaec] mt-2">
            <div>
              <span className="text-[10px] text-[#7e818c] uppercase font-bold tracking-wider block">From</span>
              <span className="text-sm font-bold text-[#282c3f]">
                ₹{(seller.avgSellingPrice || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <button
              onClick={handleOpenStory}
              className="text-xs bg-[#f5f5f6] text-[#282c3f] font-bold px-3.5 py-1.5 rounded-xs border border-[#d4d5d9] group-hover:bg-[#ff3f6c] group-hover:text-white group-hover:border-[#ff3f6c] transition-all duration-200 uppercase tracking-wider cursor-pointer"
            >
              Visit Store
            </button>
          </div>
        </div>
      </div>

      {/* Story Slideshow Modal when Visit Store is clicked */}
      {showStoryModal && (
        <StoreStoryModal
          seller={seller}
          onClose={() => setShowStoryModal(false)}
          onViewCatalogue={() => {
            setShowStoryModal(false);
            navigate(`/storefront/${seller.sellerId}`);
          }}
        />
      )}
    </>
  );
}
