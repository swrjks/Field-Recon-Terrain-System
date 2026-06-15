import React from 'react';
import { Activity } from 'lucide-react';

export const SystemTelemetry: React.FC = () => {
  return (
    <section className="tech-card p-4">
      <header className="flex justify-between items-center mb-3 border-b border-cyan-500/20 pb-2">
        <h2 className="font-display text-cyan-400 text-xs tracking-widest uppercase">System Telemetry</h2>
        <Activity className="text-cyan-400 w-3 h-3" />
      </header>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <TelemetryItem label="CONNECTION">
          <div className="flex items-center gap-2">
            <div className="flex items-end h-4 gap-[1px]">
              {[0.4, 0.6, 0.8, 1].map((h, i) => (
                <div key={i} className="w-[3px] bg-cyan-400" style={{ height: `${h * 100}%` }} />
              ))}
            </div>
            <span className="text-[11px] font-display text-cyan-400">924 Mbps</span>
          </div>
        </TelemetryItem>
        <TelemetryItem label="CPU LOAD">
          <div className="h-4 w-full bg-slate-950 border border-cyan-900/50 p-[2px]">
            <div className="h-full bg-cyan-400/40 w-[38%]" />
          </div>
        </TelemetryItem>
        <TelemetryItem label="SATELLITE" icon={<Activity size={10} />}>
          <span className="text-[10px] font-display text-cyan-400">ORBIT-X9 ACTIVE</span>
        </TelemetryItem>
        <TelemetryItem label="MEMORY">
          <span className="text-[11px] font-display text-slate-300">14.2 / 64 GB</span>
        </TelemetryItem>
      </div>
    </section>
  );
};

const TelemetryItem: React.FC<{ label: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ label, children, icon }) => (
  <div className="space-y-1">
    <div className="text-[9px] text-slate-500 tech-label">{label}</div>
    <div className="flex items-center gap-1">
      {icon && <span className="text-cyan-400">{icon}</span>}
      {children}
    </div>
  </div>
);
