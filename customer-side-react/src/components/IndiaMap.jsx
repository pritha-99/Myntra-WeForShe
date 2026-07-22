import React, { useState } from 'react';

/**
 * IndiaMap - Interactive map of India with clickable state markers
 * Uses realistic India map image with single clickable point per state
 */

// State marker positions (x, y as percentages) - single point per state
const STATE_MARKERS = {
  'Jammu and Kashmir': { x: 34, y: 12 },
  'Himachal Pradesh': { x: 32, y: 18 },
  'Punjab': { x: 29, y: 21 },
  'Chandigarh': { x: 32, y: 22 },
  'Uttarakhand': { x: 38, y: 21 },
  'Haryana': { x: 34, y: 24 },
  'Delhi': { x: 36, y: 25 },
  'Rajasthan': { x: 28, y: 33 },
  'Uttar Pradesh': { x: 45, y: 30 },
  'Bihar': { x: 58, y: 33 },
  'Sikkim': { x: 62, y: 27 },
  'Arunachal Pradesh': { x: 72, y: 28 },
  'Nagaland': { x: 75, y: 34 },
  'Manipur': { x: 76, y: 39 },
  'Mizoram': { x: 73, y: 44 },
  'Tripura': { x: 70, y: 42 },
  'Meghalaya': { x: 68, y: 36 },
  'Assam': { x: 70, y: 33 },
  'West Bengal': { x: 64, y: 44 },
  'Jharkhand': { x: 58, y: 44 },
  'Odisha': { x: 56, y: 52 },
  'Chhattisgarh': { x: 50, y: 51 },
  'Madhya Pradesh': { x: 40, y: 45 },
  'Gujarat': { x: 22, y: 42 },
  'Maharashtra': { x: 34, y: 58 },
  'Goa': { x: 30, y: 62 },
  'Telangana': { x: 46, y: 59 },
  'Andhra Pradesh': { x: 48, y: 68 },
  'Karnataka': { x: 37, y: 68 },
  'Tamil Nadu': { x: 44, y: 79 },
  'Puducherry': { x: 46, y: 78 },
  'Kerala': { x: 33, y: 80 },
};

export default function IndiaMap({ statesWithSellers = [], onStateClick }) {
  const [hoveredState, setHoveredState] = useState(null);

  // Convert statesWithSellers to a Set for quick lookup
  const activeStates = new Set(statesWithSellers);

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Container with craft-inspired styling */}
      <div 
        className="relative w-full rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #FAF4EC, #F0E4CC)',
          border: '2px solid #EAE3D8',
        }}
      >
        <div className="p-4 sm:p-8">
          {/* Map container - realistic India map */}
          <div 
            className="relative w-full rounded-2xl overflow-hidden"
            style={{ 
              paddingBottom: '125%',
              background: 'linear-gradient(135deg, #E8F5F0, #D4E9E8)',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #C8D5D0',
            }}
          >
            {/* Realistic India map image */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center p-4">
              <img 
                src="/map.jpeg" 
                alt="India Map"
                className="max-w-full max-h-full object-contain"
                style={{ 
                  filter: 'contrast(1.05) brightness(0.98)',
                  opacity: 0.92,
                }}
              />
            </div>
            
            {/* Single clickable point markers per state */}
            {statesWithSellers.map((stateName) => {
              const marker = STATE_MARKERS[stateName];
              if (!marker) return null;
              
              const isHovered = hoveredState === stateName;
              const isActive = activeStates.has(stateName);

              return (
                <div
                  key={stateName}
                  className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                    isActive ? 'z-10' : 'z-0 opacity-0'
                  }`}
                  style={{
                    left: `${marker.x}%`,
                    top: `${marker.y}%`,
                  }}
                  onMouseEnter={() => setHoveredState(stateName)}
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={() => isActive && onStateClick(stateName)}
                >
                  {/* Outer glow ring on hover */}
                  {isHovered && (
                    <>
                      <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping"
                        style={{
                          width: '40px',
                          height: '40px',
                          background: 'rgba(196, 123, 46, 0.25)',
                          border: '2px solid rgba(196, 123, 46, 0.4)',
                        }}
                      />
                      <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{
                          width: '28px',
                          height: '28px',
                          background: 'rgba(196, 123, 46, 0.15)',
                          border: '1px solid rgba(196, 123, 46, 0.3)',
                        }}
                      />
                    </>
                  )}
                  
                  {/* Main marker dot - single clickable point */}
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      isHovered ? 'scale-125' : 'scale-100'
                    }`}
                    style={{
                      width: isHovered ? '22px' : '16px',
                      height: isHovered ? '22px' : '16px',
                      background: isHovered 
                        ? 'linear-gradient(135deg, #E08B38, #C47B2E)'
                        : 'linear-gradient(135deg, #C47B2E, #9B5E1A)',
                      boxShadow: isHovered
                        ? '0 0 0 4px rgba(196, 123, 46, 0.25), 0 4px 20px rgba(196, 123, 46, 0.7), inset 0 1px 3px rgba(255,255,255,0.4)'
                        : '0 2px 10px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255,255,255,0.3)',
                      border: isHovered ? '3px solid white' : '2.5px solid white',
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Hover tooltip */}
        {hoveredState && (
          <div 
            className="absolute top-8 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full shadow-2xl text-sm font-semibold whitespace-nowrap z-30 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(26, 18, 8, 0.95), rgba(50, 35, 15, 0.92))',
              color: '#F5E4C8',
              border: '1.5px solid rgba(245, 228, 200, 0.4)',
              backdropFilter: 'blur(8px)',
              letterSpacing: '0.4px',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            {hoveredState}
            <div 
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
              style={{ 
                background: 'linear-gradient(135deg, rgba(26, 18, 8, 0.95), rgba(50, 35, 15, 0.92))',
                border: '1.5px solid rgba(245, 228, 200, 0.4)',
                borderTop: 'none',
                borderLeft: 'none',
              }}
            />
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-5 flex items-center justify-center gap-3">
        <div 
          className="w-4 h-4 rounded-full relative"
          style={{
            background: 'linear-gradient(135deg, #C47B2E, #9B5E1A)',
            boxShadow: '0 2px 10px rgba(196, 123, 46, 0.5), inset 0 1px 2px rgba(255,255,255,0.3)',
            border: '2.5px solid white',
          }}
        />
        <span 
          className="text-sm font-semibold"
          style={{ color: '#7A6B52', letterSpacing: '0.3px' }}
        >
          Click a marker to explore artisans
        </span>
      </div>
    </div>
  );
}
