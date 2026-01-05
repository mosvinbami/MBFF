'use client';

import { use } from 'react';
import Link from 'next/link';
import { useSquad } from '@/contexts/SquadContext';
import { usePlayers } from '@/contexts/PlayersContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { PlayerCardPhoto } from '@/components/PlayerCardPhoto';
import styles from './page.module.css';

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = use(params);
    const { squad, formation } = useSquad();
    const { profile } = useUserProfile();
    const { players: allPlayers } = usePlayers();

    // Helper to get player photo from PlayersContext (has enriched photo data)
    const getPlayerPhoto = (playerId: string) => {
        const contextPlayer = allPlayers.find(p => p.id === playerId);
        return contextPlayer?.photo;
    };

    // For now, we only support viewing the current user's profile
    const isCurrentUser = userId === 'current-user' || userId === profile.id;

    if (!isCurrentUser) {
        return (
            <div className={styles.container}>
                <Link href="/dashboard/leaderboard" className={styles.backBtn}>
                    ← Back to Leaderboard
                </Link>
                <div className={styles.notFound}>
                    <span className={styles.notFoundIcon}>🔍</span>
                    <p>User not found</p>
                </div>
            </div>
        );
    }

    // Get actual squad data from context
    const starters = squad.filter(p => p.isStarter);
    const bench = squad.filter(p => !p.isStarter);
    const captain = squad.find(p => p.isCaptain);
    const viceCaptain = squad.find(p => p.isViceCaptain);

    // Group starters by position
    const gk = starters.filter(p => p.position === 'GK');
    const defenders = starters.filter(p => p.position === 'DEF');
    const midfielders = starters.filter(p => p.position === 'MID');
    const forwards = starters.filter(p => p.position === 'FWD');

    return (
        <div className={styles.container}>
            <Link href="/dashboard/leaderboard" className={styles.backBtn}>
                ← Back to Leaderboard
            </Link>

            {/* Profile Card */}
            <div className={styles.profileCard}>
                {/* Header */}
                <div className={styles.publicProfileHeader}>
                    <div className={styles.publicProfileAvatar}>
                        {profile.avatarUrl ? (
                            <img
                                src={profile.avatarUrl}
                                alt={profile.username}
                                className={styles.publicProfileImage}
                            />
                        ) : (
                            <span className={styles.publicProfileEmoji}>⚽</span>
                        )}
                    </div>
                    <div className={styles.publicProfileInfo}>
                        <h1 className={styles.publicProfileName}>{profile.username}</h1>
                        <span className={styles.publicProfileTeam}>{profile.teamName}</span>
                        <span className={styles.publicProfileMeta}>
                            Member since {new Date(profile.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                    </div>
                </div>

                {/* Stats Row */}
                <div className={styles.publicStatsRow}>
                    <div className={styles.publicStat}>
                        <span className={styles.publicStatValue}>#{profile.overallRank}</span>
                        <span className={styles.publicStatLabel}>Rank</span>
                    </div>
                    <div className={styles.publicStatDivider}></div>
                    <div className={styles.publicStat}>
                        <span className={styles.publicStatValue}>{profile.totalPoints}</span>
                        <span className={styles.publicStatLabel}>Points</span>
                    </div>
                    <div className={styles.publicStatDivider}></div>
                    <div className={styles.publicStat}>
                        <span className={styles.publicStatValue}>{profile.gwPoints}</span>
                        <span className={styles.publicStatLabel}>GW</span>
                    </div>
                </div>
            </div>

            {/* Squad Section */}
            <div className={styles.squadSection}>
                <h2 className={styles.squadTitle}>
                    <span className={styles.squadTitleIcon}>⚽</span>
                    {profile.teamName}
                    <span className={styles.squadFormation}>{formation}</span>
                </h2>

                {starters.length === 0 ? (
                    <div className={styles.emptySquad}>
                        <span className={styles.emptySquadIcon}>📋</span>
                        <p>No players in squad yet</p>
                    </div>
                ) : (
                    <>
                        {/* Pitch Display */}
                        <div className={styles.pitch}>
                            {/* Forwards */}
                            <div className={styles.pitchLine}>
                                {forwards.map((player) => (
                                    <div key={player.id} className={styles.playerCard}>
                                        <div className={`${styles.playerShirt} ${styles.fwdShirt}`}>
                                            <PlayerCardPhoto
                                                playerName={player.name}
                                                existingPhoto={player.photo || getPlayerPhoto(player.id)}
                                                className={styles.playerImage}
                                            />
                                            {captain?.id === player.id && <span className={styles.captainBadge}>C</span>}
                                            {viceCaptain?.id === player.id && <span className={styles.captainBadge}>V</span>}
                                        </div>
                                        <span className={styles.playerName}>{player.name.split(' ').pop()}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Midfielders */}
                            <div className={styles.pitchLine}>
                                {midfielders.map((player) => (
                                    <div key={player.id} className={styles.playerCard}>
                                        <div className={`${styles.playerShirt} ${styles.midShirt}`}>
                                            <PlayerCardPhoto
                                                playerName={player.name}
                                                existingPhoto={player.photo || getPlayerPhoto(player.id)}
                                                className={styles.playerImage}
                                            />
                                            {captain?.id === player.id && <span className={styles.captainBadge}>C</span>}
                                            {viceCaptain?.id === player.id && <span className={styles.captainBadge}>V</span>}
                                        </div>
                                        <span className={styles.playerName}>{player.name.split(' ').pop()}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Defenders */}
                            <div className={styles.pitchLine}>
                                {defenders.map((player) => (
                                    <div key={player.id} className={styles.playerCard}>
                                        <div className={`${styles.playerShirt} ${styles.defShirt}`}>
                                            <PlayerCardPhoto
                                                playerName={player.name}
                                                existingPhoto={player.photo || getPlayerPhoto(player.id)}
                                                className={styles.playerImage}
                                            />
                                            {captain?.id === player.id && <span className={styles.captainBadge}>C</span>}
                                            {viceCaptain?.id === player.id && <span className={styles.captainBadge}>V</span>}
                                        </div>
                                        <span className={styles.playerName}>{player.name.split(' ').pop()}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Goalkeeper */}
                            <div className={styles.pitchLine}>
                                {gk.map((player) => (
                                    <div key={player.id} className={styles.playerCard}>
                                        <div className={`${styles.playerShirt} ${styles.gkShirt}`}>
                                            <PlayerCardPhoto
                                                playerName={player.name}
                                                existingPhoto={player.photo || getPlayerPhoto(player.id)}
                                                className={styles.playerImage}
                                            />
                                            {captain?.id === player.id && <span className={styles.captainBadge}>C</span>}
                                            {viceCaptain?.id === player.id && <span className={styles.captainBadge}>V</span>}
                                        </div>
                                        <span className={styles.playerName}>{player.name.split(' ').pop()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bench */}
                        {bench.length > 0 && (
                            <div className={styles.benchSection}>
                                <span className={styles.benchLabel}>Substitutes</span>
                                <div className={styles.benchRow}>
                                    {bench.map((player) => (
                                        <div key={player.id} className={styles.benchCard}>
                                            <div className={`${styles.benchShirtSmall} ${styles[`${player.position.toLowerCase()}Shirt`]}`}>
                                                <PlayerCardPhoto
                                                    playerName={player.name}
                                                    existingPhoto={player.photo || getPlayerPhoto(player.id)}
                                                    className={styles.benchImage}
                                                />
                                            </div>
                                            <span className={styles.benchNameSmall}>{player.name.split(' ').pop()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
