/**
 * Fantasy Points Calculation System
 * 
 * FPL-style scoring rules for calculating player points from match statistics.
 * Points are calculated based on:
 * - Minutes played
 * - Goals scored (varies by position)
 * - Assists
 * - Clean sheets (varies by position)
 * - Saves (goalkeepers)
 * - Cards (yellow/red)
 * - Bonus points
 */

export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

// Scoring rules (FPL-style)
export const SCORING_RULES = {
    // Minutes played
    playingTime: {
        under60: 1,  // 1-59 minutes
        over60: 2,   // 60+ minutes
    },

    // Goals scored by position
    goals: {
        GK: 6,
        DEF: 6,
        MID: 5,
        FWD: 4,
    },

    // Assists (same for all positions)
    assists: 3,

    // Clean sheets by position
    cleanSheets: {
        GK: 4,
        DEF: 4,
        MID: 1,
        FWD: 0,
    },

    // Goalkeeper specific
    saves: {
        perThree: 1, // 1 point per 3 saves
    },
    penaltySaved: 5,

    // Cards
    yellowCard: -1,
    redCard: -3,

    // Goals conceded (GK/DEF only)
    goalsConceded: {
        perTwo: -1, // -1 per 2 goals conceded (min 60 mins)
    },

    // Own goal
    ownGoal: -2,

    // Penalty missed
    penaltyMissed: -2,

    // Bonus points (1-3 for best performers)
    bonus: {
        first: 3,
        second: 2,
        third: 1,
    },
} as const;

// Match statistics for a player
export interface PlayerMatchStats {
    playerId: string;
    position: Position;
    minutes: number;
    goals: number;
    assists: number;
    cleanSheet: boolean;
    saves?: number;
    penaltiesSaved?: number;
    yellowCards: number;
    redCards: number;
    goalsConceded?: number;
    ownGoals?: number;
    penaltiesMissed?: number;
    bonusPoints?: number;
}

// Calculated points breakdown
export interface PointsBreakdown {
    playingTime: number;
    goals: number;
    assists: number;
    cleanSheet: number;
    saves: number;
    penaltySaved: number;
    yellowCards: number;
    redCards: number;
    goalsConceded: number;
    ownGoals: number;
    penaltiesMissed: number;
    bonus: number;
    total: number;
}

/**
 * Calculate fantasy points for a player based on match statistics
 */
export function calculatePoints(stats: PlayerMatchStats): PointsBreakdown {
    const breakdown: PointsBreakdown = {
        playingTime: 0,
        goals: 0,
        assists: 0,
        cleanSheet: 0,
        saves: 0,
        penaltySaved: 0,
        yellowCards: 0,
        redCards: 0,
        goalsConceded: 0,
        ownGoals: 0,
        penaltiesMissed: 0,
        bonus: 0,
        total: 0,
    };

    // Playing time points
    if (stats.minutes > 0) {
        breakdown.playingTime = stats.minutes >= 60
            ? SCORING_RULES.playingTime.over60
            : SCORING_RULES.playingTime.under60;
    }

    // Goals
    breakdown.goals = stats.goals * SCORING_RULES.goals[stats.position];

    // Assists
    breakdown.assists = stats.assists * SCORING_RULES.assists;

    // Clean sheets (only if played 60+ minutes)
    if (stats.cleanSheet && stats.minutes >= 60) {
        breakdown.cleanSheet = SCORING_RULES.cleanSheets[stats.position];
    }

    // Goalkeeper saves
    if (stats.position === 'GK' && stats.saves) {
        breakdown.saves = Math.floor(stats.saves / 3) * SCORING_RULES.saves.perThree;
    }

    // Penalty saved
    if (stats.penaltiesSaved) {
        breakdown.penaltySaved = stats.penaltiesSaved * SCORING_RULES.penaltySaved;
    }

    // Cards
    breakdown.yellowCards = stats.yellowCards * SCORING_RULES.yellowCard;
    breakdown.redCards = stats.redCards * SCORING_RULES.redCard;

    // Goals conceded (GK/DEF only, if played 60+ minutes)
    if ((stats.position === 'GK' || stats.position === 'DEF') &&
        stats.minutes >= 60 &&
        stats.goalsConceded &&
        stats.goalsConceded >= 2) {
        breakdown.goalsConceded = Math.floor(stats.goalsConceded / 2) * SCORING_RULES.goalsConceded.perTwo;
    }

    // Own goals
    if (stats.ownGoals) {
        breakdown.ownGoals = stats.ownGoals * SCORING_RULES.ownGoal;
    }

    // Penalties missed
    if (stats.penaltiesMissed) {
        breakdown.penaltiesMissed = stats.penaltiesMissed * SCORING_RULES.penaltyMissed;
    }

    // Bonus points
    if (stats.bonusPoints) {
        breakdown.bonus = stats.bonusPoints;
    }

    // Calculate total
    breakdown.total = Object.values(breakdown).reduce((sum, val) => {
        if (typeof val === 'number') return sum + val;
        return sum;
    }, 0) - breakdown.total; // Subtract total to avoid doubling

    return breakdown;
}

/**
 * Gameweek history entry for a player
 */
export interface GameweekHistory {
    gameweek: number;
    fixture: string; // e.g., "ARS 2-1 CHE"
    date: string;
    points: number;
    breakdown: PointsBreakdown;
    opponent: string;
    homeAway: 'H' | 'A';
}

/**
 * Get points description for display
 */
export function getPointsDescription(key: keyof PointsBreakdown, value: number): string {
    if (value === 0) return '';

    const descriptions: Record<keyof PointsBreakdown, string> = {
        playingTime: `Minutes played: ${value > 0 ? '+' : ''}${value}`,
        goals: `Goals: ${value > 0 ? '+' : ''}${value}`,
        assists: `Assists: ${value > 0 ? '+' : ''}${value}`,
        cleanSheet: `Clean sheet: ${value > 0 ? '+' : ''}${value}`,
        saves: `Saves: ${value > 0 ? '+' : ''}${value}`,
        penaltySaved: `Penalty saved: ${value > 0 ? '+' : ''}${value}`,
        yellowCards: `Yellow card: ${value}`,
        redCards: `Red card: ${value}`,
        goalsConceded: `Goals conceded: ${value}`,
        ownGoals: `Own goal: ${value}`,
        penaltiesMissed: `Penalty missed: ${value}`,
        bonus: `Bonus: ${value > 0 ? '+' : ''}${value}`,
        total: `Total: ${value}`,
    };

    return descriptions[key];
}

/**
 * Calculate estimated weekly points based on season totals
 * Used for non-PL leagues where we don't have live gameweek data
 */
export function estimateWeeklyPoints(
    seasonPoints: number,
    gamesPlayed: number,
    position: Position
): number {
    if (gamesPlayed === 0) return 0;

    // Average points per game
    const ppg = seasonPoints / gamesPlayed;

    // Add some variance based on position (attackers more variable)
    const variance = position === 'FWD' ? 0.3 : position === 'MID' ? 0.2 : 0.1;
    const randomFactor = 1 + (Math.random() - 0.5) * variance;

    return Math.round(ppg * randomFactor);
}

export default {
    SCORING_RULES,
    calculatePoints,
    getPointsDescription,
    estimateWeeklyPoints,
};
