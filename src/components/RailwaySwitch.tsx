import React from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { Railway } from '../types/game';
import { createSmoothCurve } from '../utils/pathSmoothing';

interface RailwaySwitchProps {
  junctionPoint: [number, number];
  connectedRailways: Railway[];
}

export function RailwaySwitch({ junctionPoint, connectedRailways }: RailwaySwitchProps) {
  const map = useMap();

  React.useEffect(() => {
    const switchElements: L.Layer[] = [];

    if (connectedRailways.length < 2) return;

    // Váltó központi pont
    const center = junctionPoint;
    
    // Minden vasútvonalhoz számítsuk ki a belépési/kilépési irányt
    const directions: { railway: Railway; direction: number; isIncoming: boolean }[] = [];
    
    connectedRailways.forEach(railway => {
      // Meghatározzuk, hogy a junction point hol van a railway path-ban
      let closestIndex = 0;
      let minDistance = Infinity;
      
      railway.path.forEach((point, index) => {
        const distance = Math.sqrt(
          Math.pow(point[0] - center[0], 2) + Math.pow(point[1] - center[1], 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });
      
      // Irány számítása
      let direction: number;
      let isIncoming: boolean;
      
      if (closestIndex === 0) {
        // A junction a vonal elején van
        const nextPoint = railway.path[1] || railway.path[0];
        direction = Math.atan2(nextPoint[1] - center[1], nextPoint[0] - center[0]);
        isIncoming = false; // Kimenő irány
      } else if (closestIndex === railway.path.length - 1) {
        // A junction a vonal végén van
        const prevPoint = railway.path[closestIndex - 1];
        direction = Math.atan2(center[1] - prevPoint[1], center[0] - prevPoint[0]);
        isIncoming = true; // Bejövő irány
      } else {
        // A junction a vonal közepén van
        const prevPoint = railway.path[closestIndex - 1];
        const nextPoint = railway.path[closestIndex + 1];
        
        // Átlagos irány számítása
        const dir1 = Math.atan2(center[1] - prevPoint[1], center[0] - prevPoint[0]);
        const dir2 = Math.atan2(nextPoint[1] - center[1], nextPoint[0] - center[0]);
        direction = (dir1 + dir2) / 2;
        isIncoming = true;
      }
      
      directions.push({ railway, direction, isIncoming });
    });

    // Váltó ágak renderelése sima ívekkel
    const railOffset = 0.000015;
    const switchRadius = 0.0001; // Váltó ív sugara
    
    directions.forEach((dir1, i) => {
      directions.slice(i + 1).forEach(dir2 => {
        // Két irány közötti váltó ág
        const angleDiff = Math.abs(dir1.direction - dir2.direction);
        
        if (angleDiff > Math.PI / 6) { // Csak ha elég nagy a szög (30 fok)
          // Sima ív létrehozása a két irány között
          const curvePoints = createSmoothCurve(
            center,
            dir1.direction,
            dir2.direction,
            switchRadius,
            20 // pontok száma az ívben
          );
          
          // Bal és jobb sín az ívhez
          const leftCurvePoints: [number, number][] = [];
          const rightCurvePoints: [number, number][] = [];
          
          curvePoints.forEach((point, index) => {
            const nextPoint = curvePoints[index + 1] || point;
            const bearing = Math.atan2(nextPoint[1] - point[1], nextPoint[0] - point[0]);
            const perpendicular = bearing + Math.PI / 2;
            
            leftCurvePoints.push([
              point[0] + Math.cos(perpendicular) * railOffset,
              point[1] + Math.sin(perpendicular) * railOffset
            ]);
            
            rightCurvePoints.push([
              point[0] - Math.cos(perpendicular) * railOffset,
              point[1] - Math.sin(perpendicular) * railOffset
            ]);
          });
          
          // Váltó sínek renderelése
          const leftSwitchRail = L.polyline(leftCurvePoints, {
            color: '#374151',
            weight: 3,
            opacity: 1,
          }).addTo(map);
          switchElements.push(leftSwitchRail);
          
          const rightSwitchRail = L.polyline(rightCurvePoints, {
            color: '#374151',
            weight: 3,
            opacity: 1,
          }).addTo(map);
          switchElements.push(rightSwitchRail);
          
          // Váltó talpfák
          curvePoints.forEach((point, index) => {
            if (index % 3 === 0) { // Ritkább talpfák a váltónál
              const nextPoint = curvePoints[index + 1] || point;
              const bearing = Math.atan2(nextPoint[1] - point[1], nextPoint[0] - point[0]);
              const perpendicular = bearing + Math.PI / 2;
              
              const sleeperLength = 0.00004;
              const sleeperStart: [number, number] = [
                point[0] + Math.cos(perpendicular) * sleeperLength,
                point[1] + Math.sin(perpendicular) * sleeperLength
              ];
              const sleeperEnd: [number, number] = [
                point[0] - Math.cos(perpendicular) * sleeperLength,
                point[1] - Math.sin(perpendicular) * sleeperLength
              ];
              
              const sleeper = L.polyline([sleeperStart, sleeperEnd], {
                color: '#654321',
                weight: 2,
                opacity: 0.9,
              }).addTo(map);
              switchElements.push(sleeper);
            }
          });
        }
      });
    });

    // Váltó központi mechanizmus (kis négyzet)
    const switchBox = L.rectangle([
      [center[0] - 0.00002, center[1] - 0.00002],
      [center[0] + 0.00002, center[1] + 0.00002]
    ], {
      color: '#4B5563',
      fillColor: '#6B7280',
      fillOpacity: 0.8,
      weight: 2,
    }).addTo(map);
    switchElements.push(switchBox);

    // Cleanup function
    return () => {
      switchElements.forEach(element => map.removeLayer(element));
    };
  }, [junctionPoint, connectedRailways, map]);

  return null;
}
