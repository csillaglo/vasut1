import { StoreSlice, RoutePlanningSlice } from '../../types/store';

export const createRoutePlanningSlice: StoreSlice<RoutePlanningSlice> = (set, get) => ({
  isPlanningRoute: false,
  planningTrainId: null,
  plannedRoute: [],

  startRoutePlanning: (trainId) => {
    set({
      isPlanningRoute: true,
      planningTrainId: trainId,
      plannedRoute: [],
    });
  },

  cancelRoutePlanning: () => {
    set({
      isPlanningRoute: false,
      planningTrainId: null,
      plannedRoute: [],
    });
  },

  addStopToPlannedRoute: (stopId) => {
    if (get().plannedRoute.includes(stopId)) return;
    set((state) => ({
      plannedRoute: [...state.plannedRoute, stopId],
    }));
  },

  clearPlannedRoute: () => {
    set({ plannedRoute: [] });
  },

  removeLastStopFromPlannedRoute: () => {
    set((state) => ({
      plannedRoute: state.plannedRoute.slice(0, -1),
    }));
  },
});
