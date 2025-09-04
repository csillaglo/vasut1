import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Building } from '../types/game';
import { useGameStore } from '../hooks/useGameStore';
import { Factory, Home, Package, Train } from 'lucide-react';
import L from 'leaflet';

interface BuildingMarkerProps {
  building: Building;
  isConnectionStart: boolean;
}

const getBuildingIcon = (type: Building['type'], isConnectionStart: boolean, isInPlannedRoute: boolean) => {
  const iconMap = {
    station: '🏢',
    factory: '🏭',
    warehouse: '📦',
    city: '🏙️',
  };

  let color = 'bg-white';
  let borderColor = 'border-gray-300';
  let textColor = 'text-gray-700';
  let shadow = 'shadow-gray-400';
  let animation = '';

  if (isConnectionStart) {
    color = 'bg-green-500';
    borderColor = 'border-green-400';
    textColor = 'text-white';
    shadow = 'shadow-green-300';
  } else if (isInPlannedRoute) {
    color = 'bg-blue-500';
    borderColor = 'border-blue-400';
    textColor = 'text-white';
    shadow = 'shadow-blue-300';
    animation = 'animate-pulse';
  }

  return L.divIcon({
    html: `
      <div class="w-10 h-10 ${color} ${borderColor} border-3 rounded-full flex items-center justify-center ${textColor} shadow-lg ${shadow} transform transition-all hover:scale-110 cursor-pointer ${animation}">
        <span class="text-lg">${iconMap[type]}</span>
      </div>
    `,
    className: 'custom-building-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

export function BuildingMarker({ building, isConnectionStart }: BuildingMarkerProps) {
  const { 
    removeBuilding, 
    selectedTool, 
    isDrawingRailway,
    railwayStartBuilding,
    railwayStartJunction,
    currentRailwayPath,
    startRailwayDrawing,
    finishRailwayDrawing,
    isPlanningRoute,
    plannedRoute,
    addStopToPlannedRoute,
  } = useGameStore();

  const isInPlannedRoute = plannedRoute.includes(building.id);

  const icon = React.useMemo(() => {
    return getBuildingIcon(building.type, isConnectionStart, isInPlannedRoute);
  }, [building.type, isConnectionStart, isInPlannedRoute]);

  const handleMarkerClick = () => {
    if (isPlanningRoute) {
      addStopToPlannedRoute(building.id);
      return;
    }

    if (isDrawingRailway && (railwayStartBuilding || railwayStartJunction) && selectedTool === 'railway') {
      if (railwayStartBuilding === building.id) {
        return;
      }
      const endPosition = building.position;
      const finalPath = [...currentRailwayPath, endPosition];
      finishRailwayDrawing(building.id, finalPath);
    } else if (selectedTool === 'railway' && !isDrawingRailway) {
      startRailwayDrawing(building.id, building.position);
    }
  };

  const getBuildingTypeHungarian = (type: Building['type']) => {
    switch (type) {
      case 'station': return 'Állomás';
      case 'factory': return 'Gyár';
      case 'warehouse': return 'Raktár';
      case 'city': return 'Város';
      default: return type;
    }
  };

  return (
    <Marker
      position={building.position}
      icon={icon}
      eventHandlers={{
        click: handleMarkerClick,
      }}
    >
      <Popup>
        <div className="p-2 max-w-[240px] text-xs">
          <div className="flex items-center gap-2 mb-2">
            {building.type === 'station' && <Train className="w-4 h-4 text-gray-600" />}
            {building.type === 'factory' && <Factory className="w-4 h-4 text-gray-600" />}
            {building.type === 'warehouse' && <Package className="w-4 h-4 text-gray-600" />}
            {building.type === 'city' && <Home className="w-4 h-4 text-gray-600" />}
            <h3 className="font-bold text-gray-800 text-sm">{building.name}</h3>
          </div>
          
          <div className="space-y-0.5 text-gray-600 mb-2">
            <p>Típus: {getBuildingTypeHungarian(building.type)}</p>
            <p>Szint: {building.level}</p>
            <p>Poz: {building.position[0].toFixed(2)}, {building.position[1].toFixed(2)}</p>
          </div>
          
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => startRailwayDrawing(building.id, building.position)}
              className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1"
              disabled={isDrawingRailway}
            >
              🚂 Építés
            </button>
            <button
              onClick={() => removeBuilding(building.id)}
              className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center gap-1"
            >
              🗑️ Törlés
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
