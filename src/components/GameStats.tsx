import React from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { Building2, Route, TrendingUp, Clock, DollarSign, Calculator, BarChart3, X } from 'lucide-react';
import { formatCurrency, formatDistance, calculatePathLength } from '../utils/calculations';
import { hasSavedGame, loadGame } from '../utils/storage';

export function GameStats() {
  const { buildings, railways, trains, money, totalSpent } = useGameStore();
  const [lastSaved, setLastSaved] = React.useState<string | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (hasSavedGame()) {
      const savedData = loadGame();
      if (savedData) {
        setLastSaved(new Date(savedData.savedAt).toLocaleString('hu-HU'));
      }
    }
  }, [buildings, railways]);

  const buildingStats = buildings.reduce((acc, building) => {
    acc[building.type] = (acc[building.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalConnections = railways.length;
  const avgBuildingLevel = buildings.length > 0 
    ? buildings.reduce((sum, b) => sum + b.level, 0) / buildings.length 
    : 0;

  const totalRailwayLength = railways.reduce((sum, railway) => sum + railway.length, 0);
  const totalRailwayCost = railways.reduce((sum, railway) => sum + railway.cost, 0);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors"
        title="Statisztikák megjelenítése"
      >
        <BarChart3 className="w-5 h-5 text-gray-600" />
      </button>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4 min-w-[250px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-600" />
        <h2 className="font-bold text-gray-800">Statisztikák</h2>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Statisztikák elrejtése"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
            <Building2 className="w-4 h-4" />
            Épületek
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span>🚂 Állomások:</span>
              <span className="font-medium">{buildingStats.station || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>🏭 Gyárak:</span>
              <span className="font-medium">{buildingStats.factory || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>📦 Raktárak:</span>
              <span className="font-medium">{buildingStats.warehouse || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>🏙️ Városok:</span>
              <span className="font-medium">{buildingStats.city || 0}</span>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-3">
          <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
            <Route className="w-4 h-4" />
            Hálózat
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Vasútvonalak:</span>
              <span className="font-medium">{totalConnections}</span>
            </div>
            <div className="flex justify-between">
              <span>Vonatok:</span>
              <span className="font-medium">{trains.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Átlag szint:</span>
              <span className="font-medium">{avgBuildingLevel.toFixed(1)}</span>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-3">
          <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            Pénzügyek
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Rendelkezésre álló:</span>
              <span className="font-medium text-green-600">{formatCurrency(money)}</span>
            </div>
            <div className="flex justify-between">
              <span>Összesen költött:</span>
              <span className="font-medium text-red-600">{formatCurrency(totalSpent)}</span>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-3">
          <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
            <Calculator className="w-4 h-4" />
            Vasúthálózat
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Összes hossz:</span>
              <span className="font-medium">{formatDistance(totalRailwayLength)}</span>
            </div>
            <div className="flex justify-between">
              <span>Vasút költség:</span>
              <span className="font-medium">{formatCurrency(totalRailwayCost)}</span>
            </div>
          </div>
        </div>
        
        {lastSaved && (
          <div className="border-t pt-3">
            <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Mentés
            </h3>
            <div className="text-xs text-gray-500">
              <p>Utolsó mentés: {lastSaved}</p>
            </div>
          </div>
        )}
        
        <div className="border-t pt-3">
          <div className="text-xs text-gray-500 space-y-1">
            <p>💡 <strong>Építés:</strong> Válasszon eszközt → kattintás térképre</p>
            <p>🚂 <strong>Vonatok:</strong> Vonat gomb → vásárlás → indítás állomások között</p>
            <p>💰 <strong>Költségek:</strong> Állomás 25k, Gyár 40k, Raktár 30k, Város 60k</p>
            <p>🚂 <strong>Vasút:</strong> 40-50k Ft/km (típustól függően)</p>
            <p>🔗 <strong>Vasút:</strong> Vasút eszköz → épület → másik épület</p>
            <p>🔀 <strong>Elágazás:</strong> Vasút eszköz → meglévő sínre kattintás</p>
            <p>⌨️ <strong>Gyorsbillentyűk:</strong> 1-6 számok, ESC = mégse</p>
            <p>💾 <strong>Mentés:</strong> Automatikus localStorage mentés</p>
          </div>
        </div>
      </div>
    </div>
  );
}
