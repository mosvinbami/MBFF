'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { NormalizedPlayer } from '@/lib/understat';

interface PlayersContextType {
    players: NormalizedPlayer[];
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;
    refreshPlayers: () => Promise<void>;
    getPlayersByLeague: (league: string) => NormalizedPlayer[];
    getPlayersByPosition: (position: string) => NormalizedPlayer[];
    getPlayerById: (id: string) => NormalizedPlayer | undefined;
}

const PlayersContext = createContext<PlayersContextType | undefined>(undefined);

export function PlayersProvider({ children }: { children: React.ReactNode }) {
    const [players, setPlayers] = useState<NormalizedPlayer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    const refreshPlayers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/players?limit=500');
            const data = await response.json();

            if (data.success) {
                setPlayers(data.players);
                setLastUpdated(data.lastUpdated);
            } else {
                throw new Error(data.error || 'Failed to fetch players');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load players');
            console.error('Error loading players:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load players on mount
    useEffect(() => {
        refreshPlayers();
    }, [refreshPlayers]);

    const getPlayersByLeague = useCallback((league: string) => {
        return players.filter(p => p.league === league);
    }, [players]);

    const getPlayersByPosition = useCallback((position: string) => {
        return players.filter(p => p.position === position);
    }, [players]);

    const getPlayerById = useCallback((id: string) => {
        return players.find(p => p.id === id);
    }, [players]);

    return (
        <PlayersContext.Provider value={{
            players,
            loading,
            error,
            lastUpdated,
            refreshPlayers,
            getPlayersByLeague,
            getPlayersByPosition,
            getPlayerById,
        }}>
            {children}
        </PlayersContext.Provider>
    );
}

export function usePlayers() {
    const context = useContext(PlayersContext);
    if (!context) {
        throw new Error('usePlayers must be used within a PlayersProvider');
    }
    return context;
}
