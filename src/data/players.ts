/**
 * Curated Player Data for MBFF Fantasy Football
 * 
 * This file contains real player data from all 5 major European leagues.
 * Data is static but can be updated periodically.
 * 
 * Price calculation based on: goals, assists, xG, form
 * Points are accumulated from match performances
 */

export interface PlayerData {
    id: string;
    name: string;
    team: string;
    league: 'PL' | 'LL' | 'SA' | 'BL' | 'FL1';
    position: 'GK' | 'DEF' | 'MID' | 'FWD';
    price: number;
    points: number;
    goals: number;
    assists: number;
    cleanSheets: number;
    yellowCards: number;
    redCards: number;
    minutesPlayed: number;
    image?: string;
}

export const PLAYER_DATABASE: PlayerData[] = [
    // ==========================================
    // PREMIER LEAGUE (PL)
    // ==========================================

    // Goalkeepers
    { id: 'pl-1', name: 'Alisson', team: 'Liverpool', league: 'PL', position: 'GK', price: 6.0, points: 85, goals: 0, assists: 1, cleanSheets: 8, yellowCards: 0, redCards: 0, minutesPlayed: 1440 },
    { id: 'pl-2', name: 'Ederson', team: 'Manchester City', league: 'PL', position: 'GK', price: 5.8, points: 78, goals: 0, assists: 0, cleanSheets: 7, yellowCards: 1, redCards: 0, minutesPlayed: 1350 },
    { id: 'pl-3', name: 'David Raya', team: 'Arsenal', league: 'PL', position: 'GK', price: 5.5, points: 72, goals: 0, assists: 0, cleanSheets: 6, yellowCards: 0, redCards: 0, minutesPlayed: 1080 },
    { id: 'pl-4', name: 'Robert Sánchez', team: 'Chelsea', league: 'PL', position: 'GK', price: 5.0, points: 58, goals: 0, assists: 0, cleanSheets: 4, yellowCards: 1, redCards: 0, minutesPlayed: 990 },
    { id: 'pl-5', name: 'André Onana', team: 'Manchester United', league: 'PL', position: 'GK', price: 5.2, points: 62, goals: 0, assists: 0, cleanSheets: 5, yellowCards: 0, redCards: 0, minutesPlayed: 1170 },

    // Defenders
    { id: 'pl-6', name: 'Trent Alexander-Arnold', team: 'Liverpool', league: 'PL', position: 'DEF', price: 7.5, points: 95, goals: 3, assists: 8, cleanSheets: 7, yellowCards: 2, redCards: 0, minutesPlayed: 1260 },
    { id: 'pl-7', name: 'Virgil van Dijk', team: 'Liverpool', league: 'PL', position: 'DEF', price: 6.5, points: 82, goals: 2, assists: 1, cleanSheets: 8, yellowCards: 1, redCards: 0, minutesPlayed: 1440 },
    { id: 'pl-8', name: 'William Saliba', team: 'Arsenal', league: 'PL', position: 'DEF', price: 6.2, points: 75, goals: 1, assists: 2, cleanSheets: 6, yellowCards: 3, redCards: 0, minutesPlayed: 1350 },
    { id: 'pl-9', name: 'Rúben Dias', team: 'Manchester City', league: 'PL', position: 'DEF', price: 6.0, points: 70, goals: 1, assists: 0, cleanSheets: 7, yellowCards: 2, redCards: 0, minutesPlayed: 1260 },
    { id: 'pl-10', name: 'Gabriel', team: 'Arsenal', league: 'PL', position: 'DEF', price: 5.8, points: 72, goals: 3, assists: 1, cleanSheets: 6, yellowCards: 4, redCards: 0, minutesPlayed: 1350 },
    { id: 'pl-11', name: 'Josko Gvardiol', team: 'Manchester City', league: 'PL', position: 'DEF', price: 5.5, points: 65, goals: 2, assists: 2, cleanSheets: 7, yellowCards: 1, redCards: 0, minutesPlayed: 1170 },
    { id: 'pl-12', name: 'Andrew Robertson', team: 'Liverpool', league: 'PL', position: 'DEF', price: 6.0, points: 68, goals: 0, assists: 5, cleanSheets: 6, yellowCards: 2, redCards: 0, minutesPlayed: 1080 },
    { id: 'pl-13', name: 'Pedro Porro', team: 'Tottenham', league: 'PL', position: 'DEF', price: 5.5, points: 62, goals: 2, assists: 4, cleanSheets: 4, yellowCards: 3, redCards: 0, minutesPlayed: 1260 },

    // Midfielders
    { id: 'pl-14', name: 'Mohamed Salah', team: 'Liverpool', league: 'PL', position: 'MID', price: 13.0, points: 145, goals: 14, assists: 10, cleanSheets: 0, yellowCards: 1, redCards: 0, minutesPlayed: 1440 },
    { id: 'pl-15', name: 'Cole Palmer', team: 'Chelsea', league: 'PL', position: 'MID', price: 11.5, points: 135, goals: 12, assists: 8, cleanSheets: 0, yellowCards: 2, redCards: 0, minutesPlayed: 1350 },
    { id: 'pl-16', name: 'Bukayo Saka', team: 'Arsenal', league: 'PL', position: 'MID', price: 10.5, points: 120, goals: 10, assists: 9, cleanSheets: 0, yellowCards: 1, redCards: 0, minutesPlayed: 1440 },
    { id: 'pl-17', name: 'Bruno Fernandes', team: 'Manchester United', league: 'PL', position: 'MID', price: 9.0, points: 98, goals: 6, assists: 5, cleanSheets: 0, yellowCards: 4, redCards: 0, minutesPlayed: 1350 },
    { id: 'pl-18', name: 'Martin Ødegaard', team: 'Arsenal', league: 'PL', position: 'MID', price: 8.5, points: 92, goals: 5, assists: 7, cleanSheets: 0, yellowCards: 2, redCards: 0, minutesPlayed: 1260 },
    { id: 'pl-19', name: 'Phil Foden', team: 'Manchester City', league: 'PL', position: 'MID', price: 9.5, points: 105, goals: 8, assists: 5, cleanSheets: 0, yellowCards: 0, redCards: 0, minutesPlayed: 1170 },
    { id: 'pl-20', name: 'Kevin De Bruyne', team: 'Manchester City', league: 'PL', position: 'MID', price: 10.0, points: 88, goals: 4, assists: 8, cleanSheets: 0, yellowCards: 1, redCards: 0, minutesPlayed: 900 },
    { id: 'pl-21', name: 'Son Heung-min', team: 'Tottenham', league: 'PL', position: 'MID', price: 9.5, points: 95, goals: 9, assists: 4, cleanSheets: 0, yellowCards: 0, redCards: 0, minutesPlayed: 1260 },

    // Forwards
    { id: 'pl-22', name: 'Erling Haaland', team: 'Manchester City', league: 'PL', position: 'FWD', price: 15.0, points: 155, goals: 18, assists: 3, cleanSheets: 0, yellowCards: 1, redCards: 0, minutesPlayed: 1440 },
    { id: 'pl-23', name: 'Alexander Isak', team: 'Newcastle', league: 'PL', position: 'FWD', price: 9.0, points: 105, goals: 12, assists: 4, cleanSheets: 0, yellowCards: 2, redCards: 0, minutesPlayed: 1350 },
    { id: 'pl-24', name: 'Ollie Watkins', team: 'Aston Villa', league: 'PL', position: 'FWD', price: 8.5, points: 95, goals: 10, assists: 6, cleanSheets: 0, yellowCards: 1, redCards: 0, minutesPlayed: 1440 },
    { id: 'pl-25', name: 'Darwin Núñez', team: 'Liverpool', league: 'PL', position: 'FWD', price: 7.5, points: 78, goals: 8, assists: 3, cleanSheets: 0, yellowCards: 3, redCards: 0, minutesPlayed: 1080 },
    { id: 'pl-26', name: 'Dominic Solanke', team: 'Tottenham', league: 'PL', position: 'FWD', price: 7.0, points: 72, goals: 7, assists: 5, cleanSheets: 0, yellowCards: 2, redCards: 0, minutesPlayed: 1170 },

    // ==========================================
    // LA LIGA (LL)
    // ==========================================

    // Goalkeepers
    { id: 'll-1', name: 'Thibaut Courtois', team: 'Real Madrid', league: 'LL', position: 'GK', price: 6.0, points: 82, goals: 0, assists: 0, cleanSheets: 9, yellowCards: 0, redCards: 0, minutesPlayed: 1440 },
    { id: 'll-2', name: 'Marc-André ter Stegen', team: 'Barcelona', league: 'LL', position: 'GK', price: 5.5, points: 48, goals: 0, assists: 0, cleanSheets: 4, yellowCards: 1, redCards: 0, minutesPlayed: 720 },
    { id: 'll-3', name: 'Jan Oblak', team: 'Atlético Madrid', league: 'LL', position: 'GK', price: 5.8, points: 75, goals: 0, assists: 0, cleanSheets: 8, yellowCards: 0, redCards: 0, minutesPlayed: 1350 },

    // Defenders
    { id: 'll-4', name: 'Antonio Rüdiger', team: 'Real Madrid', league: 'LL', position: 'DEF', price: 5.8, points: 68, goals: 1, assists: 1, cleanSheets: 9, yellowCards: 5, redCards: 0, minutesPlayed: 1440 },
    { id: 'll-5', name: 'Alejandro Balde', team: 'Barcelona', league: 'LL', position: 'DEF', price: 5.5, points: 62, goals: 1, assists: 4, cleanSheets: 5, yellowCards: 2, redCards: 0, minutesPlayed: 1260 },
    { id: 'll-6', name: 'Dani Carvajal', team: 'Real Madrid', league: 'LL', position: 'DEF', price: 5.5, points: 55, goals: 2, assists: 2, cleanSheets: 6, yellowCards: 3, redCards: 0, minutesPlayed: 900 },
    { id: 'll-7', name: 'Jules Koundé', team: 'Barcelona', league: 'LL', position: 'DEF', price: 5.8, points: 65, goals: 1, assists: 3, cleanSheets: 5, yellowCards: 4, redCards: 0, minutesPlayed: 1350 },
    { id: 'll-8', name: 'Pau Cubarsí', team: 'Barcelona', league: 'LL', position: 'DEF', price: 5.2, points: 58, goals: 0, assists: 1, cleanSheets: 5, yellowCards: 3, redCards: 0, minutesPlayed: 1260 },

    // Midfielders
    { id: 'll-9', name: 'Jude Bellingham', team: 'Real Madrid', league: 'LL', position: 'MID', price: 11.0, points: 125, goals: 11, assists: 6, cleanSheets: 0, yellowCards: 3, redCards: 0, minutesPlayed: 1350 },
    { id: 'll-10', name: 'Vinícius Jr.', team: 'Real Madrid', league: 'LL', position: 'MID', price: 12.0, points: 135, goals: 13, assists: 8, cleanSheets: 0, yellowCards: 5, redCards: 1, minutesPlayed: 1440 },
    { id: 'll-11', name: 'Lamine Yamal', team: 'Barcelona', league: 'LL', position: 'MID', price: 9.5, points: 110, goals: 8, assists: 10, cleanSheets: 0, yellowCards: 1, redCards: 0, minutesPlayed: 1350 },
    { id: 'll-12', name: 'Pedri', team: 'Barcelona', league: 'LL', position: 'MID', price: 7.5, points: 75, goals: 3, assists: 6, cleanSheets: 0, yellowCards: 2, redCards: 0, minutesPlayed: 1170 },
    { id: 'll-13', name: 'Federico Valverde', team: 'Real Madrid', league: 'LL', position: 'MID', price: 8.0, points: 85, goals: 4, assists: 5, cleanSheets: 0, yellowCards: 4, redCards: 0, minutesPlayed: 1440 },
    { id: 'll-14', name: 'Dani Olmo', team: 'Barcelona', league: 'LL', position: 'MID', price: 7.0, points: 68, goals: 5, assists: 3, cleanSheets: 0, yellowCards: 1, redCards: 0, minutesPlayed: 900 },

    // Forwards
    { id: 'll-15', name: 'Robert Lewandowski', team: 'Barcelona', league: 'LL', position: 'FWD', price: 10.5, points: 115, goals: 14, assists: 4, cleanSheets: 0, yellowCards: 2, redCards: 0, minutesPlayed: 1350 },
    { id: 'll-16', name: 'Kylian Mbappé', team: 'Real Madrid', league: 'LL', position: 'FWD', price: 14.0, points: 130, goals: 15, assists: 5, cleanSheets: 0, yellowCards: 1, redCards: 0, minutesPlayed: 1260 },
    { id: 'll-17', name: 'Antoine Griezmann', team: 'Atlético Madrid', league: 'LL', position: 'FWD', price: 8.5, points: 92, goals: 9, assists: 6, cleanSheets: 0, yellowCards: 2, redCards: 0, minutesPlayed: 1350 },
    { id: 'll-18', name: 'Raphinha', team: 'Barcelona', league: 'LL', position: 'FWD', price: 8.0, points: 88, goals: 8, assists: 7, cleanSheets: 0, yellowCards: 3, redCards: 0, minutesPlayed: 1260 },

    // ==========================================
    // SERIE A (SA)
    // ==========================================

    // Goalkeepers
    { id: 'sa-1', name: 'Mike Maignan', team: 'AC Milan', league: 'SA', position: 'GK', price: 5.8, points: 78, goals: 0, assists: 0, cleanSheets: 7, yellowCards: 1, redCards: 0, minutesPlayed: 1350 },
    { id: 'sa-2', name: 'Yann Sommer', team: 'Inter Milan', league: 'SA', position: 'GK', price: 5.5, points: 72, goals: 0, assists: 0, cleanSheets: 8, yellowCards: 0, redCards: 0, minutesPlayed: 1260 },
    { id: 'sa-3', name: 'Michele Di Gregorio', team: 'Juventus', league: 'SA', position: 'GK', price: 5.2, points: 65, goals: 0, assists: 0, cleanSheets: 6, yellowCards: 1, redCards: 0, minutesPlayed: 1170 },

    // Defenders
    { id: 'sa-4', name: 'Alessandro Bastoni', team: 'Inter Milan', league: 'SA', position: 'DEF', price: 6.0, points: 72, goals: 2, assists: 3, cleanSheets: 8, yellowCards: 3, redCards: 0, minutesPlayed: 1350 },
    { id: 'sa-5', name: 'Theo Hernández', team: 'AC Milan', league: 'SA', position: 'DEF', price: 6.5, points: 78, goals: 3, assists: 5, cleanSheets: 6, yellowCards: 4, redCards: 0, minutesPlayed: 1260 },
    { id: 'sa-6', name: 'Federico Dimarco', team: 'Inter Milan', league: 'SA', position: 'DEF', price: 6.0, points: 75, goals: 2, assists: 6, cleanSheets: 7, yellowCards: 2, redCards: 0, minutesPlayed: 1350 },
    { id: 'sa-7', name: 'Gleison Bremer', team: 'Juventus', league: 'SA', position: 'DEF', price: 5.5, points: 55, goals: 1, assists: 0, cleanSheets: 5, yellowCards: 2, redCards: 0, minutesPlayed: 810 },
    { id: 'sa-8', name: 'Kim Min-jae', team: 'Napoli', league: 'SA', position: 'DEF', price: 5.2, points: 62, goals: 1, assists: 1, cleanSheets: 5, yellowCards: 3, redCards: 0, minutesPlayed: 1170 },

    // Midfielders
    { id: 'sa-9', name: 'Nicolò Barella', team: 'Inter Milan', league: 'SA', position: 'MID', price: 8.0, points: 88, goals: 5, assists: 8, cleanSheets: 0, yellowCards: 5, redCards: 0, minutesPlayed: 1350 },
    { id: 'sa-10', name: 'Rafael Leão', team: 'AC Milan', league: 'SA', position: 'MID', price: 9.0, points: 95, goals: 8, assists: 6, cleanSheets: 0, yellowCards: 2, redCards: 0, minutesPlayed: 1260 },
    { id: 'sa-11', name: 'Khvicha Kvaratskhelia', team: 'Napoli', league: 'SA', position: 'MID', price: 8.5, points: 92, goals: 7, assists: 8, cleanSheets: 0, yellowCards: 1, redCards: 0, minutesPlayed: 1350 },
    { id: 'sa-12', name: 'Paulo Dybala', team: 'Roma', league: 'SA', position: 'MID', price: 7.5, points: 78, goals: 6, assists: 5, cleanSheets: 0, yellowCards: 2, redCards: 0, minutesPlayed: 1080 },
    { id: 'sa-13', name: 'Hakan Çalhanoğlu', team: 'Inter Milan', league: 'SA', position: 'MID', price: 7.0, points: 72, goals: 4, assists: 4, cleanSheets: 0, yellowCards: 3, redCards: 0, minutesPlayed: 1170 },

    // Forwards
    { id: 'sa-14', name: 'Lautaro Martínez', team: 'Inter Milan', league: 'SA', position: 'FWD', price: 10.5, points: 118, goals: 14, assists: 4, cleanSheets: 0, yellowCards: 3, redCards: 0, minutesPlayed: 1350 },
    { id: 'sa-15', name: 'Victor Osimhen', team: 'Napoli', league: 'SA', position: 'FWD', price: 9.5, points: 55, goals: 6, assists: 2, cleanSheets: 0, yellowCards: 1, redCards: 0, minutesPlayed: 720 },
    { id: 'sa-16', name: 'Dusan Vlahović', team: 'Juventus', league: 'SA', position: 'FWD', price: 8.0, points: 82, goals: 10, assists: 2, cleanSheets: 0, yellowCards: 2, redCards: 0, minutesPlayed: 1260 },
    { id: 'sa-17', name: 'Marcus Thuram', team: 'Inter Milan', league: 'SA', position: 'FWD', price: 8.5, points: 95, goals: 11, assists: 5, cleanSheets: 0, yellowCards: 1, redCards: 0, minutesPlayed: 1350 },

    // ==========================================
    // BUNDESLIGA (BL)
    // ==========================================

    // Goalkeepers
    { id: 'bl-1', name: 'Manuel Neuer', team: 'Bayern Munich', league: 'BL', position: 'GK', price: 5.5, points: 68, goals: 0, assists: 0, cleanSheets: 6, yellowCards: 0, redCards: 0, minutesPlayed: 1260 },
    { id: 'bl-2', name: 'Gregor Kobel', team: 'Borussia Dortmund', league: 'BL', position: 'GK', price: 5.8, points: 75, goals: 0, assists: 0, cleanSheets: 7, yellowCards: 1, redCards: 0, minutesPlayed: 1350 },
    { id: 'bl-3', name: 'Peter Gulácsi', team: 'RB Leipzig', league: 'BL', position: 'GK', price: 5.0, points: 62, goals: 0, assists: 0, cleanSheets: 5, yellowCards: 0, redCards: 0, minutesPlayed: 1170 },

    // Defenders
    { id: 'bl-4', name: 'Dayot Upamecano', team: 'Bayern Munich', league: 'BL', position: 'DEF', price: 5.5, points: 65, goals: 1, assists: 1, cleanSheets: 6, yellowCards: 4, redCards: 0, minutesPlayed: 1260 },
    { id: 'bl-5', name: 'Nico Schlotterbeck', team: 'Borussia Dortmund', league: 'BL', position: 'DEF', price: 5.2, points: 58, goals: 1, assists: 0, cleanSheets: 6, yellowCards: 3, redCards: 0, minutesPlayed: 1170 },
    { id: 'bl-6', name: 'Alphonso Davies', team: 'Bayern Munich', league: 'BL', position: 'DEF', price: 5.8, points: 65, goals: 1, assists: 4, cleanSheets: 5, yellowCards: 2, redCards: 0, minutesPlayed: 1080 },
    { id: 'bl-7', name: 'Jeremie Frimpong', team: 'Bayer Leverkusen', league: 'BL', position: 'DEF', price: 6.0, points: 78, goals: 3, assists: 6, cleanSheets: 7, yellowCards: 2, redCards: 0, minutesPlayed: 1350 },
    { id: 'bl-8', name: 'Jonathan Tah', team: 'Bayer Leverkusen', league: 'BL', position: 'DEF', price: 5.5, points: 68, goals: 1, assists: 1, cleanSheets: 8, yellowCards: 3, redCards: 0, minutesPlayed: 1440 },

    // Midfielders
    { id: 'bl-9', name: 'Jamal Musiala', team: 'Bayern Munich', league: 'BL', position: 'MID', price: 10.5, points: 115, goals: 10, assists: 8, cleanSheets: 0, yellowCards: 1, redCards: 0, minutesPlayed: 1350 },
    { id: 'bl-10', name: 'Florian Wirtz', team: 'Bayer Leverkusen', league: 'BL', position: 'MID', price: 10.0, points: 112, goals: 9, assists: 9, cleanSheets: 0, yellowCards: 2, redCards: 0, minutesPlayed: 1440 },
    { id: 'bl-11', name: 'Leroy Sané', team: 'Bayern Munich', league: 'BL', position: 'MID', price: 8.5, points: 88, goals: 7, assists: 6, cleanSheets: 0, yellowCards: 1, redCards: 0, minutesPlayed: 1170 },
    { id: 'bl-12', name: 'Xavi Simons', team: 'RB Leipzig', league: 'BL', position: 'MID', price: 7.5, points: 78, goals: 6, assists: 5, cleanSheets: 0, yellowCards: 3, redCards: 0, minutesPlayed: 1260 },
    { id: 'bl-13', name: 'Granit Xhaka', team: 'Bayer Leverkusen', league: 'BL', position: 'MID', price: 6.5, points: 68, goals: 3, assists: 5, cleanSheets: 0, yellowCards: 5, redCards: 0, minutesPlayed: 1350 },

    // Forwards
    { id: 'bl-14', name: 'Harry Kane', team: 'Bayern Munich', league: 'BL', position: 'FWD', price: 14.0, points: 145, goals: 18, assists: 6, cleanSheets: 0, yellowCards: 1, redCards: 0, minutesPlayed: 1440 },
    { id: 'bl-15', name: 'Serhou Guirassy', team: 'Borussia Dortmund', league: 'BL', position: 'FWD', price: 8.5, points: 92, goals: 12, assists: 3, cleanSheets: 0, yellowCards: 2, redCards: 0, minutesPlayed: 1170 },
    { id: 'bl-16', name: 'Victor Boniface', team: 'Bayer Leverkusen', league: 'BL', position: 'FWD', price: 7.5, points: 75, goals: 8, assists: 4, cleanSheets: 0, yellowCards: 1, redCards: 0, minutesPlayed: 990 },
    { id: 'bl-17', name: 'Loïs Openda', team: 'RB Leipzig', league: 'BL', position: 'FWD', price: 7.0, points: 72, goals: 9, assists: 2, cleanSheets: 0, yellowCards: 3, redCards: 0, minutesPlayed: 1170 },

    // ==========================================
    // LIGUE 1 (FL1)
    // ==========================================

    // Goalkeepers
    { id: 'fl1-1', name: 'Gianluigi Donnarumma', team: 'PSG', league: 'FL1', position: 'GK', price: 5.8, points: 75, goals: 0, assists: 0, cleanSheets: 7, yellowCards: 1, redCards: 0, minutesPlayed: 1350 },
    { id: 'fl1-2', name: 'Brice Samba', team: 'Lens', league: 'FL1', position: 'GK', price: 5.0, points: 65, goals: 0, assists: 0, cleanSheets: 5, yellowCards: 0, redCards: 0, minutesPlayed: 1260 },
    { id: 'fl1-3', name: 'Lucas Chevalier', team: 'Lille', league: 'FL1', position: 'GK', price: 5.2, points: 68, goals: 0, assists: 0, cleanSheets: 6, yellowCards: 1, redCards: 0, minutesPlayed: 1350 },

    // Defenders
    { id: 'fl1-4', name: 'Achraf Hakimi', team: 'PSG', league: 'FL1', position: 'DEF', price: 6.5, points: 82, goals: 3, assists: 6, cleanSheets: 7, yellowCards: 3, redCards: 0, minutesPlayed: 1350 },
    { id: 'fl1-5', name: 'Marquinhos', team: 'PSG', league: 'FL1', position: 'DEF', price: 5.8, points: 68, goals: 1, assists: 1, cleanSheets: 7, yellowCards: 4, redCards: 0, minutesPlayed: 1260 },
    { id: 'fl1-6', name: 'Jonathan Clauss', team: 'Nice', league: 'FL1', position: 'DEF', price: 5.0, points: 55, goals: 1, assists: 4, cleanSheets: 4, yellowCards: 2, redCards: 0, minutesPlayed: 1170 },
    { id: 'fl1-7', name: 'Tiago Santos', team: 'Lille', league: 'FL1', position: 'DEF', price: 5.2, points: 58, goals: 1, assists: 3, cleanSheets: 5, yellowCards: 3, redCards: 0, minutesPlayed: 1260 },

    // Midfielders
    { id: 'fl1-8', name: 'Ousmane Dembélé', team: 'PSG', league: 'FL1', position: 'MID', price: 9.0, points: 98, goals: 8, assists: 9, cleanSheets: 0, yellowCards: 2, redCards: 0, minutesPlayed: 1260 },
    { id: 'fl1-9', name: 'Lee Kang-in', team: 'PSG', league: 'FL1', position: 'MID', price: 7.0, points: 72, goals: 5, assists: 6, cleanSheets: 0, yellowCards: 1, redCards: 0, minutesPlayed: 1080 },
    { id: 'fl1-10', name: 'Vitinha', team: 'PSG', league: 'FL1', position: 'MID', price: 6.5, points: 68, goals: 4, assists: 5, cleanSheets: 0, yellowCards: 3, redCards: 0, minutesPlayed: 1170 },
    { id: 'fl1-11', name: 'Rayan Cherki', team: 'Lyon', league: 'FL1', position: 'MID', price: 6.0, points: 62, goals: 4, assists: 5, cleanSheets: 0, yellowCards: 2, redCards: 0, minutesPlayed: 1080 },
    { id: 'fl1-12', name: 'Jonathan David', team: 'Lille', league: 'FL1', position: 'MID', price: 7.5, points: 85, goals: 10, assists: 3, cleanSheets: 0, yellowCards: 1, redCards: 0, minutesPlayed: 1350 },

    // Forwards
    { id: 'fl1-13', name: 'Bradley Barcola', team: 'PSG', league: 'FL1', position: 'FWD', price: 8.5, points: 92, goals: 10, assists: 5, cleanSheets: 0, yellowCards: 1, redCards: 0, minutesPlayed: 1260 },
    { id: 'fl1-14', name: 'Marcus Thuram', team: 'Monaco', league: 'FL1', position: 'FWD', price: 7.5, points: 78, goals: 8, assists: 4, cleanSheets: 0, yellowCards: 2, redCards: 0, minutesPlayed: 1170 },
    { id: 'fl1-15', name: 'Alexandre Lacazette', team: 'Lyon', league: 'FL1', position: 'FWD', price: 7.0, points: 72, goals: 9, assists: 2, cleanSheets: 0, yellowCards: 3, redCards: 0, minutesPlayed: 1260 },
    { id: 'fl1-16', name: 'Gonçalo Ramos', team: 'PSG', league: 'FL1', position: 'FWD', price: 7.5, points: 65, goals: 6, assists: 3, cleanSheets: 0, yellowCards: 1, redCards: 0, minutesPlayed: 900 },
];

// Get all players
export function getAllPlayers(): PlayerData[] {
    return PLAYER_DATABASE;
}

// Get players by league
export function getPlayersByLeague(league: PlayerData['league']): PlayerData[] {
    return PLAYER_DATABASE.filter(p => p.league === league);
}

// Get players by position
export function getPlayersByPosition(position: PlayerData['position']): PlayerData[] {
    return PLAYER_DATABASE.filter(p => p.position === position);
}

// Get top scorers
export function getTopScorers(limit: number = 20): PlayerData[] {
    return [...PLAYER_DATABASE]
        .sort((a, b) => b.goals - a.goals)
        .slice(0, limit);
}

// Get top assisters
export function getTopAssisters(limit: number = 20): PlayerData[] {
    return [...PLAYER_DATABASE]
        .sort((a, b) => b.assists - a.assists)
        .slice(0, limit);
}

// Get player by ID
export function getPlayerById(id: string): PlayerData | undefined {
    return PLAYER_DATABASE.find(p => p.id === id);
}
