import { NextResponse } from 'next/server';
import { CLUBS } from '@/data/clubs';
import fs from 'fs';
import path from 'path';

// Mapping TSDB positions to our format
const POS_MAP: Record<string, 'GK' | 'DEF' | 'MID' | 'FWD'> = {
    'Goalkeeper': 'GK',
    'Defender': 'DEF',
    'Midfielder': 'MID',
    'Forward': 'FWD',
    'Winger': 'MID', // Sometimes used, map to MID or FWD? FPL usually FWD for Wingers, but let's stick to MID for now if ambiguous
    'Attacking Midfield': 'MID',
    'Defensive Midfield': 'MID',
    'Centre-Back': 'DEF',
    'Left-Back': 'DEF',
    'Right-Back': 'DEF',
    'Left Wing': 'FWD',
    'Right Wing': 'FWD',
    'Centre Forward': 'FWD',
    'Striker': 'FWD',
    'Second Striker': 'FWD'
};

const normalizePosition = (strPos: string): 'GK' | 'DEF' | 'MID' | 'FWD' => {
    // Default to MID if unknown (safest)
    if (!strPos) return 'MID';

    // Check direct map
    if (POS_MAP[strPos]) return POS_MAP[strPos];

    // Check includes
    const s = strPos.toLowerCase();
    if (s.includes('goalkeeper')) return 'GK';
    if (s.includes('defender') || s.includes('back')) return 'DEF';
    if (s.includes('midfield')) return 'MID';
    if (s.includes('forward') || s.includes('striker') || s.includes('wing')) return 'FWD';

    return 'MID';
};

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const leagueCode = searchParams.get('league'); // if null, do all (might timeout)

        let clubsToProcess = CLUBS;
        if (leagueCode) {
            clubsToProcess = CLUBS.filter(c => c.league === leagueCode);
        }

        const allPlayers = [];
        const errors = [];

        console.log(`Starting sync for ${clubsToProcess.length} clubs...`);

        for (const club of clubsToProcess) {
            let teamId = '';

            // Step 1: Get Team ID
            try {
                // Clean name for better search matching (remove FC, CF, etc)
                // e.g. "Sevilla FC" -> "Sevilla"
                const cleanName = club.name
                    .replace(/\s(FC|CF|UD|CD|RCD|RC|AFC|SC|BSC|TSG|VfL|VfB|1\. FSV|1\. FC)\b/g, '')
                    .replace(/\b(FC|CF|UD|CD|RCD|RC|AFC|SC|BSC|TSG|VfL|VfB|1\. FSV|1\. FC)\s/g, '')
                    .trim();

                const searchUrl = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(cleanName)}`;
                const searchRes = await fetch(searchUrl);
                const searchData = await searchRes.json();

                if (searchData.teams && searchData.teams.length > 0) {
                    // Find exact match or best match? The first one is usually best.
                    // But verify league? 
                    // Let's just take the first one, usually safer than nothing.
                    teamId = searchData.teams[0].idTeam;
                } else {
                    // Try shortName? or common alternatives
                    console.warn(`Could not find team ID for ${club.name}`);
                    errors.push(`${club.name} (No ID)`);
                    continue;
                }
            } catch (e) {
                console.error(`Error searching team ${club.name}`, e);
                errors.push(`${club.name} (Search Error)`);
                continue;
            }

            // Step 2: Fetch Players by ID
            const url = `https://www.thesportsdb.com/api/v1/json/3/lookup_all_players.php?id=${teamId}`;

            try {
                const res = await fetch(url);
                const data = await res.json();

                if (data.player) {
                    const teamPlayers = data.player.map((p: any) => ({
                        id: p.idPlayer,
                        name: p.strPlayer,
                        team: club.name, // Force strict club name from OUR db
                        teamId: club.id,
                        league: club.league,
                        position: normalizePosition(p.strPosition),
                        price: 5.0,
                        points: 0,
                        image: p.strCutout || p.strThumb || null,
                        nationality: p.strNationality,
                        number: p.strNumber
                    }));
                    allPlayers.push(...teamPlayers);
                } else {
                    console.warn(`No players found for ${club.name} (ID: ${teamId})`);
                    errors.push(`${club.name} (No Players)`);
                }
            } catch (err) {
                console.error(`Failed to fetch players for ${club.name}`, err);
                errors.push(`${club.name} (Fetch Error)`);
            }

            await new Promise(r => setTimeout(r, 100)); // Rate limit
        }

        // Save to file if we did a full sync or partial?
        // Let's assume we want to APPEND or UPDATE.
        // For simplicity, if we run for 'PL', we load existing file, filter out PL, and add new PL.

        const filePath = path.join(process.cwd(), 'src', 'data', 'players-universal.json');

        let existingData = [];
        if (fs.existsSync(filePath)) {
            try {
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                existingData = JSON.parse(fileContent);
            } catch (e) {
                // corrupted file
            }
        }

        // Remove old players for the processed leagues
        const processedLeagues = new Set(clubsToProcess.map(c => c.league));
        const keptPlayers = existingData.filter((p: any) => !processedLeagues.has(p.league));

        const finalData = [...keptPlayers, ...allPlayers];

        fs.writeFileSync(filePath, JSON.stringify(finalData, null, 2));

        return NextResponse.json({
            success: true,
            processed: clubsToProcess.length,
            playersFound: allPlayers.length,
            totalPlayers: finalData.length,
            errors
        });

    } catch (error) {
        console.error('Sync failed', error);
        return NextResponse.json({ success: false, error: 'Sync failed' }, { status: 500 });
    }
}
