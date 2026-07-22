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

export default function StateAccordion({ state, sellers, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const emoji = STATE_EMOJIS[state] || '📍';

  return (
    <div
      id={`state-accordion-${state.replace(/\s+/g, '-').replace(/&/g, 'and')}`}
      className="mb-4 rounded-2xl overflow-hidden shadow-sm border border-gray-100"
    >
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-pink-900 hover:to-gray-900 transition-all duration-300 text-left group"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <div>
            <h2 className="text-white font-bold text-base tracking-wide">{state}</h2>
            <p className="text-gray-400 text-xs mt-0.5">
              {sellers.length} {sellers.length === 1 ? 'artisan brand' : 'artisan brands'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-pink-400 font-medium hidden sm:block group-hover:text-pink-300">
            {open ? 'Collapse' : 'Explore'}
          </span>
          <div className={`w-7 h-7 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-300">
              <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </button>

      {/* Sellers grid */}
      <div
        className={`bg-gray-50 transition-all duration-500 ease-in-out overflow-hidden`}
        style={{ maxHeight: open ? `${sellers.length * 400}px` : '0px' }}
      >
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sellers.map((seller, i) => (
            <SellerCard key={seller.sellerId} seller={seller} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
