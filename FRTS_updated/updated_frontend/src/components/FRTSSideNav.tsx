import React from 'react';
import { Mountain, Move, LayoutDashboard, Trophy, Terminal } from 'lucide-react';

export const FRTSSideNav: React.FC<{ activePage: string; onPageChange: (page: string) => void }> = ({ activePage, onPageChange }) => {
  return (
    <aside className="fixed left-0 top-12 h-[calc(100vh-3rem)] flex flex-col items-center z-40 bg-slate-950/95 w-20 border-r border-cyan-900/50">
      <div className="py-4 border-b border-cyan-900/50 w-full text-center">
        <div className="text-cyan-500 font-bold tech-label">S-01</div>
        <div className="text-[8px] text-cyan-400/60 tech-label tracking-tighter">OPERATIONAL</div>
      </div>
      <nav className="flex-1 w-full flex flex-col pt-4">
        <NavItem icon={<LayoutDashboard />} label="Dashboard" active={activePage === 'Dashboard'} onClick={() => onPageChange('Dashboard')} />
        <NavItem icon={<Mountain />} label="Terrain" active={activePage === 'Terrain'} onClick={() => onPageChange('Terrain')} />
        <NavItem icon={<Move />} label="Path" active={activePage === 'Path'} onClick={() => onPageChange('Path')} />
        <NavItem icon={<Trophy />} label="Missions" active={activePage === 'Missions'} onClick={() => onPageChange('Missions')} />
      </nav>
      <div className="pb-6 px-2 w-full space-y-2">
        <button 
          onClick={() => onPageChange('Console')}
          className={`border border-cyan-500/40 text-cyan-400 font-bold text-[10px] tracking-tighter w-full py-2 hover:bg-cyan-500/10 active:scale-95 transition-all uppercase font-display flex flex-col items-center gap-1 ${activePage === 'Console' ? 'bg-cyan-500/20 shadow-[0_0_10px_rgba(0,240,255,0.2)] border-cyan-400' : ''}`}
        >
          <Terminal size={12} />
          CONSOLE
        </button>
        <button className="bg-cyan-500 text-slate-950 font-bold text-[10px] tracking-tighter w-full py-3 leading-tight active:scale-95 transition-transform uppercase font-display">
          INITIATE<br/>SCAN
        </button>
      </div>
    </aside>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full py-4 transition-all duration-150 ease-in-out cursor-pointer hover:bg-cyan-900/30 group ${active ? 'text-cyan-400 bg-cyan-500/10 border-r-2 border-cyan-400' : 'text-slate-600'}`}
  >
    <div className="mb-1 group-hover:text-cyan-300 transition-colors">
      {React.cloneElement(icon as React.ReactElement, { size: 20 })}
    </div>
    <span className="font-display text-[9px] tracking-widest font-medium uppercase text-center px-1 leading-tight">{label}</span>
  </div>
);
