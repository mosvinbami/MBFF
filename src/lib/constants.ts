// ============================================
// MBFF Design Constants
// League colors, gradients, and theme tokens
// ============================================

export const LEAGUE_COLORS = {
    // Premier League - Purple
    PL: {
        primary: '#3D195B',
        secondary: '#00FF85',
        gradient: 'linear-gradient(135deg, #3D195B 0%, #38003C 100%)',
    },
    // La Liga - Orange/Red
    LL: {
        primary: '#FF6B35',
        secondary: '#004996',
        gradient: 'linear-gradient(135deg, #FF6B35 0%, #E8472F 100%)',
    },
    // Serie A - Blue
    SA: {
        primary: '#0066B2',
        secondary: '#024494',
        gradient: 'linear-gradient(135deg, #0066B2 0%, #003D6B 100%)',
    },
    // Bundesliga - Red
    BL: {
        primary: '#D20515',
        secondary: '#000000',
        gradient: 'linear-gradient(135deg, #D20515 0%, #8B0000 100%)',
    },
    // Ligue 1 - Navy/Gold
    FL1: {
        primary: '#0A2540',
        secondary: '#DAA520',
        gradient: 'linear-gradient(135deg, #0A2540 0%, #1A3A5C 100%)',
    },
} as const;

export const POSITION_COLORS = {
    GK: {
        bg: '#F59E0B',
        text: '#000000',
    },
    DEF: {
        bg: '#10B981',
        text: '#FFFFFF',
    },
    MID: {
        bg: '#3B82F6',
        text: '#FFFFFF',
    },
    FWD: {
        bg: '#EF4444',
        text: '#FFFFFF',
    },
} as const;

export const FORMATIONS = [
    { value: '3-4-3', label: '3-4-3', positions: { DEF: 3, MID: 4, FWD: 3 } },
    { value: '3-5-2', label: '3-5-2', positions: { DEF: 3, MID: 5, FWD: 2 } },
    { value: '4-3-3', label: '4-3-3', positions: { DEF: 4, MID: 3, FWD: 3 } },
    { value: '4-4-2', label: '4-4-2', positions: { DEF: 4, MID: 4, FWD: 2 } },
    { value: '4-5-1', label: '4-5-1', positions: { DEF: 4, MID: 5, FWD: 1 } },
    { value: '5-3-2', label: '5-3-2', positions: { DEF: 5, MID: 3, FWD: 2 } },
    { value: '5-4-1', label: '5-4-1', positions: { DEF: 5, MID: 4, FWD: 1 } },
] as const;

export const SQUAD_RULES = {
    TOTAL_PLAYERS: 15,
    MAX_FROM_SAME_TEAM: 3,
    STARTING_BUDGET: 100.0,
    MIN_PRICE: 4.0,
    MAX_PRICE: 15.0,
    POSITIONS_REQUIRED: {
        GK: 2,
        DEF: 5,
        MID: 5,
        FWD: 3,
    },
} as const;

export const GAMEWEEK_RULES = {
    // UTC times
    WEEK_START_DAY: 0, // Sunday
    WEEK_END_DAY: 6,   // Saturday
    LINEUP_DEADLINE_HOUR: 12, // 12:00 UTC on Sunday
} as const;
