import React, { useState } from 'react';
import SellerCard from './SellerCard';

const STATE_EMOJIS = {
  'Tamil Nadu': '🏛️',
  'Rajasthan': '🏰',
  'Jammu & Kashmir': '❄️',
  'Gujarat': '🌊',
  'Bihar': '🎨',
  'West Bengal': '🌸',
  'Assam': '🍵',
  'Andhra Pradesh': '🎭',
  'Odisha': '⚓',
  'Other': '📍',
};

export default function StateAccordion({ state, stateName, sellers = [], defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const activeState = state || stateName || 'State';
  const emoji = STATE_EMOJIS[activeState] || '📍';

  return (
    <div
      id={`state-accordion-${activeState.replace(/\s+/g, '-').replace(/&/g, 'and')}`}
      className="mb-4 rounded-md overflow-hidden border border-[#eaeaec] bg-white shadow-xs"
    >
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-[#f5f5f6] hover:bg-[#eaeaea] transition-all duration-200 text-left cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{emoji}</span>
          <div>
            <h2 className="text-[#282c3f] font-black text-sm uppercase tracking-wider group-hover:text-[#ff3f6c] transition-colors">
              {activeState}
            </h2>
            <p className="text-[#7e818c] text-[11px] font-medium">
              {sellers.length} {sellers.length === 1 ? 'artisan brand' : 'artisan brands'} available
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#ff3f6c] font-bold uppercase tracking-wider hidden sm:block">
            {open ? 'Collapse' : 'Explore'}
          </span>
          <div className={`w-7 h-7 rounded-xs bg-white border border-[#d4d5d9] flex items-center justify-center transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
            <svg className="w-4 h-4 text-[#282c3f]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
      </button>

      {/* Sellers grid */}
      {open && (
        <div className="p-5 bg-white border-t border-[#eaeaec] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fadeIn">
          {sellers.map((seller, i) => (
            <SellerCard key={seller.sellerId} seller={seller} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
