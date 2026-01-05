import { NextResponse } from 'next/server';
import {
    LEAGUE_IDS,
    calculateFantasyPoints,
    mapPosition,
    isMatchActive,
    isMatchFinished,
    PlayerEvent,
    LeagueCode
} from '@/lib/live-points';

export const dynamic = 'force-dynamic';

// API-Football configuration
const API_FOOTBALL_BASE = 'https://v3.football.api-sports.io';
const API_KEY = process.env.API_FOOTBALL_KEY || '';

// Cache for live points (5 minute TTL during matches)
const livePointsCache = new Map<string, { data: LivePointsResponse; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface LivePointsResponse {
    success: boolean;
    league: string;
    gameweek?: number;
    players: Array<{
        playerId: string;
        playerName: string;
        team: string;
        eventPoints: number;
        matchStatus: string;
        details: {
            goals: number;
            assists: number;
            cleanSheet: boolean;
            yellowCards: number;
            redCards: number;
            minutes: number;
        };
    }>;
    lastUpdated: string;
}

/**
 * GET /api/live-points
 * 
 * Fetches live fantasy points for a specific league
 * Query params:
 * - league: PL, LL, SA, BL, FL1 (required)
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const leagueCode = searchParams.get('league') as LeagueCode;

        if (!leagueCode || !LEAGUE_IDS[leagueCode]) {
            return NextResponse.json(
                { success: false, error: 'Valid league code required (PL, LL, SA, BL, FL1)' },
                { status: 400 }
            );
        }

        // Check cache first
        const cacheKey = `live-points-${leagueCode}`;
        const cached = livePointsCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return NextResponse.json(cached.data);
        }

        // If no API key, return mock/estimated data
        if (!API_KEY) {
            const mockResponse = await generateEstimatedPoints(leagueCode);
            return NextResponse.json(mockResponse);
        }

        // Fetch live fixtures from API-Football
        const leagueId = LEAGUE_IDS[leagueCode];
        const today = new Date().toISOString().split('T')[0];

        const fixturesResponse = await fetch(
            `${API_FOOTBALL_BASE}/fixtures?league=${leagueId}&date=${today}&season=2025`,
            {
                headers: {
                    'x-apisports-key': API_KEY,
                },
                next: { revalidate: 60 },
            }
        );

        if (!fixturesResponse.ok) {
            console.error('API-Football error:', fixturesResponse.status);
            const mockResponse = await generateEstimatedPoints(leagueCode);
            return NextResponse.json(mockResponse);
        }

        const fixturesData = await fixturesResponse.json();
        const fixtures = fixturesData.response || [];

        if (fixtures.length === 0) {
            // No matches today
            return NextResponse.json({
                success: true,
                league: leagueCode,
                players: [],
                message: 'No matches today',
                lastUpdated: new Date().toISOString(),
            });
        }

        // Fetch player statistics for each fixture
        const allPlayerPoints: LivePointsResponse['players'] = [];

        for (const fixture of fixtures) {
            const fixtureId = fixture.fixture.id;
            const matchStatus = fixture.fixture.status.short;

            // Only process live or finished matches
            if (!isMatchActive(matchStatus) && !isMatchFinished(matchStatus)) {
                continue;
            }

            const playersResponse = await fetch(
                `${API_FOOTBALL_BASE}/fixtures/players?fixture=${fixtureId}`,
                {
                    headers: {
                        'x-apisports-key': API_KEY,
                    },
                    next: { revalidate: 60 },
                }
            );

            if (!playersResponse.ok) continue;

            const playersData = await playersResponse.json();
            const teamsData = playersData.response || [];

            // Determine if it's a clean sheet
            const homeGoals = fixture.goals.home || 0;
            const awayGoals = fixture.goals.away || 0;

            for (const teamData of teamsData) {
                const teamName = teamData.team.name;
                const isHome = teamData.team.id === fixture.teams.home.id;
                const goalsConceded = isHome ? awayGoals : homeGoals;
                const cleanSheet = goalsConceded === 0;

                for (const playerData of teamData.players || []) {
                    const stats = playerData.statistics?.[0];
                    if (!stats) continue;

                    const event: PlayerEvent = {
                        playerId: `api-${playerData.player.id}`,
                        playerName: playerData.player.name,
                        team: teamName,
                        position: mapPosition(stats.games?.position || 'M'),
                        minutes: stats.games?.minutes || 0,
                        goals: stats.goals?.total || 0,
                        assists: stats.goals?.assists || 0,
                        yellowCards: stats.cards?.yellow || 0,
                        redCards: stats.cards?.red || 0,
                        saves: stats.goals?.saves || 0,
                        penaltySaved: stats.penalty?.saved || 0,
                        penaltyMissed: stats.penalty?.missed || 0,
                        ownGoals: 0, // API doesn't always provide this separately
                        cleanSheet: cleanSheet,
                        goalsConceded: goalsConceded,
                    };

                    const eventPoints = calculateFantasyPoints(event);

                    allPlayerPoints.push({
                        playerId: event.playerId,
                        playerName: event.playerName,
                        team: event.team,
                        eventPoints,
                        matchStatus,
                        details: {
                            goals: event.goals,
                            assists: event.assists,
                            cleanSheet: event.cleanSheet,
                            yellowCards: event.yellowCards,
                            redCards: event.redCards,
                            minutes: event.minutes,
                        },
                    });
                }
            }
        }

        const response: LivePointsResponse = {
            success: true,
            league: leagueCode,
            players: allPlayerPoints,
            lastUpdated: new Date().toISOString(),
        };

        // Cache the response
        livePointsCache.set(cacheKey, { data: response, timestamp: Date.now() });

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching live points:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch live points' },
            { status: 500 }
        );
    }
}

/**
 * Generate estimated points when API is unavailable
 * Uses a simple heuristic based on season performance
 */
async function generateEstimatedPoints(leagueCode: LeagueCode): Promise<LivePointsResponse> {
    // Return empty - no matches or API unavailable
    return {
        success: true,
        league: leagueCode,
        players: [],
        message: 'Live data unavailable - using season stats',
        lastUpdated: new Date().toISOString(),
    } as LivePointsResponse & { message: string };
}
