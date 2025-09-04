export interface Building {
  id: string;
  type: 'station' | 'factory' | 'warehouse' | 'city';
  name: string;
  position: [number, number]; // [lat, lng]
  level: number;
  createdAt: Date;
}

export interface Railway {
  id: string;
  from: string; // building or junction id
  to: string; // building or junction id
  path: [number, number][]; // array of [lat, lng] points
  type: 'passenger' | 'cargo';
  length: number; // in kilometers
  cost: number; // construction cost
  createdAt: Date;
}

export interface Junction {
  id:string;
  position: [number, number];
  name: string;
  createdAt: Date;
}

export interface Train {
  id: string;
  name: string;
  type: 'passenger' | 'cargo';
  currentPosition: [number, number];
  currentRailway: string | null; // jelenlegi vasútvonal ID
  progress: number; // 0-1, haladás a jelenlegi vasútvonalon
  direction: 'forward' | 'backward';
  speed: number; // km/h
  status: 'idle' | 'moving' | 'loading' | 'paused';
  route: string[]; // épület/elágazás ID-k tömbje (teljes útvonal)
  currentRouteIndex: number; // jelenlegi pozíció az útvonalban
  purchasePrice: number;
  createdAt: Date;
  targetSpeed: number; // cél sebesség (gyorsítás/lassítás)
  waitTime: number; // várakozási idő állomásokon (másodpercben)
  lastUpdate: number; // utolsó frissítés időpontja
}
