import { PlayerSlice, StoreSlice } from '../../types/store';

export const createPlayerSlice: StoreSlice<PlayerSlice> = (set) => ({
  money: 1000000,
  totalSpent: 0,
  gameTime: 0,
  gameSpeed: 1,
  selectedTool: 'select',
  selectedBuilding: null,
  selectedRailway: null,

  setGameTime: (time) => set({ gameTime: time }),
  setGameSpeed: (speed) => set({ gameSpeed: Math.max(0.1, Math.min(10, speed)) }),
  setSelectedTool: (tool) => set({ selectedTool: tool, selectedBuilding: null, selectedRailway: null }),
  setSelectedBuilding: (id) => set({ selectedBuilding: id }),
  setSelectedRailway: (id) => set({ selectedRailway: id }),
});
