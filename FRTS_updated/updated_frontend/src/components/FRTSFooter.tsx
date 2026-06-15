import React from 'react';

export const FRTSFooter: React.FC = () => {
  return (
    <footer className="h-6 bg-slate-950 border-t border-cyan-900/50 flex items-center justify-between px-4 text-[8px] font-display text-cyan-400/60 uppercase tracking-widest">
      <div className="flex gap-4">
        <span>FRTS-KERNEL v4.2.0</span>
        <span>SYSTEM_TIME: 1726333441</span>
        <span>USER: COMMAND_ROOT</span>
      </div>
      <div className="flex gap-2 items-center">
        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
        <span>SECURE LINK ENCRYPTED (AES-256)</span>
      </div>
    </footer>
  );
};
