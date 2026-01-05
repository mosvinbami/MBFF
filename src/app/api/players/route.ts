import { NextResponse } from 'next/server';
import { fetchFPLPlayers, NormalizedFPLPlayer } from '@/lib/fpl';
import { PLAYER_DATABASE, PlayerData } from '@/data/players';

export const dynamic = 'force-dynamic';

// Unified player type that works with both sources
interface UnifiedPlayer {
    id: string;
    name: string;
    team: string;
    league: 'PL' | 'LL' | 'SA' | 'BL' | 'FL1';
    position: 'GK' | 'DEF' | 'MID' | 'FWD';
    price: number;
    points: number; // Total season points
    eventPoints?: number; // Current gameweek points (PL only)
    goals: number;
    assists: number;
    cleanSheets: number;
    yellowCards: number;
    redCards: number;
    minutesPlayed: number;
    xG?: number;
    xA?: number;
    form?: number;
    isLive?: boolean; // true if from FPL API
    status?: string; // a=available, d=doubtful, i=injured, etc.
    photo?: string; // Player photo URL
}

/**
 * GET /api/players
 * Returns player data from:
 * - FPL API (live) for Premier League
 * - Curated database for La Liga, Serie A, Bundesliga, Ligue 1
 * 
 * Query params:
 * - league: Filter by league code (PL, LL, SA, BL, FL1)
 * - position: Filter by position (GK, DEF, MID, FWD)
 * - limit: Limit number of results (default: 100)
 * - sort: Sort by 'points', 'price', 'goals', 'assists' (default: points)
 * - source: 'live' (PL only), 'curated' (all), 'auto' (default - live PL + curated others)
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const league = searchParams.get('league') as UnifiedPlayer['league'] | null;
        const position = searchParams.get('position') as UnifiedPlayer['position'] | null;
        const limit = parseInt(searchParams.get('limit') || '2500'); // Default to all players
        const sort = searchParams.get('sort') || 'points';
        const source = searchParams.get('source') || 'auto';

        let players: UnifiedPlayer[] = [];
        let liveCount = 0;
        let curatedCount = 0;

        // Fetch Premier League from FPL API (live data)
        if ((source === 'auto' || source === 'live') && (!league || league === 'PL')) {
            try {
                const fplPlayers = await fetchFPLPlayers();

                if (fplPlayers.length > 0) {
                    const normalizedFPL: UnifiedPlayer[] = fplPlayers.map(p => ({
                        id: p.id,
                        name: p.name,
                        team: p.team,
                        league: 'PL' as const,
                        position: p.position,
                        price: p.price,
                        points: p.points,
                        eventPoints: p.eventPoints, // Current gameweek points
                        goals: p.goals,
                        assists: p.assists,
                        cleanSheets: p.cleanSheets,
                        yellowCards: p.yellowCards,
                        redCards: p.redCards,
                        minutesPlayed: p.minutesPlayed,
                        xG: p.xG,
                        xA: p.xA,
                        form: p.form,
                        isLive: true,
                        status: p.status,
                        photo: p.photo, // Include photo URL
                    }));

                    players.push(...normalizedFPL);
                    liveCount = normalizedFPL.length;
                }
            } catch (error) {
                console.error('FPL API error, falling back to curated:', error);
                // Fall back to curated PL data
                const curatedPL = PLAYER_DATABASE.filter(p => p.league === 'PL');
                players.push(...curatedPL.map(p => ({ ...p, isLive: false, status: 'a' })));
                curatedCount += curatedPL.length;
            }
        }

        // Add curated data for other leagues (or PL fallback)
        if (source === 'auto' || source === 'curated') {
            const curatedLeagues = league
                ? (league === 'PL' && liveCount > 0 ? [] : [league])
                : ['LL', 'SA', 'BL', 'FL1'] as const;

            for (const lg of curatedLeagues) {
                const leaguePlayers = PLAYER_DATABASE.filter(p => p.league === lg);
                players.push(...leaguePlayers.map(p => ({ ...p, isLive: false, status: 'a' })));
                curatedCount += leaguePlayers.length;
            }

            // If PL was requested but FPL failed, add curated PL
            if (league === 'PL' && liveCount === 0) {
                const curatedPL = PLAYER_DATABASE.filter(p => p.league === 'PL');
                players.push(...curatedPL.map(p => ({ ...p, isLive: false })));
                curatedCount += curatedPL.length;
            }
        }

        // Filter by team
        const team = searchParams.get('team');
        if (team) {
            const teamLower = team.toLowerCase();
            players = players.filter(p =>
                p.team.toLowerCase().includes(teamLower) ||
                (p.team === 'Arsenal' && teamLower === 'arsenal') // Exact match safety
            );
        }

        // Filter by position
        if (position && ['GK', 'DEF', 'MID', 'FWD'].includes(position)) {
            players = players.filter(p => p.position === position);
        }

        // Sort
        switch (sort) {
            case 'price':
                players = [...players].sort((a, b) => b.price - a.price);
                break;
            case 'goals':
                players = [...players].sort((a, b) => b.goals - a.goals);
                break;
            case 'assists':
                players = [...players].sort((a, b) => b.assists - a.assists);
                break;
            case 'points':
            default:
                players = [...players].sort((a, b) => b.points - a.points);
        }

        // Limit
        players = players.slice(0, limit);

        return NextResponse.json({
            success: true,
            count: players.length,
            sources: {
                live: liveCount,
                curated: curatedCount,
            },
            players,
            lastUpdated: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching players:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch players' },
            { status: 500 }
        );
    }
}
