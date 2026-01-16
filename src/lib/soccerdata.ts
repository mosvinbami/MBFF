/**
 * SoccerData Client Helper
 * Provides typed functions for fetching data from the soccerdata Python API
 */

// Types for the API responses
export interface PlayerStats {
    player: string;
    team: string;
    position?: string;
    games?: number;
    goals?: number;
    assists?: number;
    xG?: number;
    xA?: number;
    shots?: number;
    minutes?: number;
    [key: string]: string | number | undefined;
}

export interface TeamStats {
    team: string;
    games?: number;
    wins?: number;
    draws?: number;
    losses?: number;
    goals_for?: number;
    goals_against?: number;
    xG?: number;
    xGA?: number;
    [key: string]: string | number | undefined;
}

export interface Match {
    date: string;
    home_team: string;
    away_team: string;
    home_score?: number;
    away_score?: number;
    home_xG?: number;
    away_xG?: number;
    [key: string]: string | number | undefined;
}

export interface ApiResponse<T> {
    data: T[];
    source: string;
}

// API Base URL
const API_BASE = '/api/soccerdata';

// League IDs
export type LeagueId = 'premier-league' | 'bundesliga' | 'la-liga' | 'serie-a' | 'ligue-1';

// Helper function to make API calls
async function fetchSoccerData<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE}?endpoint=${encodeURIComponent(endpoint)}`);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch data');
    }

    return response.json();
}

// ==================== FBref Functions ====================

/**
 * Get player season stats from FBref
 * @param league - League ID (e.g., 'premier-league')
 * @param season - Season year (e.g., '2024')
 * @param statType - Type of stats to fetch
 */
export async function getFbrefPlayerStats(
    league: LeagueId,
    season: string,
    statType: 'standard' | 'shooting' | 'passing' | 'defense' | 'possession' = 'standard'
): Promise<PlayerStats[]> {
    const response = await fetchSoccerData<PlayerStats>(
        `/api/fbref/players/${league}/${season}?stat_type=${statType}`
    );
    return response.data;
}

/**
 * Get team season stats from FBref
 */
export async function getFbrefTeamStats(
    league: LeagueId,
    season: string,
    statType: string = 'standard'
): Promise<TeamStats[]> {
    const response = await fetchSoccerData<TeamStats>(
        `/api/fbref/teams/${league}/${season}?stat_type=${statType}`
    );
    return response.data;
}

/**
 * Get match schedule from FBref
 */
export async function getFbrefSchedule(
    league: LeagueId,
    season: string
): Promise<Match[]> {
    const response = await fetchSoccerData<Match>(
        `/api/fbref/schedule/${league}/${season}`
    );
    return response.data;
}

// ==================== Understat Functions ====================

/**
 * Get player xG/xA stats from Understat
 */
export async function getUnderstatPlayerStats(
    league: LeagueId,
    season: string
): Promise<PlayerStats[]> {
    const response = await fetchSoccerData<PlayerStats>(
        `/api/understat/players/${league}/${season}`
    );
    return response.data;
}

/**
 * Get team xG stats from Understat
 */
export async function getUnderstatTeamStats(
    league: LeagueId,
    season: string
): Promise<TeamStats[]> {
    const response = await fetchSoccerData<TeamStats>(
        `/api/understat/team-stats/${league}/${season}`
    );
    return response.data;
}

/**
 * Get fixtures with xG from Understat
 */
export async function getUnderstatFixtures(
    league: LeagueId,
    season: string
): Promise<Match[]> {
    const response = await fetchSoccerData<Match>(
        `/api/understat/fixtures/${league}/${season}`
    );
    return response.data;
}

// ==================== FotMob Functions ====================

/**
 * Get match schedule from FotMob
 */
export async function getFotmobSchedule(
    league: LeagueId,
    season: string
): Promise<Match[]> {
    const response = await fetchSoccerData<Match>(
        `/api/fotmob/schedule/${league}/${season}`
    );
    return response.data;
}

// ==================== Combined Functions ====================

/**
 * Get combined player stats from multiple sources
 */
export async function getCombinedPlayerStats(
    league: LeagueId,
    season: string
): Promise<PlayerStats[]> {
    const response = await fetchSoccerData<PlayerStats>(
        `/api/combined/player-stats/${league}/${season}`
    );
    return response.data;
}

// ==================== Utility Functions ====================

export interface League {
    id: LeagueId;
    name: string;
    country: string;
}

/**
 * Get available leagues
 */
export async function getAvailableLeagues(): Promise<League[]> {
    const response = await fetch(`${API_BASE}?endpoint=/api/leagues`);
    const data = await response.json();
    return data.leagues;
}

/**
 * Check if the Python API is running
 */
export async function checkApiHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE}?endpoint=/health`);
        return response.ok;
    } catch {
        return false;
    }
}
