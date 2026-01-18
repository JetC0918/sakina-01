import { useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Hook to warm up the backend server (Render free tier sleeps after inactivity).
 * This sends a lightweight request to the health endpoint when the app loads.
 */
export const useBackendWarmup = () => {
    useEffect(() => {
        const warmup = async () => {
            try {
                // Fire and forget - we don't care about the response
                // Use no-cors mode to avoid CORS issues if the server is waking up
                // preventing preflight checks from blocking or failing aggressively
                await fetch(`${API_URL}/health`, {
                    method: 'GET',
                    // We don't need credentials for a health check
                    credentials: 'omit',
                });
            } catch (error) {
                // Silently fail - this is just a warmup optimization
                console.debug('Backend warmup ping failed (this is expected if server is down/waking up)', error);
            }
        };

        warmup();
    }, []);
};
