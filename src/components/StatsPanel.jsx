import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useTheme } from './ThemeContext';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const PARTY_COLORS = {
    'BNP': '#2E7D32',
    'Jamaat': '#D32F2F',
    'NCP': '#1976D2',
    'Independent': '#F57C00',
    'Other': '#7B1FA2',
    'Pending': '#94a3b8'
};

const StatsPanel = ({ summary }) => {
    const { theme } = useTheme();

    if (!summary) return null;

    const isDark = theme === 'dark';
    const textColor = isDark ? '#f8fafc' : '#0f172a';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

    // Prepare data for Pie Chart (Seat Distribution)
    const sortedParties = Object.entries(summary.party_seats || {}).sort((a, b) => b[1] - a[1]);
    const pieData = {
        labels: sortedParties.map(([name]) => name),
        datasets: [{
            data: sortedParties.map(([, value]) => value),
            backgroundColor: sortedParties.map(([name]) => PARTY_COLORS[name] || PARTY_COLORS['Other']),
            borderColor: isDark ? '#0f172a' : '#ffffff',
            borderWidth: 2,
            hoverOffset: 12
        }]
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                titleColor: isDark ? '#fff' : '#000',
                bodyColor: isDark ? '#fff' : '#000',
                padding: 12,
                cornerRadius: 12,
                boxPadding: 6,
                usePointStyle: true
            }
        }
    };

    // Prepare data for Bar Chart (Vote Distribution)
    const barData = {
        labels: sortedParties.slice(0, 5).map(([name]) => name),
        datasets: [{
            label: 'Seats',
            data: sortedParties.slice(0, 5).map(([, value]) => value),
            backgroundColor: sortedParties.slice(0, 5).map(([name]) => PARTY_COLORS[name] || PARTY_COLORS['Other']),
            borderRadius: 8,
            barThickness: 20
        }]
    };

    const barOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                titleColor: isDark ? '#fff' : '#000',
                bodyColor: isDark ? '#fff' : '#000',
                padding: 10
            }
        },
        scales: {
            x: {
                display: false,
                grid: { display: false }
            },
            y: {
                ticks: { color: textColor, font: { size: 11, weight: 'bold' } },
                grid: { display: false }
            }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
            <section>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-6">Seat Distribution (300 Total)</h3>
                <div className="h-64 relative">
                    <Pie data={pieData} options={pieOptions} />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <span className="block text-3xl font-black">{summary.declared_seats || 0}</span>
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Declared</span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-6">
                    {sortedParties.map(([name, value]) => (
                        <div key={name} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PARTY_COLORS[name] || PARTY_COLORS['Other'] }} />
                                <span className="text-xs font-bold">{name}</span>
                            </div>
                            <span className="text-xs font-black opacity-60">{value}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-4">Top Performance (By Seats)</h3>
                <div className="h-48 w-full bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                    <Bar data={barData} options={barOptions} />
                </div>
            </section>

            <section className="bg-blue-600/10 dark:bg-blue-600/20 border border-blue-600/20 rounded-3xl p-5 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-1">
                        <h4 className="text-blue-600 dark:text-blue-400 font-black tracking-tight flex items-center gap-2">
                            <span>📊</span> DECLARATION PROGRESS
                        </h4>
                        <span className="text-xs font-black text-blue-600/50 uppercase">{Math.round((summary.declared_seats / 300) * 100)}%</span>
                    </div>
                    <div className="text-3xl font-black mb-3 italic">
                        {summary.declared_seats} <span className="text-sm font-bold text-slate-400 opacity-50 not-italic">/ 300</span>
                    </div>
                    <div className="w-full h-3 bg-blue-600/10 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                            style={{ width: `${(summary.declared_seats / 300) * 100}%` }}
                        />
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
            </section>
        </div>
    );
};

export default StatsPanel;
