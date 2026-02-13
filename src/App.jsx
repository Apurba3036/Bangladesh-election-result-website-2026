import React, { useState, useEffect } from 'react';
import ElectionMap from './components/ElectionMap';
import StatsPanel from './components/StatsPanel';
import SummaryPanel from './components/SummaryPanel';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { Sun, Moon, BarChart3, Map as MapIcon, Share2, Info } from 'lucide-react';

import { getElectionData } from './utils/electionApi';

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const [view, setView] = useState('map');
  const [data, setData] = useState(null);

  useEffect(() => {
    getElectionData().then(setData).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/40">
      {/* Premium Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white font-black text-xl italic mt-[-1px]">B</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-black tracking-tight leading-none uppercase">Bangladesh</h1>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mt-0.5">Election Portal 2026</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* View Switcher Mobile/Tablet */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl lg:hidden">
              <button
                onClick={() => setView('map')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${view === 'map' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'
                  }`}
              >
                <MapIcon size={14} />
                <span className="hidden xs:block">Map</span>
              </button>
              <button
                onClick={() => setView('stats')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${view === 'stats' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'
                  }`}
              >
                <BarChart3 size={14} />
                <span className="hidden xs:block">Stats</span>
              </button>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
              >
                {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
              </button>
              <button className="hidden sm:flex w-10 h-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-300 dark:hover:border-slate-700">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-[61px] h-screen flex flex-col lg:flex-row overflow-hidden">
        {/* Map Engine Viewport */}
        <section className={`flex-1 relative min-h-[50vh] lg:min-h-0 bg-slate-200 dark:bg-slate-900/50 ${view === 'stats' ? 'hidden lg:block' : 'block'}`}>
          <ElectionMap />

          {/* Floating UI for Desktop Map */}
          <div className="absolute bottom-6 left-6 z-10 hidden xl:block pointer-events-none">
            <div className="pointer-events-auto max-w-xs animate-in slide-in-from-left duration-700">
              <SummaryPanel summary={data?.summary} />
            </div>
          </div>
        </section>

        {/* Dashboard Sidebar */}
        <aside className={`
          ${view === 'stats' ? 'block' : 'hidden lg:block'}
          w-full lg:w-[420px] xl:w-[480px]
          bg-white dark:bg-slate-950
          border-l border-slate-200 dark:border-slate-800
          overflow-y-auto scrollbar-hide
        `}>
          <div className="p-6 sm:p-8 space-y-8 pb-32">
            {!data && (
              <div className="py-20 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Synchronizing Live Data...</p>
              </div>
            )}

            {data && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-blue-600 font-bold uppercase text-[10px] tracking-widest">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                    </span>
                    Live Data Active
                  </div>
                  <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50 uppercase italic">Election Dashboard</h2>
                </div>

                <div className="lg:hidden">
                  <SummaryPanel summary={data.summary} />
                </div>

                <StatsPanel summary={data.summary} />

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex gap-3">
                  <Info className="flex-shrink-0 text-slate-400 mt-1" size={18} />
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Data is updated every 30 seconds from central polling stations. Turnout metadata is calculated based on registered voters per district.
                  </p>
                </div>
              </>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
