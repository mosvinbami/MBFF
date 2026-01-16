/**
 * SoccerData API Proxy
 * Proxies requests to the Python soccerdata microservice
 */

import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.SOCCERDATA_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    if (!endpoint) {
        return NextResponse.json(
            { error: 'Missing endpoint parameter' },
            { status: 400 }
        );
    }

    try {
        // Build the full URL with any additional query params
        const url = new URL(`${PYTHON_API_URL}${endpoint}`);

        // Forward any additional query parameters (except 'endpoint')
        searchParams.forEach((value, key) => {
            if (key !== 'endpoint') {
                url.searchParams.append(key, value);
            }
        });

        const response = await fetch(url.toString(), {
            headers: {
                'Accept': 'application/json',
            },
            next: { revalidate: 300 } // Cache for 5 minutes
        });

        if (!response.ok) {
            const error = await response.text();
            return NextResponse.json(
                { error: `Python API error: ${error}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('SoccerData proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch from soccerdata API. Is the Python service running?' },
            { status: 500 }
        );
    }
}
