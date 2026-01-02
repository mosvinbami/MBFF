'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getClubByName } from '@/data/clubs';
import styles from './page.module.css';

interface StatItem {
    value: number;
    name: string;
    element?: number;
}

interface MatchStats {
    goals_scored?: { h: StatItem[]; a: StatItem[] };
    assists?: { h: StatItem[]; a: StatItem[] };
    yellow_cards?: { h: StatItem[]; a: StatItem[] };
    red_cards?: { h: StatItem[]; a: StatItem[] };
    saves?: { h: StatItem[]; a: StatItem[] };
    bonus?: { h: StatItem[]; a: StatItem[] };
}

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
    stats?: MatchStats;
}

export default function MatchDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const matchId = params.matchId as string;

    const [fixture, setFixture] = useState<Fixture | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadMatch() {
            setLoading(true);
            try {
                const response = await fetch('/api/fixtures');
                const data = await response.json();

                if (data.success) {
                    const match = data.fixtures.find((f: Fixture) => f.id === matchId);
                    if (match) {
                        setFixture(match);
                    } else {
                        setError('Match not found');
                    }
                } else {
                    setError('Failed to load match data');
                }
            } catch (err) {
                setError('Failed to load match data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadMatch();
    }, [matchId]);

    const homeClub = fixture ? getClubByName(fixture.homeTeam) : null;
    const awayClub = fixture ? getClubByName(fixture.awayTeam) : null;

    const renderStatSection = (title: string, emoji: string, stats: { h: StatItem[]; a: StatItem[] } | undefined) => {
        if (!stats || (stats.h.length === 0 && stats.a.length === 0)) return null;

        return (
            <div className={styles.statSection}>
                <h3 className={styles.statTitle}>{emoji} {title}</h3>
                <div className={styles.statGrid}>
                    <div className={styles.statColumn}>
                        <span className={styles.statTeamLabel}>{fixture?.homeTeam}</span>
                        {stats.h.length > 0 ? (
                            stats.h.map((stat, i) => (
                                <Link
                                    key={i}
                                    href={`/dashboard/players?search=${encodeURIComponent(stat.name)}`}
                                    className={styles.statPlayer}
                                >
                                    {stat.name} {stat.value > 1 && `(${stat.value})`}
                                </Link>
                            ))
                        ) : (
                            <span className={styles.noStat}>-</span>
                        )}
                    </div>
                    <div className={styles.statColumn}>
                        <span className={styles.statTeamLabel}>{fixture?.awayTeam}</span>
                        {stats.a.length > 0 ? (
                            stats.a.map((stat, i) => (
                                <Link
                                    key={i}
                                    href={`/dashboard/players?search=${encodeURIComponent(stat.name)}`}
                                    className={styles.statPlayer}
                                >
                                    {stat.name} {stat.value > 1 && `(${stat.value})`}
                                </Link>
                            ))
                        ) : (
                            <span className={styles.noStat}>-</span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <span className={styles.spinner}>⚽</span>
                    <p>Loading match details...</p>
                </div>
            </div>
        );
    }

    if (error || !fixture) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <p>⚠️ {error || 'Match not found'}</p>
                    <button onClick={() => router.back()} className={styles.backBtn}>
                        ← Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <button onClick={() => router.back()} className={styles.backBtn}>
                    ← Back
                </button>
                <span className={styles.gwBadge}>Gameweek {fixture.gameweek}</span>
            </div>

            {/* Match Card */}
            <div className={styles.matchCard}>
                <div className={styles.matchDate}>
                    {new Date(fixture.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                    {fixture.status === 'live' && <span className={styles.liveBadge}>🔴 LIVE</span>}
                    {fixture.status === 'completed' && <span className={styles.ftBadge}>FT</span>}
                </div>

                {/* Stadium Info */}
                <div className={styles.venueInfo}>
                    <span className={styles.venueIcon}>🏟️</span>
                    <span className={styles.venueName}>{homeClub?.stadium || 'Stadium TBC'}</span>
                </div>

                <div className={styles.matchScore}>
                    <Link
                        href={homeClub ? `/dashboard/club/${homeClub.id}` : '#'}
                        className={styles.teamBlock}
                    >
                        <span className={styles.homeBadge}>HOME</span>
                        <span className={styles.teamLogo}>{homeClub?.logo || '🏠'}</span>
                        <span className={styles.teamName}>{fixture.homeTeam}</span>
                    </Link>

                    <div className={styles.scoreBlock}>
                        <span className={styles.score}>
                            {fixture.homeScore !== null ? fixture.homeScore : '-'}
                        </span>
                        <span className={styles.scoreDivider}>-</span>
                        <span className={styles.score}>
                            {fixture.awayScore !== null ? fixture.awayScore : '-'}
                        </span>
                    </div>

                    <Link
                        href={awayClub ? `/dashboard/club/${awayClub.id}` : '#'}
                        className={styles.teamBlock}
                    >
                        <span className={styles.awayBadge}>AWAY</span>
                        <span className={styles.teamLogo}>{awayClub?.logo || '✈️'}</span>
                        <span className={styles.teamName}>{fixture.awayTeam}</span>
                    </Link>
                </div>

                <div className={styles.matchTime}>
                    ⏰ {fixture.time}
                </div>
            </div>

            {/* Match Stats */}
            {fixture.stats ? (
                <div className={styles.statsContainer}>
                    <h2 className={styles.statsTitle}>Match Statistics</h2>

                    {renderStatSection('Goals', '⚽', fixture.stats.goals_scored)}
                    {renderStatSection('Assists', '🅰️', fixture.stats.assists)}
                    {renderStatSection('Yellow Cards', '🟨', fixture.stats.yellow_cards)}
                    {renderStatSection('Red Cards', '🟥', fixture.stats.red_cards)}
                    {renderStatSection('Saves', '🧤', fixture.stats.saves)}
                    {renderStatSection('Bonus Points', '⭐', fixture.stats.bonus)}

                    {Object.keys(fixture.stats).length === 0 && (
                        <p className={styles.noStats}>No detailed statistics available for this match.</p>
                    )}
                </div>
            ) : (
                <div className={styles.noStats}>
                    <p>📊 Statistics will be available after the match starts</p>
                </div>
            )}
        </div>
    );
}
