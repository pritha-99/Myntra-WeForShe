import React, { useState } from 'react';
import { INDIA_MAP_PATHS } from './indiaMapPaths';

/**
 * IndiaMap - Interactive SVG map of India with clickable states
 * Uses embedded SVG paths with hover effects and state selection
 */
export default function IndiaMap({ statesWithSellers = [], onStateClick }) {
  const [hoveredState, setHoveredState] = useState(null);

  // Convert statesWithSellers to a Set for fast O(1) lookup
  const activeStates = new Set(statesWithSellers);

  const handleStateClick = (stateName) => {
    if (activeStates.has(stateName) && onStateClick) {
      onStateClick(stateName);
    }
  };

  const handleStateHover = (stateName) => {
    if (activeStates.has(stateName)) {
      setHoveredState(stateName);
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      <div 
        className="relative w-full rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #FAF4EC, #F0E4CC)',
          border: '2px solid #EAE3D8',
        }}
      >
        <div className="p-4 sm:p-8">
          <div className="relative w-full">
            <svg
              viewBox="230.87 -0.07 655.6 719.36"
              className="w-full h-auto"
              style={{ maxHeight: '70vh' }}
            >
              <style>{`
                .state-path {
                  fill: #b19469;
                  stroke: #2d2d2d;
                  stroke-width: 0.5;
                  transition: all 0.3s ease;
                  cursor: pointer;
                }
                .state-path.inactive {
                  fill: #d4c5a9;
                  opacity: 0.5;
                  cursor: not-allowed;
                }
                .state-path.active {
                  fill: #E5AA70;
                  stroke: #9B5E1A;
                  stroke-width: 1;
                }
                .state-path.active:hover {
                  fill: #C47B2E;
                  stroke: #9B5E1A;
                  stroke-width: 1.5;
                  filter: drop-shadow(0 4px 12px rgba(196, 123, 46, 0.6));
                }
                .state-path.hovered {
                  fill: #E08B38;
                  stroke: #C47B2E;
                  stroke-width: 2;
                  filter: drop-shadow(0 6px 16px rgba(224, 139, 56, 0.8));
                }
              `}</style>
              <g id="polygons">
                {Object.entries(INDIA_MAP_PATHS).map(([stateName, pathData]) => {
                  const isActive = activeStates.has(stateName);
                  const isHovered = hoveredState === stateName;
                  return (
                    <path
                      key={stateName}
                      d={pathData}
                      className={`state-path ${isActive ? 'active' : 'inactive'} ${isHovered ? 'hovered' : ''}`}
                      onClick={() => handleStateClick(stateName)}
                      onMouseEnter={() => handleStateHover(stateName)}
                      onMouseLeave={() => setHoveredState(null)}
                    >
                      <title>{stateName}{isActive ? ' (Artisans Available)' : ''}</title>
                    </path>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
