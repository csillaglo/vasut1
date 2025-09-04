import { useEffect } from 'react';
import { useGameStore } from './useGameStore';

export function useKeyboardControls() {
  const { cancelRailwayDrawing, isDrawingRailway, setSelectedTool } = useGameStore();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // ESC key cancels connection
      if (event.key === 'Escape' && isDrawingRailway) {
        cancelRailwayDrawing();
        return;
      }

      // Number keys for quick tool selection
      const toolMap: Record<string, any> = {
        '1': 'select',
        '2': 'station',
        '3': 'railway',
        '4': 'branch',
      };

      if (toolMap[event.key] && !isDrawingRailway) {
        setSelectedTool(toolMap[event.key]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isDrawingRailway, cancelRailwayDrawing, setSelectedTool]);
}
