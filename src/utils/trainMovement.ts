import { Train, Railway, Building, Junction } from '../types/game';
import { calculateDistance } from './calculations';

// Vonat pozíció számítása vasútvonalon
export function calculateTrainPosition(
  train: Train,
  railway: Railway,
  deltaTime: number // milliszekundumokban
): { position: [number, number]; progress: number; reachedEnd: boolean } {
  if (!railway || train.status !== 'moving') {
    return { position: train.currentPosition, progress: train.progress, reachedEnd: false };
  }

  // Ellenőrizzük, hogy van-e érvényes path
  if (!railway.path || railway.path.length < 2) {
    console.error('Invalid railway path:', railway.id);
    return { position: train.currentPosition, progress: train.progress, reachedEnd: true };
  }

  // Reális sebesség számítás
  // Vonat sebesség: km/h -> m/s
  const speedMs = (train.speed * 1000) / (60 * 60); // m/s
  
  // Vasútvonal hossza méterben (railway.length km-ben van)
  const railwayLengthM = railway.length * 1000; // méterben
  
  if (railwayLengthM <= 0) {
    console.error('Invalid railway length:', railway.length);
    return { position: train.currentPosition, progress: train.progress, reachedEnd: true };
  }
  
  // Stabil progress számítás
  const deltaTimeSeconds = deltaTime / 1000;
  const distanceTraveledM = speedMs * deltaTimeSeconds;
  const progressDelta = distanceTraveledM / railwayLengthM;

  // Új progress számítása - kisebb lépésekben
  let newProgress = train.progress;
  if (train.direction === 'forward') {
    newProgress += progressDelta;
  } else {
    newProgress -= progressDelta;
  }

  // Határok ellenőrzése
  const reachedEnd = newProgress >= 1.0 || newProgress <= 0.0;
  newProgress = Math.max(0, Math.min(1, newProgress));

  // Pozíció interpolálása a vasútvonal mentén
  const position = interpolatePositionOnRailway(railway.path, newProgress);

  // Debug információ (ritkábban)
  if (Math.random() < 0.005) { // 0.5%-ban logol
    console.log(`Train ${train.name}: speed=${train.speed}km/h, distance=${distanceTraveledM.toFixed(2)}m, progress=${(newProgress*100).toFixed(2)}%`);
  }
  
  return { position, progress: newProgress, reachedEnd };
}

// Pozíció interpolálása vasútvonal mentén
function interpolatePositionOnRailway(
  path: [number, number][],
  progress: number
): [number, number] {
  if (path.length < 2) return path[0] || [0, 0];
  if (progress <= 0) return path[0];
  if (progress >= 1) return path[path.length - 1];

  // Teljes útvonal hossza
  const segmentLengths: number[] = [];
  let totalLength = 0;
  
  for (let i = 0; i < path.length - 1; i++) {
    const segmentLength = calculateDistance(path[i], path[i + 1]);
    segmentLengths.push(segmentLength);
    totalLength += segmentLength;
  }

  // Cél távolság
  const targetDistance = progress * totalLength;
  
  // Megfelelő szegmens keresése
  let currentDistance = 0;
  for (let i = 0; i < segmentLengths.length; i++) {
    const segmentEnd = currentDistance + segmentLengths[i];
    
    if (targetDistance <= segmentEnd) {
      // Ebben a szegmensben vagyunk
      const segmentProgress = (targetDistance - currentDistance) / segmentLengths[i];
      const start = path[i];
      const end = path[i + 1];
      
      return [
        start[0] + (end[0] - start[0]) * segmentProgress,
        start[1] + (end[1] - start[1]) * segmentProgress
      ];
    }
    
    currentDistance = segmentEnd;
  }

  return path[path.length - 1];
}

// Következő vasútvonal keresése az útvonalban
export function findNextRailway(
  train: Train,
  railways: Railway[],
  buildings: Building[],
  junctions: Junction[]
): Railway | null {
  if (train.currentRouteIndex >= train.route.length - 1) {
    console.log('Train reached end of route');
    return null; // Útvonal vége
  }

  const currentStopId = train.route[train.currentRouteIndex];
  const nextStopId = train.route[train.currentRouteIndex + 1];
  
  console.log('Looking for railway between:', currentStopId, 'and', nextStopId);

  // Vasútvonal keresése a két pont között
  const railway = railways.find(r => 
    (r.from === currentStopId && r.to === nextStopId) ||
    (r.from === nextStopId && r.to === currentStopId)
  );

  if (railway) {
    console.log('Found railway:', railway.id);
  } else {
    console.log('No railway found between stops');
  }

  return railway || null;
}

// Vonat irányának meghatározása
export function determineTrainDirection(
  train: Train,
  railway: Railway
): 'forward' | 'backward' {
  if (!railway || train.route.length < 2) return 'forward';

  const currentStopId = train.route[train.currentRouteIndex];
  const nextStopId = train.route[train.currentRouteIndex + 1];

  // Ha a vasútvonal from -> to irányban egyezik az útvonallal
  if (railway.from === currentStopId && railway.to === nextStopId) {
    return 'forward';
  } else {
    return 'backward';
  }
}

// Útvonal validálása (ellenőrzi, hogy minden szakasz elérhető-e)
export function validateRoute(
  route: string[],
  railways: Railway[],
  buildings: Building[],
  junctions: Junction[]
): boolean {
  if (route.length < 2) return false;

  for (let i = 0; i < route.length - 1; i++) {
    const from = route[i];
    const to = route[i + 1];

    // Ellenőrizzük, hogy van-e vasútvonal a két pont között
    const hasConnection = railways.some(r => 
      (r.from === from && r.to === to) ||
      (r.from === to && r.to === from)
    );

    if (!hasConnection) {
      return false;
    }
  }

  return true;
}

// Automatikus útvonal keresése két pont között (egyszerű)
export function findSimpleRoute(
  startId: string,
  endId: string,
  railways: Railway[]
): string[] {
  // Egyszerű közvetlen kapcsolat keresése
  const directRailway = railways.find(r => 
    (r.from === startId && r.to === endId) ||
    (r.from === endId && r.to === startId)
  );

  if (directRailway) {
    return [startId, endId];
  }

  // TODO: Komplex útvonalkeresés (Dijkstra algoritmus)
  return [];
}

// Vonat állapot frissítése
export function updateTrainState(
  train: Train,
  railway: Railway | null,
  reachedEnd: boolean,
  buildings: Building[],
  junctions: Junction[]
): Partial<Train> {
  const updates: Partial<Train> = {};

  if (reachedEnd && railway) {
    // Elértük a vasútvonal végét
    const currentStopId = train.route[train.currentRouteIndex + 1];
    const currentStop = buildings.find(b => b.id === currentStopId) || 
                       junctions.find(j => j.id === currentStopId);

    if (currentStop) {
      // Állomáson/elágazásnál vagyunk
      updates.currentRouteIndex = train.currentRouteIndex + 1;
      updates.progress = 0;
      
      // Ha épület (nem elágazás), akkor várakozás
      if (buildings.find(b => b.id === currentStopId)) {
        updates.status = 'loading';
        updates.waitTime = 5000; // 5 másodperc várakozás (reálisabb)
      }

      // Ellenőrizzük, hogy elértük-e az útvonal végét
      if (train.currentRouteIndex + 1 >= train.route.length - 1) {
        updates.status = 'idle';
        updates.currentRailway = null;
      }
    }
  }

  return updates;
}
