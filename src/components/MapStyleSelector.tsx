import React from 'react';
import { Map, Satellite, Mountain, Globe } from 'lucide-react';
import { mapStyles } from './GameMap';

interface MapStyleSelectorProps {
  currentStyle: keyof typeof mapStyles;
  onStyleChange: (style: keyof typeof mapStyles) => void;
}

const styleIcons = {
  openstreetmap: Globe,
  cartodb_light: Map,
  cartodb_dark: Map,
  esri_satellite: Satellite,
  stamen_terrain: Mountain,
};

export function MapStyleSelector({ currentStyle, onStyleChange }: MapStyleSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000]">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors"
        >
          {React.createElement(styleIcons[currentStyle], { className: "w-4 h-4 text-gray-600" })}
          <span className="text-sm font-medium text-gray-700">
            {mapStyles[currentStyle].name}
          </span>
          <span className="text-gray-400">▼</span>
        </button>

        {isOpen && (
          <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-lg border min-w-[200px] overflow-hidden">
            {Object.entries(mapStyles).map(([key, style]) => {
              const Icon = styleIcons[key as keyof typeof styleIcons];
              const isActive = currentStyle === key;
              
              return (
                <button
                  key={key}
                  onClick={() => {
                    onStyleChange(key as keyof typeof mapStyles);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{style.name}</span>
                  {isActive && <span className="ml-auto text-blue-600">✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Háttér kattintás bezáráshoz */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
