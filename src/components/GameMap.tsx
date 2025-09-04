import React, { useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents, Polyline, useMap } from 'react-leaflet';
import { LatLng } from 'leaflet';
import { useGameStore } from '../hooks/useGameStore';
import { calculatePathLength, formatDistance, formatCurrency, calculateRailwayCost, findNearestRailwayPoint } from '../utils/calculations';
import { BuildingMarker } from './BuildingMarker';
import { JunctionMarker } from './JunctionMarker';
import { RailwayLine } from './RailwayLine';
import { TrainMarker } from './TrainMarker';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { smoothPath } from '../utils/pathSmoothing';
import { MapStyleSelector } from './MapStyleSelector';
import { useTrainMovement } from '../hooks/useTrainMovement';
import 'leaflet/dist/leaflet.css';
import { Building } from '../types/game';

// Fix for default markers in react-leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.divIcon({
  html: `<div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>`,
  className: 'custom-div-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Térkép stílusok
export const mapStyles = {
  openstreetmap: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  cartodb_light: {
    name: 'CartoDB Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  cartodb_dark: {
    name: 'CartoDB Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  esri_satellite: {
    name: 'Műholdas',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  stamen_terrain: {
    name: 'Domborzat',
    url: 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://stamen.com/">Stamen Design</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
  }
};

interface MapEventsProps {
  onMapClick: (latlng: LatLng) => void;
  onMouseMove: (latlng: LatLng) => void;
}

function MapEvents({ onMapClick, onMouseMove }: MapEventsProps) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
    mousemove: (e) => {
      onMouseMove(e.latlng);
    },
  });
  return null;
}

export function GameMap() {
  const mapRef = useRef<L.Map>(null);
  const [currentMapStyle, setCurrentMapStyle] = React.useState<keyof typeof mapStyles>('cartodb_light');
  useKeyboardControls();
  useTrainMovement(); // Vonat mozgás kezelése
  
  const {
    buildings,
    railways,
    junctions,
    trains,
    selectedTool,
    isDrawingRailway,
    currentRailwayPath,
    railwayStartBuilding,
    railwayStartJunction,
    money,
    addBuilding,
    addJunction,
    addPointToRailway,
    cancelRailwayDrawing,
  } = useGameStore();

  const handleMapClick = (latlng: LatLng) => {
    const position: [number, number] = [latlng.lat, latlng.lng];

    // Check if we clicked near an existing building
    const clickedBuilding = buildings.find((building) => {
      const distance = Math.sqrt(
        Math.pow((building.position[0] - position[0]) * 111000, 2) +
        Math.pow((building.position[1] - position[1]) * 111000 * Math.cos(building.position[0] * Math.PI / 180), 2)
      );
      return distance < 50; // 50 meter threshold
    });

    // Check if we clicked near an existing junction
    const clickedJunction = junctions.find((junction) => {
      const distance = Math.sqrt(
        Math.pow((junction.position[0] - position[0]) * 111000, 2) +
        Math.pow((junction.position[1] - position[1]) * 111000 * Math.cos(junction.position[0] * Math.PI / 180), 2)
      );
      return distance < 50; // 50 meter threshold
    });

    if (isDrawingRailway) {
      if (!clickedBuilding && !clickedJunction) {
        console.log('Adding intermediate point:', position);
        // Add intermediate point to railway path
        addPointToRailway(position);
      }
      // If clicked on building or junction, it will be handled by their respective markers
      return;
    }

    // Handle branch tool - create junction on existing railway
    if (selectedTool === 'branch' && !isDrawingRailway) {
      // Check if we clicked near an existing railway
      const nearestRailwayPoint = findNearestRailwayPoint(position, railways, 50); // 50 meter threshold
      
      if (nearestRailwayPoint) {
        console.log('Creating junction on existing railway:', nearestRailwayPoint.point);
        // Create a new junction at the nearest point on the railway and split the line
        addJunction(
          {
            position: nearestRailwayPoint.point,
            name: `Elágazás ${junctions.length + 1}`,
          },
          nearestRailwayPoint
        );
        return;
      } else {
        alert('Elágazási pontot csak meglévő vasútvonalra lehet letenni! Kattintson egy vasútvonalra.');
        return;
      }
    }

    if (selectedTool === 'select') {
      return;
    }

    // Don't place buildings if we clicked on an existing building or junction
    if (clickedBuilding || clickedJunction) {
      return;
    }

    if (['station', 'factory', 'warehouse', 'city'].includes(selectedTool)) {
      addBuilding({
        type: selectedTool as Building['type'],
        name: `${selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)} ${buildings.length + 1}`,
        position,
        level: 1,
      });
    }
  };

  const handleMouseMove = (latlng: LatLng) => {
    if (isDrawingRailway && currentRailwayPath.length > 0) {
      // Update the preview line endpoint
      const position: [number, number] = [latlng.lat, latlng.lng];
      // This will be handled by the preview line rendering
    }
  };

  // Create preview path for current drawing
  const previewPath = React.useMemo(() => {
    if (!isDrawingRailway || currentRailwayPath.length === 0) {
      return [];
    }
    // Simítjuk az előnézeti útvonalat is, ha több mint 2 pont van
    return currentRailwayPath.length > 2 ? smoothPath(currentRailwayPath, 20) : currentRailwayPath;
  }, [isDrawingRailway, currentRailwayPath]);

  // Calculate preview cost and length
  const previewStats = React.useMemo(() => {
    if (!isDrawingRailway || previewPath.length < 2) {
      return null;
    }
    const length = calculatePathLength(previewPath);
    const cost = calculateRailwayCost(length, 'cargo'); // Default to cargo for preview
    return { length, cost };
  }, [isDrawingRailway, previewPath]);
  
  return (
    <div className="w-full h-full relative">
      <MapStyleSelector 
        currentStyle={currentMapStyle}
        onStyleChange={setCurrentMapStyle}
      />
      
      <MapContainer
        ref={mapRef}
        center={[47.4979, 19.0402]} // Budapest
        zoom={13}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          key={currentMapStyle}
          attribution={mapStyles[currentMapStyle].attribution}
          url={mapStyles[currentMapStyle].url}
        />
        
        <MapEvents onMapClick={handleMapClick} onMouseMove={handleMouseMove} />
        
        {buildings.map((building) => (
          <BuildingMarker
            key={building.id}
            building={building}
            isConnectionStart={railwayStartBuilding === building.id}
          />
        ))}
        
        {junctions.map((junction) => (
          <JunctionMarker
            key={junction.id}
            junction={junction}
            isConnectionStart={railwayStartJunction === junction.id}
          />
        ))}
        
        {railways.map((railway) => (
          <RailwayLine key={railway.id} railway={railway} />
        ))}
        
        {trains.map((train) => (
          <TrainMarker key={train.id} train={train} />
        ))}
        
        {/* Preview line for current railway drawing */}
        {isDrawingRailway && previewPath.length > 1 && (
          <Polyline
            positions={previewPath}
            color="#10b981"
            weight={4}
            opacity={0.7}
            dashArray="10, 5"
            lineCap="round"
            lineJoin="round"
          />
        )}
      </MapContainer>
      
      {isDrawingRailway && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-[1000]">
          <div className="flex items-center gap-2">
            <span>🖊️ {selectedTool === 'branch' ? '🔀 Elágazás rajzolása' : (railwayStartJunction ? '🔀 Elágazás rajzolása' : '🚂 Vasútvonal rajzolása')}</span>
            <span className="text-green-200">|</span>
            <span className="text-xs opacity-75">
              {selectedTool === 'branch' ? 'Zöld pont = befejezés' : 'Kattintás = pont, épület = befejezés'}
            </span>
            <span className="text-green-200">|</span>
            <span className="text-xs opacity-75">ESC = mégse</span>
          </div>
          {previewStats && (
            <div className="mt-2 text-xs text-green-100 flex items-center gap-4">
              <span>📏 Hossz: {formatDistance(previewStats.length)}</span>
              <span>💰 Költség: {formatCurrency(previewStats.cost)}</span>
              <span className={previewStats.cost > money ? 'text-red-300 font-bold' : ''}>
                {previewStats.cost > money ? '⚠️ Nincs elég pénz!' : '✅ Megfizethető'}
              </span>
            </div>
          )}
          <button
            onClick={cancelRailwayDrawing}
            className="ml-3 text-green-200 hover:text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
