'use client';

import { useState, useEffect } from 'react';

interface PlayerPhoto {
    imageUrl: string | null;
    loading: boolean;
}

// Cache for player photos
const photoCache = new Map<string, string | null>();

/**
 * Hook to fetch player photo from TheSportsDB
 * Only fetches if the player doesn't already have a photo
 */
export function usePlayerPhoto(playerName: string, existingPhoto?: string): PlayerPhoto {
    const [imageUrl, setImageUrl] = useState<string | null>(existingPhoto || null);
    const [loading, setLoading] = useState(!existingPhoto);

    useEffect(() => {
        // If player already has a photo, use it
        if (existingPhoto) {
            setImageUrl(existingPhoto);
            setLoading(false);
            return;
        }

        // Check cache first
        if (photoCache.has(playerName)) {
            setImageUrl(photoCache.get(playerName) || null);
            setLoading(false);
            return;
        }

        // Fetch from TheSportsDB
        const fetchPhoto = async () => {
            try {
                const response = await fetch(`/api/thesportsdb?player=${encodeURIComponent(playerName)}`);
                const data = await response.json();

                if (data.success && data.found && data.player?.imageUrl) {
                    photoCache.set(playerName, data.player.imageUrl);
                    setImageUrl(data.player.imageUrl);
                } else {
                    photoCache.set(playerName, null);
                    setImageUrl(null);
                }
            } catch (error) {
                console.error(`Failed to fetch photo for ${playerName}:`, error);
                photoCache.set(playerName, null);
                setImageUrl(null);
            } finally {
                setLoading(false);
            }
        };

        fetchPhoto();
    }, [playerName, existingPhoto]);

    return { imageUrl, loading };
}

/**
 * Batch fetch player photos (for list views)
 * Returns a map of player names to image URLs
 */
export async function fetchPlayerPhotos(playerNames: string[]): Promise<Map<string, string | null>> {
    const results = new Map<string, string | null>();

    // Filter out players already in cache
    const uncachedNames = playerNames.filter(name => !photoCache.has(name));

    // Add cached results
    playerNames.forEach(name => {
        if (photoCache.has(name)) {
            results.set(name, photoCache.get(name) || null);
        }
    });

    // Fetch uncached photos (limited to avoid rate limits)
    const batchSize = 10;
    for (let i = 0; i < Math.min(uncachedNames.length, batchSize); i++) {
        const name = uncachedNames[i];
        try {
            const response = await fetch(`/api/thesportsdb?player=${encodeURIComponent(name)}`);
            const data = await response.json();

            if (data.success && data.found && data.player?.imageUrl) {
                photoCache.set(name, data.player.imageUrl);
                results.set(name, data.player.imageUrl);
            } else {
                photoCache.set(name, null);
                results.set(name, null);
            }
        } catch (error) {
            photoCache.set(name, null);
            results.set(name, null);
        }
    }

    return results;
}
