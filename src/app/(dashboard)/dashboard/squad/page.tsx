'use client';

import Link from 'next/link';
import { useSquad, PlayerPosition, LeagueCode } from '@/contexts/SquadContext';
import styles from './page.module.css';

const positionRequirements: { position: PlayerPosition; required: number; label: string }[] = [
    { position: 'GK', required: 2, label: 'Goalkeepers' },
    { position: 'DEF', required: 5, label: 'Defenders' },
    { position: 'MID', required: 5, label: 'Midfielders' },
    { position: 'FWD', required: 3, label: 'Forwards' },
];

const leagueRequirements: { code: LeagueCode; name: string }[] = [
    { code: 'PL', name: 'Premier League' },
    { code: 'LL', name: 'La Liga' },
    { code: 'SA', name: 'Serie A' },
    { code: 'BL', name: 'Bundesliga' },
    { code: 'FL1', name: 'Ligue 1' },
];

export default function SquadPage() {
    const {
        squad,
        budgetRemaining,
        budget,
        removePlayer,
        getPositionCount,
        getLeagueCount
    } = useSquad();

    const totalSpent = budget - budgetRemaining;

    const getPlayersByPosition = (position: PlayerPosition) =>
        squad.filter(p => p.position === position);

    return (
        <div className={styles.container}>
            {/* Budget & Squad Status */}
            <section className={styles.statusCard}>
                <div className={styles.statusRow}>
                    <div className={styles.statusItem}>
                        <span className={styles.statusValue}>€{budgetRemaining.toFixed(1)}M</span>
                        <span className={styles.statusLabel}>Budget</span>
                    </div>
                    <div className={styles.statusItem}>
                        <span className={styles.statusValue}>{squad.length}/15</span>
                        <span className={styles.statusLabel}>Players</span>
                    </div>
                    <div className={styles.statusItem}>
                        <span className={styles.statusValue}>€{totalSpent.toFixed(1)}M</span>
                        <span className={styles.statusLabel}>Spent</span>
                    </div>
                </div>
            </section>

            {/* League Requirement Status */}
            <section className={styles.leagueStatus}>
                <h2 className={styles.sectionTitle}>League Requirement</h2>
                <p className={styles.requirement}>Must have ≥1 player from each league</p>
                <div className={styles.leagueGrid}>
                    {leagueRequirements.map(league => {
                        const count = getLeagueCount(league.code);
                        const isMet = count >= 1;
                        return (
                            <div
                                key={league.code}
                                className={`${styles.leagueChip} ${isMet ? styles.met : ''}`}
                                data-league={league.code.toLowerCase()}
                            >
                                <span className={styles.leagueBadge}>{league.code}</span>
                                <span className={styles.leagueCount}>{count}</span>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Position Breakdown */}
            <section className={styles.positionSection}>
                {positionRequirements.map(({ position, required, label }) => {
                    const players = getPlayersByPosition(position);
                    const emptySlots = required - players.length;
                    const isFull = emptySlots <= 0;

                    return (
                        <div key={position} className={styles.positionGroup}>
                            <div className={styles.positionHeader}>
                                <div className={styles.positionInfo}>
                                    <span className={`${styles.positionBadge} ${styles[position.toLowerCase()]}`}>
                                        {position}
                                    </span>
                                    <span className={styles.positionLabel}>{label}</span>
                                </div>
                                <span className={`${styles.positionCount} ${isFull ? styles.complete : ''}`}>
                                    {players.length}/{required}
                                </span>
                            </div>

                            {players.length > 0 && (
                                <div className={styles.playerList}>
                                    {players.map(player => (
                                        <div key={player.id} className={styles.playerCard}>
                                            <div className={styles.playerPhoto}>
                                                <span>{player.name[0]}</span>
                                            </div>
                                            <div className={styles.playerInfo}>
                                                <span className={styles.playerName}>{player.name}</span>
                                                <span className={styles.playerTeam}>{player.team}</span>
                                            </div>
                                            <div className={styles.playerMeta}>
                                                <span className={`${styles.leagueTag} ${styles[player.league.toLowerCase()]}`}>
                                                    {player.league}
                                                </span>
                                                <span className={styles.playerPrice}>€{player.price}M</span>
                                            </div>
                                            <button
                                                className={styles.removeBtn}
                                                onClick={() => removePlayer(player.id)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {emptySlots > 0 && (
                                <div className={styles.emptySlots}>
                                    {Array.from({ length: emptySlots }).map((_, i) => (
                                        <Link
                                            key={i}
                                            href={`/dashboard/players?position=${position}`}
                                            className={styles.emptySlot}
                                        >
                                            <span>+</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </section>

            {/* Squad Validation */}
            {squad.length === 15 && (
                leagueRequirements.every(l => getLeagueCount(l.code) >= 1) ? (
                    <Link href="/dashboard/lineup" className={styles.validationCard}>
                        <span className={styles.validIcon}>✓</span>
                        <span>Squad complete! Go to Lineup to set your starting XI.</span>
                        <span className={styles.arrow}>→</span>
                    </Link>
                ) : (
                    <div className={styles.validationCard}>
                        <span className={styles.invalidIcon}>!</span>
                        <span>Need at least 1 player from each league</span>
                    </div>
                )
            )}

            {/* Add Player FAB */}
            <Link href="/dashboard/players" className={styles.fab}>
                +
            </Link>
        </div>
    );
}
