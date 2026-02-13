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

    // Use absolute URL to bypass proxy issues on Vercel/Netlify
    const LIVE_URL = 'https://geotasker.ai/api/election/live';

    fetchPromise = fetch(LIVE_URL)
        .then(async (res) => {
            if (!res.ok) throw new Error(`Live API failure: ${res.status}`);
            const data = await res.json();
            console.log('✅ Live data synchronized.');
            return data;
        })
        .catch((err) => {
            console.warn('⚠️ Live sync failed, attempting fallback to local JSON...', err.message);
            // Fallback to local snapshot
            return fetch('/fallback-data.json')
                .then(async (res) => {
                    if (!res.ok) throw new Error('Fallback data also unavailable.');
                    const data = await res.json();
                    console.log('📊 Loaded from fallback local snapshot.');
                    return data;
                });
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
