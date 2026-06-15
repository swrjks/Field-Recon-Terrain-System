import React from 'react';

export const SimulationCard: React.FC = () => {
  return (
    <section className="tech-card p-4">
      <header className="flex justify-between items-center mb-3 border-b border-cyan-500/20 pb-2">
        <h2 className="font-display text-cyan-400 text-xs tracking-widest uppercase">Simulation Control</h2>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Time Selection */}
        <div className="space-y-2">
          <label className="tech-label text-slate-500">TIME OF DAY</label>
          <div className="flex gap-1 flex-wrap">
            {['DAY', 'NIGHT', 'AFTERNOON'].map(t => (
              <button key={t} className="px-3 py-1 border border-cyan-500/30 text-[10px] hover:bg-cyan-500/20 active:bg-cyan-500/40 transition-colors uppercase font-display">
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Weather Selection */}
        <div className="space-y-2">
          <label className="tech-label text-slate-500">WEATHER</label>
          <div className="flex gap-1 flex-wrap">
            {['RAINY', 'SUMMER', 'WINTER', 'SNOWFALL'].map(w => (
              <button key={w} className="px-3 py-1 border border-cyan-500/30 text-[10px] hover:bg-cyan-500/20 active:bg-cyan-500/40 transition-colors uppercase font-display">
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Wind Speed */}
        <div className="space-y-2">
          <label className="tech-label text-slate-500">WIND SPEED</label>
          <input 
            type="text" 
            placeholder="e.g. 45 kph"
            className="w-full bg-slate-950 border border-cyan-500/30 p-2 text-[10px] text-cyan-400 placeholder:text-cyan-900 focus:outline-none focus:border-cyan-400 font-display"
          />
        </div>

        {/* Humidity */}
        <div className="space-y-2">
          <label className="tech-label text-slate-500">HUMIDITY</label>
          <input 
            type="text" 
            placeholder="e.g. 60%"
            className="w-full bg-slate-950 border border-cyan-500/30 p-2 text-[10px] text-cyan-400 placeholder:text-cyan-900 focus:outline-none focus:border-cyan-400 font-display"
          />
        </div>
      </div>
    </section>
  );
};
