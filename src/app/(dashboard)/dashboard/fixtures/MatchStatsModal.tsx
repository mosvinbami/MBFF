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
    const [activeTab, setActiveTab] = useState<'stats' | 'events'>('events');

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!fixture.stats) {
        return (
            <div className={styles.overlay} onClick={onClose}>
                <div className={styles.modal} onClick={e => e.stopPropagation()}>
                    <div className={styles.header}>
                        <h3 className={styles.title}>Match Stats</h3>
                        <button className={styles.closeBtn} onClick={onClose}>✕</button>
                    </div>
                    <div className={styles.content}>
                        <p className={styles.noData}>No stats available for this match yet.</p>
                    </div>
                </div>
            </div>
        );
    }

    const { goals_scored, assists, yellow_cards, red_cards, saves, bonus } = fixture.stats;

    const renderStatRow = (label: string, homeItems: StatItem[] = [], awayItems: StatItem[] = []) => {
        if (homeItems.length === 0 && awayItems.length === 0) return null;

        return (
            <div className={styles.statRow}>
                <div className={styles.homeStats}>
                    {homeItems.map((item, idx) => (
                        <div key={idx} className={styles.statItem}>
                            <span className={styles.playerName}>{item.name}</span>
                            {item.value > 1 && <span className={styles.statValue}>({item.value})</span>}
                        </div>
                    ))}
                </div>
                <div className={styles.statLabel}>{label}</div>
                <div className={styles.awayStats}>
                    {awayItems.map((item, idx) => (
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
                    {renderStatRow('Assists', assists?.h, assists?.a)}
                    {renderStatRow('Red Cards', red_cards?.h, red_cards?.a)}

                    <div className={styles.divider} />

                    <div className={styles.sectionTitle}>Performance</div>
                    {renderStatRow('Bonus', bonus?.h, bonus?.a)}
                    {renderStatRow('Saves', saves?.h, saves?.a)}
                    {renderStatRow('Yellow Cards', yellow_cards?.h, yellow_cards?.a)}

                    {Object.values(fixture.stats).every(s => !s || (s.h.length === 0 && s.a.length === 0)) && (
                        <p className={styles.noData}>No events recorded yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
