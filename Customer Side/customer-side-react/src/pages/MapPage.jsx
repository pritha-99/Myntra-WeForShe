import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSellersGrouped } from '../api/client';
import IndiaMap from '../components/IndiaMap';

function FeaturedArtisanCard({ seller, onClick }) {
  // Use first image or placeholder
  const imageUrl = seller.image || '/placeholder-artisan.jpg';
  
  return (
    <div
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-lg transition-transform duration-300 hover:scale-105"
      style={{ height: '280px' }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${imageUrl})`,
          filter: 'brightness(0.7)',
        }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">
          {seller.brandName}
        </h3>
        <p className="text-white/80 text-sm mb-3">
          {seller.city}, {seller.state} · {seller.categoryTypes?.[0] || 'Artisan'}
        </p>
        
        {/* Quick info */}
        <div className="flex items-center gap-3 text-white/70 text-xs">
          <span>✓ Verified</span>
          {seller.categoryTypes?.includes('GI-Tagged') && (
            <span>🏷 GI-Tagged</span>
          )}
        </div>
      </div>

      {/* Hover indicator */}
      <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

export default function MapPage() {
  const navigate = useNavigate();
  const [grouped, setGrouped] = useState({});
  const [totalSellers, setTotalSellers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSellersGrouped()
      .then((data) => {
        setGrouped(data.grouped || {});
        setTotalSellers(data.totalSellers || 0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const statesWithSellers = Object.keys(grouped);
  
  // Get featured sellers (first 2 sellers from different states)
  const featuredSellers = [];
  for (const state of statesWithSellers) {
    if (featuredSellers.length >= 2) break;
    const sellers = grouped[state];
    if (sellers && sellers.length > 0) {
      featuredSellers.push(sellers[0]);
    }
  }

  function handleStateClick(stateName) {
    navigate(`/state/${encodeURIComponent(stateName)}`);
  }

  function handleFeaturedClick(seller) {
    navigate(`/storefront/${seller.sellerId}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
          <p className="text-sm">Loading artisan map…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-gray-700 font-semibold mb-1">Could not load artisan data</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-pink-950 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-600/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          {/* Back button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3">
              Made Across India
            </h1>
            <p className="text-white/70 text-base sm:text-lg max-w-2xl">
              Discover the makers behind the craft
            </p>
          </div>

          {/* Featured Artisan Cards */}
          {featuredSellers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
              {featuredSellers.map((seller) => (
                <FeaturedArtisanCard
                  key={seller.sellerId}
                  seller={seller}
                  onClick={() => handleFeaturedClick(seller)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Tap a state to explore its artisans
          </h2>
          <p className="text-gray-500">
            {statesWithSellers.length} states · {totalSellers} artisan brands
          </p>
        </div>

        {/* Interactive Map */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10">
          <IndiaMap
            statesWithSellers={statesWithSellers}
            onStateClick={handleStateClick}
          />
        </div>

        {/* Info cards below map */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-4">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Authentic Crafts</h3>
            <p className="text-sm text-gray-600">
              Every product is handmade by skilled artisans using traditional techniques passed down through generations.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Verified Artisans</h3>
            <p className="text-sm text-gray-600">
              All sellers are verified and onboarded through our rigorous process to ensure authenticity.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <span className="text-2xl">💚</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Support Local</h3>
            <p className="text-sm text-gray-600">
              Your purchase directly supports women artisans and helps preserve India's rich cultural heritage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
