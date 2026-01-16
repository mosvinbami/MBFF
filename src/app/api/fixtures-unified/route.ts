import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const leagueCode = searchParams.get('league') || 'PL';

    // We can simply proxy to the improved TheSportsDB endpoint
    // This is better than the Python scraper as it's an official API (even if free tier)
    // and we just added support for PL and BL there.

    // Construct absolute URL for internal fetch if needed, 
    // or better yet, just import the logic? 
    // For simplicity/reliability in Next.js app directory, redirecting/proxying via fetch:

    const host = request.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    try {
        const tsdbUrl = `${baseUrl}/api/fixtures-thesportsdb?league=${leagueCode}`;
        const response = await fetch(tsdbUrl, {
            next: { revalidate: 60 } // 1 min cache for "live" feel
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch from TSDB');
        }

        // We can enrich this later with Python API calls for advanced stats (xG)
        // For now, return the reliable schedule/scores
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error fetching unified fixtures:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch live fixtures' },
            { status: 500 }
        );
    }
}
