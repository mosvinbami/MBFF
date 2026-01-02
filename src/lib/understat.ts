/**
 * Understat Scraper Service
 * Fetches player and match data from understat.com for all 5 major European leagues
 */

// League mappings for Understat URLs
export const UNDERSTAT_LEAGUES = {
    PL: 'EPL',
    LL: 'La_liga',
    SA: 'Serie_A',
    BL: 'Bundesliga',
    FL1: 'Ligue_1',
} as const;

export type LeagueCode = keyof typeof UNDERSTAT_LEAGUES;

// Player data structure from Understat
export interface UnderstatPlayer {
    id: string;
    player_name: string;
    team_title: string;
    position: string;
    games: number;
    time: number; // minutes played
    goals: number;
    assists: number;
    xG: number;
    xA: number;
    shots: number;
    key_passes: number;
    yellow_cards: number;
    red_cards: number;
    npg: number; // non-penalty goals
    npxG: number; // non-penalty xG
    xGChain: number;
    xGBuildup: number;
}

// Match data structure
export interface UnderstatMatch {
    id: string;
    isResult: boolean;
    h: { id: string; title: string; short_title: string };
    a: { id: string; title: string; short_title: string };
    goals: { h: string; a: string };
    xG: { h: string; a: string };
    datetime: string;
}

// Player match stats
export interface UnderstatPlayerMatch {
    id: string;
    player_id: string;
    match_id: string;
    time: number;
    goals: number;
    assists: number;
    shots: number;
    key_passes: number;
    yellow_card: number;
    red_card: number;
    xG: number;
    xA: number;
    position: string;
    team_id: string;
    h_team: string;
    a_team: string;
    h_goals: number;
    a_goals: number;
    date: string;
}

// Normalized player for our app
export interface NormalizedPlayer {
    id: string;
    name: string;
    team: string;
    league: LeagueCode;
    position: 'GK' | 'DEF' | 'MID' | 'FWD';
    price: number;
    points: number;
    goals: number;
    assists: number;
    cleanSheets: number;
    yellowCards: number;
    redCards: number;
    minutesPlayed: number;
    xG: number;
    xA: number;
    image?: string;
}

/**
 * Fetches and parses player data from Understat league page
 */
export async function fetchLeaguePlayers(league: LeagueCode): Promise<UnderstatPlayer[]> {
    const understatLeague = UNDERSTAT_LEAGUES[league];
    const url = `https://understat.com/league/${understatLeague}`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch ${league}: ${response.status}`);
        }

        const html = await response.text();

        // Extract playersData JSON from the page
        const playersDataMatch = html.match(/var\s+playersData\s*=\s*JSON\.parse\('(.+?)'\)/);

        if (!playersDataMatch) {
            console.error(`Could not find playersData in ${league} page`);
            return [];
        }

        // Decode the escaped JSON string
        const jsonString = playersDataMatch[1]
            .replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');

        const players: UnderstatPlayer[] = JSON.parse(jsonString);
        return players;

    } catch (error) {
        console.error(`Error fetching ${league} players:`, error);
        return [];
    }
}

/**
 * Fetches match data for a specific league
 */
export async function fetchLeagueMatches(league: LeagueCode): Promise<UnderstatMatch[]> {
    const understatLeague = UNDERSTAT_LEAGUES[league];
    const url = `https://understat.com/league/${understatLeague}`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            },
            next: { revalidate: 3600 },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch ${league} matches: ${response.status}`);
        }

        const html = await response.text();

        // Extract datesData JSON from the page
        const datesDataMatch = html.match(/var\s+datesData\s*=\s*JSON\.parse\('(.+?)'\)/);

        if (!datesDataMatch) {
            return [];
        }

        const jsonString = datesDataMatch[1]
            .replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');

        const matches: UnderstatMatch[] = JSON.parse(jsonString);
        return matches;

    } catch (error) {
        console.error(`Error fetching ${league} matches:`, error);
        return [];
    }
}

/**
 * Fetches detailed player stats including match-by-match data
 */
export async function fetchPlayerDetails(playerId: string): Promise<UnderstatPlayerMatch[]> {
    const url = `https://understat.com/player/${playerId}`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            },
            next: { revalidate: 3600 },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch player ${playerId}: ${response.status}`);
        }

        const html = await response.text();

        const matchesDataMatch = html.match(/var\s+matchesData\s*=\s*JSON\.parse\('(.+?)'\)/);

        if (!matchesDataMatch) {
            return [];
        }

        const jsonString = matchesDataMatch[1]
            .replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');

        const matches: UnderstatPlayerMatch[] = JSON.parse(jsonString);
        return matches;

    } catch (error) {
        console.error(`Error fetching player ${playerId}:`, error);
        return [];
    }
}

/**
 * Maps Understat position to our fantasy position
 */
function mapPosition(understatPosition: string): 'GK' | 'DEF' | 'MID' | 'FWD' {
    const pos = understatPosition.toLowerCase();

    if (pos.includes('gk') || pos.includes('goalkeeper')) return 'GK';
    if (pos.includes('d') || pos.includes('def') || pos.includes('back')) return 'DEF';
    if (pos.includes('m') || pos.includes('mid')) return 'MID';
    if (pos.includes('f') || pos.includes('s') || pos.includes('forward') || pos.includes('striker')) return 'FWD';

    // Default based on common Understat position codes
    if (['D', 'D (L)', 'D (R)', 'D (C)'].includes(understatPosition)) return 'DEF';
    if (['M', 'M (L)', 'M (R)', 'M (C)', 'AM', 'DM'].includes(understatPosition)) return 'MID';
    if (['F', 'FW', 'S', 'Sub'].includes(understatPosition)) return 'FWD';

    return 'MID'; // Default
}

/**
 * Calculates player price based on their stats
 */
function calculatePrice(player: UnderstatPlayer): number {
    const basePrice = 5.0;

    // Add value based on goals (higher for forwards/mids)
    const goalValue = player.goals * 0.5;

    // Add value based on assists
    const assistValue = player.assists * 0.3;

    // Add value based on xG (potential)
    const potentialValue = player.xG * 0.2;

    // Add value based on minutes (consistency)
    const consistencyBonus = player.games >= 10 ? 0.5 : 0;

    const totalPrice = basePrice + goalValue + assistValue + potentialValue + consistencyBonus;

    // Clamp between 4.0 and 15.0
    return Math.round(Math.min(15.0, Math.max(4.0, totalPrice)) * 10) / 10;
}

/**
 * Calculates fantasy points based on season stats
 */
function calculatePoints(player: UnderstatPlayer, position: 'GK' | 'DEF' | 'MID' | 'FWD'): number {
    let points = 0;

    // Minutes played (2 pts per 60 mins)
    points += Math.floor(player.time / 60) * 2;

    // Goals
    if (position === 'GK' || position === 'DEF') {
        points += player.goals * 6;
    } else if (position === 'MID') {
        points += player.goals * 5;
    } else {
        points += player.goals * 4;
    }

    // Assists (3 pts each)
    points += player.assists * 3;

    // Yellow cards (-1 pt)
    points -= player.yellow_cards;

    // Red cards (-3 pts)
    points -= player.red_cards * 3;

    return points;
}

/**
 * Fetches and normalizes all players from all leagues
 */
export async function fetchAllPlayers(): Promise<NormalizedPlayer[]> {
    const allPlayers: NormalizedPlayer[] = [];

    for (const [leagueCode, _] of Object.entries(UNDERSTAT_LEAGUES)) {
        const league = leagueCode as LeagueCode;
        console.log(`Fetching ${league} players...`);

        const players = await fetchLeaguePlayers(league);

        for (const player of players) {
            const position = mapPosition(player.position);

            allPlayers.push({
                id: `${league}-${player.id}`,
                name: player.player_name,
                team: player.team_title,
                league,
                position,
                price: calculatePrice(player),
                points: calculatePoints(player, position),
                goals: player.goals,
                assists: player.assists,
                cleanSheets: 0, // Would need match-level data
                yellowCards: player.yellow_cards,
                redCards: player.red_cards,
                minutesPlayed: player.time,
                xG: parseFloat(player.xG.toString()) || 0,
                xA: parseFloat(player.xA.toString()) || 0,
            });
        }

        // Small delay between league requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    return allPlayers;
}

/**
 * Fetches top players (most points) - useful for quick loading
 */
export async function fetchTopPlayers(limit: number = 100): Promise<NormalizedPlayer[]> {
    const allPlayers = await fetchAllPlayers();

    return allPlayers
        .sort((a, b) => b.points - a.points)
        .slice(0, limit);
}
