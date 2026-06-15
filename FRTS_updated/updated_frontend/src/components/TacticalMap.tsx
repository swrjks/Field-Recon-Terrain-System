import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Layers, Maximize2, X, Target, Zap, AlertCircle, Trash2 } from 'lucide-react';

interface TacticalPoint {
  id: string;
  type: 'unit' | 'hazard' | 'objective';
  label: string;
  x: number;
  y: number;
  status: 'active' | 'standby' | 'alert' | 'engaged';
  data: string;
}

export const TacticalMap: React.FC<{ className?: string; showNodes?: boolean }> = ({ className = "", showNodes = true }) => {
  const mapRef = useRef<HTMLElement>(null);
  const [selectedPoint, setSelectedPoint] = useState<TacticalPoint | null>(null);
  const [points, setPoints] = useState<TacticalPoint[]>([
    { id: 'u1', type: 'unit', label: 'DRONE-07', x: 30, y: 40, status: 'engaged', data: 'BATT: 88% | ALT: 120m' },
    { id: 'u2', type: 'unit', label: 'SQUAD-B', x: 65, y: 55, status: 'active', data: 'COMMS: SECURE | POS: STATIC' },
    { id: 'h1', type: 'hazard', label: 'SEISMIC ANOMALY', x: 45, y: 70, status: 'alert', data: 'MAGNITUDE: 4.2 | DEPTH: 12km' },
    { id: 'o1', type: 'objective', label: 'EXTRACTION-POINT', x: 80, y: 20, status: 'standby', data: 'ETA: 12:45 | CLEARANCE: L4' },
  ]);

  const [activeLayers, setActiveLayers] = useState({
    infrastructure: true,
    elevation: false,
    signal: true
  });

  const toggleFullScreen = () => {
    if (!mapRef.current) return;
    if (!document.fullscreenElement) {
      mapRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handlePointAction = (id: string, newStatus: TacticalPoint['status']) => {
    setPoints(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    if (selectedPoint?.id === id) {
      setSelectedPoint(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const deletePoint = (id: string) => {
    setPoints(prev => prev.filter(p => p.id !== id));
    setSelectedPoint(null);
  };

  const handleDragEnd = (id: string, info: any) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((info.point.x - rect.left) / rect.width) * 100;
    const y = ((info.point.y - rect.top) / rect.height) * 100;

    setPoints(prev => prev.map(p => p.id === id ? { ...p, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } : p));
    if (selectedPoint?.id === id) {
      setSelectedPoint(prev => prev ? { ...prev, x, y } : null);
    }
  };

  const addNode = (type: TacticalPoint['type']) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNode: TacticalPoint = {
      id,
      type,
      label: `NEW-${type.toUpperCase()}-${id.toUpperCase().slice(0, 4)}`,
      x: 50,
      y: 50,
      status: 'standby',
      data: 'INITIALIZING TELEMETRY...'
    };
    setPoints(prev => [...prev, newNode]);
    setSelectedPoint(newNode);
  };

  return (
    <section 
      ref={mapRef}
      className={`relative border border-cyan-500/20 bg-slate-900/40 backdrop-blur-md overflow-hidden group tech-card h-full ${className}`}
    >
      <div className="absolute inset-0 scanline opacity-20 pointer-events-none z-10"></div>
      
      {/* Top Left Controls */}
      {showNodes && (
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          <div className="bg-slate-950/80 border border-cyan-400 p-2 text-cyan-400 font-mono text-[10px] uppercase glow-cyan tracking-wider">
            NODE COUNT: {points.length}<br/>
            ACTIVE: {points.filter(p => p.status !== 'standby').length}
          </div>
          <div className="flex gap-1">
            <button onClick={() => addNode('unit')} className="bg-slate-950 border border-cyan-400 p-1.5 text-cyan-400 hover:bg-cyan-400 hover:text-slate-950 transition-colors rounded-sm" title="ADD UNIT"><Zap size={12} /></button>
            <button onClick={() => addNode('hazard')} className="bg-slate-950 border border-red-500 p-1.5 text-red-500 hover:bg-red-500 hover:text-slate-950 transition-colors rounded-sm" title="ADD HAZARD"><AlertCircle size={12} /></button>
            <button onClick={() => addNode('objective')} className="bg-slate-950 border border-emerald-500 p-1.5 text-emerald-500 hover:bg-emerald-500 hover:text-slate-950 transition-colors rounded-sm" title="ADD OBJECTIVE"><Target size={12} /></button>
          </div>
        </div>
      )}

      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 z-20">
        <MapButton onClick={toggleFullScreen} icon={<Maximize2 size={14} />} title="FULLSCREEN" />
      </div>

      {/* Selected Entity Details Overlay */}
      <AnimatePresence>
        {selectedPoint && (
          <motion.div 
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="absolute top-16 right-4 bottom-16 w-64 z-30 bg-slate-950/90 border border-cyan-500/40 backdrop-blur-xl p-4 shadow-[0_0_50px_rgba(0,0,0,0.5)] tech-card"
          >
            <div className="flex justify-between items-start mb-6 border-b border-cyan-500/20 pb-2">
              <div>
                <span className="text-[10px] text-cyan-500/60 tech-label">TACTICAL NODE</span>
                <h3 className="text-cyan-400 font-display text-sm tracking-widest uppercase">{selectedPoint.label}</h3>
              </div>
              <button 
                onClick={() => setSelectedPoint(null)}
                className="text-cyan-900 hover:text-cyan-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[9px] text-cyan-900 tech-label block mb-2">STATUS PROTOCOL</label>
                <div className="grid grid-cols-2 gap-2">
                  {['active', 'standby', 'alert', 'engaged'].map((s) => (
                    <button 
                      key={s}
                      onClick={() => handlePointAction(selectedPoint.id, s as any)}
                      className={`text-[9px] py-1.5 border tracking-tighter uppercase font-bold transition-all ${selectedPoint.status === s ? 'bg-cyan-500 text-slate-950 border-cyan-500' : 'border-cyan-500/20 text-cyan-500/40 hover:border-cyan-500/50'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-cyan-500/5 border border-cyan-500/10 p-3 rounded-sm font-mono text-[10px] text-cyan-400 leading-relaxed">
                <div className="flex items-center gap-2 mb-2 text-cyan-500/40 uppercase text-[8px]">
                  <Zap size={10} /> Live Telemetry
                </div>
                {selectedPoint.data}
              </div>

              <button 
                onClick={() => deletePoint(selectedPoint.id)}
                className="w-full border border-red-500/40 text-red-500 font-bold text-[10px] tracking-widest py-3 hover:bg-red-500/10 transition-colors uppercase flex items-center justify-center gap-2 mt-auto"
              >
                <Trash2 size={12} /> DECOMMISSION NODE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Visualization */}
      <div className="absolute inset-0 bg-cyan-900/10">
        <div className="w-full h-full object-cover opacity-40 mix-blend-screen bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000')] bg-cover grayscale contrast-125" />
        
        {/* Layer: Elevation Grid */}
        {activeLayers.elevation && (
          <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,255,255,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        )}

        {/* Entities */}
        {showNodes && points.map((point) => (
          <motion.div 
            key={point.id}
            drag
            dragMomentum={false}
            onDragEnd={(_, info) => handleDragEnd(point.id, info)}
            className="absolute z-20 transition-transform cursor-grab active:cursor-grabbing group/node"
            style={{ left: `${point.x}%`, top: `${point.y}%`, x: '-50%', y: '-50%' }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPoint(point);
            }}
          >
            <div className={`relative flex items-center justify-center`}>
              {/* Outer Ring Animation for Alert/Engaged */}
              {(point.status === 'alert' || point.status === 'engaged') && (
                <div className={`absolute w-12 h-12 rounded-full border-2 animate-ping opacity-30 ${point.status === 'alert' ? 'border-red-500' : 'border-cyan-500'}`} />
              )}
              
              {/* Main Icon */}
              <div className={`relative p-1.5 border-2 rounded-sm transition-all transform hover:scale-110 shadow-lg ${
                selectedPoint?.id === point.id 
                  ? 'border-cyan-400 bg-cyan-400 text-slate-950 scale-125 z-30' 
                  : point.status === 'alert' ? 'border-red-500 bg-slate-950 text-red-500' 
                  : point.status === 'engaged' ? 'border-amber-500 bg-slate-950 text-amber-500'
                  : 'border-cyan-400 bg-slate-950 text-cyan-400'
              }`}>
                {point.type === 'unit' && <Zap size={14} className={point.status === 'engaged' ? 'animate-pulse' : ''} />}
                {point.type === 'hazard' && <AlertCircle size={14} />}
                {point.type === 'objective' && <Target size={14} />}
                
                {/* Node Label */}
                <div className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 tech-label text-[8px] whitespace-nowrap px-1.5 py-0.5 rounded-sm transition-opacity ${
                  selectedPoint?.id === point.id || 'group-hover/node:opacity-100 opacity-0'
                } bg-slate-950 border border-cyan-500/40 text-cyan-400`}>
                  {point.label}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      <div className="absolute bottom-4 right-4 flex gap-1 z-20">
        <MapButton icon={<Plus size={14} />} />
        <MapButton icon={<Minus size={14} />} />
        <div className="relative group/layers">
          <MapButton icon={<Layers size={14} />} />
          <div className="absolute right-0 bottom-full mb-2 bg-slate-950 border border-cyan-500/30 p-2 hidden group-hover/layers:block shadow-2xl min-w-[140px]">
            <LayerToggle label="INFRASTRUCTURE" active={activeLayers.infrastructure} onClick={() => setActiveLayers(l => ({...l, infrastructure: !l.infrastructure}))} />
            <LayerToggle label="ELEVATION" active={activeLayers.elevation} onClick={() => setActiveLayers(l => ({...l, elevation: !l.elevation}))} />
            <LayerToggle label="SIGNAL" active={activeLayers.signal} onClick={() => setActiveLayers(l => ({...l, signal: !l.signal}))} />
          </div>
        </div>
      </div>
    </section>
  );
};

const LayerToggle: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full text-left px-2 py-1.5 text-[8px] font-display font-bold tracking-widest transition-all mb-1 last:mb-0 ${
      active ? 'bg-cyan-500 text-slate-950' : 'text-cyan-500/40 hover:bg-cyan-500/10'
    }`}
  >
    {label}
  </button>
);

const MapButton: React.FC<{ icon: React.ReactNode; onClick?: () => void; title?: string }> = ({ icon, onClick, title }) => (
  <button 
    onClick={onClick}
    title={title}
    className="bg-slate-950 border border-cyan-400 p-1.5 text-cyan-400 hover:bg-cyan-400 font-bold hover:text-slate-950 transition-all rounded-sm flex items-center gap-1 active:scale-95"
  >
    {icon}
    {title && <span className="text-[8px] font-display hidden group-hover:inline ml-1 tracking-tighter">{title}</span>}
  </button>
);
