/**
 * Transfermarkt Player ID Mappings
 * 
 * Maps player names to their Transfermarkt IDs for fetching photos
 * Generated from Transfermarkt API
 */

// Transfermarkt Club IDs
export const TRANSFERMARKT_CLUB_IDS: Record<string, string> = {
    // Bundesliga
    'Bayern Munich': '27',
    'Borussia Dortmund': '16',
    'Bayer Leverkusen': '15',
    'RB Leipzig': '23826',
    'Eintracht Frankfurt': '24',
    'VfB Stuttgart': '79',
    'SC Freiburg': '60',
    'VfL Wolfsburg': '82',
    'Borussia Mönchengladbach': '18',
    'TSG Hoffenheim': '533',
    'Werder Bremen': '86',
    'Union Berlin': '89',
    'Mainz 05': '39',
    'FC Augsburg': '167',
    '1. FC Heidenheim': '2036',
    'VfL Bochum': '80',
    'FC St. Pauli': '35',
    'Holstein Kiel': '199',

    // Premier League
    'Arsenal': '11',
    'Manchester City': '281',
    'Liverpool': '31',
    'Chelsea': '631',
    'Manchester United': '985',
    'Tottenham': '148',
    'Newcastle': '762',
    'Aston Villa': '405',
    'Brighton': '1237',
    'West Ham': '379',
    'Fulham': '931',
    'Brentford': '1148',
    'Crystal Palace': '873',
    'Everton': '29',
    'Nottingham Forest': '703',
    'Bournemouth': '989',
    'Wolves': '543',
    'Leicester': '1003',
    'Ipswich': '677',
    'Southampton': '180',

    // La Liga
    'Real Madrid': '418',
    'Barcelona': '131',
    'Atletico Madrid': '13',
    'Athletic Bilbao': '621',
    'Real Sociedad': '681',
    'Villarreal': '1050',
    'Real Betis': '150',
    'Sevilla': '368',
    'Valencia': '1049',

    // Serie A
    'Inter Milan': '46',
    'AC Milan': '5',
    'Juventus': '506',
    'Napoli': '6195',
    'Roma': '12',
    'Lazio': '398',
    'Atalanta': '800',
    'Fiorentina': '430',
    'Bologna': '1025',

    // Ligue 1
    'PSG': '583',
    'Monaco': '162',
    'Marseille': '244',
    'Lille': '1082',
    'Lyon': '1041',
    'Nice': '417',
    'Lens': '826',
    'Rennes': '273',
};

// Top player Transfermarkt IDs (most popular players)
export const TRANSFERMARKT_PLAYER_IDS: Record<string, string> = {
    // Bayern Munich
    'Jamal Musiala': '580195',
    'Harry Kane': '132098',
    'Manuel Neuer': '17259',
    'Leroy Sané': '192565',
    'Joshua Kimmich': '161056',
    'Alphonso Davies': '424204',
    'Thomas Müller': '58358',
    'Serge Gnabry': '159471',
    'Kingsley Coman': '243714',
    'Michael Olise': '621205',
    'Dayot Upamecano': '344695',
    'Luis Díaz': '480692',

    // Borussia Dortmund
    'Gregor Kobel': '257814',
    'Nico Schlotterbeck': '388198',
    'Julian Brandt': '187492',
    'Serhou Guirassy': '423792',
    'Karim Adeyemi': '496984',
    'Jamie Gittens': '718794',

    // Bayer Leverkusen
    'Granit Xhaka': '111455',
    'Jeremie Frimpong': '476998',
    'Victor Boniface': '663507',
    'Alejandro Grimaldo': '194905',
    'Jonathan Tah': '134030',

    // Premier League
    'Mohamed Salah': '148455',
    'Erling Haaland': '418560',
    'Bukayo Saka': '433177',
    'Cole Palmer': '607339',
    'Martin Ødegaard': '316264',
    'Kevin De Bruyne': '88755',
    'Bruno Fernandes': '240306',
    'Alexander Isak': '435338',
    'Florian Wirtz': '521361',
    'Son Heung-min': '91845',
    'Phil Foden': '406635',
    'Darwin Núñez': '546543',
    'Virgil van Dijk': '139208',
    'Trent Alexander-Arnold': '314353',
    'William Saliba': '498059',

    // La Liga
    'Jude Bellingham': '581678',
    'Vinícius Jr.': '371998',
    'Kylian Mbappé': '342229',
    'Robert Lewandowski': '38253',
    'Lamine Yamal': '936600',
    'Pedri': '901307',
    'Antoine Griezmann': '125781',

    // Serie A
    'Lautaro Martínez': '406625',
    'Rafael Leão': '460420',
    'Nicolò Barella': '255942',
    'Dusan Vlahović': '371839',
    'Federico Dimarco': '257611',
    'Marcus Thuram': '364681',

    // Ligue 1
    'Ousmane Dembélé': '288230',
    'Bradley Barcola': '796801',
    'Achraf Hakimi': '398073',
    'Khvicha Kvaratskhelia': '598017',
};

/**
 * Get Transfermarkt player photo URL by player name
 */
export function getPlayerPhotoUrl(playerName: string): string | null {
    const playerId = TRANSFERMARKT_PLAYER_IDS[playerName];
    if (!playerId) return null;

    // Construct the photo URL pattern used by Transfermarkt
    return `https://img.a.transfermarkt.technology/portrait/header/${playerId}-1.jpg`;
}

/**
 * Get Transfermarkt club logo URL by club name
 */
export function getClubLogoUrl(clubName: string): string | null {
    const clubId = TRANSFERMARKT_CLUB_IDS[clubName];
    if (!clubId) return null;

    return `https://tmssl.akamaized.net/images/wappen/big/${clubId}.png`;
}

/**
 * Get Transfermarkt player ID by player name
 */
export function getTransfermarktPlayerId(playerName: string): string | null {
    return TRANSFERMARKT_PLAYER_IDS[playerName] || null;
}

/**
 * Get Transfermarkt club ID by club name
 */
export function getTransfermarktClubId(clubName: string): string | null {
    return TRANSFERMARKT_CLUB_IDS[clubName] || null;
}
