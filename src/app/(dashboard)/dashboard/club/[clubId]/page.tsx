'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getClubById } from '@/data/clubs';
import { usePlayers } from '@/contexts/PlayersContext';
import styles from './page.module.css';

// Types matching the API response
interface Fixture {
    id: string;
    league: string;
    gameweek: number;
    date: string;
    time: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    status: 'completed' | 'live' | 'upcoming';
}

interface Player {
    id: string;
    name: string;
    team: string;
    league: 'PL' | 'LL' | 'SA' | 'BL' | 'FL1';
    position: 'GK' | 'DEF' | 'MID' | 'FWD';
    price: number;
    points: number;
}

type PlayerStatus = 'available' | 'injured' | 'suspended' | 'doubtful' | 'unavailable';

interface PlayerAvailability {
    id: string;
    name: string;
    teamId: number;
    status: PlayerStatus;
    chanceOfPlaying: number | null;
    news: string;
}

const statusLabels: Record<PlayerStatus, string> = {
    available: '✓ Available',
    injured: '🚑 Injured',
    suspended: '🟥 Suspended',
    doubtful: '⚠️ Doubtful',
    unavailable: '⛔ Unavailable',
};

export default function ClubProfilePage() {
    const params = useParams();
    const clubId = params.clubId as string;
    const club = getClubById(clubId);

    // Get all players from context (includes all static players from all leagues)
    const { players: contextPlayers } = usePlayers();

    const [fixtures, setFixtures] = useState<Fixture[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [playerAvailability, setPlayerAvailability] = useState<Map<string, PlayerAvailability>>(new Map());
    const [loadingFixtures, setLoadingFixtures] = useState(true);
    const [loadingPlayers, setLoadingPlayers] = useState(true);

    // Team name abbreviations for matching FPL short names to full club names
    const teamNameMatches = (playerTeam: string, clubName: string): boolean => {
        const pTeam = playerTeam.toLowerCase().trim();
        const cName = clubName.toLowerCase().trim();

        // Direct match
        if (pTeam === cName) return true;

        // Bidirectional abbreviation mappings (API name <-> local club name)
        const teamNameVariants: Record<string, string[]> = {
            // Premier League
            'man city': ['manchester city'],
            'manchester city': ['man city'],
            'man utd': ['manchester united'],
            'manchester united': ['man utd'],
            'spurs': ['tottenham hotspur', 'tottenham'],
            'tottenham hotspur': ['spurs', 'tottenham'],
            'tottenham': ['spurs', 'tottenham hotspur'],
            "nott'm forest": ['nottingham forest'],
            'nottingham forest': ["nott'm forest"],
            'wolves': ['wolverhampton wanderers', 'wolverhampton'],
            'wolverhampton wanderers': ['wolves'],
            'newcastle': ['newcastle united'],
            'newcastle united': ['newcastle'],
            'west ham': ['west ham united'],
            'west ham united': ['west ham'],
            'leicester': ['leicester city'],
            'leicester city': ['leicester'],
            'brighton': ['brighton and hove albion', 'brighton & hove albion'],
            'brighton and hove albion': ['brighton'],
            'ipswich': ['ipswich town'],
            'ipswich town': ['ipswich'],

            // Bundesliga (OpenLigaDB German names <-> English club names)
            'fc bayern münchen': ['bayern munich'],
            'bayern munich': ['fc bayern münchen'],
            'bayer 04 leverkusen': ['bayer leverkusen'],
            'bayer leverkusen': ['bayer 04 leverkusen'],
            'borussia dortmund': ['borussia dortmund'],
            'eintracht frankfurt': ['eintracht frankfurt'],
            'sc freiburg': ['sc freiburg'],
            "borussia mönchengladbach": ["borussia m'gladbach", "borussia mgladbach"],
            "borussia m'gladbach": ["borussia mönchengladbach"],
            '1. fc union berlin': ['union berlin'],
            'union berlin': ['1. fc union berlin'],
            '1. fc heidenheim 1846': ['1. fc heidenheim'],
            '1. fc heidenheim': ['1. fc heidenheim 1846'],
            'fc st. pauli': ['fc st. pauli'],
            '1. fsv mainz 05': ['1. fsv mainz 05'],
            'vfl wolfsburg': ['vfl wolfsburg'],
            'werder bremen': ['werder bremen'],
            'tsg 1899 hoffenheim': ['tsg hoffenheim'],
            'tsg hoffenheim': ['tsg 1899 hoffenheim'],
            'vfb stuttgart': ['vfb stuttgart'],
            'vfl bochum': ['vfl bochum'],
            'fc augsburg': ['fc augsburg'],
            'rb leipzig': ['rb leipzig'],
            'holstein kiel': ['holstein kiel'],
        };

        // Check if either player team or club name has a variant that matches the other
        const pTeamVariants = teamNameVariants[pTeam] || [];
        const cNameVariants = teamNameVariants[cName] || [];

        // Check if player team matches any variant of club name
        if (pTeamVariants.includes(cName)) return true;
        // Check if club name matches any variant of player team  
        if (cNameVariants.includes(pTeam)) return true;

        return false;
    };

    // Fetch fixtures data for all leagues
    useEffect(() => {
        async function loadFixtures() {
            if (!club) {
                setLoadingFixtures(false);
                return;
            }

            try {
                let apiUrl = '';

                if (club.league === 'PL') {
                    // Get all PL fixtures, filter client-side with flexible name matching
                    apiUrl = `/api/fixtures`;
                } else if (club.league === 'BL') {
                    // Get all BL fixtures, filter client-side with flexible name matching
                    apiUrl = `/api/fixtures-bundesliga`;
                } else if (['LL', 'SA', 'FL1'].includes(club.league)) {
                    // Use TheSportsDB for other leagues
                    apiUrl = `/api/fixtures-thesportsdb?league=${club.league}`;
                } else {
                    setLoadingFixtures(false);
                    return;
                }

                const res = await fetch(apiUrl);
                const data = await res.json();

                if (data.success) {
                    // Filter for this specific team using flexible name matching
                    const teamFixtures = data.fixtures.filter((f: Fixture) =>
                        teamNameMatches(f.homeTeam, club.name) ||
                        teamNameMatches(f.awayTeam, club.name)
                    );
                    setFixtures(teamFixtures);
                }
            } catch (error) {
                console.error('Error loading fixtures:', error);
            } finally {
                setLoadingFixtures(false);
            }
        }

        loadFixtures();
    }, [club]);

    // Load players from context (static data for all leagues)
    useEffect(() => {
        if (!club) {
            setLoadingPlayers(false);
            return;
        }

        // Filter players by team name from context with flexible matching
        const teamPlayers = contextPlayers.filter(p =>
            teamNameMatches(p.team, club.name)
        );

        // Map to Player interface
        const mappedPlayers: Player[] = teamPlayers.map(p => ({
            id: p.id,
            name: p.name,
            team: p.team,
            league: p.league,
            position: p.position,
            price: p.price,
            points: p.points,
        }));

        setPlayers(mappedPlayers);
        setLoadingPlayers(false);
    }, [club, contextPlayers]);

    // Fetch real-time player availability for PL clubs
    useEffect(() => {
        async function loadAvailability() {
            if (!club || club.league !== 'PL') return;

            try {
                const res = await fetch(`/api/player-availability?team=${encodeURIComponent(club.name)}`);
                const data = await res.json();

                if (data.success && data.players) {
                    const availMap = new Map<string, PlayerAvailability>();
                    data.players.forEach((p: PlayerAvailability) => {
                        // Map by name (lowercase) for matching
                        availMap.set(p.name.toLowerCase(), p);
                    });
                    setPlayerAvailability(availMap);
                }
            } catch (error) {
                console.error('Error loading availability:', error);
            }
        }

        loadAvailability();
    }, [club]);

    if (!club) {
        return (
            <div className={styles.container}>
                <div className={styles.notFound}>
                    <h2>Club not found</h2>
                    <Link href="/dashboard/fixtures">Back to Fixtures</Link>
                </div>
            </div>
        );
    }

    const sortedFixtures = [...fixtures].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const upcomingFixtures = sortedFixtures
        .filter(f => f.status === 'upcoming' || f.status === 'live')
        .slice(0, 5);

    const pastFixtures = sortedFixtures
        .filter(f => f.status === 'completed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Newest first
        .slice(0, 5);

    // Calculate Form Guide (Latest result first)
    const formGuide = pastFixtures.map(f => {
        const isHome = f.homeTeam === club.name;
        const myScore = (isHome ? f.homeScore : f.awayScore) || 0;
        const oppScore = (isHome ? f.awayScore : f.homeScore) || 0;
        if (myScore > oppScore) return 'W';
        if (myScore < oppScore) return 'L';
        return 'D';
    });

    // Group players by position
    const groupedPlayers = {
        GK: players.filter(p => p.position === 'GK'),
        DEF: players.filter(p => p.position === 'DEF'),
        MID: players.filter(p => p.position === 'MID'),
        FWD: players.filter(p => p.position === 'FWD'),
    };

    const positionLabels: Record<string, string> = {
        GK: 'Goalkeepers',
        DEF: 'Defenders',
        MID: 'Midfielders',
        FWD: 'Forwards'
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getResultClass = (fixture: Fixture) => {
        if (fixture.status !== 'completed') return '';
        const isHome = fixture.homeTeam === club.name;
        const clubScore = isHome ? fixture.homeScore! : fixture.awayScore!;
        const opponentScore = isHome ? fixture.awayScore! : fixture.homeScore!;

        if (clubScore > opponentScore) return styles.win;
        if (clubScore < opponentScore) return styles.loss;
        return styles.draw;
    };

    return (
        <div className={styles.container}>
            {/* Back Button */}
            <Link href="/dashboard/fixtures" className={styles.backBtn}>
                ← Back
            </Link>

            {/* Club Header */}
            <div className={styles.clubHeader}>
                <div className={styles.clubLogo}>
                    {club.logoUrl ? (
                        <Image
                            src={club.logoUrl}
                            alt={club.name}
                            width={64}
                            height={64}
                            className={styles.clubLogoImage}
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <span>{club.logo}</span>
                    )}
                </div>
                <div className={styles.clubDetails}>
                    <h1 className={styles.clubName}>{club.name}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`${styles.leagueBadge} ${styles[club.league.toLowerCase()]}`}>
                            {club.league}
                        </span>
                        {/* Form Guide */}
                        {formGuide.length > 0 && (
                            <div className={styles.formGuide}>
                                {formGuide.map((result, i) => (
                                    <div key={i} className={`${styles.formBadge} ${styles[result]}`}>
                                        {result}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Club Info */}
            <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Stadium</span>
                    <span className={styles.infoValue}>{club.stadium}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Manager</span>
                    <span className={styles.infoValue}>{club.manager}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Founded</span>
                    <span className={styles.infoValue}>{club.founded}</span>
                </div>
            </div>

            {/* Upcoming Fixtures */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>📅 Upcoming Fixtures</h2>
                {loadingFixtures ? (
                    <p className={styles.empty}>Loading fixtures...</p>
                ) : upcomingFixtures.length > 0 ? (
                    <div className={styles.fixturesList}>
                        {upcomingFixtures.map(fixture => {
                            const isHome = fixture.homeTeam === club.name;
                            const opponent = isHome ? fixture.awayTeam : fixture.homeTeam;

                            return (
                                <div key={fixture.id} className={`${styles.fixtureCard} ${fixture.status === 'live' ? styles.live : ''}`}>
                                    <div className={styles.fixtureDate}>
                                        <span className={styles.dateText}>{formatDate(fixture.date)}</span>
                                        <span className={styles.timeText}>
                                            {fixture.status === 'live' ? 'LIVE' : fixture.time}
                                        </span>
                                    </div>
                                    <div className={styles.fixtureMatch}>
                                        <span className={styles.venue}>{isHome ? 'vs' : '@'}</span>
                                        <span className={styles.opponent}>{opponent}</span>
                                    </div>
                                    <span className={styles.gwBadge}>GW{fixture.gameweek}</span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className={styles.empty}>No upcoming fixtures</p>
                )}
            </section>

            {/* Recent Results */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>✅ Recent Results</h2>
                {loadingFixtures ? (
                    <p className={styles.empty}>Loading results...</p>
                ) : pastFixtures.length > 0 ? (
                    <div className={styles.resultsList}>
                        {pastFixtures.map(fixture => {
                            const isHome = fixture.homeTeam === club.name;
                            const opponent = isHome ? fixture.awayTeam : fixture.homeTeam;
                            const clubScore = isHome ? fixture.homeScore : fixture.awayScore;
                            const opponentScore = isHome ? fixture.awayScore : fixture.homeScore;

                            return (
                                <div key={fixture.id} className={`${styles.resultCard} ${getResultClass(fixture)}`}>
                                    <div className={styles.resultDate}>
                                        <span>{formatDate(fixture.date)}</span>
                                    </div>
                                    <div className={styles.resultMatch}>
                                        <span className={styles.venue}>{isHome ? 'vs' : '@'}</span>
                                        <span className={styles.opponent}>{opponent}</span>
                                    </div>
                                    <div className={styles.resultScore}>
                                        <span>{clubScore}</span>
                                        <span className={styles.scoreDivider}>-</span>
                                        <span>{opponentScore}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className={styles.empty}>No recent results</p>
                )}
            </section>

            {/* Squad */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>👥 Squad</h2>
                {loadingPlayers ? (
                    <p className={styles.empty}>Loading squad...</p>
                ) : players.length > 0 ? (
                    <div className={styles.squadList}>
                        {(['GK', 'DEF', 'MID', 'FWD'] as const).map(pos => {
                            const group = groupedPlayers[pos];
                            if (group.length === 0) return null;

                            return (
                                <div key={pos} className={styles.positionGroup}>
                                    <h3 className={styles.groupTitle}>{positionLabels[pos]}</h3>
                                    <div className={styles.playerGrid}>
                                        {group.map(player => {
                                            // Look up real availability status by player name
                                            const playerNameKey = player.name.split(' ').pop()?.toLowerCase() || player.name.toLowerCase();
                                            const availability = playerAvailability.get(playerNameKey);
                                            const status: PlayerStatus = availability?.status || 'available';
                                            const news = availability?.news || '';

                                            return (
                                                <Link key={player.id} href={`/dashboard/player/${player.id}`} className={styles.playerCard}>
                                                    <div className={styles.playerPhoto}>
                                                        <span>{player.name[0]}</span>
                                                    </div>
                                                    <div className={styles.playerInfo}>
                                                        <span className={styles.playerName}>{player.name}</span>
                                                        <div className={styles.playerMeta}>
                                                            <span className={`${styles.positionBadge} ${styles[player.position.toLowerCase()]}`}>
                                                                {player.position}
                                                            </span>
                                                            <span className={`${styles.statusBadge} ${styles[status]}`} title={news}>
                                                                <span className={styles.statusDot}></span>
                                                                {statusLabels[status]}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className={styles.playerStats}>
                                                        <span className={styles.playerPoints}>{player.points} pts</span>
                                                        <span className={styles.playerPrice}>€{player.price}M</span>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className={styles.empty}>No players found</p>
                )}
            </section>
        </div>
    );
}
