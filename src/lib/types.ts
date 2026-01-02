// ============================================
// MBFF TypeScript Types
// ============================================

// ============================================
// CORE FOOTBALL TYPES
// ============================================

export type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD';
export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';
export type CompetitionType = 'LEAGUE' | 'CUP' | 'CONTINENTAL' | 'SUPER_CUP';
export type Formation = '3-4-3' | '3-5-2' | '4-3-3' | '4-4-2' | '4-5-1' | '5-3-2' | '5-4-1';

export interface League {
    id: string;
    external_id: number;
    name: string;
    code: string;
    country: string;
    logo_url: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Team {
    id: string;
    external_id: number;
    league_id: string;
    name: string;
    short_name: string | null;
    logo_url: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Relations
    league?: League;
}

export interface Player {
    id: string;
    external_id: number;
    team_id: string | null;
    name: string;
    position: PlayerPosition;
    price: number;
    photo_url: string | null;
    is_available: boolean;
    total_points: number;
    created_at: string;
    updated_at: string;
    // Relations
    team?: Team;
}

export interface Competition {
    id: string;
    external_id: number;
    league_id: string | null;
    name: string;
    type: CompetitionType;
    is_competitive: boolean;
    season: string | null;
    created_at: string;
    updated_at: string;
    // Relations
    league?: League;
}

export interface Match {
    id: string;
    external_id: number;
    competition_id: string;
    home_team_id: string;
    away_team_id: string;
    kickoff_time: string;
    status: MatchStatus;
    home_score: number;
    away_score: number;
    has_extra_time: boolean;
    is_processed: boolean;
    created_at: string;
    updated_at: string;
    // Relations
    competition?: Competition;
    home_team?: Team;
    away_team?: Team;
}

export interface Gameweek {
    id: string;
    week_number: number;
    start_time: string;
    end_time: string;
    lineup_deadline: string;
    is_current: boolean;
    is_finished: boolean;
    created_at: string;
    updated_at: string;
}

export interface PlayerMatchStats {
    id: string;
    player_id: string;
    match_id: string;
    minutes_played: number;
    goals: number;
    assists: number;
    clean_sheet: boolean;
    saves: number;
    yellow_cards: number;
    red_cards: number;
    own_goals: number;
    penalty_saved: number;
    penalty_missed: number;
    fantasy_points: number;
    created_at: string;
    updated_at: string;
    // Relations
    player?: Player;
    match?: Match;
}

export interface WeeklyScore {
    id: string;
    player_id: string;
    gameweek_id: string;
    total_points: number;
    matches_played: number;
    created_at: string;
    updated_at: string;
    // Relations
    player?: Player;
    gameweek?: Gameweek;
}

// ============================================
// USER & SQUAD TYPES
// ============================================

export interface Profile {
    id: string;
    username: string;
    email: string | null;
    team_name: string;
    total_points: number;
    overall_rank: number | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface Squad {
    id: string;
    user_id: string;
    budget_remaining: number;
    is_complete: boolean;
    created_at: string;
    updated_at: string;
    // Relations
    squad_players?: SquadPlayer[];
}

export interface SquadPlayer {
    id: string;
    squad_id: string;
    player_id: string;
    purchase_price: number;
    created_at: string;
    // Relations
    player?: Player;
}

export interface Lineup {
    id: string;
    user_id: string;
    gameweek_id: string;
    formation: Formation;
    is_locked: boolean;
    total_points: number;
    created_at: string;
    updated_at: string;
    // Relations
    lineup_players?: LineupPlayer[];
    gameweek?: Gameweek;
}

export interface LineupPlayer {
    id: string;
    lineup_id: string;
    player_id: string;
    position_slot: number; // 1-11 starters, 12-15 bench
    is_captain: boolean;
    is_vice_captain: boolean;
    was_auto_subbed: boolean;
    points_earned: number;
    created_at: string;
    // Relations
    player?: Player;
}

// ============================================
// TRANSFER TYPES
// ============================================

export interface Transfer {
    id: string;
    user_id: string;
    gameweek_id: string;
    player_out_id: string;
    player_in_id: string;
    is_free: boolean;
    transfer_cost: number;
    created_at: string;
    // Relations
    player_out?: Player;
    player_in?: Player;
}

export interface TransferCredit {
    id: string;
    user_id: string;
    gameweek_id: string;
    credits_available: number;
    credits_used: number;
    is_bonus_week: boolean;
    created_at: string;
    updated_at: string;
}

// ============================================
// SCORING & LEADERBOARD TYPES
// ============================================

export interface UserGameweekScore {
    id: string;
    user_id: string;
    gameweek_id: string;
    total_points: number;
    gameweek_rank: number | null;
    created_at: string;
    updated_at: string;
    // Relations
    profile?: Profile;
    gameweek?: Gameweek;
}

// ============================================
// DERIVED/UI TYPES
// ============================================

export interface PlayerWithTeam extends Player {
    team: Team & { league: League };
}

export interface LeaderboardEntry {
    rank: number;
    user_id: string;
    username: string;
    team_name: string;
    total_points: number;
    gameweek_points?: number;
    avatar_url: string | null;
}

export interface SquadValidation {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    playerCount: number;
    positionCounts: Record<PlayerPosition, number>;
    leagueCounts: Record<string, number>;
    totalCost: number;
    budgetRemaining: number;
}

export interface LineupValidation {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    hasAllLeagues: boolean;
    formationValid: boolean;
    captainSet: boolean;
}

// ============================================
// API RESPONSE TYPES (API-Football)
// ============================================

export interface APIFootballLeague {
    league: {
        id: number;
        name: string;
        type: string;
        logo: string;
    };
    country: {
        name: string;
        code: string;
        flag: string;
    };
}

export interface APIFootballTeam {
    team: {
        id: number;
        name: string;
        code: string;
        country: string;
        founded: number;
        national: boolean;
        logo: string;
    };
    venue: {
        name: string;
        city: string;
        capacity: number;
    };
}

export interface APIFootballPlayer {
    player: {
        id: number;
        name: string;
        firstname: string;
        lastname: string;
        age: number;
        nationality: string;
        height: string;
        weight: string;
        photo: string;
    };
    statistics: Array<{
        team: {
            id: number;
            name: string;
        };
        games: {
            position: string;
            rating: string;
            minutes: number;
        };
        goals: {
            total: number;
            assists: number;
        };
        cards: {
            yellow: number;
            red: number;
        };
    }>;
}

export interface APIFootballFixture {
    fixture: {
        id: number;
        referee: string;
        timezone: string;
        date: string;
        timestamp: number;
        status: {
            long: string;
            short: string;
            elapsed: number;
        };
    };
    league: {
        id: number;
        name: string;
        country: string;
        logo: string;
        round: string;
    };
    teams: {
        home: {
            id: number;
            name: string;
            logo: string;
            winner: boolean | null;
        };
        away: {
            id: number;
            name: string;
            logo: string;
            winner: boolean | null;
        };
    };
    goals: {
        home: number | null;
        away: number | null;
    };
    score: {
        halftime: { home: number | null; away: number | null };
        fulltime: { home: number | null; away: number | null };
        extratime: { home: number | null; away: number | null };
        penalty: { home: number | null; away: number | null };
    };
}
