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
            // Use club.name for search, but handle potential TSDB naming mismatches?
            // TSDB usually likes "Arsenal", "Aston Villa", etc.
            // Our clubs.ts names are pretty good.
            const encodedName = encodeURIComponent(club.name);
            const url = `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?t=${encodedName}`;

            try {
                const res = await fetch(url);
                const data = await res.json();

                if (data.player) {
                    const teamPlayers = data.player.map((p: any) => ({
                        id: p.idPlayer,
                        name: p.strPlayer,
                        team: club.name, // Use our normalized club name
                        teamId: club.id,
                        league: club.league,
                        position: normalizePosition(p.strPosition),
                        price: 5.0, // Placeholder price
                        points: 0, // Placeholder points
                        image: p.strCutout || p.strThumb || null,
                        nationality: p.strNationality,
                        number: p.strNumber
                    }));
                    allPlayers.push(...teamPlayers);
                } else {
                    console.warn(`No players found for ${club.name}`);
                    errors.push(club.name);
                }
            } catch (err) {
                console.error(`Failed to fetch ${club.name}`, err);
                errors.push(`${club.name} (Error)`);
            }

            // Be nice to the API
            await new Promise(r => setTimeout(r, 200));
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
