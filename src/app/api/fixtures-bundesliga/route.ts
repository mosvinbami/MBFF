import { NextResponse } from 'next/server';

// OpenLigaDB API - Free, no API key required
// Documentation: https://www.openligadb.de/

interface OpenLigaMatch {
    matchID: number;
    matchDateTime: string;
    matchDateTimeUTC: string;
    team1: {
        teamId: number;
        teamName: string;
        shortName: string;
        teamIconUrl: string;
    };
    team2: {
        teamId: number;
        teamName: string;
        shortName: string;
        teamIconUrl: string;
    };
    matchResults: Array<{
        resultID: number;
        resultName: string;
        pointsTeam1: number;
        pointsTeam2: number;
        resultOrderID: number;
        resultTypeID: number;
        resultDescription: string;
    }>;
    goals: Array<{
        goalID: number;
        scoreTeam1: number;
        scoreTeam2: number;
        matchMinute: number;
        goalGetterID: number;
        goalGetterName: string;
        isPenalty: boolean;
        isOwnGoal: boolean;
    }>;
    group: {
        groupName: string;
        groupOrderID: number;
        groupID: number;
    };
    matchIsFinished: boolean;
    location?: {
        locationCity: string;
        locationStadium: string;
    };
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
    goals?: Array<{
        minute: number;
        scorer: string;
        team: 'home' | 'away';
        isPenalty: boolean;
        isOwnGoal: boolean;
    }>;
}

function normalizeMatch(match: OpenLigaMatch): NormalizedFixture {
    // Get final score from matchResults
    const finalResult = match.matchResults?.find(r => r.resultTypeID === 2) ||
        match.matchResults?.[match.matchResults.length - 1];

    // Determine match status
    let status: 'upcoming' | 'live' | 'completed' = 'upcoming';
    const matchDate = new Date(match.matchDateTimeUTC || match.matchDateTime);
    const now = new Date();

    if (match.matchIsFinished) {
        status = 'completed';
    } else if (matchDate <= now && !match.matchIsFinished) {
        // Match has started but not finished - it's live
        status = 'live';
    }

    // Format goals
    const goals = match.goals?.map(goal => ({
        minute: goal.matchMinute,
        scorer: goal.goalGetterName,
        team: (goal.scoreTeam1 > (match.goals?.filter(g => g.goalID < goal.goalID).pop()?.scoreTeam1 || 0)) ? 'home' : 'away' as 'home' | 'away',
        isPenalty: goal.isPenalty,
        isOwnGoal: goal.isOwnGoal,
    })) || [];

    return {
        id: `bl-${match.matchID}`,
        homeTeam: match.team1.teamName,
        awayTeam: match.team2.teamName,
        homeScore: finalResult?.pointsTeam1 ?? null,
        awayScore: finalResult?.pointsTeam2 ?? null,
        date: matchDate.toISOString(),
        time: matchDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        status,
        gameweek: match.group?.groupOrderID || 0,
        league: 'Bundesliga',
        leagueShort: 'BL',
        homeTeamLogo: match.team1.teamIconUrl,
        awayTeamLogo: match.team2.teamIconUrl,
        venue: match.location?.locationStadium,
        goals: goals.length > 0 ? goals : undefined,
    };
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const matchday = searchParams.get('matchday');
        const season = searchParams.get('season') || '2025'; // Current season 2025/2026

        let apiUrl: string;

        if (matchday) {
            // Specific matchday
            apiUrl = `https://api.openligadb.de/getmatchdata/bl1/${season}/${matchday}`;
        } else {
            // Get FULL SEASON for all results and upcoming matches
            apiUrl = `https://api.openligadb.de/getmatchdata/bl1/${season}`;
        }

        const response = await fetch(apiUrl, {
            next: { revalidate: 60 }, // Cache for 1 minute for live updates
        });

        if (!response.ok) {
            throw new Error(`OpenLigaDB API error: ${response.status}`);
        }

        const matches: OpenLigaMatch[] = await response.json();

        // Normalize the data
        const fixtures = matches.map(normalizeMatch);

        // Sort by date
        fixtures.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Get current matchday info
        const currentMatchday = matches[0]?.group?.groupOrderID || 0;

        // Count live matches
        const liveCount = fixtures.filter(f => f.status === 'live').length;

        return NextResponse.json({
            success: true,
            league: 'Bundesliga',
            season: `${season}/${parseInt(season) + 1}`,
            currentMatchday,
            fixtures,
            total: fixtures.length,
            liveCount,
            lastUpdated: new Date().toISOString(),
        });

    } catch (error) {
        console.error('OpenLigaDB fetch error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch Bundesliga fixtures',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
