import React from 'react';

export const AIPathfinder: React.FC = () => {
  return (
    <section className="tech-card p-4 overflow-hidden">
      <header className="flex justify-between items-center mb-3 border-b border-cyan-500/20 pb-2">
        <h2 className="font-display text-cyan-400 text-xs tracking-widest uppercase">AI Pathfinder</h2>
        <div className="flex gap-1">
          {[0, 0.2, 0.4].map((d, i) => (
            <div key={i} className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: `${d}s` }} />
          ))}
        </div>
      </header>
      <div className="space-y-2">
        <RouteCard name="ROUTE ALPHA" tag="OPTIMAL" time="14H" safety="98%" dist="42KM" active />
        <RouteCard name="ROUTE DELTA" time="08H" safety="42%" dist="18KM" />
      </div>
    </section>
  );
};

const RouteCard: React.FC<{ name: string; tag?: string; time: string; safety: string; dist: string; active?: boolean }> = ({ name, tag, time, safety, dist, active }) => (
  <div className={`p-2 border transition-all cursor-pointer ${active ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-slate-700 bg-slate-950/20 hover:border-cyan-500/30'}`}>
    <div className="flex justify-between items-start mb-1">
      <span className={`text-[10px] font-bold ${active ? 'text-cyan-400' : 'text-slate-400'}`}>{name}</span>
      {tag && <span className="bg-cyan-500 text-slate-950 text-[8px] px-1 font-bold">{tag}</span>}
    </div>
    <div className="grid grid-cols-3 gap-2 text-[9px] font-display uppercase tracking-wider opacity-60">
      <div>TIME: {time}</div>
      <div>SAFE: {safety}</div>
      <div>DIST: {dist}</div>
    </div>
  </div>
);
