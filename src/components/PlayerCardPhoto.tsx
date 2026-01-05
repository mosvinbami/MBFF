'use client';

import { useState, useEffect, memo } from 'react';
import Image from 'next/image';
import styles from './PlayerCard.module.css';

interface PlayerCardPhotoProps {
    playerName: string;
    existingPhoto?: string;
    className?: string;
}

// In-memory cache for photos
const photoCache = new Map<string, string | null>();

// Request queue to prevent rate limiting
const pendingRequests = new Map<string, Promise<string | null>>();
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 200; // 200ms between requests = 5 requests/second

async function fetchPhotoWithQueue(playerName: string): Promise<string | null> {
    // Check cache first
    if (photoCache.has(playerName)) {
        return photoCache.get(playerName) || null;
    }

    // Check if there's a pending request for this player
    const pending = pendingRequests.get(playerName);
    if (pending) {
        return pending;
    }

    // Create a new request with rate limiting
    const requestPromise = (async () => {
        // Wait for minimum interval
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime;
        if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
            await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
        }
        lastRequestTime = Date.now();

        try {
            const response = await fetch(`/api/thesportsdb?player=${encodeURIComponent(playerName)}`);
            const data = await response.json();

            if (data.success && data.found && data.player?.imageUrl) {
                photoCache.set(playerName, data.player.imageUrl);
                return data.player.imageUrl;
            } else {
                photoCache.set(playerName, null);
                return null;
            }
        } catch (err) {
            photoCache.set(playerName, null);
            return null;
        } finally {
            pendingRequests.delete(playerName);
        }
    })();

    pendingRequests.set(playerName, requestPromise);
    return requestPromise;
}

/**
 * Player photo component that fetches from TheSportsDB with rate limiting
 */
function PlayerCardPhotoComponent({ playerName, existingPhoto, className }: PlayerCardPhotoProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(existingPhoto || null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(!existingPhoto);

    useEffect(() => {
        // If already have a photo AND we haven't encountered an error with it yet, use it
        if (existingPhoto && !error) {
            setImageUrl(existingPhoto);
            setLoading(false);
            return;
        }

        // If we had an error with existing photo, or didn't have one, try cache/fetch

        // Check cache immediately
        if (photoCache.has(playerName)) {
            const cached = photoCache.get(playerName);
            setImageUrl(cached || null);
            setLoading(false);
            return;
        }

        let mounted = true;

        // Fetch from TheSportsDB with queue
        fetchPhotoWithQueue(playerName).then(url => {
            if (mounted) {
                setImageUrl(url);
                setLoading(false);
            }
        });

        return () => { mounted = false; };
    }, [playerName, existingPhoto, error]);

    // Show initial while loading or on error or no image
    if (loading || error || !imageUrl) {
        return (
            <span className={`${styles.playerInitial} ${className || ''}`}>
                {playerName.charAt(0)}
            </span>
        );
    }

    return (
        <Image
            src={imageUrl}
            alt={playerName}
            width={48}
            height={48}
            className={`${styles.playerImage} ${className || ''}`}
            onError={() => {
                // If it was an existing photo that failed, trigger fetch by setting error state
                // which will re-run the effect
                if (existingPhoto && imageUrl === existingPhoto) {
                    setError(true);
                    setImageUrl(null); // Clear invalid URL
                    setLoading(true);  // Show loading while we fetch
                } else {
                    // Start showing initials if even the fallback failed
                    setError(true);
                }
            }}
            unoptimized
        />
    );
}

// Memoize to prevent unnecessary re-renders
export const PlayerCardPhoto = memo(PlayerCardPhotoComponent);

/**
 * Pre-load photos for a list of player names (call on page load)
 */
export async function preloadPlayerPhotos(playerNames: string[]): Promise<void> {
    // Only load first 20 visible players
    const toLoad = playerNames.slice(0, 20).filter(name => !photoCache.has(name));

    for (const name of toLoad) {
        await fetchPhotoWithQueue(name);
    }
}
