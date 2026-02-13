import React from 'react';

const PARTY_COLORS = {
    'BNP': '#2E7D32',
    'Jamaat': '#D32F2F',
    'NCP': '#1976D2',
    'Independent': '#F57C00',
    'Other': '#7B1FA2',
    'Pending': '#94a3b8'
};

function SummaryPanel({ summary = {} }) {
    const {
        total_seats = 300,
        declared = 0,
        counting = 0,
        pending = 0,
        party_seats = {}
    } = summary;

    return (
        <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                Summary Stats
            </h2>

            <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                    { label: 'Total', value: total_seats, color: 'text-slate-600 dark:text-slate-400' },
                    { label: 'Declared', value: declared, color: 'text-green-600' },
                    { label: 'Counting', value: counting, color: 'text-blue-600' },
                    { label: 'Pending', value: pending, color: 'text-slate-400' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${stat.color}`}>{stat.label}</span>
                        <div className="text-xl font-black">{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Live Standings</h3>
                <div className="space-y-3">
                    {Object.entries(party_seats || {}).sort((a, b) => b[1] - a[1]).map(([party, seats]) => (
                        <div key={party} className="group">
                            <div className="flex justify-between items-end mb-1.5">
                                <span className="text-sm font-bold">{party}</span>
                                <span className="text-sm font-black">{seats} <span className="text-[10px] text-slate-400 font-normal">seats</span></span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{
                                        width: total_seats > 0 ? `${(seats / total_seats) * 100}%` : '0%',
                                        backgroundColor: PARTY_COLORS[party] || PARTY_COLORS['Pending']
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SummaryPanel;
