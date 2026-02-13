import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin } from 'lucide-react';

export function MapSearchBar({ data, onSelect }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Filter districts based on query
    useEffect(() => {
        if (!query.trim() || query.length < 1) {
            setResults([]);
            return;
        }

        const filtered = data.filter(d =>
            d.properties.region_name?.toLowerCase().includes(query.toLowerCase()) ||
            d.properties.region_code?.includes(query)
        ).slice(0, 5); // Limit to top 5 results

        setResults(filtered);
    }, [query, data]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (district) => {
        onSelect(district);
        setQuery('');
        setResults([]);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className="relative w-full max-w-xs pointer-events-auto">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-10 py-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-lg"
                    placeholder="Search Seat (e.g. Dhaka-1)..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                {query && (
                    <button
                        onClick={() => setQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                        <X className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                    </button>
                )}
            </div>

            {/* Results Dropdown */}
            {isOpen && results.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-1">
                        {results.map((r) => (
                            <button
                                key={r.properties.id}
                                onClick={() => handleSelect(r)}
                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                    <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                        {r.properties.region_name}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                                        Winner: <span className="font-medium text-slate-700 dark:text-slate-300">{r.properties.winner_party || 'Counting...'}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
