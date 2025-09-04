import React from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { validateRoute } from '../utils/trainMovement';
import { ArrowRight, Train, X } from 'lucide-react';

export function RoutePlannerUI() {
  const {
    isPlanningRoute,
    plannedRoute,
    planningTrainId,
    cancelRoutePlanning,
    clearPlannedRoute,
    removeLastStopFromPlannedRoute,
    startTrain,
    trains,
    buildings,
    junctions,
    railways,
  } = useGameStore();

  const planningTrain = trains.find(t => t.id === planningTrainId);

  const getStopName = (stopId: string) => {
    const building = buildings.find(b => b.id === stopId);
    const junction = junctions.find(j => j.id === stopId);
    return building?.name || junction?.name || 'Ismeretlen';
  };

  const handleStartTrain = () => {
    if (!planningTrainId || plannedRoute.length < 2) {
      alert('Az útvonalhoz legalább 2 megálló szükséges.');
      return;
    }

    if (validateRoute(plannedRoute, railways, buildings, junctions)) {
      startTrain(planningTrainId, plannedRoute);
      cancelRoutePlanning();
    } else {
      alert('Az útvonal nem érvényes. Ellenőrizze, hogy minden szakasz össze van-e kötve vasútvonallal.');
    }
  };

  const handleCancel = () => {
    cancelRoutePlanning();
  };

  if (!isPlanningRoute) {
    return null;
  }

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-lg shadow-lg p-4 w-full max-w-lg">
      <div className="flex justify-between items-center border-b pb-2 mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-800">Útvonal Tervezése</h3>
          {planningTrain && (
             <p className="text-sm text-gray-600 flex items-center gap-2">
                <Train size={16} className="text-blue-500" />
                <span>{planningTrain.name}</span>
             </p>
          )}
        </div>
        <button
          onClick={handleCancel}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Kattintson az állomásokra és elágazásokra a térképen a kívánt sorrendben.
        </p>
        <div className="bg-gray-50 p-3 rounded-md min-h-[40px] flex items-center flex-wrap gap-2">
          {plannedRoute.length === 0 ? (
            <span className="text-gray-400 text-sm">Válassza ki a kezdőállomást...</span>
          ) : (
            plannedRoute.map((stopId, index) => (
              <React.Fragment key={stopId}>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-medium">
                  {getStopName(stopId)}
                </span>
                {index < plannedRoute.length - 1 && (
                  <ArrowRight size={16} className="text-gray-400" />
                )}
              </React.Fragment>
            ))
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={removeLastStopFromPlannedRoute}
            disabled={plannedRoute.length === 0}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors disabled:opacity-50"
          >
            Vissza
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearPlannedRoute}
            disabled={plannedRoute.length === 0}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Útvonal törlése
          </button>
          <button
            onClick={handleStartTrain}
          disabled={plannedRoute.length < 2}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-400"
        >
          Indítás
        </button>
      </div>
    </div>
  );
}
