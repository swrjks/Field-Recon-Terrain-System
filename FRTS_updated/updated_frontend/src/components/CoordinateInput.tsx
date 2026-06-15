import React, { useState } from 'react';
import { Crosshair, MapPin } from 'lucide-react';

export const CoordinateInput: React.FC = () => {
  const [coords, setCoords] = useState({ lat: '', lng: '' });

  return (
    <div className="tech-card p-4 bg-slate-950/40 border border-cyan-500/20 mb-2">
      <div className="flex items-center gap-2 mb-3 border-b border-cyan-500/10 pb-2">
        <Crosshair size={14} className="text-cyan-400" />
        <h3 className="tech-label text-[10px] text-cyan-400 tracking-widest uppercase font-bold">Target Vector Input</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[8px] text-slate-500 tech-label uppercase">Latitude</label>
          <div className="relative">
            <input 
              type="text" 
              value={coords.lat}
              onChange={(e) => setCoords(prev => ({ ...prev, lat: e.target.value }))}
              placeholder="0.0000° N"
              className="w-full bg-black/40 border border-cyan-500/10 p-2 text-[11px] font-mono text-cyan-400 focus:outline-none focus:border-cyan-500/40 transition-all placeholder:text-cyan-900/40"
            />
            <MapPin size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-500/20" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[8px] text-slate-500 tech-label uppercase">Longitude</label>
          <div className="relative">
            <input 
              type="text" 
              value={coords.lng}
              onChange={(e) => setCoords(prev => ({ ...prev, lng: e.target.value }))}
              placeholder="0.0000° E"
              className="w-full bg-black/40 border border-cyan-500/10 p-2 text-[11px] font-mono text-cyan-400 focus:outline-none focus:border-cyan-500/40 transition-all placeholder:text-cyan-900/40"
            />
            <MapPin size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-500/20" />
          </div>
        </div>
      </div>

      <button className="w-full mt-4 bg-cyan-500/10 border border-cyan-500/20 py-2 text-[9px] tech-label text-cyan-400 hover:bg-cyan-500/20 transition-all uppercase tracking-[0.2em]">
        Update Tactical Grid
      </button>
    </div>
  );
};
