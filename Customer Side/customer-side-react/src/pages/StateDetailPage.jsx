import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSellersGrouped } from '../api/client';
import StoreStoryModal from '../components/StoreStoryModal';
import SellerCard from '../components/SellerCard';

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

  const filteredSellers =
    categoryFilter === 'All'
      ? sellers
      : sellers.filter((s) => s.categoryTypes?.includes(categoryFilter));

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-10 h-10 border-3 border-[#f5f5f6] border-t-[#ff3f6c] rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-[#7e818c] uppercase tracking-wider">Loading Regional Artisans…</p>
      </div>
    );
  }

  if (error || sellers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center bg-[#f5f5f6] border border-[#eaeaec] rounded-md p-8 max-w-md w-full">
          <div className="text-4xl mb-3">📍</div>
          <p className="text-sm font-bold text-[#282c3f] uppercase tracking-wider mb-2">
            {error || `No registered artisans found in ${decodedStateName}`}
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-5 py-2.5 bg-[#ff3f6c] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#e73961]"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <div className="bg-[#282c3f] text-white border-b border-[#eaeaec]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-[#94969f] font-semibold mb-4">
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Home</button>
            <span>/</span>
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Made Across India</button>
            <span>/</span>
            <span className="text-[#ff3f6c] font-bold">{decodedStateName}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black mb-2 uppercase tracking-wider">{decodedStateName}</h1>
          <p className="text-[#94969f] text-sm font-medium">
            {sellers.length} verified artisan brand{sellers.length !== 1 ? 's' : ''} preserving regional craft heritage
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filter Bar */}
        <div className="mb-8 pb-4 border-b border-[#eaeaec]">
          <div className="flex flex-wrap gap-2">
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-4 py-2 rounded-xs text-xs font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                  categoryFilter === category
                    ? 'bg-[#ff3f6c] text-white border-[#ff3f6c] shadow-xs'
                    : 'bg-white text-[#282c3f] border-[#d4d5d9] hover:border-[#ff3f6c] hover:text-[#ff3f6c]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#7e818c] font-semibold mt-3">
            Showing <span className="text-[#282c3f] font-bold">{filteredSellers.length}</span> artisan brands
          </p>
        </div>

        {/* Seller Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredSellers.map((seller, i) => (
            <SellerCard
              key={seller.sellerId}
              seller={seller}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Store Story Modal */}
      {selectedSeller && (
        <StoreStoryModal
          seller={selectedSeller}
          onClose={() => setSelectedSeller(null)}
          onViewCatalogue={() => {
            navigate(`/storefront/${selectedSeller.sellerId}`);
            setSelectedSeller(null);
          }}
        />
      )}
    </div>
  );
}
