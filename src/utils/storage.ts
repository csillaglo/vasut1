import { Building, Railway, Junction } from '../types/game';
import { Train } from '../types/game';

export interface SaveData {
  buildings: Building[];
  railways: Railway[];
  junctions: Junction[];
  trains: Train[];
  money: number;
  totalSpent: number;
  savedAt: string;
  version: string;
}

const STORAGE_KEY = 'railway-builder-save';
const CURRENT_VERSION = '1.0.0';

export function saveGame(buildings: Building[], railways: Railway[], junctions: Junction[], trains: Train[], money: number, totalSpent: number): boolean {
  try {
    const saveData: SaveData = {
      buildings,
      railways,
      junctions,
      trains,
      money,
      totalSpent,
      savedAt: new Date().toISOString(),
      version: CURRENT_VERSION,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    return true;
  } catch (error) {
    console.error('Mentési hiba:', error);
    return false;
  }
}

export function loadGame(): SaveData | null {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) {
      return null;
    }

    const parsed = JSON.parse(savedData) as SaveData;
    
    // Dátumok visszaállítása
    parsed.buildings = parsed.buildings.map(building => ({
      ...building,
      createdAt: new Date(building.createdAt),
    }));
    
    parsed.railways = parsed.railways.map(railway => ({
      ...railway,
      createdAt: new Date(railway.createdAt),
    }));

    parsed.junctions = (parsed.junctions || []).map(junction => ({
      ...junction,
      createdAt: new Date(junction.createdAt),
    }));
    return parsed;
  } catch (error) {
    console.error('Betöltési hiba:', error);
    return null;
  }
}

export function hasSavedGame(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

export function deleteSavedGame(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Törlési hiba:', error);
    return false;
  }
}

export function exportGame(buildings: Building[], railways: Railway[], junctions: Junction[], money: number, totalSpent: number): string {
  const saveData: SaveData = {
    buildings,
    railways,
    junctions,
    money,
    totalSpent,
    savedAt: new Date().toISOString(),
    version: CURRENT_VERSION,
  };
  
  return JSON.stringify(saveData, null, 2);
}

export function importGame(jsonData: string): SaveData | null {
  try {
    const parsed = JSON.parse(jsonData) as SaveData;
    
    // Validáció
    if (!parsed.buildings || !parsed.railways) {
      throw new Error('Érvénytelen mentési formátum');
    }

    // Dátumok visszaállítása
    parsed.buildings = parsed.buildings.map(building => ({
      ...building,
      createdAt: new Date(building.createdAt),
    }));
    
    parsed.railways = parsed.railways.map(railway => ({
      ...railway,
      createdAt: new Date(railway.createdAt),
    }));

    parsed.junctions = (parsed.junctions || []).map(junction => ({
      ...junction,
      createdAt: new Date(junction.createdAt),
    }));

    parsed.trains = (parsed.trains || []).map(train => ({
      ...train,
      createdAt: new Date(train.createdAt),
    }));

    return parsed;
  } catch (error) {
    console.error('Import hiba:', error);
    return null;
  }
}
