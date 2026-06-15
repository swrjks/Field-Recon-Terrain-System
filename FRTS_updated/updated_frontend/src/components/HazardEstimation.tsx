import React from 'react';
import { AlertTriangle, Waves, AlertCircle } from 'lucide-react';

export const HazardEstimation: React.FC<{ showRiskDistribution?: boolean; hideHeader?: boolean }> = ({ showRiskDistribution = true, hideHeader = false }) => {
  return (
    <div className={`${hideHeader ? '' : 'tech-card border border-red-500/30 bg-slate-900/60 p-4'} flex flex-col relative`}>
      {!hideHeader && (
        <header className="flex justify-between items-center mb-4 border-b border-red-500/50 pb-2">
          <h2 className="font-display text-red-400 text-sm tracking-widest uppercase">Hazard Estimation</h2>
          <AlertTriangle className="text-red-400 w-3 h-3" />
        </header>
      )}
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-2 bg-red-900/20 border-l-2 border-red-500">
          <Waves className="text-red-500 w-4 h-4" />
          <div>
            <div className="text-[10px] font-bold text-red-500">FLOOD RISK: SECTOR-04</div>
            <div className="text-[9px] text-red-400/70 tracking-tighter uppercase">PROBABILITY 84% • T-MINUS 12M</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-2 bg-slate-950/40 border-l-2 border-slate-700">
          <AlertCircle className="text-slate-400 w-4 h-4" />
          <div>
            <div className="text-[10px] font-bold text-slate-300">SEISMIC ANOMALY</div>
            <div className="text-[9px] text-slate-500 tracking-tighter uppercase">2.4 MAG • STABLE PREDICTION</div>
          </div>
        </div>
        {showRiskDistribution && (
          <div className="mt-4">
            <div className="text-[9px] text-slate-500 tech-label mb-2">RISK DISTRIBUTION</div>
            <div className="h-24 w-full bg-slate-950 flex items-center justify-center border border-red-500/20 relative overflow-hidden">
              <div className="absolute inset-0 grid-pattern opacity-10" />
              <div className="w-16 h-16 rounded-full border-2 border-red-500/30 flex items-center justify-center">
                <div className="w-10 h-10 border border-red-500/50 rotate-45 transform" />
                <div className="absolute w-full h-px bg-red-500/10" />
                <div className="absolute h-full w-px bg-red-500/10" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
