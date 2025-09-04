import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Junction } from '../types/game';
import { useGameStore } from '../hooks/useGameStore';
import { GitBranch } from 'lucide-react';
import L from 'leaflet';

interface JunctionMarkerProps {
  junction: Junction;
  isConnectionStart: boolean;
}

const getJunctionIcon = (isConnectionStart: boolean, isInPlannedRoute: boolean) => {
  let color = 'bg-orange-500';
  let borderColor = 'border-orange-400';
  let shadow = 'shadow-orange-300';
  let animation = '';

  if (isConnectionStart) {
    color = 'bg-green-500';
    borderColor = 'border-green-400';
    shadow = 'shadow-green-300';
  } else if (isInPlannedRoute) {
    color = 'bg-blue-500';
    borderColor = 'border-blue-400';
    shadow = 'shadow-blue-300';
    animation = 'animate-pulse';
  }

  return L.divIcon({
    html: `
      <div class="w-7 h-7 ${color} ${borderColor} border-2 rounded-full flex items-center justify-center text-white shadow-md ${shadow} transform transition-all hover:scale-110 cursor-pointer ${animation}">
        <span class="text-sm">🔀</span>
      </div>
    `,
    className: 'custom-building-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

export function JunctionMarker({ junction, isConnectionStart }: JunctionMarkerProps) {
  const { 
    removeJunction, 
    selectedTool, 
    isDrawingRailway,
    railwayStartBuilding,
    railwayStartJunction,
    currentRailwayPath,
    startRailwayFromJunction,
    finishRailwayDrawing,
    isPlanningRoute,
    plannedRoute,
    addStopToPlannedRoute,
  } = useGameStore();

  const isInPlannedRoute = plannedRoute.includes(junction.id);

  const icon = React.useMemo(() => {
    return getJunctionIcon(isConnectionStart, isInPlannedRoute);
  }, [isConnectionStart, isInPlannedRoute]);

  const handleMarkerClick = () => {
    if (isPlanningRoute) {
      addStopToPlannedRoute(junction.id);
      return;
    }

    if (isDrawingRailway && (railwayStartBuilding || railwayStartJunction) && selectedTool === 'railway') {
      if (railwayStartJunction === junction.id) {
        return;
      }
      const endPosition = junction.position;
      const finalPath = [...currentRailwayPath, endPosition];
      finishRailwayDrawing(junction.id, finalPath);
    } else if (selectedTool === 'railway' && !isDrawingRailway) {
      startRailwayFromJunction(junction.id, junction.position);
    }
  };

  return (
    <Marker
      position={junction.position}
      icon={icon}
      eventHandlers={{
        click: handleMarkerClick,
      }}
    >
      <Popup>
        <div className="p-2 max-w-[240px] text-xs">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="w-4 h-4 text-gray-600" />
            <h3 className="font-bold text-gray-800 text-sm">{junction.name}</h3>
          </div>
          
          <div className="space-y-0.5 text-gray-600 mb-2">
            <p>Típus: Elágazás</p>
            <p>Poz: {junction.position[0].toFixed(2)}, {junction.position[1].toFixed(2)}</p>
          </div>
          
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => startRailwayFromJunction(junction.id, junction.position)}
              className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1"
              disabled={isDrawingRailway}
            >
              🚂 Építés
            </button>
            <button
              onClick={() => removeJunction(junction.id)}
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
