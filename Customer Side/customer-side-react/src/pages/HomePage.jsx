import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StateAccordion from '../components/StateAccordion';
import IndiaMap from '../components/IndiaMap';
import { fetchSellersGrouped } from '../api/client';

function HeroBanner({ totalSellers, viewMode, onViewModeChange }) {
  return (
    <div className="relative bg-gradient-to-r from-[#282c3f] via-[#1a1c29] to-[#282c3f] text-white overflow-hidden border-b border-[#eaeaec]">
      {/* Decorative gradient accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff3f6c]/15 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#ff905a]/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#ff3f6c]/20 border border-[#ff3f6c]/40 text-[#ff3f6c] text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 bg-[#ff3f6c] rounded-full animate-pulse" />
              MYNTRA · MADE ACROSS INDIA
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-3 tracking-tight">
              Handcrafted Heritage by{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff3f6c] to-[#ff905a]">
                Women Artisans
              </span>
            </h1>

            <p className="text-[#94969f] text-sm sm:text-base leading-relaxed mb-6 max-w-xl font-medium">
              Discover authentic regional crafts from{' '}
              <span className="text-white font-bold">{totalSellers} verified artisan brands</span>{' '}
              across India — celebrating culture, empowerment, and exquisite craftsmanship.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-8 pt-2">
              {[
                { label: 'Artisan Brands', value: totalSellers },
                { label: 'States Covered', value: '10+' },
                { label: 'Product Crafts', value: '50+' },
              ].map((stat) => (
                <div key={stat.label} className="text-left">
                  <div className="text-2xl font-black text-[#ff3f6c]">{stat.value}</div>
                  <div className="text-[11px] text-[#94969f] uppercase font-bold tracking-wider mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-md border border-white/15">
            <button
              onClick={() => onViewModeChange('map')}
              className={`px-4 py-2 rounded-xs text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-[#ff3f6c] text-white shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              🗺️ Map View
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`px-4 py-2 rounded-xs text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#ff3f6c] text-white shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              📋 List View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchBar({ value, onChange }) {
  return (
    <div className="relative max-w-md w-full">
      <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[#7e818c]">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        id="seller-search-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search brands, states, crafts…"
        className="w-full pl-10 pr-4 py-2.5 bg-[#f5f5f6] border border-[#eaeaec] rounded-md text-xs font-medium text-[#282c3f] focus:outline-none focus:border-[#ff3f6c] focus:bg-white transition-all placeholder-[#94969f]"
      />
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [grouped, setGrouped] = useState({});
  const [totalSellers, setTotalSellers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'

  useEffect(() => {
    fetchSellersGrouped()
      .then((data) => {
        setGrouped(data.grouped || {});
        setTotalSellers(data.totalSellers || 0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredGrouped = React.useMemo(() => {
    if (!search.trim()) return grouped;
    const q = search.toLowerCase();
    const result = {};
    for (const [state, sellers] of Object.entries(grouped)) {
      const matches = sellers.filter(
        (s) =>
          s.brandName?.toLowerCase().includes(q) ||
          s.brandUsp?.toLowerCase().includes(q) ||
          s.city?.toLowerCase().includes(q) ||
          (s.categoryTypes || []).some((t) => t.toLowerCase().includes(q)) ||
          state.toLowerCase().includes(q)
      );
      if (matches.length) result[state] = matches;
    }
    return result;
  }, [grouped, search]);

  const states = Object.keys(filteredGrouped).sort();
  const totalVisible = states.reduce((acc, s) => acc + filteredGrouped[s].length, 0);

  return (
    <div className="min-h-screen bg-white">
      <HeroBanner 
        totalSellers={totalSellers} 
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Controls bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#eaeaec]">
          <SearchBar value={search} onChange={setSearch} />

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#535766]">
              Showing <span className="text-[#282c3f] font-black">{totalVisible}</span> brands across <span className="text-[#282c3f] font-black">{states.length}</span> states
            </span>

            {/* Mobile View Toggle */}
            <div className="flex lg:hidden items-center gap-1 bg-[#f5f5f6] p-1 rounded-md border border-[#eaeaec]">
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-xs text-[11px] font-bold uppercase transition-all ${
                  viewMode === 'map' ? 'bg-[#ff3f6c] text-white' : 'text-[#535766]'
                }`}
              >
                Map
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-xs text-[11px] font-bold uppercase transition-all ${
                  viewMode === 'list' ? 'bg-[#ff3f6c] text-white' : 'text-[#535766]'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-[#f5f5f6] border-t-[#ff3f6c] rounded-full animate-spin mb-4" />
            <p className="text-xs font-bold text-[#7e818c] uppercase tracking-wider">Loading Artisan Brands…</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-[#ff3f6c]/5 border border-[#ff3f6c]/20 rounded-md p-6 text-center max-w-md mx-auto my-10">
            <p className="text-xs font-bold text-[#ff3f6c] mb-2 uppercase tracking-wider">Unable to load brands</p>
            <p className="text-xs text-[#535766] mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs bg-[#ff3f6c] text-white px-4 py-2 rounded-xs font-bold uppercase tracking-wider hover:bg-[#e73961]"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Content Area */}
        {!loading && !error && (
          <div>
            {viewMode === 'map' ? (
              <div className="space-y-8">
                <div className="bg-[#f5f5f6] rounded-md p-4 sm:p-6 border border-[#eaeaec]">
                  <div className="text-center mb-6">
                    <h2 className="text-lg font-black text-[#282c3f] uppercase tracking-wider mb-1">
                      Interactive Craft Map of India
                    </h2>
                    <p className="text-xs text-[#535766]">
                      Click any state to explore regional weavers, artisans, and women-led enterprises.
                    </p>
                  </div>
                  <IndiaMap groupedSellers={filteredGrouped} />
                </div>

                {/* State Accordion section below map */}
                <div className="mt-12">
                  <h3 className="text-base font-black text-[#282c3f] uppercase tracking-wider mb-4">
                    Explore All Regional Clusters
                  </h3>
                  <div className="space-y-3">
                    {states.map((state) => (
                      <StateAccordion
                        key={state}
                        stateName={state}
                        sellers={filteredGrouped[state]}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {states.map((state) => (
                  <StateAccordion
                    key={state}
                    stateName={state}
                    sellers={filteredGrouped[state]}
                    defaultOpen={search.length > 0}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
