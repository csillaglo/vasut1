import React from 'react';
import { Polyline } from 'react-leaflet';
import { useGameStore } from '../hooks/useGameStore';

export function PlannedRouteVisualizer() {
  const { isPlanningRoute, plannedRoute, buildings, junctions, railways } = useGameStore();

  if (!isPlanningRoute || plannedRoute.length < 1) {
    return null;
  }

  const allStops = [...buildings, ...junctions];

  const routePositions = plannedRoute
    .map(stopId => {
      const stop = allStops.find(s => s.id === stopId);
      return stop?.position;
    })
    .filter((pos): pos is [number, number] => !!pos);

  // Find the actual railway paths between stops
  const pathSegments = [];
  for (let i = 0; i < plannedRoute.length - 1; i++) {
    const fromId = plannedRoute[i];
    const toId = plannedRoute[i + 1];

    const railway = railways.find(r =>
      (r.from === fromId && r.to === toId) ||
      (r.from === toId && r.to === fromId)
    );

    if (railway) {
      const fromStop = allStops.find(s => s.id === fromId);
      if (fromStop) {
        // Ensure path is in correct order
        const railwayPath = railway.from === fromId ? railway.path : [...railway.path].reverse();
        pathSegments.push(railwayPath);
      }
    }
  }


  return (
    <>
      {/* Dashed line for the whole route for clarity */}
      {routePositions.length > 1 && (
         <Polyline
            positions={routePositions}
            pathOptions={{
              color: 'blue',
              weight: 4,
              opacity: 0.7,
              dashArray: '10, 10',
            }}
          />
      )}

      {/* Solid lines for valid segments */}
      {pathSegments.map((path, index) => (
        <Polyline
          key={index}
          positions={path}
          pathOptions={{
            color: '#3b82f6',
            weight: 6,
            opacity: 0.9,
          }}
        />
      ))}
    </>
  );
}
