import React from 'react';
import logoImg from '../assets/myntra_logo.png';

export default function MyntraLogo({ className = '', size = 'normal' }) {
  const logoHeights = {
    small: 'h-7',
    normal: 'h-9',
    large: 'h-11',
  };

  return (
    <div className={`flex items-center select-none ${className}`}>
      <img
        src={logoImg}
        alt="Myntra Logo"
        className={`${logoHeights[size] || logoHeights.normal} w-auto object-contain cursor-pointer`}
      />
    </div>
  );
}
