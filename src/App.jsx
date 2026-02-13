import React, { useState, useEffect } from 'react';
import ElectionMap from './components/ElectionMap';
import StatsPanel from './components/StatsPanel';
import SummaryPanel from './components/SummaryPanel';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { Sun, Moon, BarChart3, Map as MapIcon, Share2, Info, Search, Filter, Camera, Zap, Globe, RefreshCcw } from 'lucide-react';
import { MapSearchBar } from './components/MapSearchBar';
import { ResultTicker } from './components/ResultTicker';

import { getElectionData, resetElectionData } from './utils/electionApi';

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const [view, setView] = useState('map');
  const [data, setData] = useState(null);
  const [selection, setSelection] = useState(null);
  const [partyFilter, setPartyFilter] = useState('All');
  const [showContestedOnly, setShowContestedOnly] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [dataSource, setDataSource] = useState('syncing');
  const [errorDetail, setErrorDetail] = useState(null);

  const loadData = (isRefresh = false) => {
    if (isRefresh) resetElectionData();
    setDataSource('syncing');
    setErrorDetail(null);

    getElectionData()
      .then(res => {
        setData(res);
        setDataSource(res._source || 'live');
      })
      .catch(err => {
        console.error('Data Fetch Error:', err);
        setDataSource('error');
        setErrorDetail(err.message);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/40">
      {/* Premium Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-blue-500/20">
                <img src="/electionlogo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-black tracking-tight leading-none uppercase text-slate-900 dark:text-white">Bangladesh</h1>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mt-0.5">Election Portal 2026</p>
              </div>

              {/* Data Source Badge */}
              <div className="hidden lg:block ml-4">
                <div
                  onClick={() => loadData(true)}
                  title={errorDetail || (dataSource === 'live' ? 'Connected to live stream' : 'Using local fallback')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full border cursor-pointer hover:shadow-md transition-all ${dataSource === 'live'
                      ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400'
                      : dataSource === 'fallback'
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                        : dataSource === 'error'
                          ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                          : 'bg-slate-500/10 border-slate-500/20 text-slate-500'
                    }`}
                >
                  {dataSource === 'syncing' ? (
                    <RefreshCcw className="w-3 h-3 animate-spin" />
                  ) : dataSource === 'error' ? (
                    <Zap className="w-3 h-3" />
                  ) : (
                    <Globe className={`w-3 h-3 ${dataSource === 'live' ? 'animate-pulse' : ''}`} />
                  )}
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {dataSource === 'live' ? 'Live Stream Active' :
                      dataSource === 'fallback' ? 'Fallback Mode' :
                        dataSource === 'error' ? 'Sync Error' : 'Syncing...'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Contested Toggle (Desktop) */}
            <button
              onClick={() => setShowContestedOnly(!showContestedOnly)}
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all font-bold text-xs ${showContestedOnly
                ? 'bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-900/40 dark:border-amber-800 dark:text-amber-400'
                : 'bg-slate-100 border-transparent text-slate-500 hover:bg-slate-200 dark:bg-slate-800/50'
                }`}
            >
              <Filter size={14} className={showContestedOnly ? 'animate-pulse' : ''} />
              <span>Contested Seats</span>
            </button>

            {/* View Switcher Mobile/Tablet */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl lg:hidden">
              <button
                onClick={() => setView('map')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${view === 'map' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                <MapIcon size={14} />
                <span className="hidden xs:block">Map</span>
              </button>
              <button
                onClick={() => setView('stats')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${view === 'stats' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}
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
              <button
                onClick={() => {
                  setIsSharing(true);

                  // Generate a professional text summary for the clipboard
                  const stats = data?.summary;
                  if (stats) {
                    const partyList = Object.entries(stats.party_seats || {})
                      .sort((a, b) => b[1] - a[1])
                      .map(([p, s]) => `${p}: ${s} seats`)
                      .join('\n');

                    const summaryText = `🗳️ BANGLADESH ELECTION PORTAL - LIVE UPDATE\n\n` +
                      `Total Seats: ${stats.total_seats}\n` +
                      `Declared: ${stats.declared}\n` +
                      `Counting: ${stats.counting}\n\n` +
                      `STANDINGS:\n${partyList}\n\n` +
                      `Generated at: ${new Date().toLocaleTimeString()}\n` +
                      `🌐 Live via: geotasker.ai`;

                    navigator.clipboard.writeText(summaryText).catch(err => {
                      console.error('Snapshot failed to copy: ', err);
                    });
                  }

                  setTimeout(() => setIsSharing(false), 2000);
                }}
                className={`w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-300 dark:hover:border-slate-700 ${isSharing ? 'animate-bounce' : ''}`}
              >
                <Camera size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-[61px] h-screen flex flex-col overflow-hidden">
        {/* Live Ticker Bar */}
        <ResultTicker data={data?.geojson?.features} onSelect={(r) => {
          setSelection({ feature: r });
          setView('map');
        }} />

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Map Engine Viewport */}
          <section className={`flex-1 relative min-h-[50vh] lg:min-h-0 bg-slate-200 dark:bg-slate-900/50 ${view === 'stats' ? 'hidden lg:block' : 'block'}`}>
            <ElectionMap
              data={data}
              selection={selection}
              partyFilter={partyFilter}
              showContestedOnly={showContestedOnly}
            />

            {/* Search Top-Center Overlay */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-full px-6 flex justify-center pointer-events-none">
              <MapSearchBar data={data?.geojson?.features || []} onSelect={(r) => setSelection({ feature: r })} />
            </div>

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
                    <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50 uppercase italic">Dashboard</h2>
                      {partyFilter !== 'All' && (
                        <button
                          onClick={() => setPartyFilter('All')}
                          className="text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          Reset Filter
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="lg:hidden">
                    <SummaryPanel summary={data.summary} />
                  </div>

                  <StatsPanel
                    summary={data.summary}
                    activeFilter={partyFilter}
                    onFilterChange={setPartyFilter}
                  />

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
        </div>

        {/* Share Snapshot Toast */}
        {isSharing && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-5 duration-300">
            <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-bold tracking-tight">Dashboard Snapshot saved to clipboard!</span>
            </div>
          </div>
        )}
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
