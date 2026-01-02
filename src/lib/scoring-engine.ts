// ============================================
// MBFF Scoring Engine
// Calculates fantasy points for player performances
// ============================================

import { PlayerPosition, PlayerMatchStats, Player, LineupPlayer, Gameweek } from './types';

// ============================================
// SCORING RULES
// ============================================

export const SCORING_RULES = {
    // Playing time
    PLAYING_60_PLUS: 2,
    PLAYING_UNDER_60: 1,

    // Goals
    GOAL_GK: 6,
    GOAL_DEF: 6,
    GOAL_MID: 5,
    GOAL_FWD: 4,

    // Assists
    ASSIST: 3,

    // Clean sheets (60+ mins required)
    CLEAN_SHEET_GK: 4,
    CLEAN_SHEET_DEF: 4,
    CLEAN_SHEET_MID: 1,

    // Goalkeeper specific
    EVERY_3_SAVES: 1,
    PENALTY_SAVE: 5,

    // Negative points
    YELLOW_CARD: -1,
    RED_CARD: -3,
    OWN_GOAL: -2,
    PENALTY_MISS: -2,

    // Captain multiplier
    CAPTAIN_MULTIPLIER: 2,
    VICE_CAPTAIN_MULTIPLIER: 1.5,
} as const;

// ============================================
// POINT CALCULATION
// ============================================

/**
 * Calculate fantasy points for a single player's match performance
 */
export function calculateMatchPoints(
    stats: Omit<PlayerMatchStats, 'id' | 'player_id' | 'match_id' | 'fantasy_points' | 'created_at' | 'updated_at'>,
    position: PlayerPosition
): number {
    let points = 0;

    // Playing time points
    if (stats.minutes_played >= 60) {
        points += SCORING_RULES.PLAYING_60_PLUS;
    } else if (stats.minutes_played > 0) {
        points += SCORING_RULES.PLAYING_UNDER_60;
    } else {
        // Player didn't play, no points
        return 0;
    }

    // Goal points (position-dependent)
    if (stats.goals > 0) {
        const goalPoints = getGoalPoints(position);
        points += stats.goals * goalPoints;
    }

    // Assist points
    points += stats.assists * SCORING_RULES.ASSIST;

    // Clean sheet points (only if played 60+ mins)
    if (stats.clean_sheet && stats.minutes_played >= 60) {
        points += getCleanSheetPoints(position);
    }

    // Goalkeeper saves
    if (position === 'GK' && stats.saves > 0) {
        points += Math.floor(stats.saves / 3) * SCORING_RULES.EVERY_3_SAVES;
    }

    // Penalty saves (GK only)
    if (stats.penalty_saved > 0) {
        points += stats.penalty_saved * SCORING_RULES.PENALTY_SAVE;
    }

    // Negative points
    points += stats.yellow_cards * SCORING_RULES.YELLOW_CARD;
    points += stats.red_cards * SCORING_RULES.RED_CARD;
    points += stats.own_goals * SCORING_RULES.OWN_GOAL;
    points += stats.penalty_missed * SCORING_RULES.PENALTY_MISS;

    return points;
}

/**
 * Get goal points based on player position
 */
function getGoalPoints(position: PlayerPosition): number {
    switch (position) {
        case 'GK':
        case 'DEF':
            return SCORING_RULES.GOAL_DEF;
        case 'MID':
            return SCORING_RULES.GOAL_MID;
        case 'FWD':
            return SCORING_RULES.GOAL_FWD;
    }
}

/**
 * Get clean sheet points based on player position
 */
function getCleanSheetPoints(position: PlayerPosition): number {
    switch (position) {
        case 'GK':
            return SCORING_RULES.CLEAN_SHEET_GK;
        case 'DEF':
            return SCORING_RULES.CLEAN_SHEET_DEF;
        case 'MID':
            return SCORING_RULES.CLEAN_SHEET_MID;
        case 'FWD':
            return 0;
    }
}

/**
 * Calculate total weekly points for a player by aggregating all match stats
 */
export function calculateWeeklyPoints(
    matchStats: Array<Omit<PlayerMatchStats, 'id' | 'player_id' | 'match_id' | 'fantasy_points' | 'created_at' | 'updated_at'>>,
    position: PlayerPosition
): { totalPoints: number; matchesPlayed: number } {
    let totalPoints = 0;
    let matchesPlayed = 0;

    for (const stats of matchStats) {
        const matchPoints = calculateMatchPoints(stats, position);
        if (stats.minutes_played > 0) {
            matchesPlayed++;
        }
        totalPoints += matchPoints;
    }

    return { totalPoints, matchesPlayed };
}

// ============================================
// LINEUP SCORING
// ============================================

/**
 * Apply captain/vice-captain multipliers to lineup players
 */
export function applyMultipliers(
    lineupPlayers: Array<{
        player_id: string;
        is_captain: boolean;
        is_vice_captain: boolean;
        base_points: number;
        minutes_played: number;
    }>
): Array<{ player_id: string; final_points: number }> {
    const result: Array<{ player_id: string; final_points: number }> = [];

    const captain = lineupPlayers.find(p => p.is_captain);
    const viceCaptain = lineupPlayers.find(p => p.is_vice_captain);

    // Check if captain played
    const captainPlayed = captain && captain.minutes_played > 0;

    for (const player of lineupPlayers) {
        let finalPoints = player.base_points;

        if (player.is_captain) {
            finalPoints *= SCORING_RULES.CAPTAIN_MULTIPLIER;
        } else if (player.is_vice_captain && !captainPlayed) {
            // Vice captain gets captain bonus if captain didn't play
            finalPoints *= SCORING_RULES.CAPTAIN_MULTIPLIER;
        }

        result.push({
            player_id: player.player_id,
            final_points: Math.floor(finalPoints),
        });
    }

    return result;
}

// ============================================
// AUTOSUB LOGIC
// ============================================

interface AutosubCandidate {
    player: Player;
    lineupPlayer: LineupPlayer;
    weeklyPoints: number;
    minutesPlayed: number;
}

/**
 * Process autosubs for a lineup where starters didn't play
 * Rules:
 * 1. Replace with same position from bench
 * 2. Must maintain valid formation (min 3 DEF)
 * 3. Must maintain 5-league representation
 * 4. Use bench order (position_slot 12, 13, 14, 15)
 */
export function processAutosubs(
    starters: AutosubCandidate[],
    bench: AutosubCandidate[],
    formation: string
): {
    finalLineup: AutosubCandidate[];
    subs: Array<{ out: string; in: string }>;
} {
    const finalLineup = [...starters];
    const availableBench = [...bench].sort((a, b) =>
        a.lineupPlayer.position_slot - b.lineupPlayer.position_slot
    );
    const subs: Array<{ out: string; in: string }> = [];

    // Get required league representation from current starters
    const starterLeagues = new Set(
        starters
            .filter(s => s.minutesPlayed > 0)
            .map(s => s.player.team?.league_id)
            .filter(Boolean)
    );

    // Process each starter who didn't play
    for (let i = 0; i < finalLineup.length; i++) {
        const starter = finalLineup[i];

        if (starter.minutesPlayed === 0) {
            // Find valid replacement from bench
            const replacementIndex = findValidReplacement(
                starter,
                availableBench,
                finalLineup,
                starterLeagues,
                formation
            );

            if (replacementIndex !== -1) {
                const replacement = availableBench[replacementIndex];

                // Perform the sub
                finalLineup[i] = {
                    ...replacement,
                    lineupPlayer: {
                        ...replacement.lineupPlayer,
                        position_slot: starter.lineupPlayer.position_slot,
                        was_auto_subbed: true,
                    },
                };

                subs.push({
                    out: starter.player.id,
                    in: replacement.player.id,
                });

                // Remove from available bench
                availableBench.splice(replacementIndex, 1);

                // Update league representation
                if (replacement.player.team?.league_id) {
                    starterLeagues.add(replacement.player.team.league_id);
                }
            }
        }
    }

    return { finalLineup, subs };
}

/**
 * Find a valid replacement from the bench
 */
function findValidReplacement(
    starter: AutosubCandidate,
    bench: AutosubCandidate[],
    currentLineup: AutosubCandidate[],
    currentLeagues: Set<string | undefined>,
    formation: string
): number {
    const starterPosition = starter.player.position;
    const requiredLeagues = ['PL', 'LL', 'SA', 'BL', 'FL1']; // 5 required leagues

    for (let i = 0; i < bench.length; i++) {
        const candidate = bench[i];

        // Must have played
        if (candidate.minutesPlayed === 0) continue;

        // Check position compatibility
        if (!isPositionCompatible(starterPosition, candidate.player.position, currentLineup, formation)) {
            continue;
        }

        // Check if this maintains league representation
        const candidateLeague = candidate.player.team?.league_id;
        const starterLeague = starter.player.team?.league_id;

        // If starter's league would be removed, candidate must bring it back or a missing league
        const wouldLoseLeague = starterLeague &&
            !currentLineup.some(p =>
                p.player.id !== starter.player.id &&
                p.player.team?.league_id === starterLeague &&
                p.minutesPlayed > 0
            );

        if (wouldLoseLeague && candidateLeague !== starterLeague) {
            // Check if we'd still have all 5 leagues
            const testLeagues = new Set(currentLeagues);
            testLeagues.delete(starterLeague);
            if (candidateLeague) testLeagues.add(candidateLeague);

            // Verify all 5 leagues are still represented
            const hasAllLeagues = requiredLeagues.every(code =>
                Array.from(testLeagues).some(id => id === code)
            );

            if (!hasAllLeagues) continue;
        }

        return i;
    }

    return -1;
}

/**
 * Check if a bench player's position is compatible with the formation
 */
function isPositionCompatible(
    starterPosition: PlayerPosition,
    candidatePosition: PlayerPosition,
    currentLineup: AutosubCandidate[],
    formation: string
): boolean {
    // Same position is always compatible
    if (starterPosition === candidatePosition) return true;

    // GK can only be replaced by GK
    if (starterPosition === 'GK' || candidatePosition === 'GK') return false;

    // Parse formation (e.g., "3-4-3" -> { DEF: 3, MID: 4, FWD: 3 })
    const [def, mid, fwd] = formation.split('-').map(Number);
    const minDef = 3; // Always need at least 3 defenders

    // Count current positions (excluding the starter being replaced)
    const counts: Record<PlayerPosition, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
    for (const player of currentLineup) {
        if (player.player.id !== currentLineup.find(p => p.player.position === starterPosition)?.player.id) {
            counts[player.player.position]++;
        }
    }

    // Add the candidate
    counts[candidatePosition]++;

    // Check minimum defender requirement
    if (counts.DEF < minDef) return false;

    // Check if the new formation is valid (total outfield = 10)
    const totalOutfield = counts.DEF + counts.MID + counts.FWD;
    if (totalOutfield !== 10) return false;

    return true;
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Check if a lineup has representation from all 5 leagues
 */
export function hasAllLeagueRepresentation(
    players: Array<{ team?: { league?: { code: string } } }>
): { isValid: boolean; missingLeagues: string[] } {
    const requiredLeagues = ['PL', 'LL', 'SA', 'BL', 'FL1'];
    const presentLeagues = new Set(
        players.map(p => p.team?.league?.code).filter(Boolean)
    );

    const missingLeagues = requiredLeagues.filter(code => !presentLeagues.has(code));

    return {
        isValid: missingLeagues.length === 0,
        missingLeagues,
    };
}

/**
 * Validate formation constraints
 */
export function isValidFormation(
    formation: string,
    positionCounts: Record<PlayerPosition, number>
): { isValid: boolean; error?: string } {
    const [def, mid, fwd] = formation.split('-').map(Number);

    if (positionCounts.GK !== 1) {
        return { isValid: false, error: 'Must have exactly 1 goalkeeper' };
    }

    if (positionCounts.DEF < 3) {
        return { isValid: false, error: 'Must have at least 3 defenders' };
    }

    if (positionCounts.DEF !== def) {
        return { isValid: false, error: `Formation requires ${def} defenders` };
    }

    if (positionCounts.MID !== mid) {
        return { isValid: false, error: `Formation requires ${mid} midfielders` };
    }

    if (positionCounts.FWD !== fwd) {
        return { isValid: false, error: `Formation requires ${fwd} forwards` };
    }

    return { isValid: true };
}
