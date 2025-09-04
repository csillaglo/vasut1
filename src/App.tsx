import React from 'react';
import { GameMap } from './components/GameMap';
import { Toolbar } from './components/Toolbar';
import { GameStats } from './components/GameStats';
import { GameControls } from './components/GameControls';

function App() {
  return (
    <div className="w-screen h-screen relative overflow-hidden">
      <GameMap />
      <Toolbar />
      <GameStats />
      <GameControls />
    </div>
  );
}

export default App;
