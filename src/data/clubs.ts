/**
 * Complete Clubs Database - All 96 Clubs from 5 Leagues
 * 
 * - Premier League: 20 clubs
 * - La Liga: 20 clubs
 * - Serie A: 20 clubs
 * - Bundesliga: 18 clubs
 * - Ligue 1: 18 clubs
 */

export interface Club {
    id: string;
    name: string;
    shortName: string;
    league: 'PL' | 'LL' | 'SA' | 'BL' | 'FL1';
    logo: string; // Emoji fallback
    logoUrl?: string; // Real logo URL
    fplTeamId?: number; // For PL team logos from FPL CDN
    stadium: string;
    manager: string;
    founded: number;
}

// Helper to generate FPL badge URL
const fplBadge = (id: number) => `https://resources.premierleague.com/premierleague/badges/t${id}.png`;

// Helper to generate TheSportsDB badge URL (team name must match their database)
const sportsDbBadge = (teamName: string) => `https://www.thesportsdb.com/images/media/team/badge/${encodeURIComponent(teamName.toLowerCase().replace(/ /g, '_'))}.png`;

// Helper to generate Transfermarkt badge URL
const tmBadge = (id: number) => `https://tmssl.akamaized.net/images/wappen/big/${id}.png`;

export const CLUBS: Club[] = [
    // ==========================================
    // PREMIER LEAGUE (20 clubs) - 2025/26 Season
    // ==========================================
    { id: 'arsenal', name: 'Arsenal', shortName: 'ARS', league: 'PL', logo: '🔴', logoUrl: fplBadge(3), fplTeamId: 3, stadium: 'Emirates Stadium', manager: 'Mikel Arteta', founded: 1886 },
    { id: 'aston-villa', name: 'Aston Villa', shortName: 'AVL', league: 'PL', logo: '🟣', logoUrl: fplBadge(7), fplTeamId: 7, stadium: 'Villa Park', manager: 'Unai Emery', founded: 1874 },
    { id: 'bournemouth', name: 'Bournemouth', shortName: 'BOU', league: 'PL', logo: '🍒', logoUrl: fplBadge(91), fplTeamId: 91, stadium: 'Vitality Stadium', manager: 'Andoni Iraola', founded: 1899 },
    { id: 'brentford', name: 'Brentford', shortName: 'BRE', league: 'PL', logo: '🐝', logoUrl: fplBadge(94), fplTeamId: 94, stadium: 'Gtech Community Stadium', manager: 'Thomas Frank', founded: 1889 },
    { id: 'brighton', name: 'Brighton', shortName: 'BHA', league: 'PL', logo: '🔵', logoUrl: fplBadge(36), fplTeamId: 36, stadium: 'Amex Stadium', manager: 'Fabian Hürzeler', founded: 1901 },
    { id: 'chelsea', name: 'Chelsea', shortName: 'CHE', league: 'PL', logo: '💙', logoUrl: fplBadge(8), fplTeamId: 8, stadium: 'Stamford Bridge', manager: 'Enzo Maresca', founded: 1905 },
    { id: 'crystal-palace', name: 'Crystal Palace', shortName: 'CRY', league: 'PL', logo: '🦅', logoUrl: fplBadge(31), fplTeamId: 31, stadium: 'Selhurst Park', manager: 'Oliver Glasner', founded: 1905 },
    { id: 'everton', name: 'Everton', shortName: 'EVE', league: 'PL', logo: '🔷', logoUrl: fplBadge(11), fplTeamId: 11, stadium: 'Goodison Park', manager: 'Sean Dyche', founded: 1878 },
    { id: 'fulham', name: 'Fulham', shortName: 'FUL', league: 'PL', logo: '⚪', logoUrl: fplBadge(54), fplTeamId: 54, stadium: 'Craven Cottage', manager: 'Marco Silva', founded: 1879 },
    { id: 'ipswich', name: 'Ipswich Town', shortName: 'IPS', league: 'PL', logo: '🔵', logoUrl: fplBadge(40), fplTeamId: 40, stadium: 'Portman Road', manager: 'Kieran McKenna', founded: 1878 },
    { id: 'leicester', name: 'Leicester City', shortName: 'LEI', league: 'PL', logo: '🦊', logoUrl: fplBadge(13), fplTeamId: 13, stadium: 'King Power Stadium', manager: 'Ruud van Nistelrooy', founded: 1884 },
    { id: 'liverpool', name: 'Liverpool', shortName: 'LIV', league: 'PL', logo: '🔴', logoUrl: fplBadge(14), fplTeamId: 14, stadium: 'Anfield', manager: 'Arne Slot', founded: 1892 },
    { id: 'man-city', name: 'Manchester City', shortName: 'MCI', league: 'PL', logo: '🩵', logoUrl: fplBadge(43), fplTeamId: 43, stadium: 'Etihad Stadium', manager: 'Pep Guardiola', founded: 1880 },
    { id: 'man-utd', name: 'Manchester United', shortName: 'MUN', league: 'PL', logo: '🔴', logoUrl: fplBadge(1), fplTeamId: 1, stadium: 'Old Trafford', manager: 'Ruben Amorim', founded: 1878 },
    { id: 'newcastle', name: 'Newcastle United', shortName: 'NEW', league: 'PL', logo: '⬛', logoUrl: fplBadge(4), fplTeamId: 4, stadium: "St James' Park", manager: 'Eddie Howe', founded: 1892 },
    { id: 'nottm-forest', name: 'Nottingham Forest', shortName: 'NFO', league: 'PL', logo: '🌳', logoUrl: fplBadge(17), fplTeamId: 17, stadium: 'City Ground', manager: 'Nuno Espírito Santo', founded: 1865 },
    { id: 'southampton', name: 'Southampton', shortName: 'SOU', league: 'PL', logo: '🔴', logoUrl: fplBadge(20), fplTeamId: 20, stadium: "St Mary's Stadium", manager: 'Ivan Jurić', founded: 1885 },
    { id: 'tottenham', name: 'Tottenham Hotspur', shortName: 'TOT', league: 'PL', logo: '⚪', logoUrl: fplBadge(6), fplTeamId: 6, stadium: 'Tottenham Hotspur Stadium', manager: 'Ange Postecoglou', founded: 1882 },
    { id: 'west-ham', name: 'West Ham United', shortName: 'WHU', league: 'PL', logo: '⚒️', logoUrl: fplBadge(21), fplTeamId: 21, stadium: 'London Stadium', manager: 'Julen Lopetegui', founded: 1895 },
    { id: 'wolves', name: 'Wolverhampton Wanderers', shortName: 'WOL', league: 'PL', logo: '🐺', logoUrl: fplBadge(39), fplTeamId: 39, stadium: 'Molineux Stadium', manager: 'Vítor Pereira', founded: 1877 },


    // ==========================================
    // LA LIGA (20 clubs) - 2025/26 Season
    // ==========================================
    { id: 'alaves', name: 'Deportivo Alavés', shortName: 'ALA', league: 'LL', logo: '🔵', stadium: 'Mendizorrotza', manager: 'Luis García Plaza', founded: 1921 },
    { id: 'athletic-bilbao', name: 'Athletic Bilbao', shortName: 'ATH', league: 'LL', logo: '🔴⚪', stadium: 'San Mamés', manager: 'Ernesto Valverde', founded: 1898 },
    { id: 'atletico-madrid', name: 'Atlético Madrid', shortName: 'ATM', league: 'LL', logo: '🔴⚪', stadium: 'Metropolitano', manager: 'Diego Simeone', founded: 1903 },
    { id: 'barcelona', name: 'FC Barcelona', shortName: 'BAR', league: 'LL', logo: '🔵🔴', stadium: 'Spotify Camp Nou', manager: 'Hansi Flick', founded: 1899 },
    { id: 'betis', name: 'Real Betis', shortName: 'BET', league: 'LL', logo: '💚', stadium: 'Benito Villamarín', manager: 'Manuel Pellegrini', founded: 1907 },
    { id: 'celta-vigo', name: 'Celta Vigo', shortName: 'CEL', league: 'LL', logo: '🔵', stadium: 'Abanca-Balaídos', manager: 'Claudio Giráldez', founded: 1923 },
    { id: 'espanyol', name: 'RCD Espanyol', shortName: 'ESP', league: 'LL', logo: '🔵⚪', stadium: 'RCDE Stadium', manager: 'Manolo González', founded: 1900 },
    { id: 'getafe', name: 'Getafe CF', shortName: 'GET', league: 'LL', logo: '🔵', stadium: 'Coliseum Alfonso Pérez', manager: 'José Bordalás', founded: 1983 },
    { id: 'girona', name: 'Girona FC', shortName: 'GIR', league: 'LL', logo: '🔴⚪', stadium: 'Montilivi', manager: 'Míchel', founded: 1930 },
    { id: 'las-palmas', name: 'UD Las Palmas', shortName: 'LPA', league: 'LL', logo: '💛', stadium: 'Gran Canaria', manager: 'Diego Martínez', founded: 1949 },
    { id: 'leganes', name: 'CD Leganés', shortName: 'LEG', league: 'LL', logo: '🔵⚪', stadium: 'Butarque', manager: 'Borja Jiménez', founded: 1928 },
    { id: 'mallorca', name: 'RCD Mallorca', shortName: 'MLL', league: 'LL', logo: '🔴', stadium: 'Son Moix', manager: 'Jagoba Arrasate', founded: 1916 },
    { id: 'osasuna', name: 'CA Osasuna', shortName: 'OSA', league: 'LL', logo: '🔴', stadium: 'El Sadar', manager: 'Vicente Moreno', founded: 1920 },
    { id: 'rayo-vallecano', name: 'Rayo Vallecano', shortName: 'RAY', league: 'LL', logo: '⚡', stadium: 'Vallecas', manager: 'Íñigo Pérez', founded: 1924 },
    { id: 'real-madrid', name: 'Real Madrid', shortName: 'RMA', league: 'LL', logo: '⚪', stadium: 'Santiago Bernabéu', manager: 'Carlo Ancelotti', founded: 1902 },
    { id: 'real-sociedad', name: 'Real Sociedad', shortName: 'RSO', league: 'LL', logo: '🔵⚪', stadium: 'Reale Arena', manager: 'Imanol Alguacil', founded: 1909 },
    { id: 'sevilla', name: 'Sevilla FC', shortName: 'SEV', league: 'LL', logo: '⚪🔴', stadium: 'Ramón Sánchez Pizjuán', manager: 'García Pimienta', founded: 1890 },
    { id: 'valencia', name: 'Valencia CF', shortName: 'VAL', league: 'LL', logo: '🦇', stadium: 'Mestalla', manager: 'Carlos Corberán', founded: 1919 },
    { id: 'valladolid', name: 'Real Valladolid', shortName: 'VLL', league: 'LL', logo: '💜', stadium: 'José Zorrilla', manager: 'Diego Cocca', founded: 1928 },
    { id: 'villarreal', name: 'Villarreal CF', shortName: 'VIL', league: 'LL', logo: '💛', stadium: 'Estadio de la Cerámica', manager: 'Marcelino', founded: 1923 },

    // ==========================================
    // SERIE A (20 clubs) - 2025/26 Season
    // ==========================================
    { id: 'atalanta', name: 'Atalanta BC', shortName: 'ATA', league: 'SA', logo: '🔵⚫', stadium: 'Gewiss Stadium', manager: 'Gian Piero Gasperini', founded: 1907 },
    { id: 'bologna', name: 'Bologna FC', shortName: 'BOL', league: 'SA', logo: '🔴🔵', stadium: 'Renato Dall\'Ara', manager: 'Vincenzo Italiano', founded: 1909 },
    { id: 'cagliari', name: 'Cagliari Calcio', shortName: 'CAG', league: 'SA', logo: '🔴🔵', stadium: 'Unipol Domus', manager: 'Davide Nicola', founded: 1920 },
    { id: 'como', name: 'Como 1907', shortName: 'COM', league: 'SA', logo: '🔵', stadium: 'Stadio Giuseppe Sinigaglia', manager: 'Cesc Fàbregas', founded: 1907 },
    { id: 'empoli', name: 'Empoli FC', shortName: 'EMP', league: 'SA', logo: '🔵', stadium: 'Stadio Carlo Castellani', manager: "Roberto D'Aversa", founded: 1920 },
    { id: 'fiorentina', name: 'ACF Fiorentina', shortName: 'FIO', league: 'SA', logo: '💜', stadium: 'Stadio Artemio Franchi', manager: 'Raffaele Palladino', founded: 1926 },
    { id: 'genoa', name: 'Genoa CFC', shortName: 'GEN', league: 'SA', logo: '🔴🔵', stadium: 'Luigi Ferraris', manager: 'Patrick Vieira', founded: 1893 },
    { id: 'inter-milan', name: 'Inter Milan', shortName: 'INT', league: 'SA', logo: '🔵⚫', stadium: 'San Siro', manager: 'Simone Inzaghi', founded: 1908 },
    { id: 'juventus', name: 'Juventus FC', shortName: 'JUV', league: 'SA', logo: '⚪⚫', stadium: 'Allianz Stadium', manager: 'Thiago Motta', founded: 1897 },
    { id: 'lazio', name: 'SS Lazio', shortName: 'LAZ', league: 'SA', logo: '🔵⚪', stadium: 'Stadio Olimpico', manager: 'Marco Baroni', founded: 1900 },
    { id: 'lecce', name: 'US Lecce', shortName: 'LEC', league: 'SA', logo: '🔴💛', stadium: 'Stadio Via del Mare', manager: 'Marco Giampaolo', founded: 1908 },
    { id: 'ac-milan', name: 'AC Milan', shortName: 'ACM', league: 'SA', logo: '🔴⚫', stadium: 'San Siro', manager: 'Sérgio Conceição', founded: 1899 },
    { id: 'monza', name: 'AC Monza', shortName: 'MON', league: 'SA', logo: '🔴⚪', stadium: 'U-Power Stadium', manager: 'Salvatore Bocchetti', founded: 1912 },
    { id: 'napoli', name: 'SSC Napoli', shortName: 'NAP', league: 'SA', logo: '🔵', stadium: 'Diego Armando Maradona', manager: 'Antonio Conte', founded: 1926 },
    { id: 'parma', name: 'Parma Calcio', shortName: 'PAR', league: 'SA', logo: '💛🔵', stadium: 'Stadio Ennio Tardini', manager: 'Fabio Pecchia', founded: 1913 },
    { id: 'roma', name: 'AS Roma', shortName: 'ROM', league: 'SA', logo: '🟡🔴', stadium: 'Stadio Olimpico', manager: 'Claudio Ranieri', founded: 1927 },
    { id: 'torino', name: 'Torino FC', shortName: 'TOR', league: 'SA', logo: '🐂', stadium: 'Stadio Olimpico Grande Torino', manager: 'Paolo Vanoli', founded: 1906 },
    { id: 'udinese', name: 'Udinese Calcio', shortName: 'UDI', league: 'SA', logo: '⚪⚫', stadium: 'Bluenergy Stadium', manager: 'Kosta Runjaić', founded: 1896 },
    { id: 'venezia', name: 'Venezia FC', shortName: 'VEN', league: 'SA', logo: '🟠⚫💚', stadium: 'Stadio Pier Luigi Penzo', manager: 'Eusebio Di Francesco', founded: 1907 },
    { id: 'verona', name: 'Hellas Verona', shortName: 'VER', league: 'SA', logo: '💛🔵', stadium: 'Stadio Marcantonio Bentegodi', manager: 'Paolo Zanetti', founded: 1903 },

    // ==========================================
    // BUNDESLIGA (18 clubs) - 2025/26 Season
    // ==========================================
    { id: 'augsburg', name: 'FC Augsburg', shortName: 'AUG', league: 'BL', logo: '🔴⚪💚', logoUrl: tmBadge(167), stadium: 'WWK Arena', manager: 'Jess Thorup', founded: 1907 },
    { id: 'leverkusen', name: 'Bayer Leverkusen', shortName: 'B04', league: 'BL', logo: '🔴⚫', logoUrl: tmBadge(15), stadium: 'BayArena', manager: 'Xabi Alonso', founded: 1904 },
    { id: 'bayern-munich', name: 'Bayern Munich', shortName: 'BAY', league: 'BL', logo: '🔴⚪', logoUrl: tmBadge(27), stadium: 'Allianz Arena', manager: 'Vincent Kompany', founded: 1900 },
    { id: 'bochum', name: 'VfL Bochum', shortName: 'BOC', league: 'BL', logo: '🔵', logoUrl: tmBadge(80), stadium: 'Vonovia Ruhrstadion', manager: 'Dieter Hecking', founded: 1848 },
    { id: 'dortmund', name: 'Borussia Dortmund', shortName: 'BVB', league: 'BL', logo: '💛⚫', logoUrl: tmBadge(16), stadium: 'Signal Iduna Park', manager: 'Nuri Şahin', founded: 1909 },
    { id: 'mgladbach', name: "Borussia M'gladbach", shortName: 'BMG', league: 'BL', logo: '⚫⚪💚', logoUrl: tmBadge(18), stadium: 'Borussia-Park', manager: 'Gerardo Seoane', founded: 1900 },
    { id: 'bremen', name: 'Werder Bremen', shortName: 'SVW', league: 'BL', logo: '💚⚪', logoUrl: tmBadge(86), stadium: 'Weserstadion', manager: 'Ole Werner', founded: 1899 },
    { id: 'frankfurt', name: 'Eintracht Frankfurt', shortName: 'SGE', league: 'BL', logo: '⚫🔴⚪', logoUrl: tmBadge(24), stadium: 'Deutsche Bank Park', manager: 'Dino Toppmöller', founded: 1899 },
    { id: 'freiburg', name: 'SC Freiburg', shortName: 'SCF', league: 'BL', logo: '🔴⚪⚫', logoUrl: tmBadge(60), stadium: 'Europa-Park Stadion', manager: 'Julian Schuster', founded: 1904 },
    { id: 'heidenheim', name: '1. FC Heidenheim', shortName: 'HDH', league: 'BL', logo: '🔴🔵⚪', logoUrl: tmBadge(2036), stadium: 'Voith-Arena', manager: 'Frank Schmidt', founded: 1946 },
    { id: 'hoffenheim', name: 'TSG Hoffenheim', shortName: 'TSG', league: 'BL', logo: '🔵⚪', logoUrl: tmBadge(533), stadium: 'PreZero Arena', manager: 'Christian Ilzer', founded: 1899 },
    { id: 'holstein-kiel', name: 'Holstein Kiel', shortName: 'KIE', league: 'BL', logo: '🔵⚪🔴', logoUrl: tmBadge(199), stadium: 'Holstein-Stadion', manager: 'Marcel Rapp', founded: 1900 },
    { id: 'mainz', name: '1. FSV Mainz 05', shortName: 'M05', league: 'BL', logo: '🔴⚪', logoUrl: tmBadge(39), stadium: 'Mewa Arena', manager: 'Bo Henriksen', founded: 1905 },
    { id: 'rb-leipzig', name: 'RB Leipzig', shortName: 'RBL', league: 'BL', logo: '🔴⚪', logoUrl: tmBadge(23826), stadium: 'Red Bull Arena', manager: 'Marco Rose', founded: 2009 },
    { id: 'st-pauli', name: 'FC St. Pauli', shortName: 'STP', league: 'BL', logo: '🏴‍☠️', logoUrl: tmBadge(35), stadium: 'Millerntor-Stadion', manager: 'Alexander Blessin', founded: 1910 },
    { id: 'stuttgart', name: 'VfB Stuttgart', shortName: 'VFB', league: 'BL', logo: '🔴⚪', logoUrl: tmBadge(79), stadium: 'MHPArena', manager: 'Sebastian Hoeneß', founded: 1893 },
    { id: 'union-berlin', name: 'Union Berlin', shortName: 'FCU', league: 'BL', logo: '🔴⚪', logoUrl: tmBadge(89), stadium: 'Stadion An der Alten Försterei', manager: 'Bo Svensson', founded: 1966 },
    { id: 'wolfsburg', name: 'VfL Wolfsburg', shortName: 'WOB', league: 'BL', logo: '💚⚪', logoUrl: tmBadge(82), stadium: 'Volkswagen Arena', manager: 'Ralph Hasenhüttl', founded: 1945 },


    // ==========================================
    // LIGUE 1 (18 clubs) - 2025/26 Season
    // ==========================================
    { id: 'angers', name: 'Angers SCO', shortName: 'ANG', league: 'FL1', logo: '⚫⚪', stadium: 'Stade Raymond Kopa', manager: 'Alexandre Dujeux', founded: 1919 },
    { id: 'auxerre', name: 'AJ Auxerre', shortName: 'AUX', league: 'FL1', logo: '🔵⚪', stadium: 'Stade de l\'Abbé-Deschamps', manager: 'Christophe Pélissier', founded: 1905 },
    { id: 'brest', name: 'Stade Brestois', shortName: 'BRE', league: 'FL1', logo: '🔴⚪', stadium: 'Stade Francis-Le Blé', manager: 'Éric Roy', founded: 1950 },
    { id: 'le-havre', name: 'Le Havre AC', shortName: 'HAC', league: 'FL1', logo: '🔵', stadium: 'Stade Océane', manager: 'Didier Digard', founded: 1894 },
    { id: 'lens', name: 'RC Lens', shortName: 'RCL', league: 'FL1', logo: '🔴💛', stadium: 'Stade Bollaert-Delelis', manager: 'Will Still', founded: 1906 },
    { id: 'lille', name: 'Lille OSC', shortName: 'LIL', league: 'FL1', logo: '🔴⚪', stadium: 'Stade Pierre-Mauroy', manager: 'Bruno Génésio', founded: 1944 },
    { id: 'lyon', name: 'Olympique Lyon', shortName: 'OL', league: 'FL1', logo: '🔵⚪🔴', stadium: 'Groupama Stadium', manager: 'Pierre Sage', founded: 1950 },
    { id: 'marseille', name: 'Olympique Marseille', shortName: 'OM', league: 'FL1', logo: '🔵⚪', stadium: 'Stade Vélodrome', manager: 'Roberto De Zerbi', founded: 1899 },
    { id: 'monaco', name: 'AS Monaco', shortName: 'MON', league: 'FL1', logo: '🔴⚪', stadium: 'Stade Louis II', manager: 'Adi Hütter', founded: 1924 },
    { id: 'montpellier', name: 'Montpellier HSC', shortName: 'MHS', league: 'FL1', logo: '🔵🟠', stadium: 'Stade de la Mosson', manager: 'Jean-Louis Gasset', founded: 1974 },
    { id: 'nantes', name: 'FC Nantes', shortName: 'NAN', league: 'FL1', logo: '💛💚', stadium: 'Stade de la Beaujoire', manager: 'Antoine Kombouaré', founded: 1943 },
    { id: 'nice', name: 'OGC Nice', shortName: 'NIC', league: 'FL1', logo: '🔴⚫', stadium: 'Allianz Riviera', manager: 'Franck Haise', founded: 1904 },
    { id: 'psg', name: 'Paris Saint-Germain', shortName: 'PSG', league: 'FL1', logo: '🔵🔴', stadium: 'Parc des Princes', manager: 'Luis Enrique', founded: 1970 },
    { id: 'reims', name: 'Stade de Reims', shortName: 'REI', league: 'FL1', logo: '🔴⚪', stadium: 'Stade Auguste-Delaune', manager: 'Luka Elsner', founded: 1931 },
    { id: 'rennes', name: 'Stade Rennais', shortName: 'REN', league: 'FL1', logo: '🔴⚫', stadium: 'Roazhon Park', manager: 'Jorge Sampaoli', founded: 1901 },
    { id: 'saint-etienne', name: 'AS Saint-Étienne', shortName: 'STE', league: 'FL1', logo: '💚', stadium: 'Stade Geoffroy-Guichard', manager: 'Eirik Horneland', founded: 1919 },
    { id: 'strasbourg', name: 'RC Strasbourg', shortName: 'STR', league: 'FL1', logo: '🔵⚪', stadium: 'Stade de la Meinau', manager: 'Liam Rosenior', founded: 1906 },
    { id: 'toulouse', name: 'Toulouse FC', shortName: 'TFC', league: 'FL1', logo: '💜', stadium: 'Stadium de Toulouse', manager: 'Carles Martínez', founded: 1970 },
];

// Helper functions
export function getClubById(id: string): Club | undefined {
    return CLUBS.find(c => c.id === id);
}

export function getClubByName(name: string): Club | undefined {
    const lowerName = name.toLowerCase().trim();

    // Common abbreviations mapping
    const abbreviations: Record<string, string> = {
        'man city': 'manchester city',
        'man utd': 'manchester united',
        'man united': 'manchester united',
        'spurs': 'tottenham',
        "nott'm forest": "nottingham forest",
        'nottm forest': 'nottingham forest',
        'brighton': 'brighton and hove albion',
        'wolves': 'wolverhampton',
        'newcastle': 'newcastle united',
        'west ham': 'west ham united',
        'leicester': 'leicester city',
        'atletico': 'atletico madrid',
        'atlético': 'atletico madrid',
        'real': 'real madrid',
        'barca': 'barcelona',
        'bayern': 'bayern munich',
        'dortmund': 'borussia dortmund',
        'psg': 'paris saint-germain',
        'inter': 'inter milan',
        'ac milan': 'milan',
    };

    // Check if name has an abbreviation we should expand
    const expandedName = abbreviations[lowerName] || lowerName;

    return CLUBS.find(c => {
        const clubName = c.name.toLowerCase();
        const shortName = c.shortName.toLowerCase();

        return (
            clubName === expandedName ||
            clubName === lowerName ||
            shortName === lowerName ||
            clubName.includes(expandedName) ||
            clubName.includes(lowerName) ||
            expandedName.includes(clubName) ||
            lowerName.includes(clubName)
        );
    });
}

export function getClubsByLeague(league: Club['league']): Club[] {
    return CLUBS.filter(c => c.league === league);
}

export function getAllClubs(): Club[] {
    return CLUBS;
}

// Log club counts
console.log(`Loaded ${CLUBS.filter(c => c.league === 'PL').length} Premier League clubs`);
console.log(`Loaded ${CLUBS.filter(c => c.league === 'LL').length} La Liga clubs`);
console.log(`Loaded ${CLUBS.filter(c => c.league === 'SA').length} Serie A clubs`);
console.log(`Loaded ${CLUBS.filter(c => c.league === 'BL').length} Bundesliga clubs`);
console.log(`Loaded ${CLUBS.filter(c => c.league === 'FL1').length} Ligue 1 clubs`);
console.log(`Total: ${CLUBS.length} clubs`);
