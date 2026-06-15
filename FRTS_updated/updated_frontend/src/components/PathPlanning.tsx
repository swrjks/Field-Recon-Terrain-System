import React, { useState } from 'react';
import { Plus, GripVertical, Trash2 } from 'lucide-react';
import { Reorder, useDragControls } from 'motion/react';

interface Location {
  id: string;
  name: string;
  lat: string;
  lng: string;
}

export const PathPlanning: React.FC<{ hideHeader?: boolean }> = ({ hideHeader = false }) => {
  const [locations, setLocations] = useState<Location[]>([
    { id: '1', name: 'A', lat: '20.5937', lng: '78.9629' },
    { id: '2', name: 'B', lat: '21.1458', lng: '79.0882' },
    { id: '3', name: 'C', lat: '22.3072', lng: '73.1812' },
  ]);

  const addLocation = () => {
    const nextLetter = String.fromCharCode(65 + locations.length);
    const newLoc = { 
      id: Math.random().toString(36).substr(2, 9), 
      name: nextLetter, 
      lat: '', 
      lng: '' 
    };
    setLocations([...locations, newLoc]);
  };

  const removeLocation = (id: string) => {
    if (locations.length <= 2) return;
    setLocations(locations.filter(l => l.id !== id));
  };

  const updateLocation = (id: string, field: 'lat' | 'lng', value: string) => {
    setLocations(locations.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Main Path Panel */}
      <section className={`${hideHeader ? '' : 'tech-card p-4'} flex flex-col`}>
        {!hideHeader && (
          <header className="flex justify-between items-center mb-4 border-b border-cyan-500/20 pb-2">
            <h2 className="font-display text-cyan-400 text-sm tracking-widest uppercase">Path Planning</h2>
            <button 
              onClick={addLocation}
              className="text-cyan-400 hover:bg-cyan-500/10 p-1 rounded transition-all cursor-pointer"
            >
              <Plus size={16} />
            </button>
          </header>
        )}

        {hideHeader && (
           <div className="flex justify-end mb-2">
             <button 
                onClick={addLocation}
                className="text-cyan-400 hover:bg-cyan-500/10 p-1 rounded transition-all cursor-pointer flex items-center gap-2"
              >
                <Plus size={12} />
                <span className="text-[8px] font-bold uppercase tracking-tighter">Add Waypoint</span>
              </button>
           </div>
        )}

        <Reorder.Group axis="y" values={locations} onReorder={setLocations} className="space-y-2">
          {locations.map((loc) => (
            <LocationItem 
              key={loc.id} 
              loc={loc} 
              onUpdate={updateLocation} 
              onRemove={() => removeLocation(loc.id)} 
            />
          ))}
        </Reorder.Group>

        <div className="mt-4 pt-4 border-t border-cyan-500/10">
          <div className="flex justify-between items-center text-[10px] text-cyan-900 tech-label">
            <span>Total Waypoints</span>
            <span>{locations.length}</span>
          </div>
        </div>
      </section>
    </div>
  );
};

const LocationItem: React.FC<{ 
  loc: Location; 
  onUpdate: (id: string, field: 'lat' | 'lng', value: string) => void;
  onRemove: () => void;
}> = ({ loc, onUpdate, onRemove }) => {
  const controls = useDragControls();

  return (
    <Reorder.Item 
      value={loc}
      dragListener={false}
      dragControls={controls}
      className="bg-slate-950/40 border border-cyan-900/50 p-2 group hover:border-cyan-500/30 transition-all"
    >
      <div className="flex items-start gap-3">
        <div 
          onPointerDown={(e) => controls.start(e)}
          className="cursor-grab active:cursor-grabbing text-cyan-900 hover:text-cyan-400 pt-1"
        >
          <GripVertical size={14} />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded-sm">
              LOC {loc.name}
            </span>
            <button 
              onClick={onRemove}
              className="opacity-0 group-hover:opacity-100 text-red-900 hover:text-red-500 transition-all p-0.5"
            >
              <Trash2 size={12} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[8px] text-slate-500 tech-label">LATITUDE</label>
              <input 
                type="text" 
                value={loc.lat}
                onChange={(e) => onUpdate(loc.id, 'lat', e.target.value)}
                placeholder="0.0000"
                className="w-full bg-black/40 border border-cyan-500/10 p-1 text-[10px] font-display text-slate-300 focus:outline-none focus:border-cyan-500/40"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] text-slate-500 tech-label">LONGITUDE</label>
              <input 
                type="text" 
                value={loc.lng}
                onChange={(e) => onUpdate(loc.id, 'lng', e.target.value)}
                placeholder="0.0000"
                className="w-full bg-black/40 border border-cyan-500/10 p-1 text-[10px] font-display text-slate-300 focus:outline-none focus:border-cyan-500/40"
              />
            </div>
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
};
