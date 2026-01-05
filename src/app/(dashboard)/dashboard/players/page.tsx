'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSquad, Player, PlayerPosition, LeagueCode } from '@/contexts/SquadContext';
import { usePlayers } from '@/contexts/PlayersContext';
import { PlayerCardPhoto } from '@/components/PlayerCardPhoto';
import styles from './page.module.css';

const positions: (PlayerPosition | 'ALL')[] = ['ALL', 'GK', 'DEF', 'MID', 'FWD'];
const leagues: (LeagueCode | 'ALL')[] = ['ALL', 'PL', 'LL', 'SA', 'BL', 'FL1'];

function PlayersPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { squad, addPlayer, canAddPlayer, budgetRemaining, getPositionCount } = useSquad();
    const { players, loading, error, lastUpdated } = usePlayers();

    // Check if coming from Squad page (position param present)
    const fromSquad = searchParams.get('position') !== null;
    const initialPosition = searchParams.get('position') as PlayerPosition | null;
    const returnTo = searchParams.get('returnTo'); // 'transfers' or null

    // Initialize filters from URL params
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [positionFilter, setPositionFilter] = useState<PlayerPosition | 'ALL'>(
        initialPosition && positions.includes(initialPosition) ? initialPosition : 'ALL'
    );
    const [leagueFilter, setLeagueFilter] = useState<LeagueCode | 'ALL'>('ALL');
    const [sortBy, setSortBy] = useState<'price' | 'points'>('points');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Update filters when URL params change
    useEffect(() => {
        const urlSearch = searchParams.get('search');
        const urlPosition = searchParams.get('position') as PlayerPosition | null;

        if (urlSearch) {
            setSearch(urlSearch);
        }
        if (urlPosition && positions.includes(urlPosition)) {
            setPositionFilter(urlPosition);
        }
    }, [searchParams]);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAddPlayer = (e: React.MouseEvent, player: Player) => {
        e.preventDefault();
        e.stopPropagation();
        const result = addPlayer(player);
        if (result.success) {
            showToast(`${player.name} added to squad!`, 'success');
            // Navigate back to Squad page (transfers tab if specified)
            if (fromSquad || returnTo) {
                setTimeout(() => {
                    const tab = returnTo === 'transfers' ? '?tab=transfers' : '';
                    router.push(`/dashboard/squad${tab}`);
                }, 500);
            }
        } else {
            showToast(result.error || 'Failed to add player', 'error');
        }
    };

    // Filter and sort players
    const filteredPlayers = players
        .filter(p => {
            if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
                !p.team.toLowerCase().includes(search.toLowerCase())) return false;
            if (positionFilter !== 'ALL' && p.position !== positionFilter) return false;
            if (leagueFilter !== 'ALL' && p.league !== leagueFilter) return false;
            return true;
        })
        .sort((a, b) => sortBy === 'price' ? b.price - a.price : b.points - a.points)
        .slice(0, 100); // Limit for performance

    const squadIds = new Set(squad.map(p => p.id));

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}>⚽</div>
                    <p>Loading players...</p>
                    <p className={styles.loadingHint}>Fetching data from 5 leagues</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <p>⚠️ {error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Toast */}
            {toast && (
                <div className={`${styles.toast} ${styles[toast.type]}`}>
                    {toast.message}
                </div>
            )}

            {/* Header with back button when coming from Squad */}
            {fromSquad && (
                <div className={styles.pageHeader}>
                    <button onClick={() => router.push('/dashboard/squad')} className={styles.backBtn}>
                        ← Back to Squad
                    </button>
                    <span className={styles.selectHint}>
                        Select a {initialPosition} to add
                    </span>
                </div>
            )}

            {/* Budget Bar */}
            <div className={styles.budgetBar}>
                <span>Budget: €{budgetRemaining.toFixed(1)}M</span>
                <span>Squad: {squad.length}/15</span>
            </div>

            {/* Data Source Info */}
            <div className={styles.dataSource}>
                <span>📊 {players.length} players available</span>
                {lastUpdated && (
                    <span className={styles.lastUpdated}>
                        Updated: {new Date(lastUpdated).toLocaleTimeString()}
                    </span>
                )}
            </div>

            {/* Position Quick Stats */}
            <div className={styles.posStats}>
                <div className={`${styles.posStat} ${getPositionCount('GK') >= 2 ? styles.complete : ''}`}>
                    <span>GK</span>
                    <span>{getPositionCount('GK')}/2</span>
                </div>
                <div className={`${styles.posStat} ${getPositionCount('DEF') >= 5 ? styles.complete : ''}`}>
                    <span>DEF</span>
                    <span>{getPositionCount('DEF')}/5</span>
                </div>
                <div className={`${styles.posStat} ${getPositionCount('MID') >= 5 ? styles.complete : ''}`}>
                    <span>MID</span>
                    <span>{getPositionCount('MID')}/5</span>
                </div>
                <div className={`${styles.posStat} ${getPositionCount('FWD') >= 3 ? styles.complete : ''}`}>
                    <span>FWD</span>
                    <span>{getPositionCount('FWD')}/3</span>
                </div>
            </div>

            {/* Search Bar */}
            <div className={styles.searchBar}>
                <input
                    type="text"
                    className="input"
                    placeholder="Search players or clubs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                    <button
                        className={styles.clearSearch}
                        onClick={() => setSearch('')}
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.filterGroup}>
                    <div className={styles.tabs}>
                        {positions.map(pos => (
                            <button
                                key={pos}
                                className={`${styles.tab} ${positionFilter === pos ? styles.active : ''}`}
                                onClick={() => setPositionFilter(pos)}
                            >
                                {pos}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.filterRow}>
                    <div className={styles.leagueTabs}>
                        {leagues.map(lg => (
                            <button
                                key={lg}
                                className={`${styles.leagueTab} ${leagueFilter === lg ? styles.active : ''}`}
                                data-league={lg.toLowerCase()}
                                onClick={() => setLeagueFilter(lg)}
                            >
                                {lg}
                            </button>
                        ))}
                    </div>

                    <div className={styles.sortToggle}>
                        <button
                            className={`${styles.sortBtn} ${sortBy === 'points' ? styles.active : ''}`}
                            onClick={() => setSortBy('points')}
                        >
                            Pts
                        </button>
                        <button
                            className={`${styles.sortBtn} ${sortBy === 'price' ? styles.active : ''}`}
                            onClick={() => setSortBy('price')}
                        >
                            €
                        </button>
                    </div>
                </div>
            </div>

            {/* Player List */}
            <div className={styles.playerList}>
                {filteredPlayers.map(player => {
                    const inSquad = squadIds.has(player.id);
                    const playerForSquad: Player = {
                        id: player.id,
                        name: player.name,
                        team: player.team,
                        league: player.league as LeagueCode,
                        position: player.position as PlayerPosition,
                        price: player.price,
                        points: player.points,
                    };
                    const check = canAddPlayer(playerForSquad);
                    const canAdd = check.allowed && !inSquad;

                    return (
                        <Link
                            key={player.id}
                            href={`/dashboard/player/${player.id}`}
                            className={`${styles.playerCard} ${inSquad ? styles.inSquad : ''}`}
                        >
                            <div className={styles.playerPhoto}>
                                <PlayerCardPhoto
                                    playerName={player.name}
                                    existingPhoto={(player as any).photo}
                                />
                            </div>
                            <div className={styles.playerInfo}>
                                <span className={styles.playerName}>{player.name}</span>
                                <span className={styles.playerTeam}>{player.team}</span>
                            </div>
                            <div className={styles.playerMeta}>
                                <span className={`${styles.badge} ${styles[player.position.toLowerCase()]}`}>
                                    {player.position}
                                </span>
                                <span className={`${styles.leagueBadge} ${styles[player.league.toLowerCase()]}`}>
                                    {player.league}
                                </span>
                            </div>
                            <div className={styles.playerStats}>
                                <span className={styles.statPoints}>{player.points}</span>
                                <span className={styles.statPrice}>€{player.price}M</span>
                            </div>
                            {inSquad ? (
                                <span className={styles.inSquadBadge}>✓</span>
                            ) : (
                                <button
                                    className={`${styles.addBtn} ${!canAdd ? styles.disabled : ''}`}
                                    onClick={(e) => canAdd && handleAddPlayer(e, playerForSquad)}
                                    disabled={!canAdd}
                                    title={!canAdd ? check.reason : 'Add to squad'}
                                >
                                    +
                                </button>
                            )}
                        </Link>
                    );
                })}
            </div>

            {filteredPlayers.length === 0 && !loading && (
                <div className={styles.empty}>
                    <p>No players found</p>
                    {search && <p className={styles.emptyHint}>Try adjusting your search or filters</p>}
                </div>
            )}
        </div>
    );
}

// Wrap with Suspense for useSearchParams
export default function PlayersPage() {
    return (
        <Suspense fallback={
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}>⚽</div>
                    <p>Loading players...</p>
                </div>
            </div>
        }>
            <PlayersPageContent />
        </Suspense>
    );
}
