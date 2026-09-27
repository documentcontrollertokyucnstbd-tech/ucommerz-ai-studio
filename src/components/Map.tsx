import React, { useState } from 'react';
import { MapPin, ZoomIn, ZoomOut, Navigation } from 'lucide-react';

interface MapProps {
  locationName: string;
  radiusKm?: number;
  latitude?: number;
  longitude?: number;
  interactive?: boolean;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  className?: string;
}

export default function Map({
  locationName,
  radiusKm = 10,
  latitude = 37.7749,
  longitude = -122.4194,
  interactive = false,
  onLocationSelect,
  className = ''
}: MapProps) {
  const [zoom, setZoom] = useState(13);
  const [address, setAddress] = useState(locationName);

  // Generate some dummy styled mock buildings/features around center for a realistic map visual
  const mapFeatures = [
    { x: 30, y: 40, size: 'w-8 h-6', label: 'Central Park' },
    { x: 70, y: 25, size: 'w-12 h-8', label: 'Downtown Hub' },
    { x: 20, y: 80, size: 'w-10 h-10', label: 'Residential Block A' },
    { x: 80, y: 70, size: 'w-16 h-6', label: 'Commercial Center' },
  ];

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert pixel to simulated lat/lng offset
    const offsetLat = ((y - rect.height / 2) / rect.height) * -0.1;
    const offsetLng = ((x - rect.width / 2) / rect.width) * 0.1;

    const newLat = parseFloat((latitude + offsetLat).toFixed(4));
    const newLng = parseFloat((longitude + offsetLng).toFixed(4));
    const newAddress = `Simulated Address near (${newLat}, ${newLng})`;

    setAddress(newAddress);
    if (onLocationSelect) {
      onLocationSelect(newLat, newLng, newAddress);
    }
  };

  return (
    <div className={`relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-inner ${className}`} style={{ minHeight: '300px' }}>
      {/* Map Background grid */}
      <div 
        onClick={handleMapClick}
        className={`absolute inset-0 bg-slate-950 transition-all cursor-${interactive ? 'crosshair' : 'default'}`}
        style={{
          backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
          backgroundSize: `${zoom * 2}px ${zoom * 2}px`,
          backgroundPosition: 'center'
        }}
      >
        {/* Radar concentric circular radius bounds */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div 
            className="border border-blue-500/30 bg-blue-500/5 rounded-full animate-pulse transition-all"
            style={{
              width: `${radiusKm * zoom * 0.5}px`,
              height: `${radiusKm * zoom * 0.5}px`,
            }}
          />
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-blue-500/10 rounded-full"
            style={{
              width: `${radiusKm * zoom * 1.0}px`,
              height: `${radiusKm * zoom * 1.0}px`,
            }}
          />
        </div>

        {/* Mock Map roads / tracks */}
        <svg className="absolute inset-0 w-full h-full opacity-20 stroke-slate-700 stroke-1 fill-none pointer-events-none">
          <path d="M0,150 Q200,100 400,150 T800,150" />
          <path d="M150,0 Q200,200 150,400" />
          <path d="M0,50 L400,350" />
          <path d="M100,300 C200,300 300,100 400,100" />
        </svg>

        {/* Mock Landmarks / Features */}
        {mapFeatures.map((f, i) => (
          <div
            key={i}
            className={`absolute ${f.size} bg-slate-800/40 border border-slate-700/50 rounded flex items-center justify-center p-1 pointer-events-none`}
            style={{ left: `${f.x}%`, top: `${f.y}%` }}
          >
            <span className="text-[9px] font-mono text-slate-500 truncate">{f.label}</span>
          </div>
        ))}

        {/* Active Center Pin */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
          <div className="relative">
            <div className="absolute -inset-2 bg-blue-500/40 rounded-full blur-sm animate-ping" />
            <MapPin className="w-8 h-8 text-blue-500 drop-shadow-[0_2px_8px_rgba(59,130,246,0.5)] fill-blue-500/10" />
          </div>
          <div className="mt-1 bg-slate-900/95 border border-slate-800 px-2 py-0.5 rounded text-[10px] font-medium text-slate-200 shadow-md whitespace-nowrap max-w-[180px] truncate">
            {address || 'Target Location'}
          </div>
        </div>
      </div>

      {/* Map interface buttons */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1 z-10">
        <button 
          onClick={() => setZoom(prev => Math.min(prev + 2, 24))}
          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 transition-colors shadow-md"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={() => setZoom(prev => Math.max(prev - 2, 6))}
          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 transition-colors shadow-md"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Map Info Bar */}
      <div className="absolute top-3 left-3 right-3 bg-slate-900/90 border border-slate-800 rounded-lg p-2 flex items-center justify-between gap-2 shadow-lg backdrop-blur-sm z-10 text-[10px]">
        <div className="flex items-center gap-2 text-slate-300">
          <Navigation className="w-3.5 h-3.5 text-blue-400" />
          <div className="truncate max-w-[180px] font-mono">
            Lat: {latitude.toFixed(4)}, Lng: {longitude.toFixed(4)}
          </div>
        </div>
        <div className="text-blue-400 font-semibold bg-blue-500/10 px-1.5 py-0.5 rounded font-mono">
          Radius: {radiusKm} km
        </div>
      </div>

      {interactive && (
        <div className="absolute bottom-3 left-3 bg-slate-900/95 border border-slate-800 text-slate-400 text-[9px] px-2 py-1 rounded shadow backdrop-blur-sm z-10 pointer-events-none">
          Click anywhere to geocode & place pin
        </div>
      )}
    </div>
  );
}
