import { NextResponse } from 'next/server';

const THESPORTSDB_API = 'https://www.thesportsdb.com/api/v1/json/3';

// Cache for API responses
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface TheSportsDBPlayer {
    idPlayer: string;
    strPlayer: string;
    strThumb: string | null;
    strCutout: string | null;
    strRender: string | null;
    strTeam: string | null;
    strNationality: string | null;
    strPosition: string | null;
}

interface SearchResult {
    player: TheSportsDBPlayer[] | null;
}

async function fetchWithCache(url: string): Promise<unknown> {
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
    });

    // Handle rate limiting gracefully
    if (response.status === 429) {
        // Return cached data if we have it, otherwise return empty result
        if (cached) {
            return cached.data;
        }
        // Cache a "not found" result for 5 minutes to prevent hammering the API
        const emptyResult = { player: null };
        cache.set(url, { data: emptyResult, timestamp: Date.now() - CACHE_TTL + 5 * 60 * 1000 });
        return emptyResult;
    }

    if (!response.ok) {
        throw new Error(`TheSportsDB API error: ${response.status}`);
    }

    const data = await response.json();
    cache.set(url, { data, timestamp: Date.now() });
    return data;
}

export const dynamic = 'force-dynamic';

/**
 * GET /api/thesportsdb
 * 
 * Fetch player photos from TheSportsDB
 * 
 * Query params:
 * - player: Player name to search
 */
const NAME_MAPPINGS: Record<string, string> = {
    'Darwin': 'Darwin Núñez',
    'Jota': 'Diogo Jota',
    'Diaz': 'Luis Díaz',
    'Son': 'Heung-Min Son',
    'A.Becker': 'Alisson Becker',
    'Martinez': 'Emiliano Martínez',
    'Gabriel': 'Gabriel Magalhães',
    'Gordon': 'Anthony Gordon',
};

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const rawPlayerName = searchParams.get('player');

        if (!rawPlayerName) {
            return NextResponse.json(
                { success: false, error: 'Missing player parameter' },
                { status: 400 }
            );
        }

        const playerName = NAME_MAPPINGS[rawPlayerName] || rawPlayerName;

        const result = await fetchWithCache(
            `${THESPORTSDB_API}/searchplayers.php?p=${encodeURIComponent(playerName)}`
        ) as SearchResult;

        if (!result.player || result.player.length === 0) {
            return NextResponse.json({
                success: true,
                found: false,
                player: null,
            });
        }

        // Return the first matching player
        const player = result.player[0];

        return NextResponse.json({
            success: true,
            found: true,
            player: {
                id: player.idPlayer,
                name: player.strPlayer,
                team: player.strTeam,
                nationality: player.strNationality,
                position: player.strPosition,
                // Prefer cutout image (transparent background), fallback to thumb
                imageUrl: player.strCutout || player.strThumb || null,
                thumb: player.strThumb,
                cutout: player.strCutout,
                render: player.strRender,
            },
        });

    } catch (error) {
        console.error('TheSportsDB API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch from TheSportsDB',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
