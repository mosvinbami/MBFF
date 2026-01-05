/**
 * Transfermarkt Data Enrichment Script
 * 
 * Fetches player photos and club data from Transfermarkt API
 * and generates enriched player/club data files.
 * 
 * Usage: npx tsx scripts/fetch-transfermarkt-data.ts
 */

const TRANSFERMARKT_API = 'https://transfermarkt-api.fly.dev';

// League configurations
const LEAGUES = {
    'BL': { id: 'L1', name: 'Bundesliga' },
    'PL': { id: 'GB1', name: 'Premier League' },
    'LL': { id: 'ES1', name: 'La Liga' },
    'SA': { id: 'IT1', name: 'Serie A' },
    'FL1': { id: 'FR1', name: 'Ligue 1' },
};

// Rate limiting: 2 requests per 3 seconds
const RATE_LIMIT_DELAY = 1600; // ms between requests

interface TransfermarktClub {
    id: string;
    name: string;
}

interface TransfermarktPlayer {
    id: string;
    name: string;
    position: string;
    age?: number;
    nationality?: string[];
    height?: number;
    marketValue?: number;
}

interface TransfermarktClubProfile {
    id: string;
    name: string;
    officialName?: string;
    image?: string;
    stadiumName?: string;
    currentMarketValue?: number;
}

interface TransfermarktPlayerProfile {
    id: string;
    name: string;
    imageUrl?: string;
    position?: { main: string };
    marketValue?: number;
    club?: { id: string; name: string };
}

interface EnrichedPlayer {
    id: string;
    transfermarktId: string;
    name: string;
    team: string;
    position: string;
    imageUrl?: string;
    marketValue?: number;
    age?: number;
    nationality?: string;
    height?: number;
}

interface EnrichedClub {
    id: string;
    transfermarktId: string;
    name: string;
    officialName?: string;
    logo?: string;
    stadium?: string;
    marketValue?: number;
}

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${url}`);
    }
    return response.json();
}

async function fetchLeagueClubs(leagueId: string): Promise<TransfermarktClub[]> {
    console.log(`  Fetching clubs for league ${leagueId}...`);
    const data = await fetchJson<{ clubs: TransfermarktClub[] }>(
        `${TRANSFERMARKT_API}/competitions/${leagueId}/clubs`
    );
    await sleep(RATE_LIMIT_DELAY);
    return data.clubs || [];
}

async function fetchClubProfile(clubId: string): Promise<TransfermarktClubProfile | null> {
    try {
        const data = await fetchJson<TransfermarktClubProfile>(
            `${TRANSFERMARKT_API}/clubs/${clubId}/profile`
        );
        await sleep(RATE_LIMIT_DELAY);
        return data;
    } catch (error) {
        console.error(`    Failed to fetch club ${clubId}:`, error);
        return null;
    }
}

async function fetchClubPlayers(clubId: string): Promise<TransfermarktPlayer[]> {
    try {
        const data = await fetchJson<{ players: TransfermarktPlayer[] }>(
            `${TRANSFERMARKT_API}/clubs/${clubId}/players`
        );
        await sleep(RATE_LIMIT_DELAY);
        return data.players || [];
    } catch (error) {
        console.error(`    Failed to fetch players for club ${clubId}:`, error);
        return [];
    }
}

async function fetchPlayerProfile(playerId: string): Promise<TransfermarktPlayerProfile | null> {
    try {
        const data = await fetchJson<TransfermarktPlayerProfile>(
            `${TRANSFERMARKT_API}/players/${playerId}/profile`
        );
        await sleep(RATE_LIMIT_DELAY);
        return data;
    } catch (error) {
        console.error(`    Failed to fetch player ${playerId}:`, error);
        return null;
    }
}

function mapPosition(position: string): 'GK' | 'DEF' | 'MID' | 'FWD' {
    const pos = position.toLowerCase();
    if (pos.includes('goalkeeper') || pos.includes('keeper')) return 'GK';
    if (pos.includes('back') || pos.includes('centre-back') || pos.includes('defender')) return 'DEF';
    if (pos.includes('midfield') || pos.includes('winger')) return 'MID';
    if (pos.includes('forward') || pos.includes('striker') || pos.includes('centre-forward')) return 'FWD';
    return 'MID'; // Default
}

async function enrichLeague(leagueCode: string): Promise<{ clubs: EnrichedClub[]; players: EnrichedPlayer[] }> {
    const league = LEAGUES[leagueCode as keyof typeof LEAGUES];
    if (!league) {
        console.error(`Unknown league: ${leagueCode}`);
        return { clubs: [], players: [] };
    }

    console.log(`\n📦 Processing ${league.name} (${leagueCode})...`);

    const enrichedClubs: EnrichedClub[] = [];
    const enrichedPlayers: EnrichedPlayer[] = [];

    // Fetch all clubs
    const clubs = await fetchLeagueClubs(league.id);
    console.log(`  Found ${clubs.length} clubs`);

    for (const club of clubs) {
        console.log(`  📍 ${club.name}...`);

        // Get club profile for logo
        const clubProfile = await fetchClubProfile(club.id);
        if (clubProfile) {
            enrichedClubs.push({
                id: `${leagueCode.toLowerCase()}-club-${club.id}`,
                transfermarktId: club.id,
                name: clubProfile.name,
                officialName: clubProfile.officialName,
                logo: clubProfile.image,
                stadium: clubProfile.stadiumName,
                marketValue: clubProfile.currentMarketValue,
            });
        }

        // Get players
        const players = await fetchClubPlayers(club.id);
        console.log(`    Found ${players.length} players`);

        // Fetch profile for top players to get photos (limit to avoid rate limits)
        const topPlayers = players
            .sort((a, b) => (b.marketValue || 0) - (a.marketValue || 0))
            .slice(0, 25); // Top 25 by market value

        for (const player of topPlayers) {
            const profile = await fetchPlayerProfile(player.id);

            enrichedPlayers.push({
                id: `${leagueCode.toLowerCase()}-${player.id}`,
                transfermarktId: player.id,
                name: player.name,
                team: club.name,
                position: mapPosition(player.position),
                imageUrl: profile?.imageUrl,
                marketValue: player.marketValue,
                age: player.age,
                nationality: player.nationality?.[0],
                height: player.height,
            });
        }
    }

    return { clubs: enrichedClubs, players: enrichedPlayers };
}

async function main() {
    console.log('🚀 Transfermarkt Data Enrichment Script');
    console.log('========================================\n');

    // Process specific league or all
    const targetLeague = process.argv[2]?.toUpperCase();

    const allClubs: EnrichedClub[] = [];
    const allPlayers: EnrichedPlayer[] = [];

    if (targetLeague && LEAGUES[targetLeague as keyof typeof LEAGUES]) {
        const result = await enrichLeague(targetLeague);
        allClubs.push(...result.clubs);
        allPlayers.push(...result.players);
    } else {
        for (const leagueCode of Object.keys(LEAGUES)) {
            const result = await enrichLeague(leagueCode);
            allClubs.push(...result.clubs);
            allPlayers.push(...result.players);
        }
    }

    console.log('\n========================================');
    console.log(`✅ Total clubs: ${allClubs.length}`);
    console.log(`✅ Total players: ${allPlayers.length}`);

    // Output as JSON (can be piped to file)
    console.log('\n📄 Club Data (copy to src/data/clubs-enriched.ts):');
    console.log(JSON.stringify(allClubs, null, 2));

    console.log('\n📄 Player Data (copy to src/data/players-enriched.ts):');
    console.log(JSON.stringify(allPlayers, null, 2));
}

main().catch(console.error);
