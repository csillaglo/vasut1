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
  const { removeTrain, startTrain, pauseTrain, resumeTrain, abortTrain, buildings, junctions, railways } = useGameStore();
  const [showRouteBuilder, setShowRouteBuilder] = React.useState(false);
  const [selectedRoute, setSelectedRoute] = React.useState<string[]>([]);
  const map = useMap();

  const allStops = [...buildings, ...junctions];

  const icon = React.useMemo(() => {
    return getTrainIcon(train.type, train.status, train.direction);
  }, [train.type, train.status, train.direction]);

  const handleStartTrain = (customRoute?: string[]) => {
    let route = customRoute || selectedRoute;
    
    if (route.length === 0) {
      const stations = buildings.filter(b => b.type === 'station');
      if (stations.length >= 2) {
        route = [stations[0].id, stations[1].id];
      }
    }
    
    if (route.length >= 2) {
      if (validateRoute(route, railways, buildings, junctions)) {
        try {
          startTrain(train.id, route);
          map.closePopup();
        } catch (error) {
          console.error('Error starting train:', error);
          alert('Hiba történt a vonat indításakor!');
          return;
        }
        setShowRouteBuilder(false);
        setSelectedRoute([]);
      } else {
        alert('Az útvonal nem érvényes! Ellenőrizze, hogy minden szakasz össze van-e kötve vasútvonallal.');
      }
    } else {
      alert('Legalább 2 megálló szükséges az útvonalhoz!');
    }
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

  const addToRoute = (stopId: string) => {
    if (!selectedRoute.includes(stopId)) {
      setSelectedRoute([...selectedRoute, stopId]);
    }
  };

  const removeFromRoute = (index: number) => {
    setSelectedRoute(selectedRoute.filter((_, i) => i !== index));
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
          // Reset state when popup opens
          setShowRouteBuilder(false);
          setSelectedRoute([]);
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
          <div className={`flex gap-1 flex-wrap ${showRouteBuilder ? 'hidden' : ''}`}>
            {train.status === 'idle' && (
              <>
                <button
                  onClick={() => handleStartTrain()}
                  className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium flex items-center gap-1"
                >
                  ▶️ Gyors start
                </button>
                <button
                  onClick={() => setShowRouteBuilder(true)}
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

          {/* Route Builder View */}
          <div className={`space-y-2 ${!showRouteBuilder ? 'hidden' : ''}`}>
            <h4 className="font-semibold text-xs text-gray-800 border-b pb-1">🗺️ Útvonal tervezése</h4>
            {selectedRoute.length > 0 && (
              <div className="bg-gray-50 p-1 rounded text-xs">
                {selectedRoute.map((stopId, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="truncate">{index + 1}. {getStopName(stopId)}</span>
                    <button
                      onClick={() => removeFromRoute(index)}
                      className="text-red-500 hover:text-red-700 ml-1 text-base"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="max-h-24 overflow-y-auto">
              <p className="text-gray-600 mb-1">Elérhető megállók:</p>
              {allStops.map(stop => (
                <button
                  key={stop.id}
                  onClick={() => addToRoute(stop.id)}
                  className={`block w-full text-left px-1.5 py-0.5 rounded mb-0.5 transition-colors ${
                    selectedRoute.includes(stop.id)
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {'type' in stop ? 
                    `${{station: '🚂', factory: '🏭', warehouse: '📦', city: '🏙️'}[stop.type]} ${stop.name}` :
                    `🔀 ${stop.name}`
                  }
                </button>
              ))}
            </div>
            
            <div className="flex gap-1">
              <button
                onClick={() => handleStartTrain(selectedRoute)}
                disabled={selectedRoute.length < 2}
                className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-300"
              >
                ▶️ Indítás
              </button>
              <button
                onClick={() => {
                  setShowRouteBuilder(false);
                  setSelectedRoute([]);
                }}
                className="px-2 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Mégse
              </button>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
