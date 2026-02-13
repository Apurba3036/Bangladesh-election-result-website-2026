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

function ElectionMap({ data, selection, partyFilter, showContestedOnly }) {
    const { theme } = useTheme();
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [error, setError] = useState(null);
    const popupRef = useRef(null);

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
                data: data?.geojson || { type: 'FeatureCollection', features: [] },
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
                        partyFilter ? 0.9 : 0.6 // Slightly higher opacity when filtering
                    ]
                }
            });
        }

        // Apply Party Filtering (NEW)
        if (m.getLayer('districts-fill')) {
            let filter = null;
            if (showContestedOnly) {
                filter = ['==', ['get', 'status'], 'counting'];
            } else if (partyFilter && partyFilter !== 'All') {
                filter = ['==', ['get', 'winner_party'], partyFilter];
            }

            // Dim others by reducing opacity if a filter is active
            m.setPaintProperty('districts-fill', 'fill-opacity',
                filter ? [
                    'case',
                    filter, 0.95,
                    0.05 // HEAVILY dim others
                ] : [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false], 0.9,
                    0.6
                ]
            );

            // Dim text labels too if they don't match
            if (m.getLayer('districts-labels')) {
                m.setPaintProperty('districts-labels', 'text-opacity',
                    filter ? ['case', filter, 1, 0.1] : 1
                );
            }
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

            // setupMapLayers handles initial empty data
            setupMapLayers(m);

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
                showDistrictPopup(m, e.features[0].properties, e.lngLat);
            });
        });

        return () => m.remove();
    }, []);

    // Handle Selection (Search/Ticker)
    useEffect(() => {
        if (map.current && selection) {
            const { feature } = selection;
            if (!feature.geometry) return;

            const centroid = getCentroid(feature.geometry);

            map.current.flyTo({
                center: centroid,
                zoom: 10,
                speed: 1.2,
                curve: 1.4,
                essential: true
            });

            showDistrictPopup(map.current, feature.properties, centroid);
        }
    }, [selection]);

    // Handle Data Sync (Fix for empty map)
    useEffect(() => {
        if (map.current && data?.geojson) {
            const m = map.current;
            const updateSource = () => {
                const source = m.getSource('districts');
                if (source) {
                    source.setData(data.geojson);
                    if (!m._fitted) {
                        fitMapToData(m, data.geojson);
                        m._fitted = true;
                    }
                } else {
                    setupMapLayers(m);
                }
            };

            if (m.isStyleLoaded()) {
                updateSource();
            } else {
                m.once('styledata', updateSource);
            }
        }
    }, [data]);

    // Handle Filter Sync
    useEffect(() => {
        if (map.current && map.current.isStyleLoaded()) {
            setupMapLayers(map.current);
        }
    }, [partyFilter, showContestedOnly]);

    const showDistrictPopup = (m, props, lngLat) => {
        if (popupRef.current) popupRef.current.remove();

        popupRef.current = new maplibregl.Popup({ className: 'custom-popup', closeButton: false })
            .setLngLat(lngLat)
            .setHTML(`
                <div class="px-4 py-3 bg-white dark:bg-slate-900 border-none rounded-xl">
                    <h4 class="text-sm font-bold text-blue-600 dark:text-blue-400 mb-1">${props.region_name || 'District'}</h4>
                    <p class="text-xs font-semibold text-slate-700 dark:text-slate-200">Winner: ${props.winner_party || 'Pending'}</p>
                    <p class="text-[10px] text-slate-500 mt-1 uppercase">Status: ${props.status || 'Counting'}</p>
                </div>
            `)
            .addTo(m);
    };

    const getCentroid = (geometry) => {
        const { type, coordinates } = geometry;
        let minX = 180, minY = 90, maxX = -180, maxY = -90;

        const extendBounds = (lng, lat) => {
            minX = Math.min(minX, lng); maxX = Math.max(maxX, lng);
            minY = Math.min(minY, lat); maxY = Math.max(maxY, lat);
        };

        const processRing = (ring) => ring.forEach(([lng, lat]) => extendBounds(lng, lat));
        const processPolygon = (poly) => poly.forEach(processRing);

        if (type === 'Polygon') {
            processPolygon(coordinates);
        } else if (type === 'MultiPolygon') {
            coordinates.forEach(processPolygon);
        }

        return [(minX + maxX) / 2, (minY + maxY) / 2];
    };

    const fitMapToData = (mInst, geojson) => {
        const bounds = new maplibregl.LngLatBounds();
        geojson.features.forEach(f => {
            const type = f.geometry?.type;
            if (type === 'Polygon') f.geometry.coordinates[0].forEach(c => bounds.extend(c));
            else if (type === 'MultiPolygon') f.geometry.coordinates.forEach(p => p[0].forEach(c => bounds.extend(c)));
        });
        if (!bounds.isEmpty()) mInst.fitBounds(bounds, { padding: 50, duration: 1500 });
    };

    return (
        <div className="relative w-full h-full min-h-[300px] lg:min-h-full overflow-hidden">
            <div ref={mapContainer} className="absolute inset-0 z-0 w-full h-full" />

            {/* In-Map UI Overlays */}
            <div className="absolute top-6 left-6 z-10 hidden sm:block">
                <Legend partySeats={data?.summary?.party_seats} />
            </div>

            {/* Mobile Loading / Status Overlay */}
            {!data && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-6 py-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex items-center gap-4 animate-in zoom-in duration-300">
                        <Loader2 className="animate-spin text-blue-600" size={24} />
                        <span className="text-sm font-black tracking-tight uppercase tracking-widest text-[#006a4e]">Synchronizing...</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ElectionMap;
