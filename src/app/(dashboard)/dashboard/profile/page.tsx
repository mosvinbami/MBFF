'use client';

import Link from 'next/link';
import { useSquad } from '@/contexts/SquadContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { PlayerCardPhoto } from '@/components/PlayerCardPhoto';
import { usePlayers } from '@/contexts/PlayersContext';
import styles from './page.module.css';

export default function ProfilePage() {
    const { squad, budgetRemaining, formation } = useSquad();
    const { profile } = useUserProfile();
    const { players: allPlayers } = usePlayers();

    // Helper to get player photo from context
    const getPlayerPhoto = (playerId: string) => {
        const player = allPlayers.find(p => p.id === playerId);
        return player?.photo;
    };

    const starters = squad.filter(p => p.isStarter);
    const captain = squad.find(p => p.isCaptain);

    const formattedJoinDate = new Date(profile.joinedDate).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
    });

    const fullJoinDate = new Date(profile.joinedDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className={styles.container}>
            {/* Profile Header Card */}
            <section className={styles.profileCard}>
                <div className={styles.profileHeader}>
                    <Link href="/dashboard/profile/edit" className={styles.editBtn}>
                        Edit <span className={styles.editArrow}>▾</span>
                    </Link>
                </div>
                <div className={styles.profileBody}>
                    <div className={styles.profileContent}>
                        <div className={styles.avatar}>
                            {profile.avatarUrl ? (
                                <img
                                    src={profile.avatarUrl}
                                    alt={profile.username}
                                    className={styles.avatarImage}
                                />
                            ) : (
                                <span>⚽</span>
                            )}
                        </div>
                        <div className={styles.profileInfoWrapper}>
                            <div className={styles.profileInfo}>
                                <h1 className={styles.username}>{profile.username}</h1>
                                <span className={styles.teamName}>{profile.teamName}</span>
                                <div className={styles.badges}>
                                    <span className={styles.activeBadge}>ACTIVE</span>
                                    <span className={styles.joinedText}>Joined {formattedJoinDate}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Row - 4 Cards */}
            <section className={styles.statsRow}>
                <div className={`${styles.statCard} ${styles.rankCard}`}>
                    <span className={styles.statValue}>#{profile.overallRank}</span>
                    <span className={styles.statLabel}>Overall Rank</span>
                </div>
                <div className={`${styles.statCard} ${styles.gwRankCard}`}>
                    <span className={styles.statValue}>#{profile.gwRank}</span>
                    <span className={styles.statLabel}>GW Rank</span>
                </div>
                <div className={`${styles.statCard} ${styles.pointsCard}`}>
                    <span className={styles.statValue}>
                        <span className={styles.starIcon}>✦</span> {profile.totalPoints}
                    </span>
                    <span className={styles.statLabel}>Total Points</span>
                </div>
                <div className={`${styles.statCard} ${styles.gwPointsCard}`}>
                    <span className={styles.statValue}>{profile.gwPoints}</span>
                    <span className={styles.statLabel}>GW Points</span>
                </div>
            </section>

            {/* Team Info Section */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Team Info</h2>
                <div className={styles.teamInfoGrid}>
                    <div className={styles.infoCard}>
                        <div className={styles.infoCardLeft}>
                            <span className={styles.infoIcon}>📋</span>
                            <div className={styles.infoCardText}>
                                <span className={styles.infoCardLabel}>Formation</span>
                                <span className={styles.infoCardValue}>
                                    {formation}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={`${styles.infoCard} ${styles.budgetCard}`}>
                        <div className={styles.infoCardLeft}>
                            <span className={styles.infoIcon}>💰</span>
                            <div className={styles.infoCardText}>
                                <span className={styles.infoCardLabel}>Budget Left</span>
                                <span className={styles.infoCardValue}>€{budgetRemaining.toFixed(1)}M</span>
                            </div>
                        </div>
                        <span className={styles.budgetValue}>€{budgetRemaining.toFixed(1)}M</span>
                    </div>

                    <div className={styles.infoCard}>
                        <div className={styles.infoCardLeft}>
                            <span className={styles.infoIcon}>⚙️</span>
                            <div className={styles.infoCardText}>
                                <span className={styles.infoCardLabel}>Squad Size</span>
                                <span className={styles.infoCardValue}>{squad.length} / 15</span>
                            </div>
                        </div>
                        <span className={styles.squadCount}>{squad.length} / 15</span>
                    </div>

                    <div className={styles.infoCard}>
                        <div className={styles.infoCardLeft}>
                            <span className={styles.infoIcon}>©️</span>
                            <div className={styles.infoCardText}>
                                <span className={styles.infoCardLabel}>Captain</span>
                                <span className={styles.infoCardValue}>
                                    {captain?.name || '—'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* My Team Section */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>My Team</h2>

                {squad.length === 0 ? (
                    <div className={styles.emptyTeam}>
                        <div className={styles.emptyTeamContent}>
                            <p>You haven't added <strong>any players</strong> yet.</p>
                            <Link href="/dashboard/squad?tab=transfers" className={styles.addPlayersBtn}>
                                Add Players
                            </Link>
                        </div>
                        <div className={styles.emptyTeamIllustration}>
                            <div className={styles.tacticsBoard}>
                                <div className={styles.boardClip}></div>
                                <div className={styles.boardField}>
                                    <div className={styles.fieldLines}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={styles.teamDisplay}>
                        {/* Pitch Display */}
                        <div className={styles.pitchDisplay}>
                            {/* Forwards */}
                            <div className={styles.pitchRow}>
                                {starters.filter(p => p.position === 'FWD').map((player) => (
                                    <div key={player.id} className={styles.pitchPlayer}>
                                        <div className={`${styles.pitchPhoto} ${styles.fwd}`}>
                                            <PlayerCardPhoto
                                                playerName={player.name}
                                                existingPhoto={getPlayerPhoto(player.id)}
                                                className={styles.pitchPlayerImage}
                                            />
                                            {captain?.id === player.id && <span className={styles.pitchCaptainBadge}>C</span>}
                                        </div>
                                        <span className={styles.pitchName}>{player.name.split(' ').pop()}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Midfielders */}
                            <div className={styles.pitchRow}>
                                {starters.filter(p => p.position === 'MID').map((player) => (
                                    <div key={player.id} className={styles.pitchPlayer}>
                                        <div className={`${styles.pitchPhoto} ${styles.mid}`}>
                                            <PlayerCardPhoto
                                                playerName={player.name}
                                                existingPhoto={getPlayerPhoto(player.id)}
                                                className={styles.pitchPlayerImage}
                                            />
                                            {captain?.id === player.id && <span className={styles.pitchCaptainBadge}>C</span>}
                                        </div>
                                        <span className={styles.pitchName}>{player.name.split(' ').pop()}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Defenders */}
                            <div className={styles.pitchRow}>
                                {starters.filter(p => p.position === 'DEF').map((player) => (
                                    <div key={player.id} className={styles.pitchPlayer}>
                                        <div className={`${styles.pitchPhoto} ${styles.def}`}>
                                            <PlayerCardPhoto
                                                playerName={player.name}
                                                existingPhoto={getPlayerPhoto(player.id)}
                                                className={styles.pitchPlayerImage}
                                            />
                                            {captain?.id === player.id && <span className={styles.pitchCaptainBadge}>C</span>}
                                        </div>
                                        <span className={styles.pitchName}>{player.name.split(' ').pop()}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Goalkeeper */}
                            <div className={styles.pitchRow}>
                                {starters.filter(p => p.position === 'GK').map((player) => (
                                    <div key={player.id} className={styles.pitchPlayer}>
                                        <div className={`${styles.pitchPhoto} ${styles.gk}`}>
                                            <PlayerCardPhoto
                                                playerName={player.name}
                                                existingPhoto={getPlayerPhoto(player.id)}
                                                className={styles.pitchPlayerImage}
                                            />
                                            {captain?.id === player.id && <span className={styles.pitchCaptainBadge}>C</span>}
                                        </div>
                                        <span className={styles.pitchName}>{player.name.split(' ').pop()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* View Squad Link */}
                        <Link href="/dashboard/squad" className={styles.viewSquadLink}>
                            View Full Squad →
                        </Link>
                    </div>
                )}
            </section>

            {/* Account Section */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Account</h2>
                    <span className={styles.sectionArrow}>›</span>
                </div>
                <div className={styles.accountList}>
                    <div className={styles.accountItem}>
                        <div className={styles.accountLeft}>
                            <span className={styles.accountIcon}>✉️</span>
                            <span className={styles.accountLabel}>Email</span>
                        </div>
                        <span className={styles.accountValue}>{profile.email}</span>
                    </div>
                    <div className={styles.accountItem}>
                        <div className={styles.accountLeft}>
                            <span className={styles.accountIcon}>📅</span>
                            <span className={styles.accountLabel}>Joined</span>
                        </div>
                        <span className={styles.accountValue}>{fullJoinDate}</span>
                    </div>
                    <div className={styles.accountItem}>
                        <div className={styles.accountLeft}>
                            <span className={styles.accountIcon}>🏆</span>
                            <span className={styles.accountLabel}>Gameweeks Played</span>
                        </div>
                        <span className={styles.accountValue}>{profile.gameweeksPlayed}</span>
                    </div>
                </div>
            </section>

            {/* View as Others */}
            <Link href={`/dashboard/profile/${profile.id}`} className={styles.viewAsOthers}>
                👁️ View profile as others see it
            </Link>
        </div>
    );
}
