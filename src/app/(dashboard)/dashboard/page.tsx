'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSquad, LeagueCode } from '@/contexts/SquadContext';
import styles from './page.module.css';

const leagueNames: Record<LeagueCode, string> = {
    PL: 'Premier League',
    LL: 'La Liga',
    SA: 'Serie A',
    BL: 'Bundesliga',
    FL1: 'Ligue 1',
};

interface NewsItem {
    title: string;
    source: string;
    league?: string;
}

export default function DashboardPage() {
    const { budgetRemaining, squad, getLeagueCount } = useSquad();
    const [showTips, setShowTips] = useState(true); // Expanded by default
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
    const [news, setNews] = useState<NewsItem[]>([]);

    // Calculate next Sunday 12:00 UTC deadline
    useEffect(() => {
        const getNextSunday = () => {
            const now = new Date();
            const sunday = new Date(now);
            sunday.setUTCHours(12, 0, 0, 0);
            const daysUntilSunday = (7 - now.getUTCDay()) % 7;
            sunday.setDate(now.getDate() + (daysUntilSunday === 0 && now.getTime() > sunday.getTime() ? 7 : daysUntilSunday));
            return sunday;
        };

        const updateCountdown = () => {
            const deadline = getNextSunday();
            const now = new Date();
            const diff = deadline.getTime() - now.getTime();

            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((diff % (1000 * 60)) / 1000);
                setCountdown({ days, hours, mins, secs });
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, []);

    // Fetch live sports news
    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await fetch('/api/news?limit=8');
                const data = await response.json();
                if (data.success && data.news) {
                    setNews(data.news);
                }
            } catch (error) {
                console.error('Error fetching news:', error);
            }
        };

        fetchNews();
        // Refresh news every 10 minutes
        const interval = setInterval(fetchNews, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Find missing leagues
    const missingLeagues = (['PL', 'LL', 'SA', 'BL', 'FL1'] as LeagueCode[])
        .filter(league => getLeagueCount(league) < 1);

    const startersCount = squad.filter(p => p.isStarter).length;

    return (
        <div className={styles.dashboard}>
            {/* Deadline Banner */}
            <section className={styles.deadlineBanner}>
                <div className={styles.deadlineInfo}>
                    <span className={styles.deadlineLabel}>Next Deadline:</span>
                    <span className={styles.deadlineTime}>Sunday, 12:00 PM</span>
                </div>
                <div className={styles.deadlineRow}>
                    <div className={styles.countdown}>
                        <span className={styles.countdownValue}>{countdown.days}D</span>
                        <span className={styles.countdownValue}>{countdown.hours}H</span>
                        <span className={styles.countdownValue}>{countdown.mins}M</span>
                        <span className={styles.countdownValue}>{countdown.secs}s</span>
                    </div>
                    <Link href="/dashboard/squad?tab=pick" className={styles.deadlineBtn}>
                        Set Lineup
                    </Link>
                </div>
            </section>

            {/* News Ticker - Live Sports News */}
            <section className={styles.newsTicker}>
                <span className={styles.newsIcon}>📰</span>
                <div className={styles.newsTrack}>
                    <div className={styles.newsScroll}>
                        {news.length > 0 ? (
                            <>
                                {news.map((item, index) => (
                                    <>
                                        <span key={index} className={styles.newsItem}>
                                            {item.title}
                                        </span>
                                        <span className={styles.newsDivider}>•</span>
                                    </>
                                ))}
                                {/* Duplicate for seamless loop */}
                                {news.map((item, index) => (
                                    <>
                                        <span key={`dup-${index}`} className={styles.newsItem}>
                                            {item.title}
                                        </span>
                                        <span className={styles.newsDivider}>•</span>
                                    </>
                                ))}
                            </>
                        ) : (
                            <>
                                <span className={styles.newsItem}>
                                    ⚽ Loading latest football news...
                                </span>
                                <span className={styles.newsDivider}>•</span>
                                <span className={styles.newsItem}>
                                    🔥 Stay tuned for updates from all 5 leagues
                                </span>
                                <span className={styles.newsDivider}>•</span>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Budget Card */}
            <section className={styles.budgetCard}>
                <div className={styles.budgetInfo}>
                    <span className={styles.budgetLabel}>AVAILABLE BUDGET</span>
                    <span className={styles.budgetValue}>€{budgetRemaining.toFixed(1)}M</span>
                </div>
                <div className={styles.squadStatus}>
                    <span className={styles.squadCount}>{squad.length}/15</span>
                    <span className={styles.squadLabel}>PLAYERS</span>
                </div>
            </section>

            {/* Quick Actions - 2x2 Grid */}
            <div className={styles.actionsGrid}>
                <Link href="/dashboard/squad?tab=transfers" className={styles.actionCard}>
                    <div className={styles.actionIconWrapper}>
                        <span className={styles.actionIcon}>👥</span>
                    </div>
                    <span className={styles.actionTitle}>Build Squad</span>
                    <span className={styles.actionDesc}>Select 15 players · {squad.length}/15</span>
                </Link>

                <Link href="/dashboard/squad?tab=pick" className={styles.actionCard}>
                    <div className={styles.actionIconWrapper}>
                        <span className={styles.actionIcon}>📋</span>
                    </div>
                    <span className={styles.actionTitle}>Set Lineup</span>
                    <span className={styles.actionDesc}>Pick starting 11</span>
                </Link>

                <Link href="/dashboard/players" className={styles.actionCard}>
                    <div className={styles.actionIconWrapper}>
                        <span className={styles.actionIcon}>⚡</span>
                    </div>
                    <span className={styles.actionTitle}>Players</span>
                    <span className={styles.actionDesc}>Browse all players</span>
                </Link>

                <Link href="/dashboard/leaderboard" className={styles.actionCard}>
                    <div className={styles.actionIconWrapper}>
                        <span className={styles.actionIcon}>🏆</span>
                    </div>
                    <span className={styles.actionTitle}>Leaderboard</span>
                    <span className={styles.actionDesc}>View rankings</span>
                </Link>
            </div>

            {/* Missing League Alert */}
            {missingLeagues.length > 0 && (
                <Link href="/dashboard/players" className={styles.alertBanner}>
                    <div className={styles.alertIcon}>⚠️</div>
                    <span className={styles.alertText}>
                        You still need a <strong className={styles.alertHighlight}>{leagueNames[missingLeagues[0]]}</strong> player
                    </span>
                    <span className={styles.alertArrow}>›</span>
                </Link>
            )}

            {/* How It Works - Collapsible */}
            <section className={styles.tipsSection}>
                <button
                    className={styles.tipsHeader}
                    onClick={() => setShowTips(!showTips)}
                >
                    <h2 className={styles.tipsTitle}>How It Works</h2>
                    <span className={`${styles.tipsToggle} ${showTips ? styles.open : ''}`}>⌄</span>
                </button>

                {showTips && (
                    <div className={styles.tipsList}>
                        <div className={styles.tipItem}>
                            <span className={styles.tipNumber}>1</span>
                            <p>Build a 15-player squad within €100M budget</p>
                        </div>
                        <div className={styles.tipItem}>
                            <span className={styles.tipNumber}>2</span>
                            <p>Set your 11-player lineup before Sunday 12:00 UTC</p>
                        </div>
                        <div className={styles.tipItem}>
                            <span className={styles.tipNumber}>3</span>
                            <p>Earn points from all competitive matches</p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
