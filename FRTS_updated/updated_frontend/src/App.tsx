/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FRTSHeader } from './components/FRTSHeader';
import { FRTSSideNav } from './components/FRTSSideNav';
import { TacticalMap } from './components/TacticalMap';
import { TerrainAnalysis } from './components/TerrainAnalysis';
import { HazardEstimation } from './components/HazardEstimation';
import { AIPathfinder } from './components/AIPathfinder';
import { SystemTelemetry } from './components/SystemTelemetry';
import { SatelliteData } from './components/SatelliteData';
import { OperationalLog } from './components/OperationalLog';
import { FRTSFooter } from './components/FRTSFooter';
import { SimulationCard } from './components/SimulationCard';
import { ConsolePage } from './components/ConsolePage';
import { PathPlanning } from './components/PathPlanning';
import { MissionsPage } from './components/MissionsPage';
import { CoordinateInput } from './components/CoordinateInput';

export default function App() {
  const [activePage, setActivePage] = React.useState('Dashboard');

  return (
    <div className="h-screen w-screen flex flex-col font-sans select-none overflow-hidden bg-background text-on-background">
      <FRTSHeader />
      
      <div className="flex flex-1 pt-12 overflow-hidden">
        <FRTSSideNav activePage={activePage} onPageChange={setActivePage} />
        
        <main className="ml-20 flex-1 grid grid-cols-12 grid-rows-8 gap-2 p-2 bg-background grid-pattern overflow-hidden">
          {activePage === 'Dashboard' && (
            <div className="col-span-12 row-span-8 grid grid-cols-12 gap-2 h-full overflow-hidden">
              {/* Main Display Area */}
              <div className="col-span-8 row-span-8 flex flex-col gap-2 min-h-0">
                <div className="flex-1 min-h-0">
                  <TacticalMap showNodes={false} />
                </div>
                <div className="grid grid-cols-2 gap-2 h-44">
                  <AIPathfinder />
                  <SatelliteData />
                </div>
              </div>

              {/* Sidebar Column */}
              <div className="col-span-4 row-span-8 flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
                <TerrainAnalysis />
                <HazardEstimation />
                <SystemTelemetry />
              </div>
            </div>
          )}

          {activePage === 'Terrain' && (
            <>
              {/* Map Column */}
              <div className="col-span-9 row-span-8 flex flex-col gap-2">
                <div className="flex-1 min-h-0">
                  <TacticalMap showNodes={false} />
                </div>
                <div className="h-44">
                  <SimulationCard />
                </div>
              </div>

              {/* Right Sidebar Column */}
              <div className="col-span-3 row-span-8 flex flex-col gap-2 overflow-y-auto pr-1">
                <CoordinateInput />
                <SystemTelemetry />
                <TerrainAnalysis />
                <HazardEstimation showRiskDistribution={false} />
              </div>
            </>
          )}

          {activePage === 'Path' && (
            <>
              {/* Map Column */}
              <div className="col-span-9 row-span-8 flex flex-col gap-2">
                <div className="flex-1 min-h-0">
                  <TacticalMap showNodes={false} />
                </div>
                <div className="h-44">
                  <SimulationCard />
                </div>
              </div>

              {/* Right Sidebar Column */}
              <div className="col-span-3 row-span-8 flex flex-col gap-2 overflow-y-auto pr-1">
                <PathPlanning />
                <HazardEstimation showRiskDistribution={false} />
              </div>
            </>
          )}

          {activePage === 'Missions' && <MissionsPage />}

          {activePage === 'Console' && <ConsolePage />}

          {activePage !== 'Dashboard' && activePage !== 'Terrain' && activePage !== 'Path' && activePage !== 'Console' && activePage !== 'Missions' && (
            <div className="col-span-12 row-span-1 flex items-center justify-center border border-cyan-500/20 bg-slate-950/40 tech-card">
              <h2 className="text-xs md:text-sm font-display text-cyan-400 glow-cyan uppercase tracking-[0.4em]">
                {activePage} System {activePage === 'Console' ? 'Node' : 'Offline'}
              </h2>
            </div>
          )}
        </main>
      </div>

      <FRTSFooter />
    </div>
  );
}
