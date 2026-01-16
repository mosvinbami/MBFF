import { NextResponse } from 'next/server';

// TheSportsDB - Free API
// Using eventsround for leagues, eventsseason for cups

// League IDs in TheSportsDB
const LEAGUE_IDS: Record<string, number> = {
    // Top 5 Leagues
    'PL': 4328,   // English Premier League
    'BL': 4331,   // German Bundesliga
    'LL': 4335,   // Spanish La Liga
    'SA': 4332,   // Italian Serie A
    'FL1': 4334,  // French Ligue 1
    // Cups
    'FACUP': 4482,      // FA Cup
    'EFLCUP': 4570,     // EFL Cup / Carabao Cup
    'UCL': 4480,        // UEFA Champions League
    'UEL': 4481,        // UEFA Europa League
    'COPPA': 4506,      // Coppa Italia
    'COPADEL': 4483,    // Copa del Rey
    'DFBPOKAL': 4488,   // DFB Pokal
    'COUPEFR': 4484,    // Coupe de France
};

const LEAGUE_NAMES: Record<string, string> = {
    'PL': 'Premier League',
    'BL': 'Bundesliga',
    'LL': 'La Liga',
    'SA': 'Serie A',
    'FL1': 'Ligue 1',
    'FACUP': 'FA Cup',
    'EFLCUP': 'EFL Cup',
    'UCL': 'Champions League',
    'UEL': 'Europa League',
    'COPPA': 'Coppa Italia',
    'COPADEL': 'Copa del Rey',
    'DFBPOKAL': 'DFB Pokal',
    'COUPEFR': 'Coupe de France',
};

// Current round estimates for leagues (Jan 2026) -> Adjusted dynamically in logic
const CURRENT_ROUNDS: Record<string, number> = {
    'PL': 21,
    'BL': 17,
    'LL': 20,
    'SA': 20,
    'FL1': 18,
};

// Cup competitions use different endpoint
const CUP_CODES = ['UCL', 'UEL', 'FACUP', 'EFLCUP', 'COPPA', 'COPADEL', 'DFBPOKAL', 'COUPEFR'];

interface TheSportsDBEvent {
    idEvent: string;
    strEvent: string;
    strHomeTeam: string;
    strAwayTeam: string;
    intHomeScore: string | null;
    intAwayScore: string | null;
    dateEvent: string;
    strTime: string;
    strTimestamp: string;
    strStatus: string | null;
    intRound: string;
    strHomeTeamBadge: string | null;
    strAwayTeamBadge: string | null;
    strVenue: string | null;
    strLeague: string;
}

interface NormalizedFixture {
    id: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    date: string;
    time: string;
    status: 'upcoming' | 'live' | 'completed';
    gameweek: number;
    league: string;
    leagueShort: string;
    homeTeamLogo?: string;
    awayTeamLogo?: string;
    venue?: string;
}

function normalizeEvent(event: TheSportsDBEvent, leagueCode: string): NormalizedFixture {
    const matchDate = new Date(event.strTimestamp || `${event.dateEvent}T${event.strTime || '15:00'}:00Z`);
    const now = new Date();

    let status: 'upcoming' | 'live' | 'completed' = 'upcoming';

    if (event.intHomeScore !== null && event.intAwayScore !== null) {
        status = 'completed';
    } else if (event.strStatus === 'Live' || event.strStatus === 'In Progress') {
        status = 'live';
    } else if (matchDate < now) {
        status = 'completed';
    }

    return {
        id: `tsdb-${event.idEvent}`,
        homeTeam: event.strHomeTeam,
        awayTeam: event.strAwayTeam,
        homeScore: event.intHomeScore !== null ? parseInt(event.intHomeScore) : null,
        awayScore: event.intAwayScore !== null ? parseInt(event.intAwayScore) : null,
        date: matchDate.toISOString(),
        time: event.strTime || '15:00',
        status,
        gameweek: parseInt(event.intRound) || 0,
        league: LEAGUE_NAMES[leagueCode] || event.strLeague,
        leagueShort: leagueCode,
        homeTeamLogo: event.strHomeTeamBadge || undefined,
        awayTeamLogo: event.strAwayTeamBadge || undefined,
        venue: event.strVenue || undefined,
    };
}

async function fetchLeagueFixtures(leagueId: number, leagueCode: string, season: string) {
    const currentRound = CURRENT_ROUNDS[leagueCode] || 20;
    const roundsToFetch = [];
    for (let r = Math.max(1, currentRound - 3); r <= currentRound + 2; r++) {
        roundsToFetch.push(r);
    }

    const roundPromises = roundsToFetch.map(round =>
        fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsround.php?id=${leagueId}&r=${round}&s=${season}`, {
            next: { revalidate: 300 },
        }).then(res => res.json()).catch(() => ({ events: null }))
    );

    const roundResults = await Promise.all(roundPromises);

    const allEvents: TheSportsDBEvent[] = [];
    for (const data of roundResults) {
        if (data.events) {
            allEvents.push(...data.events);
        }
    }

    return allEvents;
}

async function fetchCupFixtures(leagueId: number, season: string) {
    // For cups, use eventsseason and get all available data
    const response = await fetch(
        `https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=${leagueId}&s=${season}`,
        { next: { revalidate: 300 } }
    );

    const data = await response.json();
    return data.events || [];
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const leagueCode = searchParams.get('league')?.toUpperCase() || 'LL';
        const season = '2025-2026';

        const leagueId = LEAGUE_IDS[leagueCode];

        if (!leagueId) {
            return NextResponse.json({
                success: false,
                error: `Unknown league code: ${leagueCode}`,
                availableLeagues: Object.keys(LEAGUE_IDS),
            }, { status: 400 });
        }

        // Fetch fixtures based on competition type
        let allEvents: TheSportsDBEvent[];

        if (CUP_CODES.includes(leagueCode)) {
            allEvents = await fetchCupFixtures(leagueId, season);
        } else {
            allEvents = await fetchLeagueFixtures(leagueId, leagueCode, season);
        }

        // Normalize the data
        const fixtures = allEvents.map(event => normalizeEvent(event, leagueCode));

        // Remove duplicates
        const uniqueFixtures = Array.from(
            new Map(fixtures.map(f => [f.id, f])).values()
        );

        // Sort by date (most recent first)
        uniqueFixtures.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Count stats
        const completed = uniqueFixtures.filter(f => f.status === 'completed').length;
        const upcoming = uniqueFixtures.filter(f => f.status === 'upcoming').length;
        const live = uniqueFixtures.filter(f => f.status === 'live').length;

        return NextResponse.json({
            success: true,
            league: LEAGUE_NAMES[leagueCode],
            leagueCode,
            season,
            fixtures: uniqueFixtures,
            total: uniqueFixtures.length,
            completed,
            upcoming,
            liveCount: live,
            lastUpdated: new Date().toISOString(),
        });

    } catch (error) {
        console.error('TheSportsDB fetch error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch fixtures',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
