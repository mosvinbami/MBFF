'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSquad, Player, PlayerPosition, LeagueCode } from '@/contexts/SquadContext';
import { usePlayers } from '@/contexts/PlayersContext';
import styles from './page.module.css';

const positions: (PlayerPosition | 'ALL')[] = ['ALL', 'GK', 'DEF', 'MID', 'FWD'];

export default function PlayersPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { squad, addPlayer, canAddPlayer, budgetRemaining, getPositionCount } = useSquad();
    const { players, loading, error, lastUpdated } = usePlayers();

    const fromSquad = searchParams.get('position') !== null;
    const initialPosition = searchParams.get('position') as PlayerPosition | null;

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [positionFilter, setPositionFilter] = useState<PlayerPosition | 'ALL'>(
        initialPosition && positions.includes(initialPosition) ? initialPosition : 'ALL'
    );
    const [leagueFilter, setLeagueFilter] = useState<LeagueCode | 'ALL'>('ALL');
    const [sortBy, setSortBy] = useState<'price' | 'points'>('points');

    useEffect(() => {
        const urlSearch = searchParams.get('search');
        if (urlSearch) setSearch(urlSearch);

        const urlPosition = searchParams.get('position') as PlayerPosition | null;
        if (urlPosition && positions.includes(urlPosition)) setPositionFilter(urlPosition);
    }, [searchParams]);

    const handleAddPlayer = (e: React.MouseEvent, player: Player) => {
        e.stopPropagation();
        const result = addPlayer(player);
        if (result.success && fromSquad) {
            setTimeout(() => router.push('/dashboard/squad'), 500);
        }
    };

    const sortedPlayers = players
        .filter(p => {
            if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
                !p.team.toLowerCase().includes(search.toLowerCase())) return false;
            if (positionFilter !== 'ALL' && p.position !== positionFilter) return false;
            if (leagueFilter !== 'ALL' && p.league !== leagueFilter) return false;
            return true;
        })
        .sort((a, b) => sortBy === 'price' ? b.price - a.price : b.points - a.points)
        .slice(0, 100);

    const squadIds = new Set(squad.map(p => p.id));

    if (loading) return <div className={styles.loading}>Loading players...</div>;

    return (
        <div className={styles.container}>
            {/* Header Stats Pill */}
            <div className={styles.statsPill}>
                <span className={styles.statLabel}>Budget: €{budgetRemaining.toFixed(1)}M</span>
                <span className={styles.statLabel}>Squad: {squad.length}/15</span>
            </div>

            {/* Info Bar */}
            <div className={styles.infoBar}>
                <span className={styles.infoText}>📊 {players.length} players from Understat</span>
                <span className={styles.infoText}>Updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '11:58 AM'}</span>
            </div>

            {/* Position Grid */}
            <div className={styles.posGrid}>
                {['GK', 'DEF', 'MID', 'FWD'].map(pos => (
                    <div key={pos} className={styles.posBox}>
                        <span className={styles.posName}>{pos}</span>
                        <span className={styles.posCount}>
                            {getPositionCount(pos as PlayerPosition)}/
                            {pos === 'GK' ? 2 : pos === 'FWD' ? 3 : 5}
                        </span>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className={styles.filterArea}>
                <div className={styles.tabs}>
                    {positions.map(pos => (
                        <button
                            key={pos}
                            className={`${styles.tab} ${positionFilter === pos ? styles.activeTab : ''}`}
                            onClick={() => setPositionFilter(pos)}
                        >
                            {pos}
                        </button>
                    ))}
                </div>

                <div className={styles.sortDropdown}>
                    <span>SORT BY {sortBy === 'points' ? 'Points' : 'Price'}</span>
                    <span className={styles.chevron}>▼</span>
                </div>
            </div>

            {/* Player List */}
            <div className={styles.playerList}>
                {sortedPlayers.map(player => {
                    const inSquad = squadIds.has(player.id);
                    const playerForSquad: Player = { ...player, league: player.league as LeagueCode, position: player.position as PlayerPosition };
                    const check = canAddPlayer(playerForSquad);
                    const canAdd = check.allowed && !inSquad;

                    return (
                        <div key={player.id} className={styles.playerCard}>
                            {/* Swish Background */}
                            <div className={styles.cardSwish}></div>

                            <div className={styles.cardContent}>
                                {/* Left: Face/Club */}
                                <div className={styles.playerVisual}>
                                    <div className={styles.clubCircle}>
                                        {/* Placeholder Club Logo */}
                                        <div className={styles.clubPlaceholder}>{player.team.substring(0, 2).toUpperCase()}</div>
                                    </div>
                                    <div className={styles.faceContainer}>
                                        {player.image ? (
                                            <img src={player.image} alt={player.name} className={styles.playerFace} />
                                        ) : (
                                            <div className={styles.initials}>{player.name[0]}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Middle: Info */}
                                <div className={styles.playerDetails}>
                                    <h3 className={styles.playerName}>{player.name}</h3>
                                    <p className={styles.playerTeam}>{player.team}</p>
                                    <div className={styles.playerBadges}>
                                        <span className={`${styles.posBadge} ${styles[player.position]}`}>{player.position}</span>
                                        <span className={styles.metaBadge}>{player.league} · Sel {Math.floor(Math.random() * 20)}%</span>
                                    </div>
                                </div>

                                {/* Right: Stats/Action */}
                                <div className={styles.playerActions}>
                                    <div className={styles.mainStat}>
                                        <span className={styles.points}>{player.points}</span>
                                        <span className={styles.price}>€{player.price}M</span>
                                    </div>
                                    <button
                                        className={`${styles.addBtn} ${inSquad ? styles.added : ''}`}
                                        onClick={(e) => canAdd && handleAddPlayer(e, playerForSquad)}
                                        disabled={!canAdd && !inSquad}
                                    >
                                        {inSquad ? '✓' : '+'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
