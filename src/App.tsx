import React from 'react';
import React from 'react';
import { GameMap } from './components/GameMap';
import { Toolbar } from './components/Toolbar';
import { GameStats } from './components/GameStats';
import { GameControls } from './components/GameControls';
import { RoutePlannerUI } from './components/RoutePlannerUI';

function App() {
  return (
    <div className="w-screen h-screen relative overflow-hidden">
      <GameMap />
      <Toolbar />
      <GameStats />
      <GameControls />
      <RoutePlannerUI />
    </div>
  );
}

export default App;
