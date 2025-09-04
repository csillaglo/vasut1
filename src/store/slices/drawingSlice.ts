import { DrawingSlice, StoreSlice } from '../../types/store';

export const createDrawingSlice: StoreSlice<DrawingSlice> = (set, get) => ({
  isConnecting: false,
  connectionStart: null,
  isDrawingRailway: false,
  currentRailwayPath: [],
  railwayStartBuilding: null,
  railwayStartJunction: null,

  startConnection: (buildingId: string) => {
    // This function seems unused in the original code, but we keep it for future use.
    set({ isConnecting: true, connectionStart: buildingId });
  },

  finishConnection: (buildingId: string, path: [number, number][]) => {
    // This function seems unused in the original code, but we keep it for future use.
    const state = get();
    if (state.connectionStart) {
      state.addRailway({
        from: state.connectionStart,
        to: buildingId,
        path: path,
        type: 'cargo',
      });
    }
    set({ isConnecting: false, connectionStart: null });
  },

  cancelConnection: () => {
    // This function seems unused in the original code, but we keep it for future use.
    set({ isConnecting: false, connectionStart: null });
  },

  startRailwayDrawing: (buildingId, startPosition) => {
    set({
      isDrawingRailway: true,
      railwayStartBuilding: buildingId,
      railwayStartJunction: null,
      currentRailwayPath: [startPosition],
      selectedTool: 'railway',
    });
  },

  startRailwayFromJunction: (junctionId, junctionPosition) => {
    set({
      isDrawingRailway: true,
      railwayStartBuilding: null,
      railwayStartJunction: junctionId,
      currentRailwayPath: [junctionPosition],
      selectedTool: 'railway',
    });
  },

  addPointToRailway: (point) => {
    set((state) => ({
      currentRailwayPath: [...state.currentRailwayPath, point],
    }));
  },

  finishRailwayDrawing: (endNodeId, finalPath) => {
    const state = get();
    const fromId = state.railwayStartBuilding || state.railwayStartJunction;
    if (fromId && state.currentRailwayPath.length > 1) {
      const pathToUse = finalPath || state.currentRailwayPath;
      get().addRailway({
        from: fromId,
        to: endNodeId,
        path: pathToUse,
        type: 'cargo',
      });
    }
    set({
      isDrawingRailway: false,
      currentRailwayPath: [],
      railwayStartBuilding: null,
      railwayStartJunction: null,
      selectedTool: 'select',
    });
  },

  cancelRailwayDrawing: () => {
    set({
      isDrawingRailway: false,
      currentRailwayPath: [],
      railwayStartBuilding: null,
      railwayStartJunction: null,
      selectedTool: 'select',
    });
  },
});
