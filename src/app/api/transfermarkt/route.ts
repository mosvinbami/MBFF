import { NextResponse } from 'next/server';

const TRANSFERMARKT_API_BASE = 'https://transfermarkt-api.fly.dev';

// Cache for API responses (in-memory, will reset on server restart)
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// League IDs mapping
export const LEAGUE_IDS: Record<string, string> = {
    'PL': 'GB1',   // Premier League
    'BL': 'L1',    // Bundesliga
    'LL': 'ES1',   // La Liga
    'SA': 'IT1',   // Serie A
    'FL1': 'FR1',  // Ligue 1
};

interface TransfermarktClub {
    id: string;
    name: string;
}

interface TransfermarktPlayer {
    id: string;
    name: string;
    position: string;
    dateOfBirth?: string;
    age?: number;
    nationality?: string[];
    height?: number;
    foot?: string;
    marketValue?: number;
    status?: string;
}

interface TransfermarktPlayerProfile {
    id: string;
    name: string;
    imageUrl?: string;
    position: {
        main: string;
        other?: string[];
    };
    height?: number;
    citizenship?: string[];
    foot?: string;
    shirtNumber?: string;
    club?: {
        id: string;
        name: string;
    };
    marketValue?: number;
}

interface TransfermarktClubProfile {
    id: string;
    name: string;
    officialName?: string;
    image?: string;
    stadiumName?: string;
    stadiumSeats?: number;
    currentMarketValue?: number;
    colors?: string[];
    league?: {
        id: string;
        name: string;
    };
}

async function fetchWithCache(url: string): Promise<unknown> {
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    const response = await fetch(url, {
        headers: {
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Transfermarkt API error: ${response.status}`);
    }

    const data = await response.json();
    cache.set(url, { data, timestamp: Date.now() });
    return data;
}

export const dynamic = 'force-dynamic';

/**
 * GET /api/transfermarkt
 * 
 * Fetch data from Transfermarkt API
 * 
 * Query params:
 * - type: 'clubs' | 'club-profile' | 'players' | 'player-profile'
 * - league: League code (PL, BL, LL, SA, FL1) - required for type=clubs
 * - clubId: Club ID - required for type=players or type=club-profile
 * - playerId: Player ID - required for type=player-profile
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const league = searchParams.get('league');
        const clubId = searchParams.get('clubId');
        const playerId = searchParams.get('playerId');

        if (!type) {
            return NextResponse.json(
                { success: false, error: 'Missing type parameter' },
                { status: 400 }
            );
        }

        let data: Record<string, unknown> = {};

        switch (type) {
            case 'clubs': {
                if (!league || !LEAGUE_IDS[league]) {
                    return NextResponse.json(
                        { success: false, error: 'Invalid or missing league parameter' },
                        { status: 400 }
                    );
                }
                const leagueId = LEAGUE_IDS[league];
                const result = await fetchWithCache(
                    `${TRANSFERMARKT_API_BASE}/competitions/${leagueId}/clubs`
                ) as { clubs: TransfermarktClub[] };
                data = { clubs: result.clubs || [] };
                break;
            }

            case 'club-profile': {
                if (!clubId) {
                    return NextResponse.json(
                        { success: false, error: 'Missing clubId parameter' },
                        { status: 400 }
                    );
                }
                const result = await fetchWithCache(
                    `${TRANSFERMARKT_API_BASE}/clubs/${clubId}/profile`
                ) as TransfermarktClubProfile;
                data = {
                    id: result.id,
                    name: result.name,
                    officialName: result.officialName,
                    logo: result.image,
                    stadium: result.stadiumName,
                    stadiumSeats: result.stadiumSeats,
                    marketValue: result.currentMarketValue,
                    colors: result.colors,
                    league: result.league,
                };
                break;
            }

            case 'players': {
                if (!clubId) {
                    return NextResponse.json(
                        { success: false, error: 'Missing clubId parameter' },
                        { status: 400 }
                    );
                }
                const result = await fetchWithCache(
                    `${TRANSFERMARKT_API_BASE}/clubs/${clubId}/players`
                ) as { players: TransfermarktPlayer[] };
                data = {
                    players: (result.players || []).map(p => ({
                        id: p.id,
                        name: p.name,
                        position: p.position,
                        age: p.age,
                        nationality: p.nationality,
                        height: p.height,
                        foot: p.foot,
                        marketValue: p.marketValue,
                        status: p.status,
                    })),
                };
                break;
            }

            case 'player-profile': {
                if (!playerId) {
                    return NextResponse.json(
                        { success: false, error: 'Missing playerId parameter' },
                        { status: 400 }
                    );
                }
                const result = await fetchWithCache(
                    `${TRANSFERMARKT_API_BASE}/players/${playerId}/profile`
                ) as TransfermarktPlayerProfile;
                data = {
                    id: result.id,
                    name: result.name,
                    imageUrl: result.imageUrl,
                    position: result.position?.main,
                    height: result.height,
                    nationality: result.citizenship,
                    foot: result.foot,
                    shirtNumber: result.shirtNumber,
                    club: result.club,
                    marketValue: result.marketValue,
                };
                break;
            }

            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid type parameter' },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            success: true,
            ...data,
            lastUpdated: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Transfermarkt API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch from Transfermarkt API',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
