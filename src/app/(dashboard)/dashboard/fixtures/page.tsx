'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CLUBS, getClubByName } from '@/data/clubs';
import styles from './page.module.css';
import { MatchStats } from './MatchStatsModal';

// All competitions (leagues + cups) in one type
type CompetitionCode = 'PL' | 'LL' | 'SA' | 'BL' | 'FL1' | 'UCL' | 'UEL' | 'FACUP' | 'EFLCUP' | 'COPADEL' | 'COPPA' | 'DFBPOKAL' | 'COUPEFR';
type ViewMode = 'fixtures' | 'clubs';
type FilterType = 'live' | 'results' | 'upcoming';

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

export default function FixturesPage() {
    const [selectedCompetition, setSelectedCompetition] = useState<CompetitionCode>('PL');
    const [viewMode, setViewMode] = useState<ViewMode>('fixtures');
    const [activeFilter, setActiveFilter] = useState<FilterType>('results');
    const [fixtures, setFixtures] = useState<Fixture[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [liveCount, setLiveCount] = useState(0);

    // Competition names for display
    const competitionNames: Record<string, string> = {
        'PL': 'Premier League',
        'LL': 'La Liga',
        'SA': 'Serie A',
        'BL': 'Bundesliga',
        'FL1': 'Ligue 1',
        'UCL': 'Champions League',
        'UEL': 'Europa League',
        'FACUP': 'FA Cup',
        'EFLCUP': 'EFL Cup',
        'COPADEL': 'Copa del Rey',
        'COPPA': 'Coppa Italia',
        'DFBPOKAL': 'DFB Pokal',
        'COUPEFR': 'Coupe de France',
    };

    // Helper to check if competition is a cup
    const isCup = (comp: CompetitionCode) => ['UCL', 'UEL', 'FACUP', 'EFLCUP', 'COPADEL', 'COPPA', 'DFBPOKAL', 'COUPEFR'].includes(comp);
    const isLeague = (comp: CompetitionCode) => ['PL', 'LL', 'SA', 'BL', 'FL1'].includes(comp);

    // Fetch fixtures on mount
    useEffect(() => {
        async function loadFixtures() {
            // Skip fetch if in clubs view
            if (viewMode === 'clubs') {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Use our new Python-powered Unified API for ALL leagues
                // This ensures real-time FotMob data for PL, La Liga, Bundesliga, Serie A, Ligue 1
                const response = await fetch(`/api/fixtures-unified?league=${selectedCompetition}`);
                const data = await response.json();

                if (data.success) {
                    setFixtures(data.fixtures);
                    const live = data.fixtures?.filter((f: Fixture) => f.status === 'live').length || 0;
                    setLiveCount(live);

                    // Auto-select filter to show most relevant matches
                    if (live > 0) {
                        setActiveFilter('live');
                    } else {
                        // If we have upcoming games in next 7 days, show them. Else fallback to results.
                        // This ensures user sees "What's next" primarily.
                        const hasUpcoming = data.fixtures?.some((f: Fixture) => f.status === 'upcoming');
                        if (hasUpcoming) {
                            setActiveFilter('upcoming');
                        } else {
                            setActiveFilter('results');
                        }
                    }
                } else {
                    setError(data.error || 'Failed to load fixtures');
                }
            } catch (err) {
                setError('Failed to load fixtures');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadFixtures();

        // Refresh every 60 seconds for live updates
        const interval = setInterval(loadFixtures, 60000);
        return () => clearInterval(interval);
    }, [selectedCompetition, viewMode]);

    // Filter fixtures based on active filter (single selection)
    const filteredFixtures = fixtures
        .filter(f => {
            if (activeFilter === 'live') return f.status === 'live';
            if (activeFilter === 'results') return f.status === 'completed';
            if (activeFilter === 'upcoming') return f.status === 'upcoming';
            return true;
        })
        .sort((a, b) => {
            // Results: most recent first (descending)
            // Upcoming: soonest first (ascending)
            if (activeFilter === 'upcoming') {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            }
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

    // Get clubs based on selected league (only for league competitions)
    const selectedLeagueForClubs = isLeague(selectedCompetition) ? selectedCompetition : 'PL';
    const filteredClubs = CLUBS.filter(c => c.league === selectedLeagueForClubs);

    // Group fixtures by date
    const fixturesByDate = filteredFixtures.reduce((acc, fixture) => {
        const date = fixture.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(fixture);
        return acc;
    }, {} as Record<string, Fixture[]>);

    // Sort date keys: upcoming = ascending, results = descending
    const sortedDates = Object.keys(fixturesByDate).sort((a, b) => {
        if (activeFilter === 'upcoming') {
            return new Date(a).getTime() - new Date(b).getTime();
        }
        return new Date(b).getTime() - new Date(a).getTime();
    });

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return '🔴 Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>Fixtures & Clubs</h1>
                {liveCount > 0 && (
                    <span className={styles.liveBadge}>🔴 {liveCount} LIVE</span>
                )}
            </div>

            {/* View Toggle - Simplified to just Fixtures and Clubs */}
            <div className={styles.viewToggle}>
                <button
                    className={`${styles.toggleBtn} ${viewMode === 'fixtures' ? styles.active : ''}`}
                    onClick={() => setViewMode('fixtures')}
                >
                    📅 Fixtures
                </button>
                <button
                    className={`${styles.toggleBtn} ${viewMode === 'clubs' ? styles.active : ''}`}
                    onClick={() => setViewMode('clubs')}
                >
                    🏟️ Clubs ({CLUBS.length})
                </button>
            </div>

            {/* Combined Competition Selector - Leagues + Cups */}
            {viewMode === 'fixtures' && (
                <>
                    {/* Leagues Row */}
                    <div className={styles.leagueFilter}>
                        {(['PL', 'LL', 'SA', 'BL', 'FL1'] as CompetitionCode[]).map(comp => (
                            <button
                                key={comp}
                                className={`${styles.leagueBtn} ${selectedCompetition === comp ? styles.active : ''}`}
                                onClick={() => setSelectedCompetition(comp)}
                            >
                                {comp}
                            </button>
                        ))}
                    </div>
                    {/* Cups Row */}
                    <div className={styles.leagueFilter}>
                        {(['UCL', 'UEL', 'FACUP', 'EFLCUP', 'COPADEL', 'COPPA', 'DFBPOKAL', 'COUPEFR'] as CompetitionCode[]).map(comp => (
                            <button
                                key={comp}
                                className={`${styles.leagueBtn} ${selectedCompetition === comp ? styles.active : ''}`}
                                onClick={() => setSelectedCompetition(comp)}
                            >
                                {comp === 'UCL' ? '🏆' : comp === 'UEL' ? '🥈' : '🏅'} {competitionNames[comp]?.split(' ')[0] || comp}
                            </button>
                        ))}
                    </div>
                </>
            )}

            {/* Clubs view - show league filter */}
            {viewMode === 'clubs' && (
                <div className={styles.leagueFilter}>
                    {(['PL', 'LL', 'SA', 'BL', 'FL1'] as CompetitionCode[]).map(comp => (
                        <button
                            key={comp}
                            className={`${styles.leagueBtn} ${selectedCompetition === comp ? styles.active : ''}`}
                            onClick={() => setSelectedCompetition(comp)}
                        >
                            {comp}
                            <span className={styles.clubCount}>
                                {CLUBS.filter(c => c.league === comp).length}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Fixtures View */}
            {viewMode === 'fixtures' && (
                <>
                    {/* Status Filter - Single Selection */}
                    <div className={styles.statusFilter}>
                        <button
                            className={`${styles.statusBtn} ${styles.liveBtn} ${activeFilter === 'live' ? styles.active : ''}`}
                            onClick={() => setActiveFilter('live')}
                        >
                            🔴 Live {liveCount > 0 && `(${liveCount})`}
                        </button>
                        <button
                            className={`${styles.statusBtn} ${activeFilter === 'results' ? styles.active : ''}`}
                            onClick={() => setActiveFilter('results')}
                        >
                            ✅ Results
                        </button>
                        <button
                            className={`${styles.statusBtn} ${activeFilter === 'upcoming' ? styles.active : ''}`}
                            onClick={() => setActiveFilter('upcoming')}
                        >
                            📆 Upcoming
                        </button>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className={styles.loading}>
                            <span className={styles.spinner}>⚽</span>
                            <p>Loading fixtures...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className={styles.error}>
                            <p>⚠️ {error}</p>
                        </div>
                    )}

                    {/* No Data message removed - all leagues now supported */}

                    {/* Fixtures List (for all competitions) */}
                    {!loading && !error && (
                        <div className={styles.fixturesList}>
                            {sortedDates.map(date => (
                                <div key={date} className={styles.dateGroup}>
                                    <div className={styles.dateHeader}>
                                        <span className={styles.dateText}>{formatDate(date)}</span>
                                        <span className={styles.dateCount}>{fixturesByDate[date].length} matches</span>
                                    </div>

                                    {fixturesByDate[date].map(fixture => {
                                        const homeClub = getClubByName(fixture.homeTeam);
                                        const awayClub = getClubByName(fixture.awayTeam);

                                        return (
                                            <Link
                                                key={fixture.id}
                                                href={`/dashboard/match/${fixture.id}`}
                                                className={`${styles.fixtureCard} ${styles[fixture.status]}`}
                                            >
                                                <div className={styles.fixtureTime}>
                                                    {fixture.status === 'live' ? (
                                                        <span className={styles.liveIndicator}>LIVE</span>
                                                    ) : (
                                                        <span className={styles.time}>{fixture.time}</span>
                                                    )}
                                                    <span className={styles.gwBadge}>GW{fixture.gameweek}</span>
                                                </div>

                                                <div className={styles.fixtureTeams}>
                                                    <div className={styles.teamRow}>
                                                        <span
                                                            className={styles.teamName}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                if (homeClub) {
                                                                    window.location.href = `/dashboard/club/${homeClub.id}`;
                                                                }
                                                            }}
                                                        >
                                                            {fixture.homeTeam}
                                                        </span>
                                                        <span className={`${styles.score} ${fixture.status === 'live' ? styles.liveScore : ''}`}>
                                                            {fixture.homeScore !== null ? fixture.homeScore : '-'}
                                                        </span>
                                                    </div>
                                                    <div className={styles.teamRow}>
                                                        <span
                                                            className={styles.teamName}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                if (awayClub) {
                                                                    window.location.href = `/dashboard/club/${awayClub.id}`;
                                                                }
                                                            }}
                                                        >
                                                            {fixture.awayTeam}
                                                        </span>
                                                        <span className={`${styles.score} ${fixture.status === 'live' ? styles.liveScore : ''}`}>
                                                            {fixture.awayScore !== null ? fixture.awayScore : '-'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {fixture.status === 'completed' && (
                                                    <span className={styles.statusBadge}>FT</span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            ))}

                            {filteredFixtures.length === 0 && !loading && (
                                <div className={styles.empty}>
                                    <p>No {activeFilter === 'live' ? 'live' : activeFilter === 'results' ? 'completed' : 'upcoming'} fixtures found</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Clubs View */}
            {viewMode === 'clubs' && (
                <div className={styles.clubsList}>
                    <div className={styles.clubsHeader}>
                        <span>{filteredClubs.length} clubs in {selectedLeagueForClubs}</span>
                    </div>
                    {filteredClubs.map(club => (
                        <Link
                            key={club.id}
                            href={`/dashboard/club/${club.id}`}
                            className={styles.clubCard}
                        >
                            <div className={styles.clubLogo}>{club.logo}</div>
                            <div className={styles.clubInfo}>
                                <span className={styles.clubName}>{club.name}</span>
                                <span className={styles.clubMeta}>{club.stadium}</span>
                            </div>
                            <span className={`${styles.leagueBadge} ${styles[club.league.toLowerCase()]}`}>
                                {club.league}
                            </span>
                            <span className={styles.arrow}>›</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
