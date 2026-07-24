import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { INDIA_MAP_PATHS } from './indiaMapPaths';

export default function IndiaMap({ statesWithSellers = [], groupedSellers, onStateClick }) {
  const navigate = useNavigate();
  const [hoveredState, setHoveredState] = useState(null);

  const activeStatesList = groupedSellers ? Object.keys(groupedSellers) : statesWithSellers;
  const activeStates = new Set(activeStatesList);

  const handleStateClick = (stateName) => {
    if (onStateClick) {
      onStateClick(stateName);
    } else {
      navigate(`/state/${encodeURIComponent(stateName)}`);
    }
  };

  const handleStateHover = (stateName) => {
    setHoveredState(stateName);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div 
        className="relative w-full rounded-md overflow-hidden bg-white border border-[#eaeaec] shadow-xs p-4 sm:p-6"
      >
        {/* Tooltip header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#eaeaec]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff3f6c] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#282c3f]">
              {hoveredState ? hoveredState : 'Hover over a state to view details'}
            </span>
          </div>
          {hoveredState && activeStates.has(hoveredState) && (
            <span className="text-xs font-bold text-[#ff3f6c] bg-[#ff3f6c]/10 px-2.5 py-0.5 rounded-xs border border-[#ff3f6c]/20 uppercase">
              {groupedSellers?.[hoveredState]?.length || 1} Artisan Brand(s) Available
            </span>
          )}
        </div>

        <div className="relative w-full">
          <svg
            viewBox="230.87 -0.07 655.6 719.36"
            className="w-full h-auto"
            style={{ maxHeight: '65vh' }}
          >
            <style>{`
              .state-path {
                fill: #f5f5f6;
                stroke: #d4d5d9;
                stroke-width: 0.75;
                transition: all 0.25s ease;
                cursor: pointer;
              }
              .state-path.active {
                fill: #ff3f6c;
                stroke: #ffffff;
                stroke-width: 1;
              }
              .state-path.active:hover {
                fill: #e73961;
                stroke: #282c3f;
                stroke-width: 1.5;
                filter: drop-shadow(0 4px 10px rgba(255, 63, 108, 0.4));
              }
              .state-path.inactive:hover {
                fill: #eaeaec;
                stroke: #7e818c;
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
                    <title>{stateName}{isActive ? ' (Click to view brands)' : ''}</title>
                  </path>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-[#eaeaec] text-xs font-bold text-[#535766]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#ff3f6c]" />
            <span>Active Artisan Hub</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#f5f5f6] border border-[#d4d5d9]" />
            <span>Upcoming Region</span>
          </div>
        </div>
      </div>
    </div>
  );
}
