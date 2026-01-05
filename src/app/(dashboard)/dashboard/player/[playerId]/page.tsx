'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PlayerCardPhoto } from '@/components/PlayerCardPhoto';
import { getClubByName } from '@/data/clubs';
import { getFixturesByTeam, Fixture } from '@/data/fixtures';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { usePlayers } from '@/contexts/PlayersContext';
import styles from './page.module.css';

interface Player {
    id: string;
    name: string;
    team: string;
    position: string;
    league: string;
    price: number;
    points: number;
    goals?: number;
    assists?: number;
    cleanSheets?: number;
    yellowCards?: number;
    redCards?: number;
    minutesPlayed?: number;
    photo?: string;
    xG?: number;
    xA?: number;
    status?: string;
}

interface ExtendedFixture extends Fixture {
    stats?: Record<string, { h: { value: number; element: number }[]; a: { value: number; element: number }[] }>;
}

const getStatusDetails = (status: string = 'a') => {
    switch (status) {
        case 'a': return { text: 'Available', color: '#22c55e' }; // Green
        case 'd': return { text: 'Doubtful', color: '#eab308' }; // Yellow
        case 'i': return { text: 'Injured', color: '#ef4444' }; // Red
        case 's': return { text: 'Suspended', color: '#ef4444' }; // Red
        default: return { text: 'Unavailable', color: '#94a3b8' }; // Gray
    }
};

export default function PlayerProfilePage() {
    const params = useParams();
    const router = useRouter();
    const playerId = params.playerId as string;

    // Get players from context (includes static players from all leagues)
    const { players: contextPlayers } = usePlayers();

    const [player, setPlayer] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'matches' | 'stats' | 'history'>('matches');
    const [fixtures, setFixtures] = useState<ExtendedFixture[]>([]);
    // photoError state removed - PlayerCardPhoto handles fallback
    const { isInWatchlist, toggleWatchlist } = useWatchlist();

    useEffect(() => {
        async function loadPlayer() {
            setLoading(true);
            try {
                let foundPlayer: Player | undefined;

                // FIRST check context players - they have enriched data including photos
                const contextPlayer = contextPlayers.find(p => p.id === playerId);
                if (contextPlayer) {
                    foundPlayer = {
                        id: contextPlayer.id,
                        name: contextPlayer.name,
                        team: contextPlayer.team,
                        position: contextPlayer.position,
                        league: contextPlayer.league,
                        price: contextPlayer.price,
                        points: contextPlayer.points,
                        goals: contextPlayer.goals,
                        assists: contextPlayer.assists,
                        cleanSheets: contextPlayer.cleanSheets,
                        yellowCards: contextPlayer.yellowCards,
                        redCards: contextPlayer.redCards,
                        minutesPlayed: contextPlayer.minutesPlayed,
                        xG: contextPlayer.xG,
                        xA: contextPlayer.xA,
                        photo: contextPlayer.photo, // Photo from PlayersContext (Transfermarkt)
                        status: 'a',
                    };
                }

                // If not in context, try the API (for players not yet in context)
                if (!foundPlayer) {
                    const response = await fetch(`/api/players?limit=1000`);
                    const data = await response.json();
                    if (data.success) {
                        foundPlayer = data.players.find((p: Player) => p.id === playerId);
                    }
                }

                if (foundPlayer) {
                    setPlayer(foundPlayer);

                    // Load fixtures based on league
                    if (foundPlayer.league === 'PL') {
                        // Fetch real fixtures for PL from FPL API
                        try {
                            const fRes = await fetch(`/api/fixtures?team=${foundPlayer.team}`);
                            const fData = await fRes.json();
                            if (fData.success) {
                                setFixtures(fData.fixtures);
                            } else {
                                setFixtures(getFixturesByTeam(foundPlayer.team));
                            }
                        } catch (e) {
                            console.error(e);
                            setFixtures(getFixturesByTeam(foundPlayer.team));
                        }
                    } else if (foundPlayer.league === 'BL') {
                        // Fetch Bundesliga fixtures
                        try {
                            const fRes = await fetch(`/api/fixtures-bundesliga?team=${encodeURIComponent(foundPlayer.team)}`);
                            const fData = await fRes.json();
                            if (fData.success && fData.fixtures) {
                                const teamFixtures = fData.fixtures.filter((f: Fixture) =>
                                    f.homeTeam.toLowerCase().includes(foundPlayer.team.toLowerCase().split(' ')[0]) ||
                                    f.awayTeam.toLowerCase().includes(foundPlayer.team.toLowerCase().split(' ')[0])
                                );
                                setFixtures(teamFixtures);
                            } else {
                                setFixtures(getFixturesByTeam(foundPlayer.team));
                            }
                        } catch (e) {
                            console.error(e);
                            setFixtures(getFixturesByTeam(foundPlayer.team));
                        }
                    } else if (['LL', 'SA', 'FL1'].includes(foundPlayer.league)) {
                        // Fetch La Liga, Serie A, Ligue 1 fixtures via TheSportsDB
                        try {
                            const fRes = await fetch(`/api/fixtures-thesportsdb?league=${foundPlayer.league}`);
                            const fData = await fRes.json();
                            if (fData.success && fData.fixtures) {
                                const teamName = foundPlayer.team.toLowerCase();
                                const teamFixtures = fData.fixtures.filter((f: Fixture) =>
                                    f.homeTeam.toLowerCase().includes(teamName.split(' ')[0]) ||
                                    f.awayTeam.toLowerCase().includes(teamName.split(' ')[0])
                                );
                                setFixtures(teamFixtures);
                            } else {
                                setFixtures(getFixturesByTeam(foundPlayer.team));
                            }
                        } catch (e) {
                            console.error(e);
                            setFixtures(getFixturesByTeam(foundPlayer.team));
                        }
                    } else {
                        setFixtures(getFixturesByTeam(foundPlayer.team));
                    }
                } else {
                    setError('Player not found');
                }
            } catch (err) {
                setError('Failed to load player data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadPlayer();
    }, [playerId, contextPlayers]);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <span className={styles.spinner}>⚽</span>
                    <p>Loading player...</p>
                </div>
            </div>
        );
    }

    if (error || !player) {
        return (
            <div className={styles.container}>
                <div className={styles.notFound}>
                    <h2>Player not found</h2>
                    <Link href="/dashboard/players">Back to Players</Link>
                </div>
            </div>
        );
    }

    const club = getClubByName(player.team);

    // Derived Data
    const pastMatches = fixtures
        .filter(f => f.status === 'completed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3); // Last 3

    const upcomingMatches = fixtures
        .filter(f => f.status === 'upcoming' || f.status === 'live')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3); // Next 3

    const matchesPlayed = Math.round((player.minutesPlayed || 0) / 90) || 19; // simplified
    const ptsPerMatch = (player.points / matchesPlayed).toFixed(1);

    // Calculate Form (Last 3 matches points avg - simplified)
    const formValue = (player.points / 20).toFixed(1);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getDifficultyClass = () => {
        // Random difficulty for demo
        const diff = Math.floor(Math.random() * 5) + 1;
        return styles[`diff${diff}`];
    };

    return (
        <div className={styles.container}>
            {/* Header Area */}
            <div className={styles.playerHeader}>
                <button onClick={() => router.back()} className={styles.backBtn}>
                    ←
                </button>
                <div className={styles.playerPhoto}>
                    <PlayerCardPhoto
                        playerName={player.name}
                        existingPhoto={player.photo}
                        className={styles.playerImage}
                    />
                </div>
                <div className={styles.playerDetails}>
                    <span className={styles.playerRole}>{player.position}</span>
                    <h1 className={styles.playerName}>
                        <span className={styles.firstName}>{player.name.split(' ')[0]}</span>
                        {player.name.split(' ').slice(1).join(' ')}
                    </h1>
                    {club ? (
                        <Link href={`/dashboard/club/${club.id}`} className={styles.playerTeamLink}>
                            {club.name}
                        </Link>
                    ) : (
                        <span className={styles.playerTeam}>{player.team}</span>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionsGrid}>
                <button
                    className={styles.actionButton}
                    onClick={() => player && toggleWatchlist(player.id)}
                >
                    <span>{player && isInWatchlist(player.id) ? '⭐ Remove' : '☆ Watchlist'}</span>
                </button>
                <div className={`${styles.actionButton} ${styles.statusButton}`}>
                    <span
                        className={styles.statusDot}
                        style={{ backgroundColor: getStatusDetails(player.status).color }}
                    />
                    <span>Status: {getStatusDetails(player.status).text}</span>
                </div>
            </div>

            {/* Stats Row */}
            <div className={styles.statsRow}>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Price</span>
                    <span className={styles.statValue}>€{player.price}m</span>
                    <span className={styles.statRank}>26 of 257</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Pts / Match</span>
                    <span className={styles.statValue}>{ptsPerMatch}</span>
                    <span className={styles.statRank}>4 of 257</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Form</span>
                    <span className={styles.statValue}>{formValue}</span>
                    <span className={styles.statRank}>14 of 257</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Selected</span>
                    <span className={styles.statValue}>{Math.floor(Math.random() * 40 + 10)}%</span>
                    <span className={styles.statRank}>1 of 257</span>
                </div>
            </div>

            {/* Form & Fixtures Split */}
            <div className={styles.scrollingSection}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Recent Form</h3>
                </div>
                <div className={styles.cardsRow}>
                    {pastMatches.length > 0 ? pastMatches.map(f => {
                        const isHome = f.homeTeam === player.team;
                        const opponent = isHome ? f.awayTeam : f.homeTeam;
                        const teamScore = isHome ? f.homeScore : f.awayScore;
                        const oppScore = isHome ? f.awayScore : f.homeScore;
                        // Mock Points based on result
                        let ptsText = '2 pts'; // default base
                        if (f.stats) {
                            const pid = parseInt(player.id.replace('fpl-', ''));
                            const getVal = (k: string) => {
                                const arr = [...(f.stats?.[k]?.h || []), ...(f.stats?.[k]?.a || [])];
                                return arr.find(s => s.element === pid)?.value || 0;
                            };
                            const goals = getVal('goals_scored');
                            const assists = getVal('assists');
                            const bps = getVal('bps');
                            if (goals > 0 || assists > 0) ptsText = `${goals}G ${assists}A`;
                            else if (bps > 0) ptsText = `${bps} bps`;
                        } else {
                            // Fallback Mock
                            if ((teamScore || 0) > (oppScore || 0)) ptsText = '6 pts';
                            else if (teamScore === oppScore) ptsText = '2 pts';
                            else ptsText = '1 pt';
                        }

                        return (
                            <div key={f.id} className={styles.miniCard}>
                                <span className={styles.miniCardGw}>GW{f.gameweek}</span>
                                <div className={styles.miniCardLogo}>
                                    {isHome ? '🏠' : '🚌'}
                                </div>
                                <span className={styles.miniCardDetail}>{opponent.substring(0, 3).toUpperCase()}</span>
                                <div className={styles.miniCardSub}>
                                    <span className={styles.miniCardPts}>
                                        {ptsText}
                                    </span>
                                </div>
                            </div>
                        );
                    }) : <p className={styles.empty}>No matches</p>}
                </div>
            </div>

            <div className={styles.scrollingSection}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Upcoming Fixtures</h3>
                </div>
                <div className={styles.cardsRow}>
                    {upcomingMatches.length > 0 ? upcomingMatches.map(f => {
                        const isHome = f.homeTeam === player.team;
                        const opponent = isHome ? f.awayTeam : f.homeTeam;
                        const diffClass = getDifficultyClass();

                        return (
                            <div key={f.id} className={styles.miniCard}>
                                <span className={styles.miniCardGw}>GW{f.gameweek}</span>
                                <div className={styles.miniCardLogo}>
                                    {isHome ? '🏠' : '🚌'}
                                </div>
                                <span className={styles.miniCardDetail}>{opponent.substring(0, 3).toUpperCase()}</span>
                                <div className={`${styles.diffBadge} ${diffClass}`}>
                                    {Math.floor(Math.random() * 5) + 1}
                                </div>
                            </div>
                        );
                    }) : <p className={styles.empty}>No fixtures</p>}
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabsContainer}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'matches' ? styles.active : ''}`}
                    onClick={() => setActiveTab('matches')}
                >
                    Matches
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'stats' ? styles.active : ''}`}
                    onClick={() => setActiveTab('stats')}
                >
                    Stats
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'history' ? styles.active : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    History
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'matches' && (
                <div className={styles.matchList}>
                    <div className={styles.listHeader}>
                        <span>GW</span>
                        <span>Opponent</span>
                        <span>Result</span>
                        <span>Points</span>
                        <span></span>
                    </div>
                    {pastMatches.map(f => {
                        const isHome = f.homeTeam === player.team;
                        const opponent = isHome ? f.awayTeam : f.homeTeam;
                        const teamScore = isHome ? f.homeScore : f.awayScore;
                        const oppScore = isHome ? f.awayScore : f.homeScore;

                        return (
                            <Link key={f.id} href={`/dashboard/match/${f.id}`} className={styles.matchRow}>
                                <span>{f.gameweek}</span>
                                <div className={styles.matchOpponent}>
                                    {isHome ? 'vs' : '@'} {opponent}
                                </div>
                                <span className={styles.matchResult}>{teamScore} - {oppScore}</span>
                                <span className={styles.matchPts}>
                                    {f.stats ? (() => {
                                        const pid = parseInt(player.id.replace('fpl-', ''));
                                        const getVal = (k: string) => {
                                            const arr = [...(f.stats?.[k]?.h || []), ...(f.stats?.[k]?.a || [])];
                                            return arr.find(s => s.element === pid)?.value || 0;
                                        };
                                        const goals = getVal('goals_scored');
                                        const assists = getVal('assists');
                                        // Simple totals if > 0
                                        if (goals > 0 || assists > 0) return `${goals}G ${assists}A`;
                                        // Else return points if we had them or BPS
                                        const bps = getVal('bps');
                                        return bps > 0 ? `${bps} bps` : '-';
                                    })() : '-'}
                                </span>
                                <span>›</span>
                            </Link>
                        );
                    })}
                </div>
            )}

            {activeTab === 'stats' && (
                <div className={styles.infoGrid}>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Goals</span>
                        <span className={styles.infoValue}>{player.goals || 0}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Assists</span>
                        <span className={styles.infoValue}>{player.assists || 0}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Clean Sheets</span>
                        <span className={styles.infoValue}>{player.cleanSheets || 0}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Minutes Played</span>
                        <span className={styles.infoValue}>{player.minutesPlayed || 0}</span>
                    </div>
                    {player.xG !== undefined && (
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Expected Goals (xG)</span>
                            <span className={styles.infoValue}>{player.xG}</span>
                        </div>
                    )}
                    {player.xA !== undefined && (
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Expected Assists (xA)</span>
                            <span className={styles.infoValue}>{player.xA}</span>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div className={styles.infoGrid}>
                    <div className={styles.infoRow}>
                        <span className={styles.infoValue} style={{ width: '100%', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                            Career history coming soon via API integration.
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}


