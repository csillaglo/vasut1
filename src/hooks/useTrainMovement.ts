import { useEffect } from 'react';
import { useGameStore } from './useGameStore';
import { calculateTrainPosition, findNextRailway, determineTrainDirection, updateTrainState } from '../utils/trainMovement';

export function useTrainMovement() {
  const { 
    trains, 
    railways, 
    buildings, 
    junctions, 
    gameSpeed,
    updateTrain,
    setGameTime 
  } = useGameStore();

  useEffect(() => {
    if (!trains || trains.length === 0) return;
    
    let animationFrame: number | null = null;
    let lastTime = performance.now();

    const updateTrains = () => {
      try {
        const currentTime = performance.now();
        const rawDeltaTime = currentTime - lastTime;
        lastTime = currentTime;

        // Stabil deltaTime - 16.67ms = 60 FPS
        const targetFrameTime = 16.67; // 60 FPS
        const deltaTime = Math.min(rawDeltaTime, targetFrameTime * 2); // Max 2 frame skip
        const scaledDeltaTime = deltaTime * gameSpeed;

        // Frissítjük a játékidőt
        setGameTime(currentTime);

        trains.forEach(train => {
          try {
            if (train.status === 'moving' && train.currentRailway) {
              const railway = railways.find(r => r.id === train.currentRailway);
              
              if (railway) {
                // Vonat pozíció számítása
                const { position, progress, reachedEnd } = calculateTrainPosition(
                  train, 
                  railway, 
                  scaledDeltaTime
                );

                // Vonat frissítése
                const updates: Partial<typeof train> = {
                  currentPosition: position,
                  progress,
                  lastUpdate: currentTime
                };

                // Ha elértük a vasútvonal végét
                if (reachedEnd) {
                  console.log('Train reached end of railway:', train.name);
                  const stateUpdates = updateTrainState(train, railway, reachedEnd, buildings, junctions);
                  Object.assign(updates, stateUpdates);

                  // Következő vasútvonal keresése
                  if (updates.currentRouteIndex !== undefined) {
                    const nextRailway = findNextRailway(
                      { ...train, currentRouteIndex: updates.currentRouteIndex },
                      railways,
                      buildings,
                      junctions
                    );

                    if (nextRailway) {
                      console.log('Found next railway:', nextRailway.id);
                      updates.currentRailway = nextRailway.id;
                      updates.direction = determineTrainDirection(
                        { ...train, currentRouteIndex: updates.currentRouteIndex },
                        nextRailway
                      );
                      updates.status = 'moving';
                    } else {
                      console.log('No more railways, train stopping');
                      updates.status = 'idle';
                      updates.currentRailway = null;
                    }
                  }
                }

                updateTrain(train.id, updates);
              } else {
                console.error('Railway not found for train:', train.name, train.currentRailway);
                // Stop train if railway not found
                updateTrain(train.id, { 
                  status: 'idle', 
                  currentRailway: null 
                });
              }
            } else if (train.status === 'loading' && train.waitTime > 0) {
              // Várakozási idő csökkentése
              const newWaitTime = Math.max(0, train.waitTime - scaledDeltaTime);
              
              if (newWaitTime === 0) {
                // Várakozás vége, folytatjuk az utat
                const nextRailway = findNextRailway(train, railways, buildings, junctions);
                
                if (nextRailway) {
                  updateTrain(train.id, {
                    waitTime: 0,
                    status: 'moving',
                    currentRailway: nextRailway.id,
                    direction: determineTrainDirection(train, nextRailway),
                    progress: 0
                  });
                } else {
                  // Útvonal vége
                  updateTrain(train.id, {
                    waitTime: 0,
                    status: 'idle',
                    currentRailway: null
                  });
                }
              } else {
                updateTrain(train.id, { waitTime: newWaitTime });
              }
            }
          } catch (trainError) {
            console.error('Error updating train:', train.id, trainError);
            // Vonat megállítása hiba esetén
            updateTrain(train.id, { status: 'idle', currentRailway: null });
          }
        });

        // Következő frame ütemezése - csak ha van mozgó vonat
        const hasMovingTrains = trains.some(t => t.status === 'moving' || t.status === 'loading');
        if (hasMovingTrains && gameSpeed > 0) {
          animationFrame = requestAnimationFrame(updateTrains);
        }
      } catch (error) {
        console.error('Error in train movement update:', error);
      }
    };

    // Csak akkor indítsuk el az animációt, ha van mozgó vonat
    const hasMovingTrains = trains.some(t => t.status === 'moving' || t.status === 'loading');
    if (hasMovingTrains && gameSpeed > 0) {
      animationFrame = requestAnimationFrame(updateTrains);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [trains, railways, buildings, junctions, gameSpeed, updateTrain, setGameTime]);
}
