import React, { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Target, MapPin, ClipboardList, Info, AlertTriangle, Mountain, Move, Trash2, Edit3, Save, X } from 'lucide-react';
import { TacticalMap } from './TacticalMap';
import { PathPlanning } from './PathPlanning';
import { HazardEstimation } from './HazardEstimation';
import { TerrainAnalysis } from './TerrainAnalysis';
import { CoordinateInput } from './CoordinateInput';

interface Mission {
  id: string;
  code: string;
  name: string;
  place: string;
  description: string;
  status: 'planning' | 'active' | 'completed';
}

export const MissionsPage: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([
    { id: '1', code: 'OP-XENON', name: 'High Altitude Recon', place: 'Northern Sector', description: 'Gather seismic data from elevation point 4200.', status: 'planning' },
    { id: '2', code: 'OP-COBALT', name: 'Supply Chain Escort', place: 'Eastern Ridge', description: 'Ensure safe passage for supply drone unit D-08.', status: 'active' },
  ]);

  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);
  const [deletingMissionId, setDeletingMissionId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState<Mission | null>(null);

  const activeMission = missions.find(m => m.id === activeMissionId);

  const addMission = () => {
    const id = Math.random().toString(36).substr(2, 9);
    const newMission: Mission = {
      id,
      code: `OP-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      name: 'New Strategic Mission',
      place: 'Sector Unknown',
      description: 'Awaiting mission briefing and tactical objectives.',
      status: 'planning'
    };
    setMissions([...missions, newMission]);
  };

  const deleteMission = (id: string) => {
    setMissions(prev => prev.filter(m => m.id !== id));
    if (activeMissionId === id) setActiveMissionId(null);
    setDeletingMissionId(null);
  };

  const startEditing = (mission: Mission, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditBuffer({ ...mission });
    setEditingMissionId(mission.id);
  };

  const saveEdit = () => {
    if (editBuffer) {
      setMissions(prev => prev.map(m => m.id === editBuffer.id ? editBuffer : m));
      setEditingMissionId(null);
      setEditBuffer(null);
    }
  };

  if (activeMissionId && activeMission) {
    return (
      <div className="col-span-12 row-span-8 grid grid-cols-12 grid-rows-8 gap-4 h-full overflow-hidden p-2">
        {/* Mission Detail Header */}
        <div className="col-span-12 row-span-1 flex items-center justify-between border border-cyan-500/20 bg-slate-950/40 tech-card px-6">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => { setActiveMissionId(null); }}
              className="text-cyan-400 hover:text-white transition-colors bg-cyan-500/10 p-1.5 rounded-sm border border-cyan-500/20"
              title="BACK TO LIST"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="h-4 w-px bg-cyan-900 mx-2" />
            
            <div>
              <span className="text-[10px] text-cyan-900 tech-label tracking-tighter">{activeMission.code}</span>
              <h2 className="text-sm font-display text-cyan-400 uppercase tracking-widest leading-none">{activeMission.name}</h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[10px] text-cyan-900 tech-label block">LOCATION</span>
              <span className="text-[10px] text-cyan-400 uppercase tracking-wider">{activeMission.place}</span>
            </div>
            
            <div className={`px-2 py-1 border text-[8px] font-bold tracking-[0.2em] uppercase ${
              activeMission.status === 'active' ? 'border-amber-500 text-amber-500' : 'border-cyan-500 text-cyan-500'
            }`}>
              {activeMission.status}
            </div>
          </div>
        </div>

        {/* Map View */}
        <div className="col-span-8 row-span-7">
          <TacticalMap showNodes={false} />
        </div>

        {/* Tactical Planning Sidebar */}
        <div className="col-span-4 row-span-7 flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar min-h-0">
          <MissionCollapsibleSection title="Terrain Analysis" icon={<Mountain size={14} />}>
            <CoordinateInput />
            <div className="h-2" />
            <TerrainAnalysis hideHeader={true} />
          </MissionCollapsibleSection>

          <MissionCollapsibleSection title="Path Planning" icon={<Move size={14} />}>
            <PathPlanning hideHeader={true} />
          </MissionCollapsibleSection>

          <MissionCollapsibleSection title="Tactical Markers" icon={<MapPin size={14} />}>
            <div className="p-8 text-center border border-dashed border-cyan-500/10 rounded-sm">
              <span className="text-[10px] text-cyan-900 tech-label uppercase">No active markers assigned</span>
            </div>
          </MissionCollapsibleSection>

          <MissionCollapsibleSection title="Hazard Estimation" icon={<AlertTriangle size={14} />} defaultOpen={true}>
            <HazardEstimation showRiskDistribution={true} hideHeader={true} />
          </MissionCollapsibleSection>
          
          <div className="tech-card p-4 bg-cyan-500/5 space-y-3">
             <div className="flex items-center gap-2 border-b border-cyan-500/10 pb-2">
               <Info size={14} className="text-cyan-400" />
               <span className="tech-label text-[10px] text-cyan-400">Briefing Notes</span>
             </div>
             <p className="text-[11px] text-slate-400 italic leading-relaxed">
               {activeMission.description}
             </p>
             <div className="flex items-center gap-2 pt-2 text-amber-500/60">
               <AlertTriangle size={12} />
               <span className="text-[9px] font-bold uppercase tracking-tighter">Engagement Protocol: Level 3</span>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-12 row-span-8 flex flex-col p-4 space-y-4 h-full overflow-hidden">
      <header className="flex justify-between items-center bg-slate-950/40 border-b border-cyan-500/20 pb-4 px-2">
        <div>
          <h2 className="text-xl font-display text-cyan-400 glow-cyan uppercase tracking-[0.3em]">Command Center</h2>
          <p className="text-[10px] text-cyan-900 uppercase tracking-widest mt-1">Strategic Operations Overview</p>
        </div>
        <button 
          onClick={addMission}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 flex items-center gap-2 font-bold text-xs transition-all active:scale-95"
        >
          <Plus size={16} />
          INITIATE MISSION
        </button>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide pr-1">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-950 z-10">
            <tr className="border-b border-cyan-500/20">
              <th className="py-4 px-4 tech-label text-[9px] text-cyan-900">#</th>
              <th className="py-4 px-4 tech-label text-[9px] text-cyan-900">ID CODE</th>
              <th className="py-4 px-4 tech-label text-[9px] text-cyan-900">MISSION NAME</th>
              <th className="py-4 px-4 tech-label text-[9px] text-cyan-900">OPERATIONAL AREA</th>
              <th className="py-4 px-4 tech-label text-[9px] text-cyan-900">OBJECTIVES</th>
              <th className="py-4 px-4 tech-label text-[9px] text-cyan-900">STATUS</th>
              <th className="py-4 px-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyan-500/5">
            {missions.map((mission, index) => (
              <tr 
                key={mission.id} 
                onClick={() => setActiveMissionId(mission.id)}
                className={`group hover:bg-cyan-500/5 cursor-pointer transition-colors ${editingMissionId === mission.id ? 'bg-cyan-500/10' : ''}`}
                id={`mission-row-${mission.id}`}
              >
                <td className="py-5 px-4 font-mono text-[10px] text-cyan-600">{(index + 1).toString().padStart(2, '0')}</td>
                <td className="py-5 px-4">
                  {editingMissionId === mission.id ? (
                    <input 
                      className="bg-black/40 border border-cyan-500/30 text-cyan-400 font-mono text-[11px] p-1 w-full"
                      value={editBuffer?.code}
                      onClick={e => e.stopPropagation()}
                      onChange={e => setEditBuffer(prev => prev ? { ...prev, code: e.target.value } : null)}
                    />
                  ) : (
                    <span className="font-mono text-[11px] text-cyan-400 font-bold">{mission.code}</span>
                  )}
                </td>
                <td className="py-5 px-4">
                  {editingMissionId === mission.id ? (
                    <input 
                      className="bg-black/40 border border-cyan-500/30 text-cyan-400 font-display text-[11px] p-1 w-full uppercase"
                      value={editBuffer?.name}
                      onClick={e => e.stopPropagation()}
                      onChange={e => setEditBuffer(prev => prev ? { ...prev, name: e.target.value } : null)}
                    />
                  ) : (
                    <span className="font-display text-[11px] text-white uppercase tracking-wider">{mission.name}</span>
                  )}
                </td>
                <td className="py-5 px-4">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                    <MapPin size={10} className="text-cyan-500/40" />
                    {editingMissionId === mission.id ? (
                      <input 
                        className="bg-black/40 border border-cyan-500/30 text-cyan-400 text-[10px] p-1 w-full"
                        value={editBuffer?.place}
                        onClick={e => e.stopPropagation()}
                        onChange={e => setEditBuffer(prev => prev ? { ...prev, place: e.target.value } : null)}
                      />
                    ) : (
                      mission.place
                    )}
                  </div>
                </td>
                <td className="py-5 px-4 max-w-xs truncate text-[10px] text-slate-500 italic">
                  {mission.description}
                </td>
                <td className="py-5 px-4">
                  <span className={`text-[9px] px-2 py-0.5 border rounded-sm tracking-tighter uppercase font-bold ${
                    mission.status === 'active' ? 'border-amber-500/40 text-amber-500' : 
                    mission.status === 'completed' ? 'border-emerald-500/40 text-emerald-500' :
                    'border-cyan-500/40 text-cyan-500'
                  }`}>
                    {mission.status}
                  </span>
                </td>
                <td className="py-5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingMissionId === mission.id ? (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); saveEdit(); }} className="text-emerald-400 hover:text-emerald-300 p-1"><Save size={14} /></button>
                        <button onClick={(e) => { e.stopPropagation(); setEditingMissionId(null); }} className="text-red-400 hover:text-red-300 p-1"><X size={14} /></button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={(e) => startEditing(mission, e)}
                          className="text-cyan-600 hover:text-cyan-400 p-1 transition-colors"
                          title="EDIT MISSION"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setDeletingMissionId(mission.id); }}
                          className="text-red-900 hover:text-red-500 p-1 transition-colors"
                          title="TERMINATE MISSION"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                    <ChevronRight size={16} className="text-cyan-900 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {missions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-20 group">
            <Target size={48} className="text-cyan-900 group-hover:scale-110 transition-transform duration-700" />
            <p className="tech-label text-[10px] mt-4 tracking-widest text-cyan-900">Zero Operations in Queue</p>
          </div>
        )}
      </div>

      {deletingMissionId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-950 border border-red-500/30 p-8 tech-card max-w-sm w-full mx-4 shadow-[0_0_50px_rgba(255,0,0,0.1)]">
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <AlertTriangle size={24} />
              <h3 className="font-display text-lg tracking-widest uppercase">Terminate Mission?</h3>
            </div>
            <p className="text-xs text-slate-400 mb-8 tech-label leading-relaxed">
              You are about to expunge all tactical data for this operational node. This action cannot be reversed within the current command cycle.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => deleteMission(deletingMissionId)}
                className="flex-1 bg-red-500/10 border border-red-500/30 text-red-500 py-3 text-[10px] font-bold tracking-widest hover:bg-red-500 hover:text-slate-950 transition-all uppercase"
              >
                Confirm Expunge
              </button>
              <button 
                onClick={() => setDeletingMissionId(null)}
                className="flex-1 bg-cyan-500/5 border border-cyan-500/10 text-cyan-500 py-3 text-[10px] font-bold tracking-widest hover:bg-cyan-500/10 transition-all uppercase"
              >
                Abort
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="pt-4 border-t border-cyan-500/10 flex justify-between items-center text-[9px] text-cyan-900 tech-label">
        <span>SECURITY LEVEL: ALPHA-4</span>
        <span>TOTAL ENTRIES: {missions.length}</span>
      </footer>
    </div>
  );
};

const MissionCollapsibleSection: React.FC<{ 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="tech-card border border-cyan-500/20 overflow-hidden transition-all bg-slate-950/40">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-cyan-500/5 transition-colors group"
      >
        <div className="flex items-center gap-2">
          <span className="text-cyan-500 group-hover:text-cyan-400 transition-colors">{icon}</span>
          <span className="tech-label text-[10px] text-cyan-400 tracking-widest">{title}</span>
        </div>
        <ChevronRight size={14} className={`text-cyan-900 group-hover:text-cyan-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="p-2 border-t border-cyan-500/10 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};
