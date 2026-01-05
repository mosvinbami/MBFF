import { NextResponse } from 'next/server';

// FPL API player availability endpoint
// Returns real-time injury, suspension, and availability data

interface FPLPlayerAvailability {
    id: number;
    web_name: string;
    team: number;
    status: 'a' | 'i' | 's' | 'u' | 'd' | 'n'; // available, injured, suspended, unavailable, doubtful, not in squad
    chance_of_playing_next_round: number | null;
    news: string;
}

export interface PlayerAvailability {
    id: string;
    name: string;
    teamId: number;
    status: 'available' | 'injured' | 'suspended' | 'unavailable' | 'doubtful';
    chanceOfPlaying: number | null;
    news: string;
}

// Map FPL team IDs to club names
const teamIdToName: Record<number, string> = {
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
    13: 'Man City',
    14: 'Man Utd',
    15: 'Newcastle',
    16: 'Nott\'m Forest',
    17: 'Southampton',
    18: 'Spurs',
    19: 'West Ham',
    20: 'Wolves',
};

function normalizeStatus(fplStatus: string): PlayerAvailability['status'] {
    switch (fplStatus) {
        case 'i': return 'injured';
        case 's': return 'suspended';
        case 'd': return 'doubtful';
        case 'u': return 'unavailable';
        case 'n': return 'unavailable';
        default: return 'available';
    }
}

let cachedData: PlayerAvailability[] | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const teamName = searchParams.get('team');
    const playerId = searchParams.get('playerId');

    try {
        // Check cache
        const now = Date.now();
        if (!cachedData || now - cacheTime > CACHE_DURATION) {
            // Fetch fresh data from FPL API
            const response = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/', {
                next: { revalidate: 300 },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch from FPL API');
            }

            const data = await response.json();
            const fplPlayers: FPLPlayerAvailability[] = data.elements;

            // Transform to our format
            cachedData = fplPlayers.map(p => ({
                id: `fpl-${p.id}`,
                name: p.web_name,
                teamId: p.team,
                status: normalizeStatus(p.status),
                chanceOfPlaying: p.chance_of_playing_next_round,
                news: p.news || '',
            }));

            cacheTime = now;
        }

        let result = cachedData;

        // Filter by team if requested
        if (teamName) {
            const teamId = Object.entries(teamIdToName).find(
                ([, name]) => name.toLowerCase() === teamName.toLowerCase()
            )?.[0];

            if (teamId) {
                result = result.filter(p => p.teamId === parseInt(teamId));
            }
        }

        // Filter by player ID if requested
        if (playerId) {
            result = result.filter(p => p.id === playerId || p.name.toLowerCase() === playerId.toLowerCase());
        }

        return NextResponse.json({
            success: true,
            players: result,
            total: result.length,
            lastUpdated: new Date(cacheTime).toISOString(),
        });

    } catch (error) {
        console.error('Player availability fetch error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch player availability',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
