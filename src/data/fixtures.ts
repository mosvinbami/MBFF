/**
 * Fixtures Data for MBFF Fantasy Football
 * 
 * Contains match fixtures for all 5 leagues with results and upcoming games.
 */

export interface Fixture {
    id: string;
    league: 'PL' | 'LL' | 'SA' | 'BL' | 'FL1';
    gameweek: number;
    date: string;
    time: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    status: 'completed' | 'live' | 'upcoming';
    venue?: string;
}

export interface Club {
    id: string;
    name: string;
    shortName: string;
    league: 'PL' | 'LL' | 'SA' | 'BL' | 'FL1';
    logo: string; // emoji for now
    stadium: string;
    manager: string;
    founded: number;
}

// Club database
export const CLUBS: Club[] = [
    // Premier League
    { id: 'arsenal', name: 'Arsenal', shortName: 'ARS', league: 'PL', logo: '🔴', stadium: 'Emirates Stadium', manager: 'Mikel Arteta', founded: 1886 },
    { id: 'aston-villa', name: 'Aston Villa', shortName: 'AVL', league: 'PL', logo: '🟣', stadium: 'Villa Park', manager: 'Unai Emery', founded: 1874 },
    { id: 'bournemouth', name: 'Bournemouth', shortName: 'BOU', league: 'PL', logo: '🍒', stadium: 'Vitality Stadium', manager: 'Andoni Iraola', founded: 1899 },
    { id: 'brentford', name: 'Brentford', shortName: 'BRE', league: 'PL', logo: '🐝', stadium: 'Gtech Community Stadium', manager: 'Thomas Frank', founded: 1889 },
    { id: 'brighton', name: 'Brighton', shortName: 'BHA', league: 'PL', logo: '🔵', stadium: 'Amex Stadium', manager: 'Fabian Hürzeler', founded: 1901 },
    { id: 'chelsea', name: 'Chelsea', shortName: 'CHE', league: 'PL', logo: '💙', stadium: 'Stamford Bridge', manager: 'Enzo Maresca', founded: 1905 },
    { id: 'crystal-palace', name: 'Crystal Palace', shortName: 'CRY', league: 'PL', logo: '🦅', stadium: 'Selhurst Park', manager: 'Oliver Glasner', founded: 1905 },
    { id: 'everton', name: 'Everton', shortName: 'EVE', league: 'PL', logo: '🔷', stadium: 'Goodison Park', manager: 'Sean Dyche', founded: 1878 },
    { id: 'fulham', name: 'Fulham', shortName: 'FUL', league: 'PL', logo: '⚪', stadium: 'Craven Cottage', manager: 'Marco Silva', founded: 1879 },
    { id: 'ipswich', name: 'Ipswich', shortName: 'IPS', league: 'PL', logo: '🔵', stadium: 'Portman Road', manager: 'Kieran McKenna', founded: 1878 },
    { id: 'leicester', name: 'Leicester', shortName: 'LEI', league: 'PL', logo: '🦊', stadium: 'King Power Stadium', manager: 'Ruud van Nistelrooy', founded: 1884 },
    { id: 'liverpool', name: 'Liverpool', shortName: 'LIV', league: 'PL', logo: '🔴', stadium: 'Anfield', manager: 'Arne Slot', founded: 1892 },
    { id: 'man-city', name: 'Manchester City', shortName: 'MCI', league: 'PL', logo: '🩵', stadium: 'Etihad Stadium', manager: 'Pep Guardiola', founded: 1880 },
    { id: 'man-utd', name: 'Manchester United', shortName: 'MUN', league: 'PL', logo: '🔴', stadium: 'Old Trafford', manager: 'Ruben Amorim', founded: 1878 },
    { id: 'newcastle', name: 'Newcastle', shortName: 'NEW', league: 'PL', logo: '⬛', stadium: 'St James Park', manager: 'Eddie Howe', founded: 1892 },
    { id: 'nottm-forest', name: 'Nottingham Forest', shortName: 'NFO', league: 'PL', logo: '🌳', stadium: 'City Ground', manager: 'Nuno Espírito Santo', founded: 1865 },
    { id: 'southampton', name: 'Southampton', shortName: 'SOU', league: 'PL', logo: '🔴', stadium: "St Mary's Stadium", manager: 'Ivan Jurić', founded: 1885 },
    { id: 'tottenham', name: 'Tottenham', shortName: 'TOT', league: 'PL', logo: '⚪', stadium: 'Tottenham Hotspur Stadium', manager: 'Ange Postecoglou', founded: 1882 },
    { id: 'west-ham', name: 'West Ham', shortName: 'WHU', league: 'PL', logo: '⚒️', stadium: 'London Stadium', manager: 'Julen Lopetegui', founded: 1895 },
    { id: 'wolves', name: 'Wolves', shortName: 'WOL', league: 'PL', logo: '🐺', stadium: 'Molineux Stadium', manager: 'Vítor Pereira', founded: 1877 },

    // La Liga
    { id: 'real-madrid', name: 'Real Madrid', shortName: 'RMA', league: 'LL', logo: '⚪', stadium: 'Santiago Bernabéu', manager: 'Carlo Ancelotti', founded: 1902 },
    { id: 'barcelona', name: 'Barcelona', shortName: 'BAR', league: 'LL', logo: '🔵🔴', stadium: 'Camp Nou', manager: 'Hansi Flick', founded: 1899 },
    { id: 'atletico-madrid', name: 'Atlético Madrid', shortName: 'ATM', league: 'LL', logo: '🔴⚪', stadium: 'Metropolitano', manager: 'Diego Simeone', founded: 1903 },
    { id: 'sevilla', name: 'Sevilla', shortName: 'SEV', league: 'LL', logo: '⚪🔴', stadium: 'Ramón Sánchez Pizjuán', manager: 'García Pimienta', founded: 1890 },
    { id: 'villarreal', name: 'Villarreal', shortName: 'VIL', league: 'LL', logo: '💛', stadium: 'Estadio de la Cerámica', manager: 'Marcelino', founded: 1923 },

    // Serie A
    { id: 'inter-milan', name: 'Inter Milan', shortName: 'INT', league: 'SA', logo: '🔵⚫', stadium: 'San Siro', manager: 'Simone Inzaghi', founded: 1908 },
    { id: 'ac-milan', name: 'AC Milan', shortName: 'ACM', league: 'SA', logo: '🔴⚫', stadium: 'San Siro', manager: 'Sérgio Conceição', founded: 1899 },
    { id: 'juventus', name: 'Juventus', shortName: 'JUV', league: 'SA', logo: '⚪⚫', stadium: 'Allianz Stadium', manager: 'Thiago Motta', founded: 1897 },
    { id: 'napoli', name: 'Napoli', shortName: 'NAP', league: 'SA', logo: '🔵', stadium: 'Diego Armando Maradona', manager: 'Antonio Conte', founded: 1926 },
    { id: 'roma', name: 'Roma', shortName: 'ROM', league: 'SA', logo: '🟡🔴', stadium: 'Stadio Olimpico', manager: 'Claudio Ranieri', founded: 1927 },

    // Bundesliga
    { id: 'bayern-munich', name: 'Bayern Munich', shortName: 'BAY', league: 'BL', logo: '🔴', stadium: 'Allianz Arena', manager: 'Vincent Kompany', founded: 1900 },
    { id: 'dortmund', name: 'Borussia Dortmund', shortName: 'BVB', league: 'BL', logo: '💛', stadium: 'Signal Iduna Park', manager: 'Nuri Şahin', founded: 1909 },
    { id: 'leverkusen', name: 'Bayer Leverkusen', shortName: 'B04', league: 'BL', logo: '🔴', stadium: 'BayArena', manager: 'Xabi Alonso', founded: 1904 },
    { id: 'rb-leipzig', name: 'RB Leipzig', shortName: 'RBL', league: 'BL', logo: '🔴⚪', stadium: 'Red Bull Arena', manager: 'Marco Rose', founded: 2009 },
    { id: 'frankfurt', name: 'Eintracht Frankfurt', shortName: 'SGE', league: 'BL', logo: '⚫🔴', stadium: 'Deutsche Bank Park', manager: 'Dino Toppmöller', founded: 1899 },

    // Ligue 1
    { id: 'psg', name: 'Paris Saint-Germain', shortName: 'PSG', league: 'FL1', logo: '🔵🔴', stadium: 'Parc des Princes', manager: 'Luis Enrique', founded: 1970 },
    { id: 'marseille', name: 'Olympique Marseille', shortName: 'OM', league: 'FL1', logo: '🔵⚪', stadium: 'Stade Vélodrome', manager: 'Roberto De Zerbi', founded: 1899 },
    { id: 'monaco', name: 'AS Monaco', shortName: 'MON', league: 'FL1', logo: '🔴⚪', stadium: 'Stade Louis II', manager: 'Adi Hütter', founded: 1924 },
    { id: 'lille', name: 'Lille', shortName: 'LIL', league: 'FL1', logo: '🔴', stadium: 'Stade Pierre-Mauroy', manager: 'Bruno Génésio', founded: 1944 },
    { id: 'lyon', name: 'Olympique Lyon', shortName: 'OL', league: 'FL1', logo: '🔵🔴', stadium: 'Groupama Stadium', manager: 'Pierre Sage', founded: 1950 },
];

// Generate fixtures for current season
export const FIXTURES: Fixture[] = [
    // Gameweek 18 (Dec 26-28) - Completed
    { id: 'pl-18-1', league: 'PL', gameweek: 18, date: '2025-12-26', time: '15:00', homeTeam: 'Liverpool', awayTeam: 'Leicester', homeScore: 3, awayScore: 1, status: 'completed' },
    { id: 'pl-18-2', league: 'PL', gameweek: 18, date: '2025-12-26', time: '15:00', homeTeam: 'Manchester City', awayTeam: 'Everton', homeScore: 2, awayScore: 0, status: 'completed' },
    { id: 'pl-18-3', league: 'PL', gameweek: 18, date: '2025-12-26', time: '17:30', homeTeam: 'Arsenal', awayTeam: 'Ipswich', homeScore: 1, awayScore: 0, status: 'completed' },
    { id: 'pl-18-4', league: 'PL', gameweek: 18, date: '2025-12-26', time: '15:00', homeTeam: 'Chelsea', awayTeam: 'Fulham', homeScore: 1, awayScore: 1, status: 'completed' },
    { id: 'pl-18-5', league: 'PL', gameweek: 18, date: '2025-12-26', time: '15:00', homeTeam: 'Bournemouth', awayTeam: 'Crystal Palace', homeScore: 0, awayScore: 0, status: 'completed' },
    { id: 'pl-18-6', league: 'PL', gameweek: 18, date: '2025-12-27', time: '20:00', homeTeam: 'Tottenham', awayTeam: 'Nottingham Forest', homeScore: 1, awayScore: 0, status: 'completed' },

    // Gameweek 19 (Dec 29-Jan 1) - Completed
    { id: 'pl-19-1', league: 'PL', gameweek: 19, date: '2025-12-29', time: '16:30', homeTeam: 'Newcastle', awayTeam: 'Manchester United', homeScore: 2, awayScore: 0, status: 'completed' },
    { id: 'pl-19-2', league: 'PL', gameweek: 19, date: '2025-12-29', time: '14:00', homeTeam: 'Brighton', awayTeam: 'Brentford', homeScore: 3, awayScore: 1, status: 'completed' },
    { id: 'pl-19-3', league: 'PL', gameweek: 19, date: '2025-12-29', time: '14:00', homeTeam: 'Aston Villa', awayTeam: 'Brighton', homeScore: 2, awayScore: 2, status: 'completed' },
    { id: 'pl-19-4', league: 'PL', gameweek: 19, date: '2026-01-01', time: '17:30', homeTeam: 'Liverpool', awayTeam: 'Manchester United', homeScore: 2, awayScore: 2, status: 'completed' },
    { id: 'pl-19-5', league: 'PL', gameweek: 19, date: '2026-01-01', time: '15:00', homeTeam: 'Arsenal', awayTeam: 'Brentford', homeScore: 1, awayScore: 0, status: 'completed' },
    { id: 'pl-19-6', league: 'PL', gameweek: 19, date: '2026-01-01', time: '15:00', homeTeam: 'Chelsea', awayTeam: 'Bournemouth', homeScore: 3, awayScore: 0, status: 'completed' },

    // Gameweek 20 (Jan 4-5) - Upcoming
    { id: 'pl-20-1', league: 'PL', gameweek: 20, date: '2026-01-04', time: '15:00', homeTeam: 'Manchester City', awayTeam: 'West Ham', homeScore: null, awayScore: null, status: 'upcoming' },
    { id: 'pl-20-2', league: 'PL', gameweek: 20, date: '2026-01-04', time: '15:00', homeTeam: 'Everton', awayTeam: 'Liverpool', homeScore: null, awayScore: null, status: 'upcoming' },
    { id: 'pl-20-3', league: 'PL', gameweek: 20, date: '2026-01-04', time: '17:30', homeTeam: 'Manchester United', awayTeam: 'Arsenal', homeScore: null, awayScore: null, status: 'upcoming' },
    { id: 'pl-20-4', league: 'PL', gameweek: 20, date: '2026-01-05', time: '14:00', homeTeam: 'Tottenham', awayTeam: 'Newcastle', homeScore: null, awayScore: null, status: 'upcoming' },
    { id: 'pl-20-5', league: 'PL', gameweek: 20, date: '2026-01-05', time: '16:30', homeTeam: 'Wolves', awayTeam: 'Chelsea', homeScore: null, awayScore: null, status: 'upcoming' },

    // Gameweek 21 (Jan 11-12) - Upcoming
    { id: 'pl-21-1', league: 'PL', gameweek: 21, date: '2026-01-11', time: '15:00', homeTeam: 'Arsenal', awayTeam: 'Tottenham', homeScore: null, awayScore: null, status: 'upcoming' },
    { id: 'pl-21-2', league: 'PL', gameweek: 21, date: '2026-01-11', time: '17:30', homeTeam: 'Liverpool', awayTeam: 'Manchester City', homeScore: null, awayScore: null, status: 'upcoming' },
    { id: 'pl-21-3', league: 'PL', gameweek: 21, date: '2026-01-12', time: '14:00', homeTeam: 'Chelsea', awayTeam: 'Newcastle', homeScore: null, awayScore: null, status: 'upcoming' },

    // La Liga fixtures
    { id: 'll-18-1', league: 'LL', gameweek: 18, date: '2025-12-22', time: '21:00', homeTeam: 'Real Madrid', awayTeam: 'Sevilla', homeScore: 4, awayScore: 2, status: 'completed' },
    { id: 'll-18-2', league: 'LL', gameweek: 18, date: '2025-12-22', time: '18:30', homeTeam: 'Barcelona', awayTeam: 'Atlético Madrid', homeScore: 1, awayScore: 2, status: 'completed' },
    { id: 'll-19-1', league: 'LL', gameweek: 19, date: '2026-01-05', time: '21:00', homeTeam: 'Atlético Madrid', awayTeam: 'Real Madrid', homeScore: null, awayScore: null, status: 'upcoming' },
    { id: 'll-19-2', league: 'LL', gameweek: 19, date: '2026-01-05', time: '18:30', homeTeam: 'Sevilla', awayTeam: 'Barcelona', homeScore: null, awayScore: null, status: 'upcoming' },

    // Serie A fixtures
    { id: 'sa-18-1', league: 'SA', gameweek: 18, date: '2025-12-22', time: '20:45', homeTeam: 'Inter Milan', awayTeam: 'AC Milan', homeScore: 2, awayScore: 1, status: 'completed' },
    { id: 'sa-18-2', league: 'SA', gameweek: 18, date: '2025-12-21', time: '18:00', homeTeam: 'Napoli', awayTeam: 'Juventus', homeScore: 0, awayScore: 0, status: 'completed' },
    { id: 'sa-19-1', league: 'SA', gameweek: 19, date: '2026-01-05', time: '20:45', homeTeam: 'Juventus', awayTeam: 'Inter Milan', homeScore: null, awayScore: null, status: 'upcoming' },
    { id: 'sa-19-2', league: 'SA', gameweek: 19, date: '2026-01-05', time: '15:00', homeTeam: 'AC Milan', awayTeam: 'Roma', homeScore: null, awayScore: null, status: 'upcoming' },

    // Bundesliga fixtures
    { id: 'bl-17-1', league: 'BL', gameweek: 17, date: '2025-12-21', time: '18:30', homeTeam: 'Bayern Munich', awayTeam: 'RB Leipzig', homeScore: 5, awayScore: 1, status: 'completed' },
    { id: 'bl-17-2', league: 'BL', gameweek: 17, date: '2025-12-21', time: '15:30', homeTeam: 'Borussia Dortmund', awayTeam: 'Bayer Leverkusen', homeScore: 2, awayScore: 3, status: 'completed' },
    { id: 'bl-18-1', league: 'BL', gameweek: 18, date: '2026-01-11', time: '18:30', homeTeam: 'Bayer Leverkusen', awayTeam: 'Bayern Munich', homeScore: null, awayScore: null, status: 'upcoming' },
    { id: 'bl-18-2', league: 'BL', gameweek: 18, date: '2026-01-11', time: '15:30', homeTeam: 'RB Leipzig', awayTeam: 'Borussia Dortmund', homeScore: null, awayScore: null, status: 'upcoming' },

    // Ligue 1 fixtures
    { id: 'fl1-17-1', league: 'FL1', gameweek: 17, date: '2025-12-22', time: '20:45', homeTeam: 'Paris Saint-Germain', awayTeam: 'Olympique Lyon', homeScore: 3, awayScore: 1, status: 'completed' },
    { id: 'fl1-17-2', league: 'FL1', gameweek: 17, date: '2025-12-22', time: '17:00', homeTeam: 'AS Monaco', awayTeam: 'Lille', homeScore: 2, awayScore: 2, status: 'completed' },
    { id: 'fl1-18-1', league: 'FL1', gameweek: 18, date: '2026-01-12', time: '20:45', homeTeam: 'Olympique Marseille', awayTeam: 'Paris Saint-Germain', homeScore: null, awayScore: null, status: 'upcoming' },
    { id: 'fl1-18-2', league: 'FL1', gameweek: 18, date: '2026-01-12', time: '17:00', homeTeam: 'Lille', awayTeam: 'AS Monaco', homeScore: null, awayScore: null, status: 'upcoming' },
];

// Helper functions
export function getFixturesByLeague(league: Fixture['league']): Fixture[] {
    return FIXTURES.filter(f => f.league === league).sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

export function getFixturesByTeam(teamName: string): Fixture[] {
    return FIXTURES.filter(f =>
        f.homeTeam === teamName || f.awayTeam === teamName
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getUpcomingFixtures(limit: number = 10): Fixture[] {
    return FIXTURES
        .filter(f => f.status === 'upcoming')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, limit);
}

export function getCompletedFixtures(limit: number = 10): Fixture[] {
    return FIXTURES
        .filter(f => f.status === 'completed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
}

export function getClubById(clubId: string): Club | undefined {
    return CLUBS.find(c => c.id === clubId);
}

export function getClubByName(name: string): Club | undefined {
    return CLUBS.find(c =>
        c.name.toLowerCase() === name.toLowerCase() ||
        c.shortName.toLowerCase() === name.toLowerCase()
    );
}

export function getClubsByLeague(league: Club['league']): Club[] {
    return CLUBS.filter(c => c.league === league);
}
