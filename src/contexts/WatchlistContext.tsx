'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WatchlistContextType {
    watchlist: string[];
    addToWatchlist: (playerId: string) => void;
    removeFromWatchlist: (playerId: string) => void;
    isInWatchlist: (playerId: string) => boolean;
    toggleWatchlist: (playerId: string) => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: ReactNode }) {
    const [watchlist, setWatchlist] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from local storage
    useEffect(() => {
        const saved = localStorage.getItem('mbff-watchlist');
        if (saved) {
            try {
                setWatchlist(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse watchlist', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to local storage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('mbff-watchlist', JSON.stringify(watchlist));
        }
    }, [watchlist, isLoaded]);

    const addToWatchlist = (playerId: string) => {
        setWatchlist(prev => {
            if (prev.includes(playerId)) return prev;
            return [...prev, playerId];
        });
    };

    const removeFromWatchlist = (playerId: string) => {
        setWatchlist(prev => prev.filter(id => id !== playerId));
    };

    const isInWatchlist = (playerId: string) => watchlist.includes(playerId);

    const toggleWatchlist = (playerId: string) => {
        if (isInWatchlist(playerId)) {
            removeFromWatchlist(playerId);
        } else {
            addToWatchlist(playerId);
        }
    };

    return (
        <WatchlistContext.Provider value={{
            watchlist,
            addToWatchlist,
            removeFromWatchlist,
            isInWatchlist,
            toggleWatchlist
        }}>
            {children}
        </WatchlistContext.Provider>
    );
}

export function useWatchlist() {
    const context = useContext(WatchlistContext);
    if (context === undefined) {
        throw new Error('useWatchlist must be used within a WatchlistProvider');
    }
    return context;
}
