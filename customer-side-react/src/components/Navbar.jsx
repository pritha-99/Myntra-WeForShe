import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MyntraLogo from './MyntraLogo';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#eaeaec] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo */}
        <button
          id="navbar-logo"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 cursor-pointer focus:outline-none"
        >
          <MyntraLogo size="normal" />
        </button>

        {/* Navigation Category Links (Myntra uppercase bold font) */}
        <nav className="hidden lg:flex items-center gap-7 text-[13px] font-bold text-[#282c3f] uppercase tracking-wider">
          <button onClick={() => navigate('/')} className="hover:text-[#ff3f6c] transition-colors py-5 border-b-2 border-transparent hover:border-[#ff3f6c] cursor-pointer">
            WOMEN
          </button>
          <button onClick={() => navigate('/')} className="hover:text-[#ff3f6c] transition-colors py-5 border-b-2 border-transparent hover:border-[#ff3f6c] cursor-pointer">
            MEN
          </button>
          <button onClick={() => navigate('/')} className="hover:text-[#ff3f6c] transition-colors py-5 border-b-2 border-transparent hover:border-[#ff3f6c] cursor-pointer">
            ARTISANS & BRANDS
          </button>
          <button onClick={() => navigate('/')} className="hover:text-[#ff3f6c] transition-colors py-5 border-b-2 border-transparent hover:border-[#ff3f6c] cursor-pointer">
            BEAUTY
          </button>
          <div className="flex items-center gap-1 cursor-pointer hover:text-[#ff3f6c] transition-colors py-5">
            <span>STUDIO</span>
            <span className="bg-[#ff3f6c] text-white text-[9px] font-black px-1.5 py-0.5 rounded-xs tracking-normal leading-none">
              NEW
            </span>
          </div>
        </nav>

        {/* Search Bar matching Myntra.png */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7e818c]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search for products, brands and more"
              className="w-full bg-[#f5f5f6] text-[#282c3f] text-xs font-medium pl-10 pr-4 py-2.5 rounded-md border border-transparent focus:border-[#d4d5d9] focus:bg-white focus:outline-none transition-all placeholder-[#94969f]"
            />
          </div>
        </div>

        {/* Right Header Action Icons */}
        <div className="flex items-center gap-6 text-[#282c3f]">
          {!isHome && (
            <button
              id="navbar-back-btn"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#ff3f6c] hover:text-[#e73961] transition-colors cursor-pointer mr-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back</span>
            </button>
          )}

          {/* Profile */}
          <button className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-[#ff3f6c] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <span className="text-[11px] font-bold">Profile</span>
          </button>

          {/* Wishlist */}
          <button className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-[#ff3f6c] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <span className="text-[11px] font-bold">Wishlist</span>
          </button>

          {/* Bag */}
          <button className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-[#ff3f6c] transition-colors relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <span className="text-[11px] font-bold">Bag</span>
          </button>
        </div>

      </div>
    </header>
  );
}
