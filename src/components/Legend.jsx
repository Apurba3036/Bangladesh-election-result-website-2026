import React from 'react';

const PARTY_COLORS = {
    'BNP': '#2E7D32',
    'Jamaat': '#D32F2F',
    'NCP': '#1976D2',
    'Independent': '#F57C00',
    'Other': '#7B1FA2',
    'Pending': '#94a3b8'
};

const STATUS_COLORS = {
    'Declared': '#10b981',
    'Counting': '#3b82f6',
    'Pending': '#94a3b8'
};

function Legend({ partySeats = {} }) {
    return (
        <div className="p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl pointer-events-auto">
            <h3 className="text-xs font-black uppercase tracking-tighter text-slate-400 mb-3">Map Legend</h3>

            <div className="space-y-4">
                <section>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Parties</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {Object.entries(PARTY_COLORS).map(([party, color]) => (
                            <div key={party} className="flex items-center gap-2 group">
                                <div
                                    className="w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-white/50"
                                    style={{ backgroundColor: color }}
                                />
                                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">
                                    {party}
                                    {partySeats[party] !== undefined && (
                                        <span className="ml-1 text-[10px] opacity-50 font-bold">{partySeats[party]}</span>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

                <section>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Polling Status</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {Object.entries(STATUS_COLORS).map(([status, color]) => (
                            <div key={status} className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                                <span className="text-[11px] text-slate-600 dark:text-slate-400">{status}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Legend;
