import React from 'react';
import { Radio, ChevronRight } from 'lucide-react';

export function ResultTicker({ data, onSelect }) {
    // Get latest 6 results that are 'declared'
    const latestResults = data
        ?.filter(f => f.properties.status === 'declared')
        ?.sort((a, b) => new Date(b.properties.updated_at) - new Date(a.properties.updated_at))
        ?.slice(0, 6) || [];

    if (latestResults.length === 0) return null;

    return (
        <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-2 overflow-hidden pointer-events-auto shadow-sm">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 flex items-center gap-4">
                {/* Badge */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 dark:bg-red-500/20 rounded-lg whitespace-nowrap">
                    <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 mt-0.5">Live Feed</span>
                </div>

                {/* Ticker Container */}
                <div className="flex-1 overflow-hidden relative group">
                    <div className="flex animate-ticker whitespace-nowrap gap-8 py-1">
                        {/* Repeat twice for seamless scroll if needed, but flex-items suffice for news banner style */}
                        {latestResults.map((r, i) => (
                            <button
                                key={`${r.properties.id}-${i}`}
                                onClick={() => onSelect(r)}
                                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group/item"
                            >
                                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover/item:underline">
                                    {r.properties.region_name}
                                </span>
                                <span className="text-[11px] font-medium px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded uppercase tracking-tighter">
                                    {r.properties.winner_party}
                                </span>
                                <ChevronRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Summary Viewport (Optional simple counter) */}
                <div className="hidden lg:flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-4 ml-auto">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Total Declared:</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">298 / 300</span>
                </div>
            </div>

            {/* Custom Animation Style */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes ticker {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-ticker {
                    animation: ticker 30s linear infinite;
                }
                .animate-ticker:hover {
                    animation-play-state: paused;
                }
            `}} />
        </div>
    );
}
