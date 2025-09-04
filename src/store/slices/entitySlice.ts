import { Building, Junction, Railway, Train } from '../../types/game';
import { EntitySlice, StoreSlice } from '../../types/store';
import { calculateBuildingCost, calculatePathLength, calculateRailwayCost } from '../../utils/calculations';
import { smoothPath } from '../../utils/pathSmoothing';

export const createEntitySlice: StoreSlice<EntitySlice> = (set, get) => ({
  buildings: [],
  railways: [],
  junctions: [],
  trains: [],

  addBuilding: (building) => {
    const cost = calculateBuildingCost(building.type, building.level);
    if (get().money < cost) {
      alert(`Nincs elég pénz! Szükséges: ${cost.toLocaleString('hu-HU')} Ft`);
      return;
    }
    const newBuilding: Building = { ...building, id: crypto.randomUUID(), createdAt: new Date() };
    set((state) => ({
      buildings: [...state.buildings, newBuilding],
      money: state.money - cost,
      totalSpent: state.totalSpent + cost,
    }));
  },

  removeBuilding: (id) => {
    set((state) => ({
      buildings: state.buildings.filter((b) => b.id !== id),
      railways: state.railways.filter((r) => r.from !== id && r.to !== id),
      selectedBuilding: state.selectedBuilding === id ? null : state.selectedBuilding,
    }));
  },

  addJunction: (junction, splitRailway) => {
    const newJunction: Junction = { ...junction, id: crypto.randomUUID(), createdAt: new Date() };
    set((state) => {
      const junctions = [...state.junctions, newJunction];
      let railways = state.railways;
      if (splitRailway) {
        const { railway, point, segmentIndex } = splitRailway;
        railways = railways.filter(r => r.id !== railway.id);
        const path1 = [...railway.path.slice(0, segmentIndex + 1), point];
        const path2 = [point, ...railway.path.slice(segmentIndex + 1)];
        const createNewSegment = (from: string, to: string, path: [number, number][]): Railway => ({
          from, to, path: path.length > 2 ? smoothPath(path, 30) : path, type: railway.type,
          length: calculatePathLength(path), cost: 0, id: crypto.randomUUID(), createdAt: new Date(),
        });
        railways.push(createNewSegment(railway.from, newJunction.id, path1), createNewSegment(newJunction.id, railway.to, path2));
      }
      return { ...state, junctions, railways };
    });
  },

  removeJunction: (id) => {
    set((state) => ({
      junctions: state.junctions.filter((j) => j.id !== id),
      railways: state.railways.filter((r) => r.from !== id && r.to !== id),
    }));
  },

  addRailway: (railway) => {
    const smoothedPath = railway.path.length > 2 ? smoothPath(railway.path, 30) : railway.path;
    const length = calculatePathLength(smoothedPath);
    const cost = calculateRailwayCost(length, railway.type);
    if (get().money < cost) {
      alert(`Nincs elég pénz a vasútvonal építéséhez! Szükséges: ${cost.toLocaleString('hu-HU')} Ft`);
      get().cancelRailwayDrawing();
      return;
    }
    const newRailway: Railway = { ...railway, path: smoothedPath, length, cost, id: crypto.randomUUID(), createdAt: new Date() };
    set((state) => ({
      railways: [...state.railways, newRailway],
      money: state.money - cost,
      totalSpent: state.totalSpent + cost,
    }));
  },

  removeRailway: (id) => {
    set((state) => ({
      railways: state.railways.filter((r) => r.id !== id),
      trains: state.trains.filter((t) => t.currentRailway !== id),
    }));
  },

  addTrain: (train) => {
    const cost = train.purchasePrice;
    if (get().money < cost) {
      alert(`Nincs elég pénz! Szükséges: ${cost.toLocaleString('hu-HU')} Ft`);
      return;
    }
    const newTrain: Train = { ...train, id: crypto.randomUUID(), createdAt: new Date(), targetSpeed: train.speed, waitTime: 0, lastUpdate: Date.now() };
    set((state) => ({
      trains: [...state.trains, newTrain],
      money: state.money - cost,
      totalSpent: state.totalSpent + cost,
    }));
  },

  removeTrain: (id) => {
    set((state) => {
      const trainToRemove = state.trains.find((t) => t.id === id);
      if (!trainToRemove) return state;
      const refundAmount = trainToRemove.purchasePrice;
      return {
        ...state,
        trains: state.trains.filter((t) => t.id !== id),
        money: state.money + refundAmount,
        totalSpent: state.totalSpent - refundAmount,
      };
    });
  },
});
