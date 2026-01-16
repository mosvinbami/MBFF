'use client';

import { useEffect, useState } from 'react';
import styles from './MatchStatsModal.module.css';

export interface StatItem {
    value: number;
    name: string;
}

export interface MatchStats {
    goals_scored?: { h: StatItem[]; a: StatItem[] };
    assists?: { h: StatItem[]; a: StatItem[] };
    yellow_cards?: { h: StatItem[]; a: StatItem[] };
    red_cards?: { h: StatItem[]; a: StatItem[] };
    saves?: { h: StatItem[]; a: StatItem[] };
    bonus?: { h: StatItem[]; a: StatItem[] };
}

export interface FixtureWithStats {
    id: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    status: string;
    time: string;
    stats?: MatchStats;
}

interface MatchStatsModalProps {
    fixture: FixtureWithStats;
    onClose: () => void;
}

export default function MatchStatsModal({ fixture, onClose }: MatchStatsModalProps) {
    const [stats, setStats] = useState<MatchStats | undefined>(fixture.stats);
    const [loading, setLoading] = useState(false);

    // Fetch real stats if ID is from TheSportsDB
    useEffect(() => {
        if (fixture.id.startsWith('tsdb-') && !stats) {
            setLoading(true);
            const eventId = fixture.id.replace('tsdb-', '');

            // We use the public TheSportsDB API directly for client-side event lookup
            // free tier allows this
            fetch(`https://www.thesportsdb.com/api/v1/json/3/lookupevent.php?id=${eventId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.events && data.events[0]) {
                        const event = data.events[0];
                        // Parse the semi-structured text from TheSportsDB (Goals)
                        // Example format: "Goal: Player Name; Goal: Player B;"
                        const parseEvents = (str: string | null): StatItem[] => {
                            if (!str) return [];
                            return str.split(';')
                                .map(s => s.trim())
                                .filter(s => s)
                                .map(s => {
                                    // Remove "Goal:" prefix etc if present
                                    const name = s.replace(/^(Goal|Yellow Card|Red Card):/, '').trim();
                                    return { name, value: 1 };
                                });
                        };

                        const newStats: MatchStats = {
                            goals_scored: {
                                h: parseEvents(event.strHomeGoalDetails),
                                a: parseEvents(event.strAwayGoalDetails)
                            },
                            red_cards: {
                                h: parseEvents(event.strHomeRedCards),
                                a: parseEvents(event.strAwayRedCards)
                            },
                            yellow_cards: {
                                h: parseEvents(event.strHomeYellowCards),
                                a: parseEvents(event.strAwayYellowCards)
                            }
                        };
                        setStats(newStats);
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [fixture.id]);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (loading) {
        return (
            <div className={styles.overlay} onClick={onClose}>
                <div className={styles.modal}>
                    <div className={styles.loading}>Loading match data...</div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className={styles.overlay} onClick={onClose}>
                <div className={styles.modal} onClick={e => e.stopPropagation()}>
                    <div className={styles.header}>
                        <h3 className={styles.title}>Match Stats</h3>
                        <button className={styles.closeBtn} onClick={onClose}>✕</button>
                    </div>
                    <div className={styles.content}>
                        <p className={styles.noData}>No detailed stats available for this match.</p>
                    </div>
                </div>
            </div>
        );
    }

    const { goals_scored, assists, yellow_cards, red_cards, saves, bonus } = stats;

    const renderStatRow = (label: string, homeItems: StatItem[] = [], awayItems: StatItem[] = []) => {
        if ((!homeItems || homeItems.length === 0) && (!awayItems || awayItems.length === 0)) return null;

        return (
            <div className={styles.statRow}>
                <div className={styles.homeStats}>
                    {homeItems?.map((item, idx) => (
                        <div key={idx} className={styles.statItem}>
                            <span className={styles.playerName}>{item.name}</span>
                            {item.value > 1 && <span className={styles.statValue}>({item.value})</span>}
                        </div>
                    ))}
                </div>
                <div className={styles.statLabel}>{label}</div>
                <div className={styles.awayStats}>
                    {awayItems?.map((item, idx) => (
                        <div key={idx} className={styles.statItem}>
                            <span className={styles.playerName}>{item.name}</span>
                            {item.value > 1 && <span className={styles.statValue}>({item.value})</span>}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.scoreHeader}>
                        <span className={styles.team}>{fixture.homeTeam}</span>
                        <span className={`${styles.score} ${fixture.status === 'live' ? styles.live : ''}`}>
                            {fixture.homeScore ?? 0} - {fixture.awayScore ?? 0}
                        </span>
                        <span className={styles.team}>{fixture.awayTeam}</span>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div className={styles.content}>
                    <div className={styles.sectionTitle}>Match Events</div>
                    {renderStatRow('Goals', goals_scored?.h, goals_scored?.a)}
                    {renderStatRow('Red Cards', red_cards?.h, red_cards?.a)}
                    {renderStatRow('Yellow Cards', yellow_cards?.h, yellow_cards?.a)}

                    {/* Placeholder for future xG stats from Python API */}

                    {(goals_scored?.h?.length === 0 && goals_scored?.a?.length === 0) &&
                        (red_cards?.h?.length === 0 && red_cards?.a?.length === 0) && (
                            <p className={styles.noData}>No major events recorded yet.</p>
                        )}
                </div>
            </div>
        </div>
    );
}
