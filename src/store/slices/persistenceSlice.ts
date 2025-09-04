import { PersistenceSlice, StoreSlice } from '../../types/store';
import { saveGame, loadGame, exportGame } from '../../utils/storage';

const initialState = {
  buildings: [],
  railways: [],
  junctions: [],
  trains: [],
  money: 1000000,
  totalSpent: 0,
  gameTime: 0,
  gameSpeed: 1,
  selectedTool: 'select' as const,
  selectedBuilding: null,
  selectedRailway: null,
  isConnecting: false,
  connectionStart: null,
  isDrawingRailway: false,
  currentRailwayPath: [],
  railwayStartBuilding: null,
  railwayStartJunction: null,
};

export const createPersistenceSlice: StoreSlice<PersistenceSlice> = (set, get) => ({
  clearAll: () => {
    set(initialState);
  },

  saveToStorage: () => {
    const state = get();
    return saveGame(state.buildings, state.railways, state.junctions, state.trains, state.money, state.totalSpent);
  },

  loadFromStorage: () => {
    const savedData = loadGame();
    if (savedData) {
      set({
        ...initialState,
        buildings: savedData.buildings,
        railways: savedData.railways,
        junctions: savedData.junctions || [],
        trains: savedData.trains || [],
        money: savedData.money || 1000000,
        totalSpent: savedData.totalSpent || 0,
      });
      return true;
    }
    return false;
  },

  exportData: () => {
    const state = get();
    return exportGame(state.buildings, state.railways, state.junctions, state.trains, state.money, state.totalSpent);
  },

  importData: (jsonData) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.buildings && parsed.railways) {
        const buildings = parsed.buildings.map((b: any) => ({ ...b, createdAt: new Date(b.createdAt) }));
        const railways = parsed.railways.map((r: any) => ({ ...r, createdAt: new Date(r.createdAt) }));
        const junctions = (parsed.junctions || []).map((j: any) => ({ ...j, createdAt: new Date(j.createdAt) }));
        const trains = (parsed.trains || []).map((t: any) => ({ ...t, createdAt: new Date(t.createdAt) }));

        set({
          ...initialState,
          buildings,
          railways,
          junctions,
          trains,
          money: parsed.money || 1000000,
          totalSpent: parsed.totalSpent || 0,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Import hiba:', error);
      return false;
    }
  },
});
