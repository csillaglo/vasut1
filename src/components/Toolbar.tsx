import React from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { formatCurrency } from '../utils/calculations';
import { TrainShop } from './TrainShop';
import { 
  MousePointer, 
  Train, 
  Factory, 
  Package, 
  Home, 
  Route,
  GitBranch,
  Trash2,
  Save,
  Upload,
  Download,
  DollarSign,
  ShoppingCart
} from 'lucide-react';
import { hasSavedGame } from '../utils/storage';

const tools = [
  { id: 'select', name: 'Kiválasztás', icon: MousePointer },
  { id: 'station', name: 'Állomás', icon: Train },
  { id: 'railway', name: 'Vasút', icon: Route },
  { id: 'branch', name: 'Elágazás', icon: GitBranch },
] as const;

export function Toolbar() {
  const { 
    selectedTool, 
    setSelectedTool, 
    buildings, 
    railways,
    trains,
    money,
    isDrawingRailway,
    cancelRailwayDrawing,
    saveToStorage,
    loadFromStorage,
    exportData,
    importData,
    clearAll: clearAllData
  } = useGameStore();

  const [showSaveSuccess, setShowSaveSuccess] = React.useState(false);
  const [showLoadSuccess, setShowLoadSuccess] = React.useState(false);
  const [showTrainShop, setShowTrainShop] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const success = saveToStorage();
    if (success) {
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    } else {
      alert('Mentési hiba történt!');
    }
  };

  const handleLoad = () => {
    if (buildings.length > 0 || railways.length > 0) {
      if (!confirm('A jelenlegi játék elvész. Biztosan betölti a mentett játékot?')) {
        return;
      }
    }
    
    const success = loadFromStorage();
    if (success) {
      setShowLoadSuccess(true);
      setTimeout(() => setShowLoadSuccess(false), 2000);
    } else {
      alert('Nincs mentett játék vagy betöltési hiba történt!');
    }
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vasut-epitő-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        if (buildings.length > 0 || railways.length > 0) {
          if (!confirm('A jelenlegi játék elvész. Biztosan importálja a fájlt?')) {
            return;
          }
        }
        
        const success = importData(content);
        if (success) {
          alert('Sikeres importálás!');
        } else {
          alert('Importálási hiba! Ellenőrizze a fájl formátumát.');
        }
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  const clearAll = () => {
    if (confirm('Biztosan törli az összes épületet és vasútvonalat?')) {
      clearAllData();
    }
  };

  return (
    <div className={`absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg transition-all duration-300 ${
      isCollapsed ? 'w-12' : 'w-48'
    }`}>
      {/* Collapse/Expand Button */}
      <div className="flex items-center justify-between p-3 border-b">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Train className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-gray-800 text-sm">Vasút Építő</h2>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title={isCollapsed ? 'Kinyitás' : 'Becsukás'}
        >
          {isCollapsed ? (
            <div className="flex flex-col items-center">
              <Train className="w-4 h-4 text-blue-600 mb-1" />
              <span className="text-xs">▶</span>
            </div>
          ) : (
            <span className="text-gray-500">◀</span>
          )}
        </button>
      </div>

      <div className="p-3">
        {!isCollapsed ? (
          <>
            <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center gap-1 mb-1">
                <DollarSign className="w-3 h-3 text-green-600" />
                <span className="text-xs font-semibold text-green-800">Költségvetés</span>
              </div>
              <div className="text-sm font-bold text-green-700">
                {formatCurrency(money)}
              </div>
            </div>
            
            <div className="space-y-2 mb-3">
              <h3 className="text-xs font-semibold text-gray-600">Eszközök</h3>
              <div className="text-xs text-gray-500 mb-2">
                💡 Gyorsbillentyűk: 1-4
              </div>
              <div className="text-xs text-blue-600 mb-2 p-2 bg-blue-50 rounded">
                <div className="font-semibold mb-1">🔀 Építési módok:</div>
                <div><strong>Vasút:</strong> Épület → épület</div>
                <div><strong>Elágazás:</strong> Vasútvonalra kattintva</div>
              </div>
              <div className="grid grid-cols-2 gap-1 mb-3">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = selectedTool === tool.id;
                  
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setSelectedTool(tool.id as any)}
                      className={`
                        flex flex-col items-center gap-1 p-2 rounded border-2 transition-all text-xs
                        ${isActive 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800'
                        }
                      `}
                      disabled={isDrawingRailway && tool.id !== 'select'}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="font-medium">
                        {tool.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              
              <div className="border-t pt-2 mb-3">
                <h3 className="text-xs font-semibold text-gray-600 mb-2">Járművek</h3>
                <button
                  onClick={() => setShowTrainShop(true)}
                  className="flex flex-col items-center gap-1 p-2 rounded border-2 transition-all w-full text-xs border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800"
                  disabled={isDrawingRailway}
                >
                  <ShoppingCart className="w-3 h-3" />
                  <span className="font-medium">Vonat vásárlás</span>
                </button>
              </div>
            </div>

            {isDrawingRailway && (
              <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-xs text-blue-800 mb-1 flex items-center gap-1">
                  🖊️ Vasútvonal rajzolása...
                </p>
                <p className="text-xs text-blue-600 mb-2">
                  Térképre kattintva pontok, épületre befejezés
                </p>
                <button
                  onClick={cancelRailwayDrawing}
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                >
                  Mégse
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-1">
            {/* Kompakt mentés/betöltés gombok becsukott állapotban */}
            <button
              onClick={handleSave}
              className="w-full p-1 hover:bg-gray-100 rounded transition-colors"
              title="Mentés"
            >
              <Save className="w-4 h-4 text-gray-600 mx-auto" />
            </button>
            
            <button
              onClick={handleLoad}
              className="w-full p-1 hover:bg-gray-100 rounded transition-colors"
              title="Betöltés"
              disabled={!hasSavedGame()}
            >
              <Upload className="w-4 h-4 text-gray-600 mx-auto" />
            </button>
            
            <button
              onClick={handleExport}
              className="w-full p-1 hover:bg-gray-100 rounded transition-colors"
              title="Exportálás"
            >
              <Download className="w-4 h-4 text-gray-600 mx-auto" />
            </button>
            
            <button
              onClick={handleImport}
              className="w-full p-1 hover:bg-gray-100 rounded transition-colors"
              title="Importálás"
            >
              <Upload className="w-4 h-4 text-gray-600 mx-auto" />
            </button>
            
            <div className="border-t pt-1">
              <button
                onClick={clearAll}
                className="w-full p-1 hover:bg-red-100 rounded transition-colors"
                title="Minden törlése"
              >
                <Trash2 className="w-4 h-4 text-red-600 mx-auto" />
              </button>
            </div>
          </div>
        )}
        
        {/* Mentés/betöltés gombok kinyitott állapotban */}
        {!isCollapsed && (
          <div className="border-t pt-3">
            <h3 className="text-xs font-semibold text-gray-600 mb-2">Játék kezelés</h3>
            <div className="grid grid-cols-2 gap-1 mb-2">
              <button
                onClick={handleSave}
                className="flex flex-col items-center gap-1 p-2 rounded border hover:bg-gray-50 transition-colors text-xs"
              >
                <Save className="w-3 h-3 text-gray-600" />
                <span>Mentés</span>
              </button>
              
              <button
                onClick={handleLoad}
                className="flex flex-col items-center gap-1 p-2 rounded border hover:bg-gray-50 transition-colors text-xs"
                disabled={!hasSavedGame()}
              >
                <Upload className="w-3 h-3 text-gray-600" />
                <span>Betöltés</span>
              </button>
              
              <button
                onClick={handleExport}
                className="flex flex-col items-center gap-1 p-2 rounded border hover:bg-gray-50 transition-colors text-xs"
              >
                <Download className="w-3 h-3 text-gray-600" />
                <span>Export</span>
              </button>
              
              <button
                onClick={handleImport}
                className="flex flex-col items-center gap-1 p-2 rounded border hover:bg-gray-50 transition-colors text-xs"
              >
                <Upload className="w-3 h-3 text-gray-600" />
                <span>Import</span>
              </button>
            </div>
            
            <button
              onClick={clearAll}
              className="w-full flex items-center justify-center gap-1 p-2 rounded border border-red-200 hover:bg-red-50 transition-colors text-xs text-red-600"
            >
              <Trash2 className="w-3 h-3" />
              <span>Minden törlése</span>
            </button>
          </div>
        )}
      </div>
          
      {showSaveSuccess && (
        <div className="absolute -top-2 left-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-lg">
          Játék mentve!
        </div>
      )}
      
      {showLoadSuccess && (
        <div className="absolute -top-2 left-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg">
          Játék betöltve!
        </div>
      )}
      
      {showTrainShop && (
        <TrainShop 
          isOpen={showTrainShop} 
          onClose={() => setShowTrainShop(false)} 
        />
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
