import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';

export const ConsolePage: React.FC = () => {
  return (
    <div className="col-span-12 row-span-7 grid grid-cols-1 md:grid-cols-2 gap-4 p-2 h-full overflow-hidden">
      <ConsolePanel title="System Console" />
      <ConsolePanel title="Network Console" />
    </div>
  );
};

const ConsolePanel: React.FC<{ title: string }> = ({ title }) => {
  const [input, setInput] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const dummyMessages = [
    `INITIALIZING ${title.toUpperCase()} PROTOCOLS...`,
    "FETCHING SUB-PROCESS CODES [SEC-01]",
    "ESTABLISHING SECURE HANDSHAKE...",
    "HANDSHAKE COMPLETE. TOKEN ASSIGNED.",
    "PARSING ENVIRONMENT VARIABLES...",
    "MODULAR KERNEL ATTACHED",
    "DECRYPTING LOG FRAGMENTS...",
    "UPDATING SYSTEM CLOCK [UTC]",
    "SYNCHRONIZING WITH ORBITAL-X9",
    "BUFFERING LOCAL CACHE...",
    "READY FOR OPERATOR COMMANDS_"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isAuthorized]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (input.toLowerCase() === 'password') {
        setIsAuthorized(true);
        startLogSimulation();
      } else {
        setLogs(prev => [...prev, `[ERROR] ACCESS DENIED: INVALID KEY "${input.toUpperCase()}"`]);
        setInput('');
      }
    }
  };

  const startLogSimulation = () => {
    setLogs(["AUTHORIZATION SUCCESSFUL.", "AUTHENTICATING COMMANDER..."]);
    let currentLog = 0;
    const interval = setInterval(() => {
      if (currentLog < dummyMessages.length) {
        const rand = Math.floor(Math.random() * 9999);
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${dummyMessages[currentLog]} [${rand}]`]);
        currentLog++;
      } else {
        clearInterval(interval);
      }
    }, 300);
  };

  return (
    <div className="flex flex-col border border-cyan-500/20 bg-black tech-card h-full overflow-hidden shadow-[inset_0_0_20px_rgba(0,240,255,0.05)]">
      <div className="flex justify-between items-center px-4 py-2 border-b border-cyan-500/20 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3 h-3 text-cyan-400" />
          <span className="tech-label text-[10px] tracking-widest text-cyan-400">{title}</span>
        </div>
        <div className="text-[8px] opacity-40 font-mono">PORT: {title.includes('Network') ? '8080' : '3000'}</div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 p-6 font-mono text-[12px] md:text-[13px] overflow-y-auto space-y-1.5 bg-[linear-gradient(rgba(0,240,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px]"
      >
        <div className="text-cyan-900 mb-6 opacity-40 flex justify-between">
          <span>FRTS_TERMINAL_EMULATOR_4.2.0-STABLE</span>
          <span>TTY: {title.includes('System') ? 'ttyS0' : 'ttyN0'}</span>
        </div>
        
        {logs.map((log, i) => (
          <div key={i} className={log.includes('ERROR') ? 'text-red-500' : log.includes('SUCCESSFUL') || log.includes('GRANTED') ? 'text-emerald-400 glow-cyan font-bold' : 'text-cyan-400 opacity-90'}>
            <span className="opacity-40 mr-2">{'>'}</span>
            {log}
          </div>
        ))}

        {!isAuthorized ? (
          <div className="flex flex-col gap-2 mt-2">
            <div className="text-cyan-900/60 uppercase text-[9px] tracking-widest px-1">SECURITY LOCK ACTIVE - ENCRYPTED CHANNEL</div>
            <div className="flex items-center gap-2 group">
              <span className="text-cyan-400 font-bold opacity-60">root@{title.includes('System') ? 'sys' : 'net'}:~$</span>
              <span className="text-cyan-400">sudo auth --key</span>
              <div className="relative flex-1">
                <input 
                  type="password"
                  className="bg-transparent border-none outline-none text-cyan-400 w-full caret-cyan-400 font-mono"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus={title.includes('System')}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-emerald-500/50 italic text-[10px] mt-4">
            <span className="animate-pulse">●</span>
            AUTHENTICATED SESSION ACTIVE
          </div>
        )}
      </div>

      <div className="px-4 py-1 border-t border-cyan-500/10 text-[8px] text-cyan-900 flex justify-between font-mono">
        <span>{isAuthorized ? 'AUTH_OK' : 'AUTH_PENDING'}</span>
        <span>SSL_ACTIVE</span>
      </div>
    </div>
  );
};
