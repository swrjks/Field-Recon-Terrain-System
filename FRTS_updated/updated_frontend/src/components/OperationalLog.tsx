import React from 'react';

export const OperationalLog: React.FC = () => {
  return (
    <section className="col-span-4 row-span-2 border border-cyan-500/40 bg-black p-4 relative overflow-hidden group tech-card">
      <div className="absolute inset-0 scanline opacity-30 pointer-events-none" />
      <header className="mb-2 relative z-10">
        <h2 className="font-display text-cyan-400 text-xs tracking-widest uppercase flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_#00f0ff]" />
          Operational Log
        </h2>
      </header>
      <div className="text-[10px] font-display space-y-1 overflow-y-auto h-[100px] scrollbar-hide pr-2 relative z-10">
        <LogEntry time="14:22:01" text="SCANNING SECTOR-01..." color="text-slate-300" />
        <LogEntry time="14:22:04" text="TERRAIN MAPPING 100% COMPLETE" color="text-slate-300" />
        <LogEntry time="14:22:15" text="WARNING: UNSTABLE SLOPE DETECTED" color="text-red-400 font-bold" />
        <LogEntry time="14:23:10" text="AI PATHFINDER REROUTING..." color="text-slate-300" />
        <LogEntry time="14:23:45" text="CONNECTION STABLE VIA SAT-X9" color="text-emerald-400" />
        <LogEntry time="14:24:00" text="AWAITING OPERATOR INPUT_" color="text-slate-300 animate-pulse" />
      </div>
    </section>
  );
};

const LogEntry: React.FC<{ time: string; text: string; color: string }> = ({ time, text, color }) => (
  <div className={color}>
    <span className="text-amber-500 mr-2">[{time}]</span>
    {text}
  </div>
);
