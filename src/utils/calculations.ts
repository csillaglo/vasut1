// Haversine formula for calculating distance between two points on Earth
export function calculateDistance(point1: [number, number], point2: [number, number]): number {
  const R = 6371; // Earth's radius in kilometers
  const lat1 = point1[0] * Math.PI / 180;
  const lat2 = point2[0] * Math.PI / 180;
  const deltaLat = (point2[0] - point1[0]) * Math.PI / 180;
  const deltaLng = (point2[1] - point1[1]) * Math.PI / 180;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in kilometers
}

// Calculate total path length
export function calculatePathLength(path: [number, number][]): number {
  if (path.length < 2) return 0;

  let totalLength = 0;
  for (let i = 0; i < path.length - 1; i++) {
    totalLength += calculateDistance(path[i], path[i + 1]);
  }

  return totalLength;
}

// Calculate construction cost based on length and type
export function calculateRailwayCost(length: number, type: 'passenger' | 'cargo'): number {
  const baseCostPerKm = type === 'passenger' ? 50000 : 40000; // Passenger lines are more expensive
  const minimumCost = 10000; // Minimum cost for any railway
  
  return Math.max(minimumCost, Math.round(length * baseCostPerKm));
}

// Calculate building cost
export function calculateBuildingCost(type: string, level: number = 1): number {
  const baseCosts = {
    station: 25000,
    factory: 40000,
    warehouse: 30000,
    city: 60000,
  };
  
  const baseCost = baseCosts[type as keyof typeof baseCosts] || 25000;
  return baseCost * level;
}

// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: 'HUF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format distance for display
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(2)} km`;
}

// Pont távolsága egy vonaltól (vasútvonaltól)
export function distanceToLine(point: [number, number], lineStart: [number, number], lineEnd: [number, number]): number {
  const A = point[0] - lineStart[0];
  const B = point[1] - lineStart[1];
  const C = lineEnd[0] - lineStart[0];
  const D = lineEnd[1] - lineStart[1];

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) {
    return calculateDistance(point, lineStart);
  }

  let param = dot / lenSq;
  param = Math.max(0, Math.min(1, param));

  const closestPoint: [number, number] = [
    lineStart[0] + param * C,
    lineStart[1] + param * D
  ];

  return calculateDistance(point, closestPoint);
}

// Legközelebbi pont egy vonalon
export function closestPointOnLine(point: [number, number], lineStart: [number, number], lineEnd: [number, number]): [number, number] {
  const A = point[0] - lineStart[0];
  const B = point[1] - lineStart[1];
  const C = lineEnd[0] - lineStart[0];
  const D = lineEnd[1] - lineStart[1];

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) {
    return lineStart;
  }

  let param = dot / lenSq;
  param = Math.max(0, Math.min(1, param));

  return [
    lineStart[0] + param * C,
    lineStart[1] + param * D
  ];
}

// Elágazási pont keresése vasútvonalakon
export function findNearestRailwayPoint(
  clickPoint: [number, number], 
  railways: Railway[], 
  threshold: number = 100 // méterben
): { railway: Railway; point: [number, number]; segmentIndex: number } | null {
  let nearestRailway: Railway | null = null;
  let nearestPoint: [number, number] | null = null;
  let nearestDistance = Infinity;
  let nearestSegmentIndex = -1;

  for (const railway of railways) {
    for (let i = 0; i < railway.path.length - 1; i++) {
      const segmentStart = railway.path[i];
      const segmentEnd = railway.path[i + 1];
      
      const distance = distanceToLine(clickPoint, segmentStart, segmentEnd) * 1000; // méterben
      
      if (distance < threshold && distance < nearestDistance) {
        nearestDistance = distance;
        nearestRailway = railway;
        nearestPoint = closestPointOnLine(clickPoint, segmentStart, segmentEnd);
        nearestSegmentIndex = i;
      }
    }
  }

  if (nearestRailway && nearestPoint) {
    return {
      railway: nearestRailway,
      point: nearestPoint,
      segmentIndex: nearestSegmentIndex
    };
  }

  return null;
}
