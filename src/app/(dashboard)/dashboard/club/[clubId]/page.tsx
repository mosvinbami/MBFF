'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getClubById } from '@/data/clubs';
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

export default function ClubProfilePage() {
    const params = useParams();
    const clubId = params.clubId as string;
    const club = getClubById(clubId);

    const [fixtures, setFixtures] = useState<Fixture[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [loadingFixtures, setLoadingFixtures] = useState(true);
    const [loadingPlayers, setLoadingPlayers] = useState(true);

    // Fetch fixtures data (Premier League only)
    useEffect(() => {
        async function loadFixtures() {
            if (!club || club.league !== 'PL') {
                setLoadingFixtures(false);
                return;
            }

            try {
                const res = await fetch(`/api/fixtures?team=${encodeURIComponent(club.name)}`);
                const data = await res.json();

                if (data.success) {
                    setFixtures(data.fixtures);
                }
            } catch (error) {
                console.error('Error loading fixtures:', error);
            } finally {
                setLoadingFixtures(false);
            }
        }

        loadFixtures();
    }, [club]);

    // Fetch players data
    useEffect(() => {
        async function loadPlayers() {
            if (!club) return;

            try {
                // Use API route to get full squad info merging FPL + curated
                const res = await fetch(`/api/players?team=${encodeURIComponent(club.name)}&source=auto&limit=50`);
                const data = await res.json();

                if (data.success) {
                    setPlayers(data.players);
                }
            } catch (error) {
                console.error('Error loading players:', error);
            } finally {
                setLoadingPlayers(false);
            }
        }

        loadPlayers();
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
                <div className={styles.clubLogo}>{club.logo}</div>
                <div className={styles.clubDetails}>
                    <h1 className={styles.clubName}>{club.name}</h1>
                    <span className={`${styles.leagueBadge} ${styles[club.league.toLowerCase()]}`}>
                        {club.league}
                    </span>
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
                ) : club.league !== 'PL' ? (
                    <p className={styles.empty}>Live fixtures available for PL clubs only</p>
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
                ) : club.league !== 'PL' ? (
                    <p className={styles.empty}>Live results available for PL clubs only</p>
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
                    <div className={styles.playerGrid}>
                        {players.map(player => (
                            <Link
                                key={player.id}
                                href={`/dashboard/player/${player.id}`}
                                className={styles.playerCard}
                            >
                                <div className={styles.playerPhoto}>
                                    <span>{player.name[0]}</span>
                                </div>
                                <div className={styles.playerInfo}>
                                    <span className={styles.playerName}>{player.name}</span>
                                    <span className={`${styles.positionBadge} ${styles[player.position.toLowerCase()]}`}>
                                        {player.position}
                                    </span>
                                </div>
                                <div className={styles.playerStats}>
                                    <span className={styles.playerPoints}>{player.points} pts</span>
                                    <span className={styles.playerPrice}>€{player.price}M</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className={styles.empty}>No players found</p>
                )}
            </section>
        </div>
    );
}
