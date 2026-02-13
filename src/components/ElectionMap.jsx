import React, { useEffect, useRef, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTheme } from './ThemeContext';
import { Loader2, RefreshCw } from 'lucide-react';
import Legend from './Legend';

// Party color mapping
const PARTY_COLORS = {
    'BNP': '#2E7D32',
    'Jamaat': '#D32F2F',
    'NCP': '#1976D2',
    'Independent': '#F57C00',
    'Other': '#7B1FA2',
    'Pending': '#94a3b8'
};

import { getElectionData } from '../utils/electionApi';

function ElectionMap() {
    const { theme } = useTheme();
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [electionData, setElectionData] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState(null);

    // Map base style definition (Dynamic based on theme)
    const getMapStyle = (currentTheme) => ({
        version: 8,
        sources: {
            'raster-tiles': {
                type: 'raster',
                tiles: [
                    currentTheme === 'dark'
                        ? 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
                        : 'https://a.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}@2x.png'
                ],
                tileSize: 256,
                attribution: '&copy; OSM &copy; CARTO'
            }
        },
        layers: [{
            id: 'base-tiles',
            type: 'raster',
            source: 'raster-tiles'
        }]
    });

    // Handle Theme Change
    useEffect(() => {
        if (map.current) {
            map.current.setStyle(getMapStyle(theme), { diff: false });
            // Re-add sources and layers after style change
            map.current.once('styledata', () => setupMapLayers(map.current));
        }
    }, [theme]);

    const setupMapLayers = (m) => {
        if (!m.getSource('districts')) {
            m.addSource('districts', {
                type: 'geojson',
                data: electionData?.geojson || { type: 'FeatureCollection', features: [] },
                generateId: true
            });
        }

        if (!m.getLayer('districts-fill')) {
            m.addLayer({
                id: 'districts-fill',
                type: 'fill',
                source: 'districts',
                paint: {
                    'fill-color': [
                        'match',
                        ['get', 'winner_party'],
                        'BNP', PARTY_COLORS['BNP'],
                        'Jamaat', PARTY_COLORS['Jamaat'],
                        'NCP', PARTY_COLORS['NCP'],
                        'Independent', PARTY_COLORS['Independent'],
                        'Other', PARTY_COLORS['Other'],
                        PARTY_COLORS['Pending']
                    ],
                    'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        0.9,
                        0.6
                    ]
                }
            });
        }

        if (!m.getLayer('districts-line')) {
            m.addLayer({
                id: 'districts-line',
                type: 'line',
                source: 'districts',
                paint: {
                    'line-color': theme === 'dark' ? '#ffffff' : '#0f172a',
                    'line-width': 0.8,
                    'line-opacity': 0.3
                }
            });
        }

        // Add District Labels (NEW)
        if (!m.getLayer('districts-labels')) {
            m.addLayer({
                id: 'districts-labels',
                type: 'symbol',
                source: 'districts',
                layout: {
                    'text-field': ['get', 'region_name'],
                    'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                    'text-size': [
                        'interpolate', ['linear'], ['zoom'],
                        6, 8,
                        10, 14
                    ],
                    'text-anchor': 'center',
                    'text-allow-overlap': false,
                    'text-padding': 10
                },
                paint: {
                    'text-color': theme === 'dark' ? '#ffffff' : '#0f172a',
                    'text-halo-color': theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                    'text-halo-width': 1.5
                }
            });
        }
    };

    useEffect(() => {
        if (!mapContainer.current) return;

        const m = new maplibregl.Map({
            container: mapContainer.current,
            style: getMapStyle(theme),
            center: [90.4125, 23.8103],
            zoom: 6.5,
            antialias: true
        });

        m.on('load', () => {
            map.current = m;
            m.resize();
            setupMapLayers(m);

            getElectionData()
                .then(data => {
                    setElectionData(data);
                    setIsLoadingData(false);
                    if (m.getSource('districts')) {
                        m.getSource('districts').setData(data.geojson);
                        fitMapToData(m, data.geojson);
                    }
                })
                .catch(err => {
                    setError(err.message);
                    setIsLoadingData(false);
                });

            // Interactivity
            let hoveredId = null;
            m.on('mousemove', 'districts-fill', (e) => {
                if (e.features.length > 0) {
                    m.getCanvas().style.cursor = 'pointer';
                    if (hoveredId !== null) m.setFeatureState({ source: 'districts', id: hoveredId }, { hover: false });
                    hoveredId = e.features[0].id;
                    m.setFeatureState({ source: 'districts', id: hoveredId }, { hover: true });
                }
            });

            m.on('mouseleave', 'districts-fill', () => {
                m.getCanvas().style.cursor = '';
                if (hoveredId !== null) m.setFeatureState({ source: 'districts', id: hoveredId }, { hover: false });
                hoveredId = null;
            });

            m.on('click', 'districts-fill', (e) => {
                const props = e.features[0].properties;
                new maplibregl.Popup({ className: 'custom-popup', closeButton: false })
                    .setLngLat(e.lngLat)
                    .setHTML(`
                        <div class="px-4 py-3 bg-white dark:bg-slate-900 border-none rounded-xl">
                            <h4 class="text-sm font-bold text-blue-600 dark:text-blue-400 mb-1">${props.region_name || 'District'}</h4>
                            <p class="text-xs font-semibold text-slate-700 dark:text-slate-200">Winner: ${props.winner_party || 'Pending'}</p>
                            <p class="text-[10px] text-slate-500 mt-1 uppercase">Status: ${props.status || 'Counting'}</p>
                        </div>
                    `)
                    .addTo(m);
            });
        });

        const fitMapToData = (mInst, geojson) => {
            const bounds = new maplibregl.LngLatBounds();
            geojson.features.forEach(f => {
                const type = f.geometry?.type;
                if (type === 'Polygon') f.geometry.coordinates[0].forEach(c => bounds.extend(c));
                else if (type === 'MultiPolygon') f.geometry.coordinates.forEach(p => p[0].forEach(c => bounds.extend(c)));
            });
            if (!bounds.isEmpty()) mInst.fitBounds(bounds, { padding: 50, duration: 1500 });
        };

        return () => m.remove();
    }, []);

    return (
        <div className="relative w-full h-full min-h-[300px] lg:min-h-full overflow-hidden">
            <div ref={mapContainer} className="absolute inset-0 z-0 w-full h-full" />

            {/* In-Map UI Overlays */}
            <div className="absolute top-6 left-6 z-10 hidden sm:block">
                <Legend partySeats={electionData?.summary?.party_seats} />
            </div>

            {/* Mobile Loading / Status Overlay */}
            {isLoadingData && !error && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-6 py-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex items-center gap-4 animate-in zoom-in duration-300">
                        <Loader2 className="animate-spin text-blue-600" size={24} />
                        <span className="text-sm font-black tracking-tight uppercase">Initializing Map Engine...</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 z-50 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 text-center max-w-sm">
                        <RefreshCw className="mx-auto mb-4 text-rose-500" size={40} />
                        <h3 className="text-lg font-bold mb-2">Sync Connection Lost</h3>
                        <p className="text-sm text-slate-500 mb-6">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg hover:ring-4 hover:ring-blue-500/20"
                        >
                            Retry Sync
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ElectionMap;
