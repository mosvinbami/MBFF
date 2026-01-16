const fs = require('fs');
const path = require('path');

// Regex to extract clubs from TS file
const clubsPath = path.join(__dirname, '../src/data/clubs.ts');
const clubsContent = fs.readFileSync(clubsPath, 'utf-8');
const clubRegex = /\{ id: '([^']+)', name: '([^']+)',.*league: '([^']+)'/g;
const clubs = [];
let match;
while ((match = clubRegex.exec(clubsContent)) !== null) {
    clubs.push({ id: match[1], name: match[2], league: match[3] });
}

console.log(`Parsed ${clubs.length} clubs from source.`);

const targetPath = path.join(__dirname, '../src/data/players-universal.json');
let allPlayers = [];
if (fs.existsSync(targetPath)) {
    try {
        allPlayers = JSON.parse(fs.readFileSync(targetPath));
        console.log(`Loaded ${allPlayers.length} existing players.`);
    } catch (e) { }
}

// Helper to normalized position
const normalizePosition = (strPos) => {
    if (!strPos) return 'MID';
    const s = strPos.toLowerCase();
    if (s.includes('goalkeeper')) return 'GK';
    if (s.includes('defender') || s.includes('back')) return 'DEF';
    if (s.includes('midfield')) return 'MID';
    if (s.includes('forward') || s.includes('striker')) return 'FWD';
    return 'MID';
};

// Main loop
(async () => {
    for (const club of clubs) {
        // Skip logic if we want to resume?
        // No, let's refresh everyone to ensure "25 players" goal

        console.log(`Syncing ${club.name} (${club.league})...`);

        // Clean name
        const cleanName = club.name
            .replace(/\s(FC|CF|UD|CD|RCD|RC|AFC|SC|BSC|TSG|VfL|VfB|1\. FSV|1\. FC)\b/g, '')
            .replace(/\b(FC|CF|UD|CD|RCD|RC|AFC|SC|BSC|TSG|VfL|VfB|1\. FSV|1\. FC)\s/g, '')
            .trim();

        try {
            // 1. Get Team ID
            const searchRes = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(cleanName)}`);
            const searchData = await searchRes.json();

            if (!searchData.teams) {
                console.warn(`  [WARN] No team found for ${cleanName}`);
                continue;
            }
            const teamId = searchData.teams[0].idTeam;

            // 2. Get Players
            const playersRes = await fetch(`https://www.thesportsdb.com/api/v1/json/3/lookup_all_players.php?id=${teamId}`);
            const playersData = await playersRes.json();

            if (!playersData.player) {
                console.warn(`  [WARN] No players for ${club.name}`);
                continue;
            }

            // Filter current club players out of main list to avoid dupes before re-adding
            allPlayers = allPlayers.filter(p => p.team !== club.name);

            const newPlayers = playersData.player.map(p => ({
                id: p.idPlayer,
                name: p.strPlayer,
                team: club.name,
                teamId: club.id,
                league: club.league,
                position: normalizePosition(p.strPosition),
                price: 5.0,
                points: 0,
                image: p.strCutout || p.strThumb || null,
                nationality: p.strNationality,
                number: p.strNumber
            }))
                // Filter out 'Manager' if mistakenly included or invalid positions
                .filter(p => p.position !== 'Manager')
                // Onana Filter
                .filter(p => !(p.name.includes('André Onana') && p.team.includes('Manchester United')));

            allPlayers.push(...newPlayers);
            console.log(`  + Added ${newPlayers.length} players.`);

            // Save Checkpoint
            fs.writeFileSync(targetPath, JSON.stringify(allPlayers, null, 2));

        } catch (e) {
            console.error(`  [ERR] Failed ${club.name}:`, e.message);
        }

        // Sleep 300ms to be safe
        await new Promise(r => setTimeout(r, 300));
    }

    console.log('Done! Final count: ' + allPlayers.length);
})();
