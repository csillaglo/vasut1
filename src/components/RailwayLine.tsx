import React from 'react';
import { Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Railway } from '../types/game';
import { useGameStore } from '../hooks/useGameStore';
import { formatDistance, formatCurrency } from '../utils/calculations';

interface RailwayLineProps {
  railway: Railway;
}

export function RailwayLine({ railway }: RailwayLineProps) {
  const map = useMap();
  const { 
    removeRailway, 
    buildings, 
    junctions,
    selectedTool, 
    selectedRailway, 
    setSelectedRailway,
  } = useGameStore();
  
  const fromBuilding = buildings.find(b => b.id === railway.from);
  const fromJunction = junctions.find(j => j.id === railway.from);
  const toBuilding = buildings.find(b => b.id === railway.to);
  const toJunction = junctions.find(j => j.id === railway.to);

  // Draw the realistic railway tracks
  React.useEffect(() => {
    if (railway.path.length < 2) return;

    const trackElements: L.Layer[] = [];
    
    // Interpolate points for smoother curves
    const interpolatedPoints: [number, number][] = [];
    for (let i = 0; i < railway.path.length - 1; i++) {
      const start = railway.path[i];
      const end = railway.path[i + 1];
      
      for (let t = 0; t <= 1; t += 1 / 20) { // 20 points per segment
        const lat = start[0] + (end[0] - start[0]) * t;
        const lng = start[1] + (end[1] - start[1]) * t;
        interpolatedPoints.push([lat, lng]);
      }
    }
    
    // 1. Draw the light gray ballast first (underneath)
    const ballast = L.polyline(interpolatedPoints, {
      color: '#D1D5DB', // Light gray
      weight: 7,
      opacity: 1,
    }).addTo(map);
    trackElements.push(ballast);
    
    // 2. Calculate paths for the two parallel rails
    const railOffset = 0.000015;
    const leftRailPoints: [number, number][] = [];
    const rightRailPoints: [number, number][] = [];
    
    for (let i = 0; i < interpolatedPoints.length; i++) {
      const point = interpolatedPoints[i];
      const nextPoint = (i < interpolatedPoints.length - 1) ? interpolatedPoints[i + 1] : point;
      const prevPoint = (i > 0) ? interpolatedPoints[i - 1] : point;

      const bearing = (i < interpolatedPoints.length - 1)
        ? Math.atan2(nextPoint[1] - point[1], nextPoint[0] - point[0])
        : Math.atan2(point[1] - prevPoint[1], point[0] - prevPoint[0]);
        
      const perpendicular = bearing + Math.PI / 2;
      
      leftRailPoints.push([
        point[0] + Math.cos(perpendicular) * railOffset,
        point[1] + Math.sin(perpendicular) * railOffset
      ]);
      
      rightRailPoints.push([
        point[0] - Math.cos(perpendicular) * railOffset,
        point[1] - Math.sin(perpendicular) * railOffset
      ]);
    }
    
    const railColor = selectedRailway === railway.id 
      ? '#3B82F6' // Blue when selected
      : '#374151'; // Dark gray otherwise

    // 3. Draw the two dark rails on top
    const leftRail = L.polyline(leftRailPoints, { color: railColor, weight: 2, opacity: 1 }).addTo(map);
    trackElements.push(leftRail);
    
    const rightRail = L.polyline(rightRailPoints, { color: railColor, weight: 2, opacity: 1 }).addTo(map);
    trackElements.push(rightRail);
    
    return () => {
      trackElements.forEach(element => map.removeLayer(element));
    };
  }, [railway.path, map, selectedRailway, railway.id]);

  // At least one endpoint must exist
  if ((!fromBuilding && !fromJunction) || (!toBuilding && !toJunction)) {
    return null;
  }

  const handleRailwayClick = (e: L.LeafletMouseEvent) => {
    if (selectedTool === 'select') {
      L.DomEvent.stopPropagation(e);
      setSelectedRailway(railway.id);
    }
  };

  const getEndpointName = (building: any, junction: any) => {
    if (building) return building.name;
    if (junction) return junction.name;
    return 'Ismeretlen';
  };

  return (
    <>
      {/* Invisible wide line for easier clicking and popup */}
      <Polyline
        positions={railway.path}
        color="transparent"
        weight={20}
        opacity={0}
        className={selectedTool === 'select' ? 'railway-line cursor-pointer' : 'railway-line'}
        eventHandlers={{
          click: handleRailwayClick,
        }}
      >
        <Popup>
          <div className="p-2">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              🚂 Vasútvonal
              {selectedRailway === railway.id && <span className="text-blue-600 text-xs">(Kiválasztva)</span>}
            </h3>
            <div className="space-y-1 text-sm text-gray-600 mb-3">
              <p>Típus: {railway.type === 'passenger' ? 'Személyszállító' : 'Teherszállító'}</p>
              <p>Hossz: {formatDistance(railway.length)}</p>
              <p>Építési költség: {formatCurrency(railway.cost)}</p>
              <p>Honnan: {getEndpointName(fromBuilding, fromJunction)}</p>
              <p>Hová: {getEndpointName(toBuilding, toJunction)}</p>
            </div>
            <button
              onClick={() => removeRailway(railway.id)}
              className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
            >
              🗑️ Vasút törlése
            </button>
          </div>
        </Popup>
      </Polyline>
    </>
  );
}
