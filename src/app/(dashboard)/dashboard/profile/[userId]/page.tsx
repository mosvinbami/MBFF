'use client';

import { use } from 'react';
import Link from 'next/link';
import styles from '../page.module.css';

// Mock users database - will be replaced with actual database
const mockUsers: Record<string, {
    id: string;
    username: string;
    teamName: string;
    avatar: string;
    joinedDate: string;
    overallRank: number;
    gwRank: number;
    totalPoints: number;
    gwPoints: number;
    formation: string;
    starters: Array<{ name: string; position: 'GK' | 'DEF' | 'MID' | 'FWD'; isCaptain?: boolean; isViceCaptain?: boolean }>;
    bench: Array<{ name: string; position: 'GK' | 'DEF' | 'MID' | 'FWD' }>;
}> = {
    'current-user': {
        id: 'current-user',
        username: 'FootballFan23',
        teamName: 'FC Thunder',
        avatar: '⚽',
        joinedDate: '2025-08-15',
        overallRank: 156,
        gwRank: 89,
        totalPoints: 342,
        gwPoints: 52,
        formation: '4-3-3',
        starters: [
            { name: 'Alisson', position: 'GK' },
            { name: 'Alexander-Arnold', position: 'DEF' },
            { name: 'Van Dijk', position: 'DEF' },
            { name: 'Saliba', position: 'DEF' },
            { name: 'Robertson', position: 'DEF' },
            { name: 'Saka', position: 'MID' },
            { name: 'Bellingham', position: 'MID', isCaptain: true },
            { name: 'Palmer', position: 'MID' },
            { name: 'Haaland', position: 'FWD', isViceCaptain: true },
            { name: 'Mbappé', position: 'FWD' },
            { name: 'Kane', position: 'FWD' },
        ],
        bench: [
            { name: 'Donnarumma', position: 'GK' },
            { name: 'Hakimi', position: 'DEF' },
            { name: 'Barella', position: 'MID' },
            { name: 'Barcola', position: 'FWD' },
        ],
    },
    'user-1': {
        id: 'user-1',
        username: 'FootballGenius',
        teamName: 'The Invincibles',
        avatar: '👑',
        joinedDate: '2025-06-01',
        overallRank: 1,
        gwRank: 5,
        totalPoints: 452,
        gwPoints: 68,
        formation: '3-5-2',
        starters: [
            { name: 'Courtois', position: 'GK' },
            { name: 'Rüdiger', position: 'DEF' },
            { name: 'Bastoni', position: 'DEF' },
            { name: 'Upamecano', position: 'DEF' },
            { name: 'Vinícius Jr.', position: 'MID' },
            { name: 'Bellingham', position: 'MID', isCaptain: true },
            { name: 'Musiala', position: 'MID' },
            { name: 'Wirtz', position: 'MID' },
            { name: 'Dembélé', position: 'MID' },
            { name: 'Haaland', position: 'FWD', isViceCaptain: true },
            { name: 'Kane', position: 'FWD' },
        ],
        bench: [
            { name: 'Maignan', position: 'GK' },
            { name: 'Van Dijk', position: 'DEF' },
            { name: 'Saka', position: 'MID' },
            { name: 'Mbappé', position: 'FWD' },
        ],
    },
    'user-2': {
        id: 'user-2',
        username: 'TacticMaster',
        teamName: 'Dream Team FC',
        avatar: '🥈',
        joinedDate: '2025-07-10',
        overallRank: 2,
        gwRank: 12,
        totalPoints: 438,
        gwPoints: 45,
        formation: '4-4-2',
        starters: [
            { name: 'Alisson', position: 'GK' },
            { name: 'Alexander-Arnold', position: 'DEF' },
            { name: 'Saliba', position: 'DEF' },
            { name: 'Bastoni', position: 'DEF' },
            { name: 'Hakimi', position: 'DEF' },
            { name: 'Saka', position: 'MID', isViceCaptain: true },
            { name: 'Palmer', position: 'MID' },
            { name: 'Barella', position: 'MID' },
            { name: 'Musiala', position: 'MID' },
            { name: 'Haaland', position: 'FWD', isCaptain: true },
            { name: 'Martínez', position: 'FWD' },
        ],
        bench: [
            { name: 'Neuer', position: 'GK' },
            { name: 'Rüdiger', position: 'DEF' },
            { name: 'Wirtz', position: 'MID' },
            { name: 'Barcola', position: 'FWD' },
        ],
    },
};

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = use(params);
    const user = mockUsers[userId];

    if (!user) {
        return (
            <div className={styles.container}>
                <Link href="/dashboard/leaderboard" className={styles.backBtn}>
                    ← Back to Leaderboard
                </Link>
                <div className={styles.section}>
                    <p style={{ textAlign: 'center', padding: '2rem' }}>User not found</p>
                </div>
            </div>
        );
    }

    const [def, mid, fwd] = user.formation.split('-').map(Number);

    const gk = user.starters.filter(p => p.position === 'GK');
    const defenders = user.starters.filter(p => p.position === 'DEF');
    const midfielders = user.starters.filter(p => p.position === 'MID');
    const forwards = user.starters.filter(p => p.position === 'FWD');

    return (
        <div className={styles.container}>
            <Link href="/dashboard/leaderboard" className={styles.backBtn}>
                ← Back to Leaderboard
            </Link>

            {/* Public Profile Header */}
            <section className={styles.publicHeader}>
                <div className={styles.publicAvatar}>{user.avatar}</div>
                <h1 className={styles.publicUsername}>{user.username}</h1>
                <span className={styles.publicTeamName}>{user.teamName}</span>
                <span className={styles.publicJoined}>
                    Member since {new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
            </section>

            {/* Stats Cards */}
            <section className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>#{user.overallRank}</span>
                    <span className={styles.statLabel}>Overall Rank</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{user.totalPoints}</span>
                    <span className={styles.statLabel}>Total Points</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>#{user.gwRank}</span>
                    <span className={styles.statLabel}>GW Rank</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{user.gwPoints}</span>
                    <span className={styles.statLabel}>GW Points</span>
                </div>
            </section>

            {/* Team Section */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    {user.teamName} • {user.formation}
                </h2>

                {/* Pitch Display */}
                <div className={styles.pitchDisplay}>
                    {/* Forwards */}
                    <div className={styles.pitchRow}>
                        {forwards.map((player, i) => (
                            <div key={i} className={styles.pitchPlayer}>
                                <div className={`${styles.pitchShirt} ${styles.fwd}`}>
                                    {player.name.substring(0, 3).toUpperCase()}
                                    {player.isCaptain && <span className={styles.pitchCaptainBadge}>C</span>}
                                    {player.isViceCaptain && <span className={styles.pitchCaptainBadge}>V</span>}
                                </div>
                                <span className={styles.pitchName}>{player.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Midfielders */}
                    <div className={styles.pitchRow}>
                        {midfielders.map((player, i) => (
                            <div key={i} className={styles.pitchPlayer}>
                                <div className={`${styles.pitchShirt} ${styles.mid}`}>
                                    {player.name.substring(0, 3).toUpperCase()}
                                    {player.isCaptain && <span className={styles.pitchCaptainBadge}>C</span>}
                                    {player.isViceCaptain && <span className={styles.pitchCaptainBadge}>V</span>}
                                </div>
                                <span className={styles.pitchName}>{player.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Defenders */}
                    <div className={styles.pitchRow}>
                        {defenders.map((player, i) => (
                            <div key={i} className={styles.pitchPlayer}>
                                <div className={`${styles.pitchShirt} ${styles.def}`}>
                                    {player.name.substring(0, 3).toUpperCase()}
                                    {player.isCaptain && <span className={styles.pitchCaptainBadge}>C</span>}
                                    {player.isViceCaptain && <span className={styles.pitchCaptainBadge}>V</span>}
                                </div>
                                <span className={styles.pitchName}>{player.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Goalkeeper */}
                    <div className={styles.pitchRow}>
                        {gk.map((player, i) => (
                            <div key={i} className={styles.pitchPlayer}>
                                <div className={`${styles.pitchShirt} ${styles.gk}`}>
                                    {player.name.substring(0, 3).toUpperCase()}
                                </div>
                                <span className={styles.pitchName}>{player.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bench */}
                <div className={styles.benchDisplay}>
                    {user.bench.map((player, i) => (
                        <div key={i} className={styles.benchPlayer}>
                            <div className={`${styles.benchShirt} ${styles[player.position.toLowerCase()]}`}>
                                {player.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className={styles.benchName}>{player.name.split(' ').pop()}</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
