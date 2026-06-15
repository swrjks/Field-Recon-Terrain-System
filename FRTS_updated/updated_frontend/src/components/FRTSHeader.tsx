import React from 'react';
import { Clock } from 'lucide-react';

export const FRTSHeader: React.FC = () => {
  const [now, setNow] = React.useState(new Date().toLocaleString());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date().toLocaleString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-12 bg-slate-950/90 backdrop-blur-xl border-b border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
      <div className="flex items-center space-x-6">
        <div className="text-cyan-400 font-black tracking-widest text-lg border-l-4 border-cyan-500 pl-3 font-display">
          FRTS COMMAND
        </div>
        <nav className="hidden md:flex space-x-6 h-full items-center tech-label text-[12px] tracking-widest">
          <a className="text-cyan-400 border-b-2 border-cyan-400 pb-1" href="#">DASHBOARD</a>
          <a className="text-slate-500 hover:text-cyan-200 transition-colors uppercase" href="#">Surveillance</a>
          <a className="text-slate-500 hover:text-cyan-200 transition-colors uppercase" href="#">Tactical Map</a>
          <a className="text-slate-500 hover:text-cyan-200 transition-colors uppercase" href="#">Network</a>
        </nav>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center gap-2 bg-cyan-500/5 px-3 py-1 border border-cyan-500/10 rounded-sm">
          <Clock size={12} className="text-cyan-500/60" />
          <span className="text-[10px] tech-label text-cyan-500/80 tracking-widest uppercase">Last Sync:</span>
          <span className="text-[10px] font-mono text-cyan-400 font-bold">{now}</span>
        </div>
      </div>
    </header>
  );
};
