import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// News cache (10 minute TTL)
const newsCache = new Map<string, { news: NewsItem[]; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface NewsItem {
    title: string;
    link: string;
    source: string;
    publishedAt: string;
    league?: string;
}

// RSS feed sources for football news (football-specific only)
const RSS_FEEDS = [
    // Football-specific feeds
    { url: 'https://www.espn.com/espn/rss/soccer/news', league: 'ALL', source: 'ESPN FC' },
    { url: 'https://feeds.bbci.co.uk/sport/football/rss.xml', league: 'ALL', source: 'BBC Sport' },
    { url: 'https://www.goal.com/feeds/en/news', league: 'ALL', source: 'Goal.com' },
    { url: 'https://theanalyst.com/eu/feed/', league: 'ALL', source: 'The Analyst' },
];
// Teams from all 5 leagues to filter relevant news
const LEAGUE_TEAMS = {
    // Premier League
    PL: [
        'arsenal', 'aston villa', 'bournemouth', 'brentford', 'brighton', 'chelsea',
        'crystal palace', 'everton', 'fulham', 'ipswich', 'leicester', 'liverpool',
        'man city', 'manchester city', 'man utd', 'manchester united', 'newcastle',
        'nottingham forest', 'southampton', 'tottenham', 'spurs', 'west ham', 'wolves'
    ],
    // La Liga
    LL: [
        'real madrid', 'barcelona', 'atletico madrid', 'athletic bilbao', 'real sociedad',
        'villarreal', 'betis', 'sevilla', 'valencia', 'osasuna', 'getafe', 'celta vigo',
        'mallorca', 'las palmas', 'rayo vallecano', 'girona', 'alaves', 'leganes',
        'espanyol', 'valladolid'
    ],
    // Serie A
    SA: [
        'inter', 'inter milan', 'napoli', 'juventus', 'juve', 'ac milan', 'milan',
        'atalanta', 'lazio', 'roma', 'fiorentina', 'bologna', 'torino', 'monza',
        'udinese', 'genoa', 'cagliari', 'empoli', 'parma', 'verona', 'como', 'lecce', 'venezia'
    ],
    // Bundesliga
    BL: [
        'bayern', 'bayern munich', 'dortmund', 'borussia dortmund', 'bayer leverkusen',
        'leverkusen', 'rb leipzig', 'leipzig', 'eintracht frankfurt', 'frankfurt',
        'stuttgart', 'wolfsburg', 'freiburg', 'hoffenheim', 'werder bremen', 'bremen',
        'mainz', 'augsburg', 'union berlin', 'bochum', 'heidenheim', 'st pauli', 'kiel'
    ],
    // Ligue 1
    FL1: [
        'psg', 'paris saint-germain', 'marseille', 'monaco', 'lille', 'lyon',
        'nice', 'lens', 'rennes', 'reims', 'toulouse', 'montpellier', 'strasbourg',
        'brest', 'nantes', 'le havre', 'auxerre', 'angers', 'saint-etienne', 'st etienne'
    ]
};

// Flatten all teams into a single array for filtering
const ALL_TEAMS = Object.values(LEAGUE_TEAMS).flat();

// Additional keywords that indicate league-relevant news
const LEAGUE_KEYWORDS = [
    'premier league', 'la liga', 'serie a', 'bundesliga', 'ligue 1',
    'champions league', 'europa league', 'ucl', 'conference league'
];

/**
 * Check if a news headline is relevant to the 5 leagues
 */
function isRelevantNews(title: string): boolean {
    const lowerTitle = title.toLowerCase();

    // Check if it mentions any team from the 5 leagues
    const mentionsTeam = ALL_TEAMS.some(team => lowerTitle.includes(team));

    // Check if it mentions any league competition
    const mentionsLeague = LEAGUE_KEYWORDS.some(keyword => lowerTitle.includes(keyword));

    return mentionsTeam || mentionsLeague;
}

/**
 * Parse RSS XML to extract news items
 */
function parseRSS(xml: string, source: string, league: string): NewsItem[] {
    const items: NewsItem[] = [];

    // Simple regex-based XML parsing for RSS items
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/;
    const linkRegex = /<link>(.*?)<\/link>/;
    const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;

    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
        const item = match[1];

        const titleMatch = item.match(titleRegex);
        const linkMatch = item.match(linkRegex);
        const pubDateMatch = item.match(pubDateRegex);

        if (titleMatch) {
            const title = (titleMatch[1] || titleMatch[2] || '').trim();
            // Filter out empty or very short titles
            if (title.length > 10) {
                items.push({
                    title,
                    link: linkMatch?.[1] || '',
                    source,
                    league,
                    publishedAt: pubDateMatch?.[1] || new Date().toISOString(),
                });
            }
        }
    }

    return items;
}

/**
 * GET /api/news
 * 
 * Fetches live sports news from RSS feeds for all 5 leagues
 * Query params:
 * - league: PL, LL, SA, BL, FL1 (optional, filters by league)
 * - limit: number of items to return (default 10)
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const leagueFilter = searchParams.get('league');
        const limit = parseInt(searchParams.get('limit') || '10', 10);

        // Check cache
        const cacheKey = `news-${leagueFilter || 'all'}`;
        const cached = newsCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return NextResponse.json({
                success: true,
                news: cached.news.slice(0, limit),
                cached: true,
                lastUpdated: new Date(cached.timestamp).toISOString(),
            });
        }

        // Determine which feeds to fetch
        const feedsToFetch = leagueFilter
            ? RSS_FEEDS.filter(f => f.league === leagueFilter || f.league === 'ALL')
            : RSS_FEEDS;

        // Fetch all RSS feeds in parallel
        const feedPromises = feedsToFetch.map(async (feed) => {
            try {
                const response = await fetch(feed.url, {
                    headers: {
                        'User-Agent': 'MBFF-Fantasy-App/1.0',
                        'Accept': 'application/rss+xml, application/xml, text/xml',
                    },
                    next: { revalidate: 300 }, // 5 min cache
                });

                if (!response.ok) {
                    console.error(`Failed to fetch ${feed.source}: ${response.status}`);
                    return [];
                }

                const xml = await response.text();
                return parseRSS(xml, feed.source, feed.league);
            } catch (error) {
                console.error(`Error fetching ${feed.source}:`, error);
                return [];
            }
        });

        const results = await Promise.all(feedPromises);
        const allNews = results.flat();

        // Sort by publish date (newest first)
        allNews.sort((a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );

        // Deduplicate by title (sometimes same news appears in multiple feeds)
        const seen = new Set<string>();
        const uniqueNews = allNews.filter(item => {
            const key = item.title.toLowerCase().slice(0, 50);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        // Filter to only show news about teams from the 5 leagues
        const relevantNews = uniqueNews.filter(item => isRelevantNews(item.title));

        // Cache the filtered results
        newsCache.set(cacheKey, { news: relevantNews, timestamp: Date.now() });

        return NextResponse.json({
            success: true,
            news: relevantNews.slice(0, limit),
            total: relevantNews.length,
            lastUpdated: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching news:', error);

        // Return fallback news on error
        return NextResponse.json({
            success: true,
            news: [
                { title: 'Transfer deadline approaching - clubs scramble for signings', source: 'MBFF', league: 'ALL', publishedAt: new Date().toISOString(), link: '' },
                { title: 'Champions League knockout rounds set for drama', source: 'MBFF', league: 'ALL', publishedAt: new Date().toISOString(), link: '' },
                { title: 'Weekend fixtures preview across Europe', source: 'MBFF', league: 'ALL', publishedAt: new Date().toISOString(), link: '' },
            ],
            fallback: true,
            lastUpdated: new Date().toISOString(),
        });
    }
}
