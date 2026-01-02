'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CLUBS, getClubByName } from '@/data/clubs';
import styles from './page.module.css';

interface Player {
    id: string;
    name: string;
    team: string;
    position: string;
    league: string;
    price: number;
    points: number;
    goals?: number;
    assists?: number;
    cleanSheets?: number;
    yellowCards?: number;
    redCards?: number;
    minutesPlayed?: number;
    photo?: string;
}

export default function PlayerProfilePage() {
    const params = useParams();
    const router = useRouter();
    const playerId = params.playerId as string;

    const [player, setPlayer] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadPlayer() {
            setLoading(true);
            try {
                const response = await fetch('/api/players');
                const data = await response.json();

                if (data.success) {
                    const foundPlayer = data.players.find((p: Player) => p.id === playerId);
                    if (foundPlayer) {
                        setPlayer(foundPlayer);
                    } else {
                        setError('Player not found');
                    }
                } else {
                    setError('Failed to load player data');
                }
            } catch (err) {
                setError('Failed to load player data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadPlayer();
    }, [playerId]);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <span className={styles.spinner}>⚽</span>
                    <p>Loading player...</p>
                </div>
            </div>
        );
    }

    if (error || !player) {
        return (
            <div className={styles.container}>
                <div className={styles.notFound}>
                    <h2>Player not found</h2>
                    <p>The player you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                    <Link href="/dashboard/players">Back to Players</Link>
                </div>
            </div>
        );
    }

    // Find the club
    const club = getClubByName(player.team);

    return (
        <div className={styles.container}>
            {/* Back Button */}
            <button onClick={() => router.back()} className={styles.backBtn}>
                ← Back
            </button>

            {/* Player Header */}
            <div className={styles.playerHeader}>
                <div className={styles.playerPhoto}>
                    <span>{player.name[0]}</span>
                </div>
                <div className={styles.playerDetails}>
                    <h1 className={styles.playerName}>{player.name}</h1>
                    <div className={styles.playerMeta}>
                        <span className={`${styles.positionBadge} ${styles[player.position.toLowerCase()]}`}>
                            {player.position}
                        </span>
                        <span className={`${styles.leagueBadge} ${styles[player.league.toLowerCase()]}`}>
                            {player.league}
                        </span>
                    </div>
                </div>
                <div className={styles.playerPrice}>
                    <span className={styles.priceValue}>€{player.price}M</span>
                </div>
            </div>

            {/* Club Info */}
            {club && (
                <Link href={`/dashboard/club/${club.id}`} className={styles.clubCard}>
                    <span className={styles.clubLogo}>{club.logo}</span>
                    <div className={styles.clubInfo}>
                        <span className={styles.clubName}>{club.name}</span>
                        <span className={styles.clubMeta}>{club.stadium}</span>
                    </div>
                    <span className={styles.arrow}>›</span>
                </Link>
            )}

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{player.points}</span>
                    <span className={styles.statLabel}>Total Points</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{player.goals || 0}</span>
                    <span className={styles.statLabel}>Goals</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{player.assists || 0}</span>
                    <span className={styles.statLabel}>Assists</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{player.cleanSheets || 0}</span>
                    <span className={styles.statLabel}>Clean Sheets</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{player.yellowCards || 0}</span>
                    <span className={styles.statLabel}>Yellow Cards</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{player.minutesPlayed || 0}</span>
                    <span className={styles.statLabel}>Minutes</span>
                </div>
            </div>

            {/* Player Info Section */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>📊 Season Stats</h2>
                <div className={styles.infoGrid}>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Position</span>
                        <span className={styles.infoValue}>{player.position}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Team</span>
                        <span className={styles.infoValue}>{player.team}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>League</span>
                        <span className={styles.infoValue}>{player.league}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Price</span>
                        <span className={styles.infoValue}>€{player.price}M</span>
                    </div>
                    {player.redCards !== undefined && player.redCards > 0 && (
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Red Cards</span>
                            <span className={styles.infoValue}>{player.redCards}</span>
                        </div>
                    )}
                </div>
            </section>

            {/* Add to Squad Button */}
            <button className={styles.addButton}>
                + Add to Squad
            </button>
        </div>
    );
}
