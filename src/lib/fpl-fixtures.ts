/**
 * FPL Fixtures API Service
 * 
 * Fetches real Premier League fixtures from the official FPL API
 */

const FPL_BASE_URL = 'https://fantasy.premierleague.com/api';

// FPL Team ID to Name mapping (from bootstrap-static)
let teamMapping: Record<number, { name: string; shortName: string }> = {};

export interface FPLFixture {
    id: number;
    event: number; // gameweek
    kickoff_time: string;
    team_h: number;
    team_a: number;
    team_h_score: number | null;
    team_a_score: number | null;
    finished: boolean;
    started: boolean;
    finished_provisional: boolean;
}

export interface NormalizedFixture {
    id: string;
    league: 'PL';
    gameweek: number;
    date: string;
    time: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    status: 'completed' | 'live' | 'upcoming';
}

/**
 * Fetches team data to build name mapping
 */
async function ensureTeamMapping() {
    if (Object.keys(teamMapping).length > 0) return;

    try {
        const response = await fetch(`${FPL_BASE_URL}/bootstrap-static/`, {
            next: { revalidate: 3600 },
        });

        if (!response.ok) return;

        const data = await response.json();
        data.teams.forEach((team: { id: number; name: string; short_name: string }) => {
            teamMapping[team.id] = { name: team.name, shortName: team.short_name };
        });
    } catch (error) {
        console.error('Error fetching FPL teams:', error);
    }
}

/**
 * Fetches all Premier League fixtures from FPL API
 */
export async function fetchFPLFixtures(): Promise<NormalizedFixture[]> {
    await ensureTeamMapping();

    try {
        const response = await fetch(`${FPL_BASE_URL}/fixtures/`, {
            next: { revalidate: 300 }, // Cache for 5 minutes
        });

        if (!response.ok) {
            console.error(`FPL Fixtures API error: ${response.status}`);
            return [];
        }

        const fixtures: FPLFixture[] = await response.json();

        return fixtures.map(f => {
            const kickoff = new Date(f.kickoff_time);
            const homeTeamData = teamMapping[f.team_h] || { name: `Team ${f.team_h}`, shortName: 'TBD' };
            const awayTeamData = teamMapping[f.team_a] || { name: `Team ${f.team_a}`, shortName: 'TBD' };

            let status: 'completed' | 'live' | 'upcoming' = 'upcoming';
            if (f.finished) {
                status = 'completed';
            } else if (f.started) {
                status = 'live';
            }

            return {
                id: `fpl-${f.id}`,
                league: 'PL' as const,
                gameweek: f.event || 0,
                date: kickoff.toISOString().split('T')[0],
                time: kickoff.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                homeTeam: homeTeamData.name,
                awayTeam: awayTeamData.name,
                homeScore: f.team_h_score,
                awayScore: f.team_a_score,
                status,
            };
        });
    } catch (error) {
        console.error('Error fetching FPL fixtures:', error);
        return [];
    }
}

/**
 * Get fixtures for a specific gameweek
 */
export async function fetchFPLFixturesByGameweek(gameweek: number): Promise<NormalizedFixture[]> {
    const allFixtures = await fetchFPLFixtures();
    return allFixtures.filter(f => f.gameweek === gameweek);
}

/**
 * Get fixtures for a specific team
 */
export async function fetchFPLFixturesByTeam(teamName: string): Promise<NormalizedFixture[]> {
    const allFixtures = await fetchFPLFixtures();
    return allFixtures.filter(f =>
        f.homeTeam.toLowerCase().includes(teamName.toLowerCase()) ||
        f.awayTeam.toLowerCase().includes(teamName.toLowerCase())
    );
}

/**
 * Get upcoming fixtures
 */
export async function fetchUpcomingFPLFixtures(limit: number = 20): Promise<NormalizedFixture[]> {
    const allFixtures = await fetchFPLFixtures();
    return allFixtures
        .filter(f => f.status === 'upcoming')
        .slice(0, limit);
}

/**
 * Get recent results
 */
export async function fetchRecentFPLResults(limit: number = 20): Promise<NormalizedFixture[]> {
    const allFixtures = await fetchFPLFixtures();
    return allFixtures
        .filter(f => f.status === 'completed')
        .slice(-limit)
        .reverse();
}

/**
 * Get live matches
 */
export async function fetchLiveFPLFixtures(): Promise<NormalizedFixture[]> {
    const allFixtures = await fetchFPLFixtures();
    return allFixtures.filter(f => f.status === 'live');
}
