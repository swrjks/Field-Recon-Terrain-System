import React from 'react';
import { Filter } from 'lucide-react';

export const TerrainAnalysis: React.FC<{ hideHeader?: boolean }> = ({ hideHeader = false }) => {
  return (
    <div className={`${hideHeader ? '' : 'tech-card p-4'} flex flex-col`}>
      {!hideHeader && (
        <header className="flex justify-between items-center mb-4 border-b border-cyan-500/20 pb-2">
          <h2 className="font-display text-cyan-400 text-sm tracking-widest uppercase">Terrain Analysis</h2>
          <Filter className="text-cyan-400 w-3 h-3" />
        </header>
      )}
      <div className="flex-1 space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] tech-label text-slate-400">
            <span>ELEVATION PROFILE</span>
            <span className="text-cyan-400">8,848M MAX</span>
          </div>
          <div className="h-16 flex items-end gap-[2px]">
            {[0.5, 0.65, 0.75, 1, 0.8, 0.5, 0.25].map((h, i) => (
              <div key={i} className="bg-cyan-400/60 w-full" style={{ height: `${h * 100}%` }} />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StatBox label="AVG SLOPE" value="14.2°" />
          <StatBox label="RUGGEDNESS" value="HIGH" />
        </div>
        <div className="flex-1 border-t border-cyan-500/10 pt-4">
          <div className="text-[9px] text-slate-500 tech-label mb-2">SOIL COMPOSITION</div>
          <div className="space-y-2">
            <ProgressRow label="SEDIMENTARY" val="65%" />
            <ProgressRow label="BASALTIC" val="22%" />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-slate-950/40 border border-cyan-900/50 p-2">
    <div className="text-[9px] text-slate-500 tech-label">{label}</div>
    <div className="text-xl font-display font-medium text-cyan-400 leading-none mt-1">{value}</div>
  </div>
);

const ProgressRow: React.FC<{ label: string; val: string }> = ({ label, val }) => (
  <div className="flex justify-between items-center text-[10px] font-display">
    <span className="text-on-surface tracking-wider">{label}</span>
    <div className="w-24 bg-slate-800 h-1 relative">
      <div className="bg-cyan-400 h-full shadow-[0_0_5px_#00f0ff]" style={{ width: val }} />
    </div>
  </div>
);
