import { Train } from '../../types/game';
import { StoreSlice, TrainSlice } from '../../types/store';

export const createTrainSlice: StoreSlice<TrainSlice> = (set, get) => ({
  startTrain: (trainId, route) => {
    const state = get();
    const train = state.trains.find(t => t.id === trainId);
    if (!train) return;

    const firstRailway = state.railways.find(r =>
      (r.from === route[0] && r.to === route[1]) ||
      (r.from === route[1] && r.to === route[0])
    );

    if (!firstRailway) {
      alert('Az útvonal nem érvényes! Ellenőrizze, hogy minden szakasz össze van-e kötve vasútvonallal.');
      return;
    }

    set((state) => ({
      trains: state.trains.map((t) =>
        t.id === trainId
          ? {
              ...t,
              route,
              currentRouteIndex: 0,
              status: 'moving' as const,
              progress: 0,
              currentRailway: firstRailway.id,
              direction: firstRailway.from === route[0] ? 'forward' : 'backward'
            }
          : t
      ),
    }));
  },

  pauseTrain: (trainId) => {
    set((state) => ({
      trains: state.trains.map((t) =>
        t.id === trainId ? { ...t, status: 'paused' as const } : t
      ),
    }));
  },

  resumeTrain: (trainId) => {
    set((state) => ({
      trains: state.trains.map((t) =>
        t.id === trainId ? { ...t, status: 'moving' as const, lastUpdate: Date.now() } : t
      ),
    }));
  },

  abortTrain: (trainId) => {
    set((state) => ({
      trains: state.trains.map((t) =>
        t.id === trainId
          ? {
              ...t,
              status: 'idle' as const,
              currentRailway: null,
              route: [],
              currentRouteIndex: 0,
              progress: 0
            }
          : t
      ),
    }));
  },

  updateTrain: (trainId, updates) => {
    set((state) => ({
      trains: state.trains.map((t) =>
        t.id === trainId ? { ...t, ...updates } : t
      ),
    }));
  },
});
