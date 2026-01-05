'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BUNDESLIGA_PLAYERS } from '@/data/players-bundesliga';
import { LALIGA_PLAYERS } from '@/data/players-laliga';
import { SERIEA_PLAYERS } from '@/data/players-seriea';
import { LIGUE1_PLAYERS } from '@/data/players-ligue1';
import { getPlayerPhotoUrl } from '@/data/transfermarkt-ids';

// Local player type (replaces Understat)
export type LeagueCode = 'PL' | 'LL' | 'SA' | 'BL' | 'FL1';

export interface NormalizedPlayer {
    id: string;
    name: string;
    team: string;
    league: LeagueCode;
    position: 'GK' | 'DEF' | 'MID' | 'FWD';
    price: number;
    points: number; // Total season points
    eventPoints?: number; // Current gameweek points (PL only)
    goals: number;
    assists: number;
    cleanSheets: number;
    yellowCards: number;
    redCards: number;
    minutesPlayed: number;
    xG: number;
    xA: number;
    photo?: string; // Player photo URL (PL only)
}

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

// Merge static league players into NormalizedPlayer format
const staticPlayers: NormalizedPlayer[] = [
    ...BUNDESLIGA_PLAYERS,
    ...LALIGA_PLAYERS,
    ...SERIEA_PLAYERS,
    ...LIGUE1_PLAYERS,
].map(p => ({
    id: p.id,
    name: p.name,
    team: p.team,
    position: p.position,
    price: p.price,
    points: p.points,
    league: p.league as 'PL' | 'LL' | 'SA' | 'BL' | 'FL1',
    goals: Math.floor(p.points / 15), // Estimate goals from points
    assists: Math.floor(p.points / 25), // Estimate assists from points
    xG: 0,
    xA: 0,
    cleanSheets: 0,
    yellowCards: 0,
    redCards: 0,
    minutesPlayed: 1800, // Assume decent playing time
    photo: getPlayerPhotoUrl(p.name) || undefined, // Add Transfermarkt photo
}));

export function PlayersProvider({ children }: { children: React.ReactNode }) {
    const [players, setPlayers] = useState<NormalizedPlayer[]>(staticPlayers);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    const refreshPlayers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/players?limit=2500'); // Get ALL players
            const data = await response.json();

            if (data.success) {
                // API players are Premier League from FPL
                const apiPlayers: NormalizedPlayer[] = data.players || [];

                // Create a Map to dedupe by ID
                const playerMap = new Map<string, NormalizedPlayer>();

                // Add API players first (these are live PL data)
                apiPlayers.forEach(p => {
                    playerMap.set(p.id, p);
                });

                // Add static players (these fill in other leagues)
                staticPlayers.forEach(p => {
                    // Only add if not already in map (prevents duplicates)
                    if (!playerMap.has(p.id)) {
                        playerMap.set(p.id, p);
                    }
                });

                // Fetch live points for all leagues
                const leagues: Array<'PL' | 'LL' | 'SA' | 'BL' | 'FL1'> = ['PL', 'LL', 'SA', 'BL', 'FL1'];
                const livePointsPromises = leagues.map(async (league) => {
                    try {
                        const res = await fetch(`/api/live-points?league=${league}`);
                        const liveData = await res.json();
                        return { league, players: liveData.players || [] };
                    } catch {
                        return { league, players: [] };
                    }
                });

                const livePointsResults = await Promise.all(livePointsPromises);

                // Create a lookup map for live points by player name (lowercase for matching)
                const livePointsLookup = new Map<string, number>();
                for (const result of livePointsResults) {
                    for (const livePlayer of result.players) {
                        const key = livePlayer.playerName.toLowerCase();
                        // Add to existing points if player has multiple matches (shouldn't happen usually)
                        const existing = livePointsLookup.get(key) || 0;
                        livePointsLookup.set(key, existing + livePlayer.eventPoints);
                    }
                }

                // Merge live points into player data
                const allPlayers = Array.from(playerMap.values()).map(player => {
                    const livePoints = livePointsLookup.get(player.name.toLowerCase());
                    if (livePoints !== undefined) {
                        return { ...player, eventPoints: livePoints };
                    }
                    // Keep existing eventPoints if already set (e.g., from FPL)
                    return player;
                });

                setPlayers(allPlayers);
                setLastUpdated(data.lastUpdated);
            } else {
                // If API fails, still show static players
                setPlayers(staticPlayers);
                throw new Error(data.error || 'Failed to fetch players');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load players');
            console.error('Error loading players:', err);
            // Ensure static players are available even on error
            setPlayers(staticPlayers);
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
