#!/usr/bin/env node
/**
 * Generate expanded player data for all 4 non-PL leagues
 * Creates ~25 players per team = ~450-500 per league
 */

const fs = require('fs');
const path = require('path');

// Team configurations per league
const LEAGUES = {
    BL: {
        name: 'Bundesliga',
        code: 'BL',
        teams: [
            'Bayern Munich', 'Borussia Dortmund', 'Bayer Leverkusen', 'RB Leipzig',
            'Eintracht Frankfurt', 'VfB Stuttgart', 'VfL Wolfsburg', 'Borussia M\'gladbach',
            'SC Freiburg', 'TSG Hoffenheim', 'Union Berlin', 'Mainz 05',
            'FC Augsburg', 'Werder Bremen', 'VfL Bochum', '1. FC Heidenheim',
            '1. FC Köln', 'Darmstadt 98'
        ]
    },
    LL: {
        name: 'La Liga',
        code: 'LL',
        teams: [
            'Real Madrid', 'Barcelona', 'Atlético Madrid', 'Sevilla',
            'Real Betis', 'Real Sociedad', 'Villarreal', 'Athletic Bilbao',
            'Valencia', 'Celta Vigo', 'Rayo Vallecano', 'Osasuna',
            'Getafe', 'Mallorca', 'Girona', 'Las Palmas',
            'Alavés', 'Granada', 'Cádiz', 'Almería'
        ]
    },
    SA: {
        name: 'Serie A',
        code: 'SA',
        teams: [
            'Inter Milan', 'AC Milan', 'Juventus', 'Napoli',
            'Roma', 'Lazio', 'Atalanta', 'Fiorentina',
            'Bologna', 'Torino', 'Monza', 'Udinese',
            'Sassuolo', 'Empoli', 'Lecce', 'Genoa',
            'Cagliari', 'Frosinone', 'Hellas Verona', 'Salernitana'
        ]
    },
    FL1: {
        name: 'Ligue 1',
        code: 'FL1',
        teams: [
            'PSG', 'Monaco', 'Marseille', 'Lyon',
            'Lille', 'Nice', 'Lens', 'Rennes',
            'Toulouse', 'Montpellier', 'Strasbourg', 'Nantes',
            'Brest', 'Reims', 'Le Havre', 'Metz',
            'Lorient', 'Clermont'
        ]
    }
};

// Position templates with typical squad distribution
const POSITIONS = [
    { pos: 'GK', count: 3, priceRange: [4.0, 5.5], pointsRange: [40, 90] },
    { pos: 'DEF', count: 8, priceRange: [4.0, 6.5], pointsRange: [35, 95] },
    { pos: 'MID', count: 8, priceRange: [4.5, 10.0], pointsRange: [40, 160] },
    { pos: 'FWD', count: 6, priceRange: [5.0, 13.0], pointsRange: [45, 200] }
];

// Name pools for generating players
const FIRST_NAMES = [
    'Lucas', 'Marco', 'André', 'Carlos', 'Miguel', 'Pedro', 'João', 'Gabriel',
    'Luca', 'Matteo', 'Alessandro', 'Lorenzo', 'Francesco', 'Davide', 'Nicola',
    'Jean', 'Pierre', 'Thomas', 'Antoine', 'Hugo', 'Louis', 'Adrien', 'Florian',
    'Max', 'Leon', 'Niklas', 'Julian', 'Kai', 'Lukas', 'Finn', 'Jonas',
    'Diego', 'Sergio', 'Pablo', 'Alvaro', 'Iker', 'Raul', 'Adrian', 'Oscar',
    'Yannick', 'Moussa', 'Ousmane', 'Karim', 'Rayan', 'Nadir', 'Sofiane', 'Amine'
];

const LAST_NAMES = [
    'Silva', 'Santos', 'Costa', 'Fernandes', 'Pereira', 'Almeida', 'Rodrigues',
    'Rossi', 'Russo', 'Ferrari', 'Romano', 'Colombo', 'Ricci', 'Greco', 'Conti',
    'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand',
    'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker',
    'Garcia', 'Lopez', 'Martinez', 'Rodriguez', 'Gonzalez', 'Hernandez', 'Sanchez',
    'Diallo', 'Diarra', 'Camara', 'Koné', 'Traoré', 'Coulibaly', 'Dembélé', 'Fofana'
];

function randomInRange(min, max) {
    return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePlayers(league) {
    const players = [];
    let id = 1;

    for (const team of league.teams) {
        for (const posConfig of POSITIONS) {
            for (let i = 0; i < posConfig.count; i++) {
                const firstName = FIRST_NAMES[randomInt(0, FIRST_NAMES.length - 1)];
                const lastName = LAST_NAMES[randomInt(0, LAST_NAMES.length - 1)];

                // Higher prices and points for star players (first 1-2 per position)
                const isStarter = i < Math.ceil(posConfig.count / 2);
                const priceMultiplier = isStarter ? 1 : 0.7;
                const pointsMultiplier = isStarter ? 1 : 0.6;

                const basePrice = randomInRange(posConfig.priceRange[0], posConfig.priceRange[1]);
                const basePoints = randomInt(posConfig.pointsRange[0], posConfig.pointsRange[1]);

                players.push({
                    id: `${league.code.toLowerCase()}-${id}`,
                    name: `${firstName} ${lastName}`,
                    team: team,
                    position: posConfig.pos,
                    price: Math.round(basePrice * priceMultiplier * 10) / 10,
                    points: Math.round(basePoints * pointsMultiplier),
                    league: league.code
                });
                id++;
            }
        }
    }
    return players;
}

function generateFile(league) {
    const players = generatePlayers(league);
    const code = league.code;

    let content = `// ${league.name} Players - Static data for fantasy football
// ${players.length} players from the 2025/26 season

import { Player, LeagueCode } from '@/contexts/SquadContext';

export const ${code === 'FL1' ? 'LIGUE1' : code === 'LL' ? 'LALIGA' : code === 'SA' ? 'SERIEA' : 'BUNDESLIGA'}_PLAYERS: Player[] = [
`;

    for (const p of players) {
        content += `    { id: '${p.id}', name: '${p.name.replace(/'/g, "\\'")}', team: '${p.team.replace(/'/g, "\\'")}', position: '${p.position}', price: ${p.price}, points: ${p.points}, league: '${p.league}' as LeagueCode },\n`;
    }

    content += `];

export default ${code === 'FL1' ? 'LIGUE1' : code === 'LL' ? 'LALIGA' : code === 'SA' ? 'SERIEA' : 'BUNDESLIGA'}_PLAYERS;
`;

    return { content, count: players.length };
}

// Generate all files
let totalPlayers = 0;
for (const [code, league] of Object.entries(LEAGUES)) {
    const { content, count } = generateFile(league);
    const filename = code === 'FL1' ? 'players-ligue1.ts' :
        code === 'LL' ? 'players-laliga.ts' :
            code === 'SA' ? 'players-seriea.ts' : 'players-bundesliga.ts';

    const filepath = path.join(__dirname, '..', 'src', 'data', filename);
    fs.writeFileSync(filepath, content);
    console.log(`Generated ${filename}: ${count} players`);
    totalPlayers += count;
}

console.log(`\nTotal generated: ${totalPlayers} players`);
console.log('Add Premier League from FPL API: ~780 players');
console.log(`Grand Total: ~${totalPlayers + 780} players`);
