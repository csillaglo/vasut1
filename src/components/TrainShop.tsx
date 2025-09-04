import React from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { formatCurrency } from '../utils/calculations';
import { Train as TrainIcon, Package, ShoppingCart, X } from 'lucide-react';

interface TrainShopProps {
  isOpen: boolean;
  onClose: () => void;
}

const trainTypes = [
  {
    type: 'passenger' as const,
    name: 'Személyszállító vonat',
    price: 150000,
    speed: 60, // Reálisabb sebesség km/h-ban
    emoji: '🚂',
    description: 'Gyors személyszállítás állomások között'
  },
  {
    type: 'cargo' as const,
    name: 'Tehervonat',
    price: 200000,
    speed: 40, // Lassabb tehervonat
    emoji: '🚛',
    description: 'Nagy teherbírású áruszállítás'
  }
];

export function TrainShop({ isOpen, onClose }: TrainShopProps) {
  const { money, addTrain, buildings, trains } = useGameStore();

  const handleBuyTrain = (trainType: typeof trainTypes[0]) => {
    // Első állomás pozíciója, vagy alapértelmezett pozíció
    const firstStation = buildings.find(b => b.type === 'station');
    const startPosition: [number, number] = firstStation 
      ? firstStation.position 
      : [47.4979, 19.0402]; // Budapest

    addTrain({
      name: `${trainType.name} ${trains.length + 1}`,
      type: trainType.type,
      currentPosition: startPosition,
      currentRailway: null,
      progress: 0,
      direction: 'forward',
      speed: trainType.speed,
      status: 'idle',
      route: [],
      currentRouteIndex: 0,
      purchasePrice: trainType.price,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Vonat vásárlás</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm text-green-800">
            💰 Rendelkezésre álló pénz: <span className="font-bold">{formatCurrency(money)}</span>
          </div>
        </div>

        <div className="space-y-3">
          {trainTypes.map((trainType) => {
            const canAfford = money >= trainType.price;
            
            return (
              <div
                key={trainType.type}
                className={`border rounded-lg p-4 ${canAfford ? 'border-gray-200' : 'border-red-200 bg-red-50'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{trainType.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{trainType.name}</h3>
                    <p className="text-sm text-gray-600">{trainType.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-gray-600">
                    <p>⚡ Sebesség: {trainType.speed} km/h</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">
                      {formatCurrency(trainType.price)}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleBuyTrain(trainType)}
                  disabled={!canAfford}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    canAfford
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {canAfford ? '🛒 Megvásárlás' : '💸 Nincs elég pénz'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          💡 <strong>Tipp:</strong> A vonatok az első állomásnál jelennek meg. Legalább 2 állomás szükséges az útvonalhoz.
        </div>
      </div>
    </div>
  );
}
