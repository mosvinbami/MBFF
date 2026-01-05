/**
 * Fantasy Premier League (FPL) API Service
 * 
 * Free, official API that provides real-time Premier League player data.
 * No authentication required. Updates automatically after each gameweek.
 * 
 * API Endpoints:
 * - /bootstrap-static/ - All players, teams, gameweeks
 * - /event/{gw}/live/ - Live points for each gameweek
 * - /element-summary/{player_id}/ - Player history
 */

const FPL_BASE_URL = 'https://fantasy.premierleague.com/api';

// FPL position mapping
const FPL_POSITIONS: Record<number, 'GK' | 'DEF' | 'MID' | 'FWD'> = {
    1: 'GK',
    2: 'DEF',
    3: 'MID',
    4: 'FWD',
};

// FPL team mapping (updated for 2025/26 season)
const FPL_TEAMS: Record<number, string> = {
    1: 'Arsenal',
    2: 'Aston Villa',
    3: 'Bournemouth',
    4: 'Brentford',
    5: 'Brighton',
    6: 'Chelsea',
    7: 'Crystal Palace',
    8: 'Everton',
    9: 'Fulham',
    10: 'Ipswich',
    11: 'Leicester',
    12: 'Liverpool',
    13: 'Manchester City',
    14: 'Manchester United',
    15: 'Newcastle',
    16: 'Nottingham Forest',
    17: 'Southampton',
    18: 'Tottenham',
    19: 'West Ham',
    20: 'Wolves',
};

// Raw FPL player data type
export interface FPLPlayer {
    id: number;
    code: number; // Used for photo URL
    web_name: string;
    first_name: string;
    second_name: string;
    team: number;
    element_type: number; // position
    now_cost: number; // price * 10
    total_points: number;
    goals_scored: number;
    assists: number;
    clean_sheets: number;
    yellow_cards: number;
    red_cards: number;
    minutes: number;
    starts: number;
    expected_goals: string;
    expected_assists: string;
    form: string;
    points_per_game: string;
    selected_by_percent: string;
    status: string; // 'a' = available, 'i' = injured, etc.
}

// FPL gameweek data
export interface FPLGameweek {
    id: number;
    name: string;
    deadline_time: string;
    is_current: boolean;
    is_next: boolean;
    finished: boolean;
}

// Bootstrap static response
export interface FPLBootstrap {
    elements: FPLPlayer[];
    teams: { id: number; name: string; short_name: string }[];
    events: FPLGameweek[];
}

// Normalized player for our app
export interface NormalizedFPLPlayer {
    id: string;
    name: string;
    fullName: string;
    team: string;
    teamId: number;
    league: 'PL';
    position: 'GK' | 'DEF' | 'MID' | 'FWD';
    price: number;
    points: number; // Total season points
    eventPoints: number; // Current gameweek points
    goals: number;
    assists: number;
    cleanSheets: number;
    yellowCards: number;
    redCards: number;
    minutesPlayed: number;
    xG: number;
    xA: number;
    form: number;
    selectedBy: number;
    status: string;
    photo: string; // Player photo URL
}

/**
 * Fetches all FPL data (players, teams, gameweeks)
 * Cache reduced to 60 seconds for live match days
 */
export async function fetchFPLBootstrap(): Promise<FPLBootstrap | null> {
    try {
        const response = await fetch(`${FPL_BASE_URL}/bootstrap-static/`, {
            next: { revalidate: 60 }, // Cache for 1 minute only
            headers: {
                'User-Agent': 'MBFF Fantasy App',
                'Cache-Control': 'no-cache',
            },
        });

        if (!response.ok) {
            console.error(`FPL API error: ${response.status}`);
            return null;
        }

        return response.json();
    } catch (error) {
        console.error('Error fetching FPL data:', error);
        return null;
    }
}

/**
 * Fetches live gameweek points
 */
export interface LivePlayerStats {
    id: number;
    stats: {
        minutes: number;
        goals_scored: number;
        assists: number;
        clean_sheets: number;
        goals_conceded: number;
        own_goals: number;
        penalties_saved: number;
        penalties_missed: number;
        yellow_cards: number;
        red_cards: number;
        saves: number;
        bonus: number;
        bps: number;
        total_points: number;
    };
}

export async function fetchLiveGameweekPoints(gameweek: number): Promise<Map<number, LivePlayerStats['stats']>> {
    const livePoints = new Map<number, LivePlayerStats['stats']>();

    try {
        const response = await fetch(`${FPL_BASE_URL}/event/${gameweek}/live/`, {
            cache: 'no-store', // Always fresh
            headers: {
                'User-Agent': 'MBFF Fantasy App',
            },
        });

        if (!response.ok) {
            console.error(`FPL Live API error: ${response.status}`);
            return livePoints;
        }

        const data = await response.json();

        if (data.elements) {
            data.elements.forEach((el: LivePlayerStats) => {
                livePoints.set(el.id, el.stats);
            });
        }

        return livePoints;
    } catch (error) {
        console.error('Error fetching live points:', error);
        return livePoints;
    }
}

/**
 * Gets current gameweek info
 */
export async function getCurrentGameweek(): Promise<FPLGameweek | null> {
    const data = await fetchFPLBootstrap();
    if (!data) return null;

    return data.events.find(e => e.is_current) || data.events.find(e => e.is_next) || null;
}

/**
 * Fetches and normalizes all Premier League players from FPL API
 * Includes live gameweek points if matches are in progress
 */
export async function fetchFPLPlayers(): Promise<NormalizedFPLPlayer[]> {
    const data = await fetchFPLBootstrap();

    if (!data) {
        console.error('Failed to fetch FPL bootstrap data');
        return [];
    }

    // Get current gameweek
    const currentGW = data.events.find(e => e.is_current);

    // Fetch live points if we have a current gameweek
    let livePoints: Map<number, LivePlayerStats['stats']> | null = null;
    if (currentGW && !currentGW.finished) {
        livePoints = await fetchLiveGameweekPoints(currentGW.id);
    }

    // Create team mapping from API data
    const teamMap: Record<number, string> = {};
    data.teams.forEach(team => {
        teamMap[team.id] = team.name;
    });

    // Normalize players with live points
    const players: NormalizedFPLPlayer[] = data.elements.map(player => {
        // Get live stats if available
        const live = livePoints?.get(player.id);

        return {
            id: `fpl-${player.id}`,
            name: player.web_name,
            fullName: `${player.first_name} ${player.second_name}`,
            team: teamMap[player.team] || FPL_TEAMS[player.team] || 'Unknown',
            teamId: player.team,
            league: 'PL' as const,
            position: FPL_POSITIONS[player.element_type] || 'MID',
            price: player.now_cost / 10,
            // Total season points
            points: player.total_points,
            // Current gameweek points from live data
            eventPoints: live?.total_points || 0,
            goals: player.goals_scored,
            assists: player.assists,
            cleanSheets: player.clean_sheets,
            yellowCards: player.yellow_cards,
            redCards: player.red_cards,
            minutesPlayed: player.minutes,
            xG: parseFloat(player.expected_goals) || 0,
            xA: parseFloat(player.expected_assists) || 0,
            form: parseFloat(player.form) || 0,
            selectedBy: parseFloat(player.selected_by_percent) || 0,
            status: player.status,
            photo: `https://resources.premierleague.com/premierleague/photos/players/250x250/p${player.code}.png`,
        };
    });

    return players;
}

/**
 * Fetches top FPL players by points
 */
export async function fetchTopFPLPlayers(limit: number = 100): Promise<NormalizedFPLPlayer[]> {
    const players = await fetchFPLPlayers();

    return players
        .filter(p => p.minutesPlayed > 0) // Only players who have played
        .sort((a, b) => b.points - a.points)
        .slice(0, limit);
}

/**
 * Fetches FPL players by position
 */
export async function fetchFPLPlayersByPosition(position: 'GK' | 'DEF' | 'MID' | 'FWD'): Promise<NormalizedFPLPlayer[]> {
    const players = await fetchFPLPlayers();

    return players
        .filter(p => p.position === position && p.minutesPlayed > 0)
        .sort((a, b) => b.points - a.points);
}
