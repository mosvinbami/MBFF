'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSquad, LeagueCode } from '@/contexts/SquadContext';
import styles from './page.module.css';

export default function DashboardPage() {
    const { budgetRemaining, squad, getLeagueCount } = useSquad();
    const [rulesOpen, setRulesOpen] = useState(false);

    // Mock Countdown Logic
    const [timeLeft, setTimeLeft] = useState({ d: 2, h: 14, m: 52 });

    useEffect(() => {
        // Simple mock timer decrement
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.m > 0) return { ...prev, m: prev.m - 1 };
                if (prev.h > 0) return { ...prev, h: prev.h - 1, m: 59 };
                if (prev.d > 0) return { ...prev, d: prev.d - 1, h: 23, m: 59 };
                return prev;
            });
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // Guidance Logic
    const getGuidanceMessage = () => {
        if (squad.length < 15) return `Select ${15 - squad.length} more players to complete squad`;
        if (getLeagueCount('PL') === 0) return "You need at least 1 Premier League player";
        if (getLeagueCount('LL') === 0) return "You need at least 1 La Liga player";
        if (getLeagueCount('SA') === 0) return "You need at least 1 Serie A player";
        if (getLeagueCount('BL') === 0) return "You need at least 1 Bundesliga player";
        if (getLeagueCount('FL1') === 0) return "You need at least 1 Ligue 1 player";
        return "Your squad is ready! Set your lineup.";
    };

    const guidance = getGuidanceMessage();
    const isSquadComplete = squad.length === 15;

    return (
        <div className={styles.dashboard}>
            {/* Deadline Card */}
            <section className={styles.deadlineCard}>
                <div className={styles.deadlineHeader}>
                    <span className={styles.deadlineLabel}>Next Deadline: <span className={styles.deadlineDate}>Sunday, 12:00 PM</span></span>
                </div>
                <div className={styles.deadlineContent}>
                    <div className={styles.countdownBox}>
                        <span>{timeLeft.d}D</span>
                        <span>{timeLeft.h}H</span>
                        <span>{timeLeft.m}M</span>
                        <span>17s</span>
                    </div>
                    <Link href="/dashboard/lineup" className={styles.setLineupBtn}>
                        Set Lineup
                    </Link>
                </div>
            </section>

            {/* Hero Budget Card */}
            <section className={styles.heroCard}>
                <div className={styles.heroContent}>
                    <div className={styles.budgetGroup}>
                        <span className={styles.heroLabel}>AVAILABLE BUDGET</span>
                        <div className={styles.heroValue}>€{budgetRemaining.toFixed(1)}M</div>
                    </div>
                    <div className={styles.playerCountBadge}>
                        <span className={styles.pcValue}>{squad.length}/15</span>
                        <span className={styles.pcLabel}>PLAYERS</span>
                    </div>
                </div>
                {/* Abstract Swish Background */}
                <div className={styles.heroBackground} />
            </section>

            {/* Action Grid */}
            <section className={styles.actions}>
                <Link href="/dashboard/squad" className={styles.actionTile}>
                    <div className={`${styles.iconBox} ${styles.iconBlue}`}>👥</div>
                    <div className={styles.actionMeta}>
                        <span className={styles.actionTitle}>Build Squad</span>
                        <span className={styles.actionHint}>Select 15 players · {squad.length}/15</span>
                    </div>
                    <div className={styles.tileGlow} />
                </Link>

                <Link href="/dashboard/lineup" className={styles.actionTile}>
                    <div className={`${styles.iconBox} ${styles.iconOrange}`}>📋</div>
                    <div className={styles.actionMeta}>
                        <span className={styles.actionTitle}>Set Lineup</span>
                        <span className={styles.actionHint}>Pick starting 11</span>
                    </div>
                    <div className={styles.tileGlow} />
                </Link>

                <Link href="/dashboard/players" className={styles.actionTile}>
                    <div className={`${styles.iconBox} ${styles.iconYellow}`}>⚡</div>
                    <div className={styles.actionMeta}>
                        <span className={styles.actionTitle}>Players</span>
                        <span className={styles.actionHint}>Browse all players</span>
                    </div>
                    <div className={styles.tileGlow} />
                </Link>

                <Link href="/dashboard/leaderboard" className={styles.actionTile}>
                    <div className={`${styles.iconBox} ${styles.iconGold}`}>🏆</div>
                    <div className={styles.actionMeta}>
                        <span className={styles.actionTitle}>Leaderboard</span>
                        <span className={styles.actionHint}>View rankings</span>
                    </div>
                    <div className={styles.tileGlow} />
                </Link>
            </section>

            {/* Guidance Banner */}
            <div className={styles.guidanceBanner}>
                <div className={styles.shieldIcon}>!</div>
                <span className={styles.guidanceText}>{guidance}</span>
                <span className={styles.guidanceArrow}>›</span>
            </div>

            {/* League Strip */}
            <section className={styles.leagueStrip}>
                {['PL', 'LL', 'SA', 'BL', 'FL1'].map((code) => {
                    const count = getLeagueCount(code as LeagueCode);
                    const isMet = count > 0;
                    return (
                        <div key={code} className={`${styles.leagueBadge} ${isMet ? styles.met : ''}`}>
                            <span className={styles.lbCode}>{code === 'FL1' ? 'L1' : code}</span>
                            <div className={styles.lbStatus}>
                                {isMet ? <span className={styles.dotMet} /> : <span className={styles.dotMiss} />}
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* Collapsible Rules */}
            <section className={styles.rulesSection}>
                <button
                    className={styles.rulesToggle}
                    onClick={() => setRulesOpen(!rulesOpen)}
                >
                    <span>How It Works</span>
                    <span className={`${styles.chevron} ${rulesOpen ? styles.open : ''}`}>▼</span>
                </button>

                {rulesOpen && (
                    <div className={styles.rulesContent}>
                        <div className={styles.ruleItem}>
                            <span className={styles.ruleNum}>1</span>
                            <p>Build a 15-player squad within €100M budget</p>
                        </div>
                        <div className={styles.ruleItem}>
                            <span className={styles.ruleNum}>2</span>
                            <p>Set your 11-player lineup before Sunday 12:00 UTC</p>
                        </div>
                        <div className={styles.ruleItem}>
                            <span className={styles.ruleNum}>3</span>
                            <p>Earn points from all competitive matches</p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
