import React from 'react';
import { Satellite } from 'lucide-react';

export const SatelliteData: React.FC = () => {
  return (
    <section className="tech-card p-4 flex flex-col">
      <header className="flex justify-between items-center mb-3 border-b border-cyan-500/20 pb-2">
        <h2 className="font-display text-cyan-400 text-xs tracking-widest uppercase flex items-center gap-2">
          <Satellite size={12} />
          Satellite Data Source
        </h2>
        <span className="text-[8px] text-cyan-400/50 font-display">ID: 3DR-09</span>
      </header>
      <div className="flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <InfoRow label="SATELLITE" val="INSAT-3DR" />
          <InfoRow label="ORBIT" val="GEOSTATIONARY" />
          <InfoRow label="ALTITUDE" val="35,786 KM" border={false} />
        </div>
        <div className="mt-2 bg-cyan-500/10 border border-cyan-500/30 p-2 flex justify-between items-center">
          <span className="text-[9px] font-bold text-cyan-400">STATUS</span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-[9px] font-display text-cyan-400 uppercase">ACTIVE / SYNCED</span>
          </div>
        </div>
      </div>
    </section>
  );
};

const InfoRow: React.FC<{ label: string; val: string; border?: boolean }> = ({ label, val, border = true }) => (
  <div className={`flex justify-between items-center pb-1 ${border ? 'border-b border-white/5' : ''}`}>
    <span className="text-[9px] text-slate-500 tech-label">{label}</span>
    <span className="text-[10px] font-display text-slate-300 uppercase">{val}</span>
  </div>
);
