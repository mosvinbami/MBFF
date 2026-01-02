'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

// Types
export type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD';
export type LeagueCode = 'PL' | 'LL' | 'SA' | 'BL' | 'FL1';

export interface Player {
    id: string;
    name: string;
    team: string;
    league: LeagueCode;
    position: PlayerPosition;
    price: number;
    points: number;
    image?: string;
}

export interface SquadPlayer extends Player {
    isStarter: boolean;
    isCaptain: boolean;
    isViceCaptain: boolean;
    benchOrder: number | null; // 1-4 for bench players
}

interface SquadContextType {
    // Squad data
    squad: SquadPlayer[];
    budget: number;
    budgetRemaining: number;

    // Squad management
    addPlayer: (player: Player) => { success: boolean; error?: string };
    removePlayer: (playerId: string) => void;

    // Lineup management
    setStarter: (playerId: string, isStarter: boolean) => { success: boolean; error?: string };
    setCaptain: (playerId: string) => void;
    setViceCaptain: (playerId: string) => void;
    setBenchOrder: (playerId: string, order: number) => void;

    // Transfers
    transferPlayer: (outId: string, inPlayer: Player) => { success: boolean; error?: string };

    // Validation helpers
    canAddPlayer: (player: Player) => { allowed: boolean; reason?: string };
    getPositionCount: (position: PlayerPosition) => number;
    getLeagueCount: (league: LeagueCode) => number;
    getStarterCount: () => number;
    getFormation: () => string;

    // Formation
    formation: string;
    setFormation: (formation: string) => void;
}

const BUDGET = 100;
const MAX_SQUAD_SIZE = 15;

const POSITION_LIMITS: Record<PlayerPosition, { min: number; max: number }> = {
    GK: { min: 2, max: 2 },
    DEF: { min: 5, max: 5 },
    MID: { min: 5, max: 5 },
    FWD: { min: 3, max: 3 },
};

const SquadContext = createContext<SquadContextType | undefined>(undefined);

export function SquadProvider({ children }: { children: ReactNode }) {
    const [squad, setSquad] = useState<SquadPlayer[]>([]);
    const [formation, setFormation] = useState('4-3-3');

    const budgetRemaining = BUDGET - squad.reduce((sum, p) => sum + p.price, 0);

    const getPositionCount = useCallback((position: PlayerPosition) => {
        return squad.filter(p => p.position === position).length;
    }, [squad]);

    const getLeagueCount = useCallback((league: LeagueCode) => {
        return squad.filter(p => p.league === league).length;
    }, [squad]);

    const getStarterCount = useCallback(() => {
        return squad.filter(p => p.isStarter).length;
    }, [squad]);

    const getFormation = useCallback(() => {
        const starters = squad.filter(p => p.isStarter);
        const def = starters.filter(p => p.position === 'DEF').length;
        const mid = starters.filter(p => p.position === 'MID').length;
        const fwd = starters.filter(p => p.position === 'FWD').length;
        return `${def}-${mid}-${fwd}`;
    }, [squad]);

    const canAddPlayer = useCallback((player: Player): { allowed: boolean; reason?: string } => {
        // Check squad size
        if (squad.length >= MAX_SQUAD_SIZE) {
            return { allowed: false, reason: 'Squad is full (15 players)' };
        }

        // Check budget
        if (player.price > budgetRemaining) {
            return { allowed: false, reason: `Not enough budget (€${budgetRemaining.toFixed(1)}M remaining)` };
        }

        // Check position limit
        const posCount = getPositionCount(player.position);
        const limit = POSITION_LIMITS[player.position];
        if (posCount >= limit.max) {
            return { allowed: false, reason: `Already have max ${limit.max} ${player.position}s` };
        }

        // Check if already in squad
        if (squad.some(p => p.id === player.id)) {
            return { allowed: false, reason: 'Player already in squad' };
        }

        // Check max 3 from same team
        const teamCount = squad.filter(p => p.team === player.team).length;
        if (teamCount >= 3) {
            return { allowed: false, reason: `Max 3 players from ${player.team}` };
        }

        return { allowed: true };
    }, [squad, budgetRemaining, getPositionCount]);

    const addPlayer = useCallback((player: Player): { success: boolean; error?: string } => {
        const check = canAddPlayer(player);
        if (!check.allowed) {
            return { success: false, error: check.reason };
        }

        const squadPlayer: SquadPlayer = {
            ...player,
            isStarter: false,
            isCaptain: false,
            isViceCaptain: false,
            benchOrder: null,
        };

        setSquad(prev => [...prev, squadPlayer]);
        return { success: true };
    }, [canAddPlayer]);

    const removePlayer = useCallback((playerId: string) => {
        setSquad(prev => prev.filter(p => p.id !== playerId));
    }, []);

    const setStarter = useCallback((playerId: string, isStarter: boolean): { success: boolean; error?: string } => {
        const player = squad.find(p => p.id === playerId);
        if (!player) return { success: false, error: 'Player not found' };

        if (isStarter) {
            // Check if we can add more starters
            const starters = squad.filter(p => p.isStarter);
            if (starters.length >= 11) {
                return { success: false, error: 'Already have 11 starters' };
            }

            // Validate formation based on position
            const [def, mid, fwd] = formation.split('-').map(Number);
            const positionStarters = starters.filter(p => p.position === player.position).length;

            let maxForPosition = 0;
            if (player.position === 'GK') maxForPosition = 1;
            else if (player.position === 'DEF') maxForPosition = def;
            else if (player.position === 'MID') maxForPosition = mid;
            else if (player.position === 'FWD') maxForPosition = fwd;

            if (positionStarters >= maxForPosition) {
                return { success: false, error: `Formation ${formation} allows max ${maxForPosition} ${player.position}s in starting XI` };
            }
        }

        setSquad(prev => prev.map(p =>
            p.id === playerId
                ? { ...p, isStarter, benchOrder: isStarter ? null : p.benchOrder }
                : p
        ));

        return { success: true };
    }, [squad, formation]);

    const setCaptain = useCallback((playerId: string) => {
        setSquad(prev => prev.map(p => ({
            ...p,
            isCaptain: p.id === playerId,
            isViceCaptain: p.id === playerId ? false : p.isViceCaptain,
        })));
    }, []);

    const setViceCaptain = useCallback((playerId: string) => {
        setSquad(prev => prev.map(p => ({
            ...p,
            isViceCaptain: p.id === playerId,
            isCaptain: p.id === playerId ? false : p.isCaptain,
        })));
    }, []);

    const setBenchOrder = useCallback((playerId: string, order: number) => {
        setSquad(prev => prev.map(p =>
            p.id === playerId ? { ...p, benchOrder: order } : p
        ));
    }, []);

    const transferPlayer = useCallback((outId: string, inPlayer: Player): { success: boolean; error?: string } => {
        const outPlayer = squad.find(p => p.id === outId);
        if (!outPlayer) {
            return { success: false, error: 'Player to transfer out not found' };
        }

        // Check if same position
        if (outPlayer.position !== inPlayer.position) {
            return { success: false, error: `Must replace ${outPlayer.position} with another ${outPlayer.position}` };
        }

        // Check budget (considering we're removing outPlayer)
        const newBudget = budgetRemaining + outPlayer.price;
        if (inPlayer.price > newBudget) {
            return { success: false, error: `Not enough budget after transfer (€${newBudget.toFixed(1)}M available)` };
        }

        // Check team limit (excluding the player being transferred out)
        const teamCount = squad.filter(p => p.team === inPlayer.team && p.id !== outId).length;
        if (teamCount >= 3) {
            return { success: false, error: `Max 3 players from ${inPlayer.team}` };
        }

        // Check 5-league rule would still be satisfied
        const leagueCount = squad.filter(p => p.league === outPlayer.league && p.id !== outId).length;
        const inLeagueCount = squad.filter(p => p.league === inPlayer.league && p.id !== outId).length;

        // If we're removing the last player from a league, the incoming player must be from that league
        if (leagueCount === 0 && inPlayer.league !== outPlayer.league) {
            return { success: false, error: `Must maintain at least 1 player from ${outPlayer.league}` };
        }

        // Perform transfer
        const newSquadPlayer: SquadPlayer = {
            ...inPlayer,
            isStarter: outPlayer.isStarter,
            isCaptain: outPlayer.isCaptain,
            isViceCaptain: outPlayer.isViceCaptain,
            benchOrder: outPlayer.benchOrder,
        };

        setSquad(prev => prev.map(p => p.id === outId ? newSquadPlayer : p));
        return { success: true };
    }, [squad, budgetRemaining]);

    return (
        <SquadContext.Provider value={{
            squad,
            budget: BUDGET,
            budgetRemaining,
            addPlayer,
            removePlayer,
            setStarter,
            setCaptain,
            setViceCaptain,
            setBenchOrder,
            transferPlayer,
            canAddPlayer,
            getPositionCount,
            getLeagueCount,
            getStarterCount,
            getFormation,
            formation,
            setFormation,
        }}>
            {children}
        </SquadContext.Provider>
    );
}

export function useSquad() {
    const context = useContext(SquadContext);
    if (context === undefined) {
        throw new Error('useSquad must be used within a SquadProvider');
    }
    return context;
}
