// Singleton to store data in memory for fast access across components
let cachedData = null;
let fetchPromise = null;

/**
 * Centeralized fetcher for election data with automatic fallback.
 * 1. Tries to fetch from the live API (/api/election/live)
 * 2. If live API fails, falls back to the local snapshot (/fallback-data.json)
 */
export const getElectionData = () => {
    // Return cached data if available (Sync access)
    if (cachedData) return Promise.resolve(cachedData);

    // Return existing fetch promise if one is in flight (Avoid duplicate requests)
    if (fetchPromise) return fetchPromise;

    // Use relative URL to use the Vite proxy (fixes CORS issues in development)
    const LIVE_URL = '/api/election/live';

    const fetchLive = (url) => fetch(url, { cache: 'no-store' })
        .then(async (res) => {
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const data = await res.json();
            return { ...data, _source: 'live' };
        });

    fetchPromise = fetchLive(LIVE_URL)
        .catch((err) => {
            console.warn('⚠️ Direct live sync failed (likely CORS or Offline), falling back to local snapshot.', err.message);
            return fetch('/fallback-data.json')
                .then(res => res.ok ? res.json() : Promise.reject('Local data missing'))
                .then(data => ({ ...data, _source: 'fallback' }));
        })
        .then((data) => {
            cachedData = data;
            return data;
        })
        .catch((err) => {
            fetchPromise = null; // Allow retrying on hard failure
            throw err;
        });

    return fetchPromise;
};

// Helper to manually clear cache/reset fetcher (useful for force refresh)
export const resetElectionData = () => {
    cachedData = null;
    fetchPromise = null;
};
