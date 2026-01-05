import { NextResponse } from 'next/server';

const FPL_BASE_URL = 'https://fantasy.premierleague.com/api';

// Team and Player mapping cache
let teamMapping: Record<number, { name: string; shortName: string }> = {};
let playerMapping: Record<number, { name: string }> = {};

async function ensureMappings() {
    if (Object.keys(teamMapping).length > 0 && Object.keys(playerMapping).length > 0) return;

    try {
        const response = await fetch(`${FPL_BASE_URL}/bootstrap-static/`, {
            next: { revalidate: 3600 },
        });

        if (!response.ok) return;

        const data = await response.json();

        // Map teams
        data.teams.forEach((team: { id: number; name: string; short_name: string }) => {
            teamMapping[team.id] = { name: team.name, shortName: team.short_name };
        });

        // Map players
        data.elements.forEach((player: { id: number; web_name: string }) => {
            playerMapping[player.id] = { name: player.web_name };
        });

    } catch (error) {
        console.error('Error fetching FPL bootstrap data:', error);
    }
}

interface FPLStatItem {
    value: number;
    element: number;
}

interface FPLStat {
    identifier: string;
    a: FPLStatItem[];
    h: FPLStatItem[];
}

interface FPLFixture {
    id: number;
    event: number;
    kickoff_time: string;
    team_h: number;
    team_a: number;
    team_h_score: number | null;
    team_a_score: number | null;
    finished: boolean;
    started: boolean;
    finished_provisional: boolean;
    stats: FPLStat[];
}

export const dynamic = 'force-dynamic';

/**
 * GET /api/fixtures
 * Returns real Premier League fixtures from FPL API
 * 
 * Query params:
 * - gameweek: Filter by gameweek number
 * - team: Filter by team name
 * - status: Filter by 'completed', 'live', or 'upcoming'
 */
export async function GET(request: Request) {
    try {
        await ensureMappings();

        const { searchParams } = new URL(request.url);
        const gameweek = searchParams.get('gameweek');
        const team = searchParams.get('team');
        const status = searchParams.get('status');

        // Fetch fixtures from FPL
        const response = await fetch(`${FPL_BASE_URL}/fixtures/`, {
            next: { revalidate: 60 }, // Cache for 1 minute for live updates
        });

        if (!response.ok) {
            return NextResponse.json(
                { success: false, error: 'Failed to fetch FPL fixtures' },
                { status: 500 }
            );
        }

        const rawFixtures: FPLFixture[] = await response.json();

        // Helper to map stats
        const mapStats = (stats: FPLStat[]) => {
            if (!stats) return {};
            return stats.reduce((acc, stat) => {
                acc[stat.identifier] = {
                    h: stat.h.map(s => ({ value: s.value, name: playerMapping[s.element]?.name || 'Unknown', element: s.element })),
                    a: stat.a.map(s => ({ value: s.value, name: playerMapping[s.element]?.name || 'Unknown', element: s.element }))
                };
                return acc;
            }, {} as Record<string, { h: { value: number; name: string; element: number }[]; a: { value: number; name: string; element: number }[] }>);
        };

        // Normalize fixtures
        let fixtures = rawFixtures.map(f => {
            const kickoff = new Date(f.kickoff_time);
            const homeTeamData = teamMapping[f.team_h] || { name: `Team ${f.team_h}`, shortName: 'TBD' };
            const awayTeamData = teamMapping[f.team_a] || { name: `Team ${f.team_a}`, shortName: 'TBD' };

            let fixtureStatus: 'completed' | 'live' | 'upcoming' = 'upcoming';

            // A game is completed if finished or finished_provisional is true
            if (f.finished || f.finished_provisional) {
                fixtureStatus = 'completed';
            } else if (f.started) {
                // Game has started but not finished - check if it's actually live
                // A typical football match lasts ~2 hours including halftime
                const kickoffTime = new Date(f.kickoff_time).getTime();
                const now = Date.now();
                const elapsedMs = now - kickoffTime;
                const twoHoursMs = 2 * 60 * 60 * 1000;

                if (elapsedMs < twoHoursMs) {
                    // Game started less than 2 hours ago - likely still live
                    fixtureStatus = 'live';
                } else {
                    // Game started more than 2 hours ago - treat as completed
                    fixtureStatus = 'completed';
                }
            }

            return {
                id: `fpl-${f.id}`,
                league: 'PL',
                gameweek: f.event || 0,
                date: kickoff.toISOString().split('T')[0],
                time: kickoff.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' }),
                homeTeam: homeTeamData.name,
                homeTeamShort: homeTeamData.shortName,
                awayTeam: awayTeamData.name,
                awayTeamShort: awayTeamData.shortName,
                homeScore: f.team_h_score,
                awayScore: f.team_a_score,
                status: fixtureStatus,
                kickoffTime: f.kickoff_time,
                stats: mapStats(f.stats) // Add mapped stats
            };
        });

        // Filter by gameweek
        if (gameweek) {
            fixtures = fixtures.filter(f => f.gameweek === parseInt(gameweek));
        }

        // Filter by team
        if (team) {
            const teamLower = team.toLowerCase();
            fixtures = fixtures.filter(f =>
                f.homeTeam.toLowerCase().includes(teamLower) ||
                f.awayTeam.toLowerCase().includes(teamLower)
            );
        }

        // Filter by status
        if (status && ['completed', 'live', 'upcoming'].includes(status)) {
            fixtures = fixtures.filter(f => f.status === status);
        }

        // Count live matches (truly live - started, not finished, and within 2 hours of kickoff)
        const now = Date.now();
        const twoHoursMs = 2 * 60 * 60 * 1000;
        const liveCount = rawFixtures.filter(f => {
            if (f.finished || f.finished_provisional) return false;
            if (!f.started) return false;

            const kickoffTime = new Date(f.kickoff_time).getTime();
            const elapsedMs = now - kickoffTime;
            return elapsedMs < twoHoursMs;
        }).length;

        return NextResponse.json({
            success: true,
            count: fixtures.length,
            liveCount,
            fixtures,
            lastUpdated: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching fixtures:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch fixtures' },
            { status: 500 }
        );
    }
}
