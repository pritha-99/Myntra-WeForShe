import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSellersGrouped } from '../api/client';
import StoreStoryModal from '../components/StoreStoryModal';

function ArtisanCard({ seller, onClick }) {
  const initials = (seller.brandName || '??').slice(0, 2).toUpperCase();
  
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-pink-200"
    >
      {/* Header with icon */}
      <div className="p-5 pb-3">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-white font-black text-lg">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base mb-0.5 line-clamp-1">
              {seller.brandName}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-1">
              By {seller.founderName}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-4">
        <p className="text-sm text-gray-600 line-clamp-2 mb-3 min-h-[40px]">
          {seller.brandUsp}
        </p>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
            ✓ Verified
          </span>
          {seller.categoryTypes?.includes('GI-Tagged') && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              🏷 GI
            </span>
          )}
          {seller.ecoTags?.some(tag => tag.toLowerCase().includes('handmade')) && (
            <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              ✋ Handmade
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            📍 {seller.city}
          </span>
          <button className="text-sm font-medium text-pink-600 hover:text-pink-700 flex items-center gap-1">
            Story
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StateDetailPage() {
  const { stateName } = useParams();
  const navigate = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedSeller, setSelectedSeller] = useState(null);

  const decodedStateName = decodeURIComponent(stateName);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchSellersGrouped()
      .then((data) => {
        const stateSellerList = data.grouped?.[decodedStateName] || [];
        setSellers(stateSellerList);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [decodedStateName]);

  // Get all unique categories from sellers
  const allCategories = ['All'];
  const categorySet = new Set();
  sellers.forEach((seller) => {
    seller.categoryTypes?.forEach((cat) => {
      if (cat && !['GI-Tagged', 'Dying Art', 'Freshly Onboarded', 'Meet the Maker'].includes(cat)) {
        categorySet.add(cat);
      }
    });
  });
  allCategories.push(...Array.from(categorySet).sort());

  // Filter sellers by category
  const filteredSellers =
    categoryFilter === 'All'
      ? sellers
      : sellers.filter((s) => s.categoryTypes?.includes(categoryFilter));

  function handleSellerClick(seller) {
    setSelectedSeller(seller);
  }

  function closeModal() {
    setSelectedSeller(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
          <p className="text-sm">Loading artisans…</p>
        </div>
      </div>
    );
  }

  if (error || sellers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <p className="text-gray-700 font-semibold mb-1">
            {error || `No artisans found in ${decodedStateName}`}
          </p>
          <button
            onClick={() => navigate('/map')}
            className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            Back to Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-900 via-orange-900 to-amber-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Back button */}
          <button
            onClick={() => navigate('/map')}
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Map
          </button>

          <h1 className="text-3xl sm:text-4xl font-black mb-2">{decodedStateName}</h1>
          <p className="text-white/80 text-lg">
            {sellers.length} artisan{sellers.length !== 1 ? 's' : ''} · {categorySet.size > 0 ? `${categorySet.size} categories` : 'Traditional crafts'}
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Category filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-5 py-2 rounded-full text-sm font-medium border transition-all ${
                  categoryFilter === category
                    ? 'bg-pink-600 text-white border-pink-600 shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-pink-400 hover:text-pink-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Showing {filteredSellers.length} {filteredSellers.length === 1 ? 'artisan' : 'artisans'}
            {categoryFilter !== 'All' && ` in "${categoryFilter}"`}
          </p>
        </div>

        {/* Artisan cards grid */}
        {filteredSellers.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-600 font-semibold">No artisans found in this category</p>
            <p className="text-gray-400 text-sm mt-1">Try selecting a different category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredSellers.map((seller) => (
              <ArtisanCard
                key={seller.sellerId}
                seller={seller}
                onClick={() => handleSellerClick(seller)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Store Story Modal */}
      {selectedSeller && (
        <StoreStoryModal
          seller={selectedSeller}
          onClose={closeModal}
          onViewCatalogue={() => {
            navigate(`/storefront/${selectedSeller.sellerId}`);
            closeModal();
          }}
        />
      )}
    </div>
  );
}
