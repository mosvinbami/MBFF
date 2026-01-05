/**
 * Live Fantasy Points Calculator
 * 
 * Calculates fantasy points based on real-time match events.
 * Works with API-Football data or any source providing player events.
 */

// League IDs for API-Football
export const LEAGUE_IDS = {
    PL: 39,   // Premier League
    LL: 140,  // La Liga
    SA: 135,  // Serie A
    BL: 78,   // Bundesliga
    FL1: 61,  // Ligue 1
} as const;

export type LeagueCode = keyof typeof LEAGUE_IDS;

// Fantasy points scoring system
export const SCORING = {
    // Goals
    GOAL_GK: 10,
    GOAL_DEF: 6,
    GOAL_MID: 5,
    GOAL_FWD: 4,

    // Assists
    ASSIST: 3,

    // Clean sheets (no goals conceded)
    CLEAN_SHEET_GK: 4,
    CLEAN_SHEET_DEF: 4,
    CLEAN_SHEET_MID: 1,
    CLEAN_SHEET_FWD: 0,

    // Cards
    YELLOW_CARD: -1,
    RED_CARD: -3,

    // Goalkeeper saves (per save)
    SAVE: 0.5,

    // Appearance
    PLAYED_60_MINS: 2,
    PLAYED_UNDER_60: 1,

    // Penalties
    PENALTY_SAVED: 5,
    PENALTY_MISSED: -2,

    // Own goal
    OWN_GOAL: -2,

    // Goals conceded (GK/DEF only, per 2 goals)
    GOALS_CONCEDED_2: -1,
} as const;

export interface PlayerEvent {
    playerId: string;
    playerName: string;
    team: string;
    position: 'GK' | 'DEF' | 'MID' | 'FWD';
    minutes: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    saves: number;
    penaltySaved: number;
    penaltyMissed: number;
    ownGoals: number;
    cleanSheet: boolean;
    goalsConceded: number;
}

/**
 * Calculate fantasy points for a player based on their match events
 */
export function calculateFantasyPoints(event: PlayerEvent): number {
    let points = 0;
    const pos = event.position;

    // Appearance points
    if (event.minutes >= 60) {
        points += SCORING.PLAYED_60_MINS;
    } else if (event.minutes > 0) {
        points += SCORING.PLAYED_UNDER_60;
    }

    // Goals
    if (event.goals > 0) {
        const goalPoints = pos === 'GK' ? SCORING.GOAL_GK
            : pos === 'DEF' ? SCORING.GOAL_DEF
                : pos === 'MID' ? SCORING.GOAL_MID
                    : SCORING.GOAL_FWD;
        points += event.goals * goalPoints;
    }

    // Assists
    points += event.assists * SCORING.ASSIST;

    // Clean sheets (only for GK, DEF, MID)
    if (event.cleanSheet && event.minutes >= 60) {
        const csPoints = pos === 'GK' ? SCORING.CLEAN_SHEET_GK
            : pos === 'DEF' ? SCORING.CLEAN_SHEET_DEF
                : pos === 'MID' ? SCORING.CLEAN_SHEET_MID
                    : SCORING.CLEAN_SHEET_FWD;
        points += csPoints;
    }

    // Cards
    points += event.yellowCards * SCORING.YELLOW_CARD;
    points += event.redCards * SCORING.RED_CARD;

    // Goalkeeper-specific
    if (pos === 'GK') {
        points += event.saves * SCORING.SAVE;
        points += event.penaltySaved * SCORING.PENALTY_SAVED;
    }

    // Penalty missed (any position)
    points += event.penaltyMissed * SCORING.PENALTY_MISSED;

    // Own goals
    points += event.ownGoals * SCORING.OWN_GOAL;

    // Goals conceded (GK/DEF only)
    if ((pos === 'GK' || pos === 'DEF') && event.goalsConceded >= 2) {
        points += Math.floor(event.goalsConceded / 2) * SCORING.GOALS_CONCEDED_2;
    }

    return Math.round(points);
}

/**
 * API-Football response types
 */
export interface APIFootballFixture {
    fixture: {
        id: number;
        date: string;
        status: {
            short: string; // 'FT', '1H', '2H', 'HT', 'NS', etc.
            elapsed: number | null;
        };
    };
    league: {
        id: number;
        name: string;
    };
    teams: {
        home: { id: number; name: string };
        away: { id: number; name: string };
    };
    goals: {
        home: number | null;
        away: number | null;
    };
}

export interface APIFootballPlayer {
    player: {
        id: number;
        name: string;
        photo: string;
    };
    statistics: Array<{
        games: {
            minutes: number | null;
            position: string;
        };
        goals: {
            total: number | null;
            assists: number | null;
        };
        cards: {
            yellow: number;
            red: number;
        };
        penalty: {
            saved: number | null;
            missed: number | null;
        };
    }>;
}

/**
 * Map API-Football position to our position type
 */
export function mapPosition(apiPosition: string): 'GK' | 'DEF' | 'MID' | 'FWD' {
    const pos = apiPosition?.toUpperCase() || 'MID';
    if (pos === 'G' || pos === 'GK' || pos === 'GOALKEEPER') return 'GK';
    if (pos === 'D' || pos === 'DEF' || pos === 'DEFENDER') return 'DEF';
    if (pos === 'M' || pos === 'MID' || pos === 'MIDFIELDER') return 'MID';
    if (pos === 'F' || pos === 'FWD' || pos === 'FORWARD' || pos === 'ATTACKER') return 'FWD';
    return 'MID'; // Default
}

/**
 * Check if a match has finished or is live
 */
export function isMatchActive(status: string): boolean {
    const activeStatuses = ['1H', '2H', 'HT', 'ET', 'P', 'BT', 'LIVE'];
    return activeStatuses.includes(status);
}

export function isMatchFinished(status: string): boolean {
    const finishedStatuses = ['FT', 'AET', 'PEN'];
    return finishedStatuses.includes(status);
}
