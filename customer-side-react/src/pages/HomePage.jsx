import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StateAccordion from '../components/StateAccordion';
import IndiaMap from '../components/IndiaMap';
import { fetchSellersGrouped } from '../api/client';

function HeroBanner({ totalSellers, viewMode, onViewModeChange }) {
  return (
    <div className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-pink-950 overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-pink-600/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-rose-500/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="flex items-start justify-between">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-pink-600/20 border border-pink-500/30 text-pink-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" />
              Celebrating Women-Led Artisan Brands
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
              Crafts that carry{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">
                centuries
              </span>{' '}
              of stories
            </h1>

            <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
              Discover authentic handcrafted goods from{' '}
              <span className="text-pink-300 font-semibold">{totalSellers} artisan brands</span>{' '}
              across India — each piece a labour of love, tradition, and skill.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6">
              {[
                { label: 'Artisan Brands', value: totalSellers },
                { label: 'Indian States', value: '10+' },
                { label: 'Product Types', value: '50+' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-black text-pink-400">{stat.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* View Toggle */}
          <div className="hidden lg:flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm p-1.5 rounded-xl border border-gray-700/50">
            <button
              onClick={() => onViewModeChange('map')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'map'
                  ? 'bg-pink-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              🗺️ Map View
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-pink-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
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
    <div className="relative max-w-lg">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400">
          <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
        </svg>
      </div>
      <input
        id="seller-search-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search brands, states, crafts…"
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent shadow-sm placeholder-gray-400"
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

  // Filter sellers by search across all states
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
    <div className="min-h-screen bg-gray-50">
      <HeroBanner 
        totalSellers={totalSellers} 
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Mobile View Toggle */}
        <div className="lg:hidden flex items-center justify-center gap-2 bg-white p-1.5 rounded-xl border border-gray-200 mb-6 shadow-sm">
          <button
            onClick={() => setViewMode('map')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'map'
                ? 'bg-pink-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🗺️ Map
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-pink-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 List
          </button>
        </div>

        {/* Map View */}
        {viewMode === 'map' && (
          <div className="mb-10">
            {/* Map Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 mb-2">Made Across India</h2>
              <p className="text-gray-600">Click on a state to discover artisan brands</p>
            </div>

            {/* Interactive Map */}
            {!loading && !error && (
              <IndiaMap 
                statesWithSellers={states}
                onStateClick={(stateName) => navigate(`/state/${stateName}`)}
              />
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mb-4" />
                <p className="text-sm">Loading map…</p>
              </div>
            )}

            {error && (
              <div className="text-center py-24">
                <div className="text-5xl mb-4">⚠️</div>
                <p className="text-gray-700 font-semibold mb-1">Could not load map</p>
                <p className="text-gray-400 text-sm">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Explore by State</h2>
                {!loading && (
                  <p className="text-sm text-gray-400 mt-1">
                    {search ? `${totalVisible} brands match "${search}"` : `${states.length} states · ${totalSellers} brands`}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <SearchBar value={search} onChange={setSearch} />
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mb-4" />
                <p className="text-sm">Loading artisan brands…</p>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="text-center py-24">
                <div className="text-5xl mb-4">⚠️</div>
                <p className="text-gray-700 font-semibold mb-1">Could not connect to backend</p>
                <p className="text-gray-400 text-sm">{error}</p>
                <p className="text-gray-400 text-sm mt-2">Make sure the backend is running on <code className="bg-gray-100 px-1.5 py-0.5 rounded text-pink-600">localhost:4000</code></p>
              </div>
            )}

            {/* Empty search result */}
            {!loading && !error && states.length === 0 && (
              <div className="text-center py-24">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-600 font-semibold">No brands found for "{search}"</p>
                <p className="text-gray-400 text-sm mt-1">Try searching by state, craft, or brand name</p>
              </div>
            )}

            {/* State accordions */}
            {!loading && !error && states.map((state, i) => (
              <StateAccordion
                key={state}
                state={state}
                sellers={filteredGrouped[state]}
                defaultOpen={i === 0}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
