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
    points: number; // Total season points
    eventPoints?: number; // Current gameweek points
    // Transfermarkt data (optional)
    imageUrl?: string;        // Player photo URL
    clubLogo?: string;        // Team logo URL
    marketValue?: number;     // Market value in EUR
    transfermarktId?: string; // Transfermarkt player ID
    photo?: string;           // Alias for imageUrl
}

export interface SquadPlayer extends Player {
    isStarter: boolean;
    isCaptain: boolean;
    isViceCaptain: boolean;
    benchOrder: number | null;
}

interface SquadContextType {
    // Squad data
    squad: SquadPlayer[];
    budget: number;
    budgetRemaining: number;

    // Squad management (for transfers tab only)
    addPlayer: (player: Player) => { success: boolean; error?: string };
    removePlayer: (playerId: string) => void;

    // Lineup management (for pick team tab)
    setStarter: (playerId: string, isStarter: boolean) => { success: boolean; error?: string };
    swapPlayers: (starterId: string, benchId: string) => void; // Atomic swap between starter and bench
    setCaptain: (playerId: string) => void;
    setViceCaptain: (playerId: string) => void;
    setBenchOrder: (playerId: string, order: number) => void;
    saveLineup: () => void;
    hasLineupChanges: boolean;

    // Transfers
    transferPlayer: (outId: string, inPlayer: Player) => { success: boolean; error?: string };
    freeTransfers: number;
    transfersMade: number;
    transferCost: number;
    isInitialSquadComplete: boolean;
    hasUnsavedChanges: boolean;
    confirmTransfers: () => void;
    cancelTransfers: () => void;
    resetSquad: () => void;
    autoPick: (availablePlayers: Player[]) => void;

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
const POINTS_PER_EXTRA_TRANSFER = 4;

const POSITION_LIMITS: Record<PlayerPosition, { min: number; max: number }> = {
    GK: { min: 2, max: 2 },
    DEF: { min: 5, max: 5 },
    MID: { min: 5, max: 5 },
    FWD: { min: 3, max: 3 },
};

const SquadContext = createContext<SquadContextType | undefined>(undefined);

export function SquadProvider({ children }: { children: ReactNode }) {
    // Current working squad (can have unsaved changes)
    const [squad, setSquad] = useState<SquadPlayer[]>([]);

    // Saved squad (confirmed state - for reverting)
    const [savedSquad, setSavedSquad] = useState<SquadPlayer[]>([]);

    // Is the initial 15-player squad complete and saved?
    const [isInitialSquadComplete, setIsInitialSquadComplete] = useState(false);

    const [formation, setFormationState] = useState('4-3-3');
    const [freeTransfers, setFreeTransfers] = useState(1);

    // Track changes since last save
    const [changesCount, setChangesCount] = useState(0);

    const budgetRemaining = BUDGET - squad.reduce((sum, p) => sum + p.price, 0);

    // Only charge if initial squad is complete
    const transfersMade = isInitialSquadComplete ? changesCount : 0;
    const transferCost = isInitialSquadComplete
        ? Math.max(0, changesCount - freeTransfers) * POINTS_PER_EXTRA_TRANSFER
        : 0;

    // Check if there are unsaved changes (for transfers)
    const hasUnsavedChanges = JSON.stringify(squad) !== JSON.stringify(savedSquad);

    // Track lineup changes (captain, starters, formation)
    const [savedLineup, setSavedLineup] = useState<{
        starters: string[];
        captainId: string | null;
        viceCaptainId: string | null;
        formation: string;
    }>({ starters: [], captainId: null, viceCaptainId: null, formation: '4-3-3' });

    const currentLineup = {
        starters: squad.filter(p => p.isStarter).map(p => p.id).sort(),
        captainId: squad.find(p => p.isCaptain)?.id || null,
        viceCaptainId: squad.find(p => p.isViceCaptain)?.id || null,
        formation,
    };
    const hasLineupChanges = JSON.stringify(currentLineup) !== JSON.stringify(savedLineup);

    // Auto-arrange players when formation changes
    const setFormation = useCallback((newFormation: string) => {
        const [newDef, newMid, newFwd] = newFormation.split('-').map(Number);

        setSquad(prev => {
            const allPlayers = [...prev];

            const gkStarters = allPlayers.filter(p => p.position === 'GK' && p.isStarter);
            const defStarters = allPlayers.filter(p => p.position === 'DEF' && p.isStarter);
            const midStarters = allPlayers.filter(p => p.position === 'MID' && p.isStarter);
            const fwdStarters = allPlayers.filter(p => p.position === 'FWD' && p.isStarter);

            const gkBench = allPlayers.filter(p => p.position === 'GK' && !p.isStarter);
            const defBench = allPlayers.filter(p => p.position === 'DEF' && !p.isStarter);
            const midBench = allPlayers.filter(p => p.position === 'MID' && !p.isStarter);
            const fwdBench = allPlayers.filter(p => p.position === 'FWD' && !p.isStarter);

            const adjustPosition = (
                currentStarters: SquadPlayer[],
                bench: SquadPlayer[],
                targetCount: number
            ): { starters: SquadPlayer[], bench: SquadPlayer[] } => {
                const result: SquadPlayer[] = [];
                const newBench: SquadPlayer[] = [];

                if (currentStarters.length > targetCount) {
                    result.push(...currentStarters.slice(0, targetCount).map(p => ({ ...p, isStarter: true })));
                    newBench.push(...currentStarters.slice(targetCount).map(p => ({ ...p, isStarter: false })));
                    newBench.push(...bench.map(p => ({ ...p, isStarter: false })));
                } else if (currentStarters.length < targetCount) {
                    const needed = targetCount - currentStarters.length;
                    result.push(...currentStarters.map(p => ({ ...p, isStarter: true })));
                    result.push(...bench.slice(0, needed).map(p => ({ ...p, isStarter: true })));
                    newBench.push(...bench.slice(needed).map(p => ({ ...p, isStarter: false })));
                } else {
                    result.push(...currentStarters.map(p => ({ ...p, isStarter: true })));
                    newBench.push(...bench.map(p => ({ ...p, isStarter: false })));
                }

                return { starters: result, bench: newBench };
            };

            const gkResult = adjustPosition(gkStarters, gkBench, 1);
            const defResult = adjustPosition(defStarters, defBench, newDef);
            const midResult = adjustPosition(midStarters, midBench, newMid);
            const fwdResult = adjustPosition(fwdStarters, fwdBench, newFwd);

            const newSquad = [
                ...gkResult.starters, ...gkResult.bench,
                ...defResult.starters, ...defResult.bench,
                ...midResult.starters, ...midResult.bench,
                ...fwdResult.starters, ...fwdResult.bench,
            ];

            let benchOrder = 1;
            return newSquad.map(p => ({
                ...p,
                benchOrder: p.isStarter ? null : benchOrder++,
            }));
        });

        setFormationState(newFormation);
    }, []);

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
        if (squad.length >= MAX_SQUAD_SIZE) {
            return { allowed: false, reason: 'Squad is full (15 players)' };
        }

        if (player.price > budgetRemaining) {
            return { allowed: false, reason: `Not enough budget (€${budgetRemaining.toFixed(1)}M remaining)` };
        }

        const posCount = getPositionCount(player.position);
        const limit = POSITION_LIMITS[player.position];
        if (posCount >= limit.max) {
            return { allowed: false, reason: `Already have max ${limit.max} ${player.position}s` };
        }

        if (squad.some(p => p.id === player.id)) {
            return { allowed: false, reason: 'Player already in squad' };
        }

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

        const [def, mid, fwd] = formation.split('-').map(Number);
        const currentStarters = squad.filter(p => p.isStarter);
        const starterCount = currentStarters.length;

        const gkStarters = currentStarters.filter(p => p.position === 'GK').length;
        const defStarters = currentStarters.filter(p => p.position === 'DEF').length;
        const midStarters = currentStarters.filter(p => p.position === 'MID').length;
        const fwdStarters = currentStarters.filter(p => p.position === 'FWD').length;

        let shouldBeStarter = false;
        if (starterCount < 11) {
            if (player.position === 'GK' && gkStarters < 1) {
                shouldBeStarter = true;
            } else if (player.position === 'DEF' && defStarters < def) {
                shouldBeStarter = true;
            } else if (player.position === 'MID' && midStarters < mid) {
                shouldBeStarter = true;
            } else if (player.position === 'FWD' && fwdStarters < fwd) {
                shouldBeStarter = true;
            }
        }

        const benchCount = squad.filter(p => !p.isStarter).length;
        if (!shouldBeStarter && benchCount >= 4) {
            return { success: false, error: 'Bench is full (max 4 substitutes)' };
        }

        const squadPlayer: SquadPlayer = {
            ...player,
            isStarter: shouldBeStarter,
            isCaptain: false,
            isViceCaptain: false,
            benchOrder: shouldBeStarter ? null : benchCount + 1,
        };

        setSquad(prev => [...prev, squadPlayer]);

        // Only count as transfer change if initial squad is complete
        if (isInitialSquadComplete) {
            const isReturningPlayer = savedSquad.some(p => p.id === player.id);
            if (!isReturningPlayer) {
                setChangesCount(prev => prev + 1);
            }
        }

        return { success: true };
    }, [canAddPlayer, squad, formation, isInitialSquadComplete, savedSquad]);

    const removePlayer = useCallback((playerId: string) => {
        const playerToRemove = squad.find(p => p.id === playerId);
        if (!playerToRemove) return;

        setSquad(prev => prev.filter(p => p.id !== playerId));

        // If removing a player that was just added (not in saved squad), reduce change count
        if (isInitialSquadComplete) {
            const wasInSavedSquad = savedSquad.some(p => p.id === playerId);
            if (!wasInSavedSquad && changesCount > 0) {
                // This was a newly added player, so removing it reverses the change
                setChangesCount(prev => Math.max(0, prev - 1));
            }
        }
    }, [squad, isInitialSquadComplete, savedSquad, changesCount]);

    const setStarter = useCallback((playerId: string, isStarter: boolean): { success: boolean; error?: string } => {
        const player = squad.find(p => p.id === playerId);
        if (!player) return { success: false, error: 'Player not found' };

        if (isStarter) {
            const starters = squad.filter(p => p.isStarter);
            if (starters.length >= 11) {
                return { success: false, error: 'Already have 11 starters' };
            }

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

    // Atomic swap between a starter and a bench player
    const swapPlayers = useCallback((starterId: string, benchId: string) => {
        setSquad(prev => {
            const starterPlayer = prev.find(p => p.id === starterId);
            const benchPlayer = prev.find(p => p.id === benchId);

            if (!starterPlayer || !benchPlayer) return prev;
            if (!starterPlayer.isStarter || benchPlayer.isStarter) return prev;

            return prev.map(p => {
                if (p.id === starterId) {
                    // Starter moves to bench
                    return { ...p, isStarter: false, benchOrder: benchPlayer.benchOrder };
                }
                if (p.id === benchId) {
                    // Bench player becomes starter
                    return { ...p, isStarter: true, benchOrder: null };
                }
                return p;
            });
        });
    }, []);

    const transferPlayer = useCallback((outId: string, inPlayer: Player): { success: boolean; error?: string } => {
        const outPlayer = squad.find(p => p.id === outId);
        if (!outPlayer) {
            return { success: false, error: 'Player to transfer out not found' };
        }

        if (outPlayer.position !== inPlayer.position) {
            return { success: false, error: `Must replace ${outPlayer.position} with another ${outPlayer.position}` };
        }

        const newBudget = budgetRemaining + outPlayer.price;
        if (inPlayer.price > newBudget) {
            return { success: false, error: `Not enough budget after transfer (€${newBudget.toFixed(1)}M available)` };
        }

        const teamCount = squad.filter(p => p.team === inPlayer.team && p.id !== outId).length;
        if (teamCount >= 3) {
            return { success: false, error: `Max 3 players from ${inPlayer.team}` };
        }

        const newSquadPlayer: SquadPlayer = {
            ...inPlayer,
            isStarter: outPlayer.isStarter,
            isCaptain: outPlayer.isCaptain,
            isViceCaptain: outPlayer.isViceCaptain,
            benchOrder: outPlayer.benchOrder,
        };

        setSquad(prev => prev.map(p => p.id === outId ? newSquadPlayer : p));

        if (isInitialSquadComplete) {
            const outPlayerWasSaved = savedSquad.some(p => p.id === outId);
            const inPlayerWasSaved = savedSquad.some(p => p.id === inPlayer.id);

            if (outPlayerWasSaved && !inPlayerWasSaved) {
                setChangesCount(prev => prev + 1);
            } else if (!outPlayerWasSaved && inPlayerWasSaved) {
                setChangesCount(prev => Math.max(0, prev - 1));
            }
        }

        return { success: true };
    }, [squad, budgetRemaining, isInitialSquadComplete, savedSquad]);

    const confirmTransfers = useCallback(() => {
        // Mark initial squad as complete if we have 15 players
        if (!isInitialSquadComplete && squad.length === 15) {
            setIsInitialSquadComplete(true);
        }

        // Save current squad as the confirmed state
        setSavedSquad([...squad]);

        // Reset changes count for next transfer window
        setChangesCount(0);

        // Consume used free transfers
        setFreeTransfers(Math.max(0, freeTransfers - changesCount));
    }, [squad, isInitialSquadComplete, changesCount, freeTransfers]);

    const cancelTransfers = useCallback(() => {
        // Revert to saved squad
        setSquad([...savedSquad]);
        setChangesCount(0);
    }, [savedSquad]);

    const resetSquad = useCallback(() => {
        setSquad([]);
        setSavedSquad([]);
        setChangesCount(0);
        setIsInitialSquadComplete(false);
    }, []);

    const saveLineup = useCallback(() => {
        setSavedLineup({
            starters: squad.filter(p => p.isStarter).map(p => p.id).sort(),
            captainId: squad.find(p => p.isCaptain)?.id || null,
            viceCaptainId: squad.find(p => p.isViceCaptain)?.id || null,
            formation,
        });
    }, [squad, formation]);

    const autoPick = useCallback((availablePlayers: Player[]) => {
        const [def, mid, fwd] = formation.split('-').map(Number);

        // Define what we need for a full squad
        const needs: Record<PlayerPosition, number> = {
            GK: 2,
            DEF: 5,
            MID: 5,
            FWD: 3,
        };

        // Formation starter needs
        const starterNeeds: Record<PlayerPosition, number> = {
            GK: 1,
            DEF: def,
            MID: mid,
            FWD: fwd,
        };

        // Calculate what we still need
        const currentCounts = {
            GK: squad.filter(p => p.position === 'GK').length,
            DEF: squad.filter(p => p.position === 'DEF').length,
            MID: squad.filter(p => p.position === 'MID').length,
            FWD: squad.filter(p => p.position === 'FWD').length,
        };

        // Current starter counts
        const currentStarterCounts = {
            GK: squad.filter(p => p.position === 'GK' && p.isStarter).length,
            DEF: squad.filter(p => p.position === 'DEF' && p.isStarter).length,
            MID: squad.filter(p => p.position === 'MID' && p.isStarter).length,
            FWD: squad.filter(p => p.position === 'FWD' && p.isStarter).length,
        };

        // Leagues we still need (at least 1 from each)
        const leagues: LeagueCode[] = ['PL', 'LL', 'SA', 'BL', 'FL1'];
        const leaguesNeeded = new Set(
            leagues.filter(l => squad.filter(p => p.league === l).length === 0)
        );

        let currentBudget = budgetRemaining;
        const newPlayers: SquadPlayer[] = [];
        const usedIds = new Set(squad.map(p => p.id));
        const teamCounts: Record<string, number> = {};
        squad.forEach(p => {
            teamCounts[p.team] = (teamCounts[p.team] || 0) + 1;
        });

        // Find minimum prices per position
        const minPrices: Record<PlayerPosition, number> = {
            GK: Math.min(...availablePlayers.filter(p => p.position === 'GK').map(p => p.price)) || 4,
            DEF: Math.min(...availablePlayers.filter(p => p.position === 'DEF').map(p => p.price)) || 4,
            MID: Math.min(...availablePlayers.filter(p => p.position === 'MID').map(p => p.price)) || 4.5,
            FWD: Math.min(...availablePlayers.filter(p => p.position === 'FWD').map(p => p.price)) || 4.5,
        };

        // Calculate how many slots still need to be filled per position
        const getSlotsNeeded = (pos: PlayerPosition) =>
            Math.max(0, needs[pos] - currentCounts[pos]);

        // Calculate minimum budget needed for remaining slots
        const getMinBudgetNeeded = () => {
            let minNeeded = 0;
            for (const pos of ['GK', 'DEF', 'MID', 'FWD'] as PlayerPosition[]) {
                minNeeded += getSlotsNeeded(pos) * minPrices[pos];
            }
            return minNeeded;
        };

        // Sort by value (points/price) for best bang-for-buck
        const sortedByValue = [...availablePlayers].sort((a, b) =>
            (b.points / b.price) - (a.points / a.price)
        );

        // Helper to add a player
        const addPlayer = (player: Player, position: PlayerPosition) => {
            const existingPosStarters = currentStarterCounts[position];
            const newPosStarters = newPlayers.filter(p => p.position === position && p.isStarter).length;
            const totalPosStarters = existingPosStarters + newPosStarters;
            const isStarter = totalPosStarters < starterNeeds[position];

            newPlayers.push({
                ...player,
                isStarter,
                isCaptain: false,
                isViceCaptain: false,
                benchOrder: null,
            });

            usedIds.add(player.id);
            currentBudget -= player.price;
            currentCounts[position]++;
            teamCounts[player.team] = (teamCounts[player.team] || 0) + 1;
        };

        // Check if we can afford a player while leaving enough for remaining slots
        const canAfford = (player: Player) => {
            const positions: PlayerPosition[] = ['GK', 'DEF', 'MID', 'FWD'];
            let minNeeded = 0;

            for (const pos of positions) {
                const remaining = Math.max(0, needs[pos] - currentCounts[pos] -
                    (pos === player.position ? 1 : 0));
                minNeeded += remaining * minPrices[pos];
            }

            return (currentBudget - player.price) >= minNeeded;
        };

        // First pass: fill league requirements
        for (const league of leaguesNeeded) {
            for (const position of ['FWD', 'MID', 'DEF', 'GK'] as PlayerPosition[]) {
                if (currentCounts[position] >= needs[position]) continue;

                const player = sortedByValue.find(p =>
                    p.league === league &&
                    p.position === position &&
                    canAfford(p) &&
                    !usedIds.has(p.id) &&
                    (teamCounts[p.team] || 0) < 3
                );

                if (player) {
                    addPlayer(player, position);
                    leaguesNeeded.delete(league);
                    break;
                }
            }
        }

        // Second pass: fill remaining positions with best value players
        for (const position of ['FWD', 'MID', 'DEF', 'GK'] as PlayerPosition[]) {
            while (currentCounts[position] < needs[position]) {
                const player = sortedByValue.find(p =>
                    p.position === position &&
                    canAfford(p) &&
                    !usedIds.has(p.id) &&
                    (teamCounts[p.team] || 0) < 3
                );

                if (!player) break;
                addPlayer(player, position);
            }
        }

        // Add new players to squad
        if (newPlayers.length > 0) {
            const combined = [...squad, ...newPlayers];
            let benchOrder = 1;
            const finalSquad = combined.map(p => ({
                ...p,
                benchOrder: p.isStarter ? null : benchOrder++,
            }));

            setSquad(finalSquad);

            // If this fills the squad to 15, save it as the initial state
            if (finalSquad.length === 15) {
                setSavedSquad([...finalSquad]);
                setIsInitialSquadComplete(true);
                setChangesCount(0);
            }
        }
    }, [squad, formation, budgetRemaining]);

    return (
        <SquadContext.Provider value={{
            squad,
            budget: BUDGET,
            budgetRemaining,
            addPlayer,
            removePlayer,
            setStarter,
            swapPlayers,
            setCaptain,
            setViceCaptain,
            setBenchOrder,
            saveLineup,
            hasLineupChanges,
            transferPlayer,
            freeTransfers,
            transfersMade,
            transferCost,
            isInitialSquadComplete,
            hasUnsavedChanges,
            confirmTransfers,
            cancelTransfers,
            resetSquad,
            autoPick,
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
