import { create } from 'zustand';
import { GameStore } from '../types/store';
import { createEntitySlice } from '../store/slices/entitySlice';
import { createPlayerSlice } from '../store/slices/playerSlice';
import { createDrawingSlice } from '../store/slices/drawingSlice';
import { createTrainSlice } from '../store/slices/trainSlice';
import { createPersistenceSlice } from '../store/slices/persistenceSlice';

export const useGameStore = create<GameStore>()((...a) => ({
  ...createEntitySlice(...a),
  ...createPlayerSlice(...a),
  ...createDrawingSlice(...a),
  ...createTrainSlice(...a),
  ...createPersistenceSlice(...a),
}));
