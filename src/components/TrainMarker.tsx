import React from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import { Train } from '../types/game';
import { useGameStore } from '../hooks/useGameStore';
import { formatCurrency } from '../utils/calculations';
import { validateRoute } from '../utils/trainMovement';
import L from 'leaflet';

interface TrainMarkerProps {
  train: Train;
}

const getTrainIcon = (type: Train['type'], status: Train['status'], direction: Train['direction']) => {
  let trainIcon = type === 'passenger' ? '🚂' : '🚛';
  
  const statusColor = 
    status === 'moving' ? 'bg-green-500' :
    status === 'loading' ? 'bg-yellow-500' :
    status === 'paused' ? 'bg-orange-500' : 'bg-gray-500';
    
  const borderColor = 
    status === 'moving' ? 'border-green-400' :
    status === 'loading' ? 'border-yellow-400' :
    status === 'paused' ? 'border-orange-400' : 'border-gray-400';
    
  const pulseClass = status === 'moving' ? 'animate-pulse' : '';
  const directionArrow = direction === 'forward' ? '→' : '←';

  return L.divIcon({
    html: `
      <div class="w-8 h-8 ${statusColor} ${borderColor} border-2 rounded-full flex items-center justify-center text-white shadow-lg transform transition-all hover:scale-110 cursor-pointer ${pulseClass} relative">
        <span class="text-sm">${trainIcon}</span>
        <span class="text-xs font-bold absolute -bottom-0.5 -right-0.5 bg-white text-gray-800 rounded-full w-3 h-3 flex items-center justify-center shadow text-xs">${directionArrow}</span>
      </div>
    `,
    className: 'custom-train-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export function TrainMarker({ train }: TrainMarkerProps) {
  const {
    removeTrain,
    startTrain,
    pauseTrain,
    resumeTrain,
    abortTrain,
    buildings,
    junctions,
    railways,
    startRoutePlanning
  } = useGameStore();
  const map = useMap();

  const icon = React.useMemo(() => {
    return getTrainIcon(train.type, train.status, train.direction);
  }, [train.type, train.status, train.direction]);

  const handleQuickStart = () => {
    const stations = buildings.filter(b => b.type === 'station');
    if (stations.length < 2) {
      alert('Legalább 2 állomás szükséges a gyors indításhoz!');
      return;
    }
    
    const route = [stations[0].id, stations[1].id];

    if (validateRoute(route, railways, buildings, junctions)) {
      try {
        startTrain(train.id, route);
        map.closePopup();
      } catch (error) {
        console.error('Error starting train:', error);
        alert('Hiba történt a vonat indításakor!');
      }
    } else {
      alert('Az útvonal nem érvényes! Ellenőrizze, hogy az első két állomás össze van-e kötve vasútvonallal.');
    }
  };

  const handlePlanRoute = () => {
    startRoutePlanning(train.id);
    map.closePopup();
  };

  const handlePause = () => {
    pauseTrain(train.id);
    map.closePopup();
  };

  const handleResume = () => {
    resumeTrain(train.id);
    map.closePopup();
  };

  const handleAbort = () => {
    abortTrain(train.id);
    map.closePopup();
  };

  const getStopName = (stopId: string) => {
    const building = buildings.find(b => b.id === stopId);
    const junction = junctions.find(j => j.id === stopId);
    return building?.name || junction?.name || 'Ismeretlen';
  };

  return (
    <Marker
      position={train.currentPosition}
      icon={icon}
      eventHandlers={{
        popupopen: (e) => {
          const popupContent = e.popup.getElement();
          if (popupContent) {
            // Prevent clicks inside the popup from closing it
            L.DomEvent.disableClickPropagation(popupContent);
            L.DomEvent.disableScrollPropagation(popupContent);
          }
        },
      }}
    >
      <Popup>
        <div className="p-2 max-w-[240px] text-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{train.type === 'passenger' ? '🚂' : '🚛'}</span>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">{train.name}</h3>
              <p className="text-gray-500">
                {train.type === 'passenger' ? 'Személyszállító' : 'Tehervonat'}
              </p>
            </div>
          </div>
          
          <div className={`p-2 rounded-md mb-2 text-xs ${
            train.status === 'moving' ? 'bg-green-50 border border-green-200' :
            train.status === 'loading' ? 'bg-yellow-50 border border-yellow-200' :
            train.status === 'paused' ? 'bg-orange-50 border border-orange-200' :
            'bg-gray-50 border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold">
                {train.status === 'moving' ? '🟢 Mozgásban' :
                 train.status === 'loading' ? '🟡 Rakodás' :
                 train.status === 'paused' ? '⏸️ Megállítva' : '🔴 Várakozik'}
              </span>
              <span className="font-bold">
                {train.speed} km/h
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-1 text-gray-600">
              <div>
                <span className="font-medium">Irány:</span>
                <span className="ml-1">{train.direction === 'forward' ? '→' : '←'}</span>
              </div>
              <div>
                <span className="font-medium">Ár:</span>
                <span className="ml-1">{formatCurrency(train.purchasePrice)}</span>
              </div>
            </div>
          </div>
          
          {train.route.length > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-md p-2 mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs text-blue-800">🗺️ Útvonal</span>
                <span className="text-xs text-blue-600">
                  {train.currentRouteIndex + 1}/{train.route.length}
                </span>
              </div>
              <div className="text-xs text-blue-700 space-y-0.5">
                <div className="flex items-center gap-1">
                  <span>Jelenlegi:</span>
                  <span className="font-medium truncate">{getStopName(train.route[train.currentRouteIndex])}</span>
                </div>
                {train.currentRouteIndex < train.route.length - 1 && (
                  <div className="flex items-center gap-1">
                    <span>Következő:</span>
                    <span className="font-medium truncate">{getStopName(train.route[train.currentRouteIndex + 1])}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Main Controls View */}
          <div className="flex gap-1 flex-wrap">
            {train.status === 'idle' && (
              <>
                <button
                  onClick={handleQuickStart}
                  className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium flex items-center gap-1"
                >
                  ▶️ Gyors start
                </button>
                <button
                  onClick={handlePlanRoute}
                  className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium flex items-center gap-1"
                >
                  🗺️ Tervezés
                </button>
              </>
            )}

            {(train.status === 'moving' || train.status === 'loading') && (
              <button
                onClick={handlePause}
                className="px-2 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium flex items-center gap-1"
              >
                ⏸️ Megállítás
              </button>
            )}

            {train.status === 'paused' && (
              <>
                <button
                  onClick={handleResume}
                  className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium flex items-center gap-1"
                >
                  ▶️ Folytatás
                </button>
                <button
                  onClick={handleAbort}
                  className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center gap-1"
                >
                  ⏹️ Törlés
                </button>
              </>
            )}
            
            <button
              onClick={() => removeTrain(train.id)}
              className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium flex items-center gap-1"
            >
              🗑️ Eladás
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
