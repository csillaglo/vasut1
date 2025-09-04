import { StateCreator } from 'zustand';
import { Building, Railway, Junction, Train } from './game';

// The full store interface, combining all slices
export interface GameStore extends EntitySlice, PlayerSlice, DrawingSlice, TrainSlice, PersistenceSlice, RoutePlanningSlice {}

// Generic for creating slices
export type StoreSlice<T> = StateCreator<
  GameStore,
  [],
  [],
  T
>;

// Slice for game entities (buildings, railways, etc.)
export interface EntitySliceState {
  buildings: Building[];
  railways: Railway[];
  junctions: Junction[];
  trains: Train[];
}
export interface EntitySliceActions {
  addBuilding: (building: Omit<Building, 'id' | 'createdAt'>) => void;
  removeBuilding: (id: string) => void;
  addJunction: (
    junction: Omit<Junction, 'id' | 'createdAt'>,
    splitRailway?: { railway: Railway; point: [number, number]; segmentIndex: number }
  ) => void;
  removeJunction: (id: string) => void;
  addRailway: (railway: Omit<Railway, 'id' | 'createdAt'>) => void;
  removeRailway: (id: string) => void;
  addTrain: (train: Omit<Train, 'id' | 'createdAt'>) => void;
  removeTrain: (id: string) => void;
}
export type EntitySlice = EntitySliceState & EntitySliceActions;

// Slice for player-related state (money, tools, etc.)
export interface PlayerSliceState {
  money: number;
  totalSpent: number;
  gameTime: number;
  gameSpeed: number;
  selectedTool: 'select' | 'station' | 'factory' | 'warehouse' | 'city' | 'railway' | 'branch';
  selectedBuilding: string | null;
  selectedRailway: string | null;
}
export interface PlayerSliceActions {
  setGameTime: (time: number) => void;
  setGameSpeed: (speed: number) => void;
  setSelectedTool: (tool: PlayerSliceState['selectedTool']) => void;
  setSelectedBuilding: (id: string | null) => void;
  setSelectedRailway: (id: string | null) => void;
}
export type PlayerSlice = PlayerSliceState & PlayerSliceActions;

// Slice for drawing railways
export interface DrawingSliceState {
  isConnecting: boolean;
  connectionStart: string | null;
  isDrawingRailway: boolean;
  currentRailwayPath: [number, number][];
  railwayStartBuilding: string | null;
  railwayStartJunction: string | null;
}
export interface DrawingSliceActions {
  startConnection: (buildingId: string) => void;
  finishConnection: (buildingId: string, path: [number, number][]) => void;
  cancelConnection: () => void;
  startRailwayDrawing: (buildingId: string, startPosition: [number, number]) => void;
  startRailwayFromJunction: (junctionId: string, junctionPosition: [number, number]) => void;
  addPointToRailway: (point: [number, number]) => void;
  finishRailwayDrawing: (endNodeId: string, finalPath?: [number, number][]) => void;
  cancelRailwayDrawing: () => void;
}
export type DrawingSlice = DrawingSliceState & DrawingSliceActions;

// Slice for train control
export interface TrainSliceActions {
  startTrain: (trainId: string, route: string[]) => void;
  pauseTrain: (trainId: string) => void;
  resumeTrain: (trainId: string) => void;
  abortTrain: (trainId: string) => void;
  updateTrain: (trainId: string, updates: Partial<Train>) => void;
}
export type TrainSlice = TrainSliceActions;

// Slice for persistence and game lifecycle
export interface PersistenceSliceActions {
  clearAll: () => void;
  saveToStorage: () => boolean;
  loadFromStorage: () => boolean;
  exportData: () => string;
  importData: (jsonData: string) => boolean;
}
export type PersistenceSlice = PersistenceSliceActions;

// Slice for interactive route planning
export interface RoutePlanningSliceState {
  isPlanningRoute: boolean;
  planningTrainId: string | null;
  plannedRoute: string[];
}
export interface RoutePlanningSliceActions {
  startRoutePlanning: (trainId: string) => void;
  cancelRoutePlanning: () => void;
  addStopToPlannedRoute: (stopId: string) => void;
  clearPlannedRoute: () => void;
  removeLastStopFromPlannedRoute: () => void;
}
export type RoutePlanningSlice = RoutePlanningSliceState & RoutePlanningSliceActions;
