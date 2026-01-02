'use client';

import Link from 'next/link';
import { useSquad } from '@/contexts/SquadContext';
import styles from './page.module.css';

// Mock user data - will be replaced with actual auth data
const mockUser = {
    id: 'current-user',
    username: 'FootballFan23',
    teamName: 'FC Thunder',
    email: 'user@example.com',
    avatar: '⚽',
    joinedDate: '2025-08-15',
    favoriteLeague: 'Premier League',
    overallRank: 156,
    gwRank: 89,
    totalPoints: 342,
    gwPoints: 52,
    transfersUsed: 8,
    gameweeksPlayed: 8,
};

export default function ProfilePage() {
    const { squad, budgetRemaining, getFormation } = useSquad();

    const starters = squad.filter(p => p.isStarter);
    const bench = squad.filter(p => !p.isStarter);
    const captain = squad.find(p => p.isCaptain);

    return (
        <div className={styles.container}>
            {/* Profile Header */}
            <section className={styles.profileHeader}>
                <div className={styles.avatar}>{mockUser.avatar}</div>
                <div className={styles.profileInfo}>
                    <h1 className={styles.username}>{mockUser.username}</h1>
                    <span className={styles.teamName}>{mockUser.teamName}</span>
                </div>
                <Link href="/dashboard/profile/edit" className={styles.editBtn}>
                    Edit
                </Link>
            </section>

            {/* Stats Cards */}
            <section className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>#{mockUser.overallRank}</span>
                    <span className={styles.statLabel}>Overall Rank</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{mockUser.totalPoints}</span>
                    <span className={styles.statLabel}>Total Points</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>#{mockUser.gwRank}</span>
                    <span className={styles.statLabel}>GW Rank</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{mockUser.gwPoints}</span>
                    <span className={styles.statLabel}>GW Points</span>
                </div>
            </section>

            {/* Team Info */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Team Info</h2>
                <div className={styles.infoList}>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Squad Size</span>
                        <span className={styles.infoValue}>{squad.length}/15</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Formation</span>
                        <span className={styles.infoValue}>{starters.length === 11 ? getFormation() : 'Not set'}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Budget Left</span>
                        <span className={styles.infoValue}>€{budgetRemaining.toFixed(1)}M</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Captain</span>
                        <span className={styles.infoValue}>{captain?.name || 'Not set'}</span>
                    </div>
                </div>
            </section>

            {/* My Team Display */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>My Team</h2>

                {squad.length === 0 ? (
                    <div className={styles.emptyTeam}>
                        <p>No players in squad yet</p>
                        <Link href="/dashboard/players" className={styles.addPlayersBtn}>
                            Add Players
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Starting XI */}
                        {starters.length > 0 && (
                            <div className={styles.teamGroup}>
                                <h3 className={styles.groupTitle}>Starting XI ({starters.length}/11)</h3>
                                <div className={styles.playerGrid}>
                                    {starters.map(player => (
                                        <div key={player.id} className={styles.playerChip}>
                                            <span className={`${styles.positionDot} ${styles[player.position.toLowerCase()]}`} />
                                            <span className={styles.chipName}>{player.name.split(' ').pop()}</span>
                                            {player.isCaptain && <span className={styles.captainTag}>C</span>}
                                            {player.isViceCaptain && <span className={styles.vcTag}>V</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Bench */}
                        {bench.length > 0 && (
                            <div className={styles.teamGroup}>
                                <h3 className={styles.groupTitle}>Bench ({bench.length})</h3>
                                <div className={styles.playerGrid}>
                                    {bench.map(player => (
                                        <div key={player.id} className={`${styles.playerChip} ${styles.bench}`}>
                                            <span className={`${styles.positionDot} ${styles[player.position.toLowerCase()]}`} />
                                            <span className={styles.chipName}>{player.name.split(' ').pop()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* Account Info */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Account</h2>
                <div className={styles.infoList}>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Email</span>
                        <span className={styles.infoValue}>{mockUser.email}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Joined</span>
                        <span className={styles.infoValue}>{new Date(mockUser.joinedDate).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Gameweeks Played</span>
                        <span className={styles.infoValue}>{mockUser.gameweeksPlayed}</span>
                    </div>
                </div>
            </section>

            {/* View as Others */}
            <Link href={`/dashboard/profile/${mockUser.id}`} className={styles.viewAsOthers}>
                👁️ View profile as others see it
            </Link>
        </div>
    );
}
