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
            // 1. Try to fetch the Universal Database (synced from TheSportsDB)
            const universalRes = await fetch('/api/players/universal');
            const universalData = await universalRes.json();

            let allPlayers: NormalizedPlayer[] = [];

            if (universalData.success && universalData.players.length > 0) {
                // Map universal DB players to Context format
                allPlayers = universalData.players.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    team: p.team,
                    league: p.league,
                    position: p.position,
                    price: p.price || 5.0,
                    points: p.points || 0,
                    goals: 0,
                    assists: 0,
                    cleanSheets: 0,
                    yellowCards: 0,
                    redCards: 0,
                    minutesPlayed: 0,
                    xG: 0,
                    xA: 0,
                    photo: p.image || undefined, // Use TSDB cutout
                }));
            } else {
                // Fallback to static lists if universal DB is empty/missing
                console.warn('Universal DB missing, using static fallback');
                allPlayers = staticPlayers;
            }

            // 2. Fetch Live FPL Data (better stats for PL)
            try {
                const fplRes = await fetch('/api/players?limit=1000');
                const fplData = await fplRes.json();

                if (fplData.success) {
                    const fplMap = new Map(fplData.players.map((p: any) => [p.name.toLowerCase(), p]));

                    // Merge FPL stats into our universal players (matching by name)
                    allPlayers = allPlayers.map(p => {
                        if (p.league === 'PL') {
                            const fplP = fplMap.get(p.name.toLowerCase());
                            if (fplP) {
                                return {
                                    ...p,
                                    // Use FPL stats which are real and live
                                    points: fplP.points,
                                    goals: fplP.goals,
                                    assists: fplP.assists,
                                    cleanSheets: fplP.cleanSheets,
                                    price: fplP.price,
                                    eventPoints: fplP.eventPoints,
                                    photo: fplP.photo || p.photo // Prefer FPL photo if standard
                                };
                            }
                        }
                        return p;
                    });
                }
            } catch (err) {
                console.warn('FPL fetch failed', err);
            }

            // 3. Fetch Python Live Points (for match events across all leagues if available)
            // This endpoint (api/live-points) connects to our python scrapers
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
            const livePointsLookup = new Map<string, number>();

            livePointsResults.forEach(result => {
                result.players.forEach((lp: any) => {
                    livePointsLookup.set(lp.playerName.toLowerCase(), lp.eventPoints);
                });
            });

            // Merge live match points
            allPlayers = allPlayers.map(p => {
                const live = livePointsLookup.get(p.name.toLowerCase());
                if (live !== undefined) {
                    return { ...p, eventPoints: live };
                }
                return p;
            });

            setPlayers(allPlayers);
            setLastUpdated(new Date().toISOString());

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load players');
            console.error('Error loading players:', err);
            setPlayers(staticPlayers); // Hard fallback
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
