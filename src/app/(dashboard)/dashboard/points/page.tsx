'use client';

import { useState } from 'react';
import styles from './page.module.css';

// Mock points data
const mockPointsData = {
    gameweek: 1,
    totalPoints: 0,
    gameweekPoints: 0,
    playerBreakdown: [] as Array<{
        id: string;
        name: string;
        team: string;
        position: string;
        isCaptain: boolean;
        matches: Array<{
            opponent: string;
            competition: string;
            minutes: number;
            goals: number;
            assists: number;
            cleanSheet: boolean;
            saves: number;
            yellowCards: number;
            redCards: number;
            points: number;
        }>;
        totalPoints: number;
    }>,
};

const gameweeks = [1, 2, 3, 4, 5];

export default function PointsPage() {
    const [selectedGW, setSelectedGW] = useState(mockPointsData.gameweek);

    return (
        <div className={styles.container}>
            {/* Gameweek Selector */}
            <div className={styles.gwSelector}>
                <button className={styles.gwArrow}>‹</button>
                <div className={styles.gwList}>
                    {gameweeks.map(gw => (
                        <button
                            key={gw}
                            className={`${styles.gwItem} ${selectedGW === gw ? styles.active : ''}`}
                            onClick={() => setSelectedGW(gw)}
                        >
                            GW{gw}
                        </button>
                    ))}
                </div>
                <button className={styles.gwArrow}>›</button>
            </div>

            {/* Points Summary */}
            <section className={styles.summaryCard}>
                <div className={styles.summaryMain}>
                    <span className={styles.summaryValue}>{mockPointsData.gameweekPoints}</span>
                    <span className={styles.summaryLabel}>GW{selectedGW} Points</span>
                </div>
                <div className={styles.summaryDivider} />
                <div className={styles.summarySecondary}>
                    <span className={styles.totalValue}>{mockPointsData.totalPoints}</span>
                    <span className={styles.totalLabel}>Total</span>
                </div>
            </section>

            {/* Scoring Breakdown */}
            <section className={styles.breakdown}>
                <h3 className={styles.sectionTitle}>Scoring Breakdown</h3>

                {mockPointsData.playerBreakdown.length === 0 ? (
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>📊</span>
                        <p>No points data yet</p>
                        <span className={styles.emptyHint}>
                            Complete your squad and lineup to start scoring
                        </span>
                    </div>
                ) : (
                    <div className={styles.playerList}>
                        {mockPointsData.playerBreakdown.map(player => (
                            <details key={player.id} className={styles.playerAccordion}>
                                <summary className={styles.playerSummary}>
                                    <div className={styles.playerInfo}>
                                        <span className={`${styles.badge} ${styles[player.position.toLowerCase()]}`}>
                                            {player.position}
                                        </span>
                                        <div className={styles.playerName}>
                                            {player.name}
                                            {player.isCaptain && <span className={styles.captainBadge}>C</span>}
                                        </div>
                                    </div>
                                    <span className={styles.playerPoints}>{player.totalPoints}</span>
                                </summary>
                                <div className={styles.matchBreakdown}>
                                    {player.matches.map((match, i) => (
                                        <div key={i} className={styles.matchItem}>
                                            <div className={styles.matchInfo}>
                                                <span className={styles.opponent}>vs {match.opponent}</span>
                                                <span className={styles.competition}>{match.competition}</span>
                                            </div>
                                            <div className={styles.matchStats}>
                                                <span>{match.minutes}&apos; mins</span>
                                                {match.goals > 0 && <span>⚽ {match.goals}</span>}
                                                {match.assists > 0 && <span>🅰️ {match.assists}</span>}
                                                {match.cleanSheet && <span>🧤 CS</span>}
                                            </div>
                                            <span className={styles.matchPoints}>+{match.points}</span>
                                        </div>
                                    ))}
                                </div>
                            </details>
                        ))}
                    </div>
                )}
            </section>

            {/* Scoring Guide */}
            <section className={styles.guide}>
                <h3 className={styles.sectionTitle}>Scoring Guide</h3>
                <div className={styles.guideGrid}>
                    <div className={styles.guideItem}>
                        <span className={styles.guideAction}>Goal (FWD)</span>
                        <span className={styles.guidePoints}>+4</span>
                    </div>
                    <div className={styles.guideItem}>
                        <span className={styles.guideAction}>Goal (MID)</span>
                        <span className={styles.guidePoints}>+5</span>
                    </div>
                    <div className={styles.guideItem}>
                        <span className={styles.guideAction}>Goal (DEF/GK)</span>
                        <span className={styles.guidePoints}>+6</span>
                    </div>
                    <div className={styles.guideItem}>
                        <span className={styles.guideAction}>Assist</span>
                        <span className={styles.guidePoints}>+3</span>
                    </div>
                    <div className={styles.guideItem}>
                        <span className={styles.guideAction}>Clean Sheet</span>
                        <span className={styles.guidePoints}>+4</span>
                    </div>
                    <div className={styles.guideItem}>
                        <span className={styles.guideAction}>3 Saves (GK)</span>
                        <span className={styles.guidePoints}>+1</span>
                    </div>
                    <div className={styles.guideItem}>
                        <span className={styles.guideAction}>Yellow Card</span>
                        <span className={styles.guidePointsNeg}>-1</span>
                    </div>
                    <div className={styles.guideItem}>
                        <span className={styles.guideAction}>Red Card</span>
                        <span className={styles.guidePointsNeg}>-3</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
