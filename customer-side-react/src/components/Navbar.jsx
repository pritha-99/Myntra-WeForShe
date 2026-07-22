import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <button
          id="navbar-logo"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 group"
        >
          <div className="w-7 h-7 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-black">M</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-gray-900 font-black text-sm tracking-tight">MYNTRA</span>
            <span className="text-pink-500 font-semibold text-[9px] tracking-widest">WE FOR SHE</span>
          </div>
        </button>

        {/* Center tag */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 bg-pink-50 px-3 py-1.5 rounded-full border border-pink-100">
          <span className="text-pink-500">✦</span>
          <span>Artisan Brands across India</span>
          <span className="text-pink-500">✦</span>
        </div>

        {/* Back button on inner pages */}
        {!isHome && (
          <button
            id="navbar-back-btn"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-gray-600 font-medium hover:text-pink-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
            </svg>
            All Brands
          </button>
        )}

        {isHome && (
          <div className="text-xs text-gray-400 font-medium hidden sm:block">
            Discover · Support · Celebrate
          </div>
        )}
      </div>
    </nav>
  );
}
