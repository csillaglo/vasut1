import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Settings, Play, Pause, Gauge } from 'lucide-react';
import { useGameStore } from '../hooks/useGameStore';

export function GameControls() {
  const { gameSpeed, setGameSpeed } = useGameStore();
  const [showSpeedMenu, setShowSpeedMenu] = React.useState(false);
  
  const handleSpeedChange = (newSpeed: number) => {
    setGameSpeed(newSpeed);
    setShowSpeedMenu(false);
  };

  return (
    <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
      {/* Sebesség vezérlő */}
      <div className="relative">
        <button
          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
          className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          title={`Játék sebesség: ${gameSpeed === 0 ? 'Szünet' : gameSpeed + 'x'}`}
        >
          {gameSpeed === 0 ? (
            <Play className="w-5 h-5 text-green-600" />
          ) : (
            <div className="flex flex-col items-center">
              <Gauge className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-bold text-gray-600">{gameSpeed}x</span>
            </div>
          )}
        </button>
        
        {showSpeedMenu && (
          <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-lg border p-2 min-w-[120px]">
            <div className="space-y-1">
              <button
                onClick={() => handleSpeedChange(gameSpeed === 0 ? 1 : 0)}
                className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
                  gameSpeed === 0 ? 'bg-green-500 text-white' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {gameSpeed === 0 ? '▶️ Folytatás' : '⏸️ Szünet'}
              </button>
              
              <div className="border-t pt-1">
                <p className="text-xs text-gray-500 mb-1 px-1">Sebesség:</p>
                {[0.5, 1, 2, 4, 10].map(speed => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={`w-full px-3 py-1 rounded text-sm transition-colors ${
                      gameSpeed === speed ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {speed === 0.5 ? '🐌' : speed === 1 ? '🚶' : speed === 2 ? '🏃' : speed === 4 ? '🚀' : '⚡️'} {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Háttér kattintás bezáráshoz */}
        {showSpeedMenu && (
          <div 
            className="fixed inset-0 z-[-1]" 
            onClick={() => setShowSpeedMenu(false)}
          />
        )}
      </div>
      
      <button
        className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        title="Nagyítás"
      >
        <ZoomIn className="w-5 h-5 text-gray-600" />
      </button>
      
      <button
        className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        title="Kicsinyítés"
      >
        <ZoomOut className="w-5 h-5 text-gray-600" />
      </button>
      
      <button
        className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        title="Visszaállítás"
        onClick={() => window.location.reload()}
      >
        <RotateCcw className="w-5 h-5 text-gray-600" />
      </button>
      
      <button
        className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        title="Beállítások"
        onClick={() => alert('Beállítások hamarosan!')}
      >
        <Settings className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
}
