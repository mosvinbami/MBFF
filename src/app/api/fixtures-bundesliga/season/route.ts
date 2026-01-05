import { NextResponse } from 'next/server';

// Get all Bundesliga matches for the entire season
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const season = searchParams.get('season') || '2024';

        const apiUrl = `https://api.openligadb.de/getmatchdata/bl1/${season}`;

        const response = await fetch(apiUrl, {
            next: { revalidate: 300 }, // Cache for 5 minutes
        });

        if (!response.ok) {
            throw new Error(`OpenLigaDB API error: ${response.status}`);
        }

        const matches = await response.json();

        // Group matches by gameweek
        const groupedByGameweek: Record<number, unknown[]> = {};

        matches.forEach((match: { group?: { groupOrderID?: number }; matchID: number; matchDateTime: string; matchDateTimeUTC?: string; team1: { teamName: string; teamIconUrl: string }; team2: { teamName: string; teamIconUrl: string }; matchResults?: Array<{ resultTypeID: number; pointsTeam1: number; pointsTeam2: number }>; matchIsFinished: boolean }) => {
            const gw = match.group?.groupOrderID || 0;
            if (!groupedByGameweek[gw]) {
                groupedByGameweek[gw] = [];
            }

            const finalResult = match.matchResults?.find(r => r.resultTypeID === 2) ||
                match.matchResults?.[match.matchResults.length - 1];

            const matchDate = new Date(match.matchDateTimeUTC || match.matchDateTime);
            const now = new Date();

            let status: 'upcoming' | 'live' | 'completed' = 'upcoming';
            if (match.matchIsFinished) {
                status = 'completed';
            } else if (matchDate <= now) {
                status = 'live';
            }

            groupedByGameweek[gw].push({
                id: `bl-${match.matchID}`,
                homeTeam: match.team1.teamName,
                awayTeam: match.team2.teamName,
                homeScore: finalResult?.pointsTeam1 ?? null,
                awayScore: finalResult?.pointsTeam2 ?? null,
                date: matchDate.toISOString(),
                status,
                homeTeamLogo: match.team1.teamIconUrl,
                awayTeamLogo: match.team2.teamIconUrl,
            });
        });

        // Convert to array format
        const gameweeks = Object.entries(groupedByGameweek).map(([gw, fixtures]) => ({
            gameweek: parseInt(gw),
            fixtures,
            completed: (fixtures as Array<{ status: string }>).every(f => f.status === 'completed'),
            hasLive: (fixtures as Array<{ status: string }>).some(f => f.status === 'live'),
        }));

        // Sort by gameweek
        gameweeks.sort((a, b) => a.gameweek - b.gameweek);

        // Find current gameweek (first one with upcoming or live matches)
        const currentGameweek = gameweeks.find(gw => !gw.completed)?.gameweek || gameweeks[gameweeks.length - 1]?.gameweek || 1;

        return NextResponse.json({
            success: true,
            league: 'Bundesliga',
            season: `${season}/${parseInt(season) + 1}`,
            currentGameweek,
            totalGameweeks: gameweeks.length,
            gameweeks,
            lastUpdated: new Date().toISOString(),
        });

    } catch (error) {
        console.error('OpenLigaDB season fetch error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch Bundesliga season fixtures',
            },
            { status: 500 }
        );
    }
}
