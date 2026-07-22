import React from 'react';
import logoImg from '../assets/myntra_logo.png';

export default function MyntraLogo({ className = '', subtitle = null, height = 36 }) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <img
        src={logoImg}
        alt="Myntra Logo"
        style={{ height: height, width: 'auto', objectFit: 'contain' }}
        className="cursor-pointer"
      />
      {subtitle && (
        <span className="font-bold text-xs text-[var(--myntra-muted)] uppercase tracking-wider border-l border-[var(--myntra-border)] pl-3">
          {subtitle}
        </span>
      )}
    </div>
  );
}
