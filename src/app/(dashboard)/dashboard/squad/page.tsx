'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSquad, PlayerPosition, LeagueCode } from '@/contexts/SquadContext';
import { usePlayers } from '@/contexts/PlayersContext';
import { getFixturesByTeam, getClubByName } from '@/data/fixtures';
import { PlayerCardPhoto } from '@/components/PlayerCardPhoto';
import styles from './page.module.css';

type TabType = 'pick' | 'transfers' | 'points';

const leagueRequirements: { code: LeagueCode; name: string }[] = [
    { code: 'PL', name: 'Premier League' },
    { code: 'LL', name: 'La Liga' },
    { code: 'SA', name: 'Serie A' },
    { code: 'BL', name: 'Bundesliga' },
    { code: 'FL1', name: 'Ligue 1' },
];

function SquadPageContent() {
    const {
        squad,
        budgetRemaining,
        budget,
        removePlayer,
        setStarter,
        swapPlayers,
        setCaptain,
        setViceCaptain,
        formation,
        setFormation,
        getLeagueCount,
        getStarterCount,
        freeTransfers,
        transfersMade,
        transferCost,
        isInitialSquadComplete,
        hasUnsavedChanges,
        confirmTransfers,
        cancelTransfers,
        resetSquad,
        autoPick,
        saveLineup,
        hasLineupChanges,
    } = useSquad();

    const { players } = usePlayers();

    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<TabType>('pick');
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
    const [swapMode, setSwapMode] = useState<string | null>(null); // ID of starter being swapped
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [isConfirmed, setIsConfirmed] = useState(false);

    // Helper to get player photo from PlayersContext (has enriched photo data)
    const getPlayerPhoto = (playerId: string) => {
        const contextPlayer = players.find(p => p.id === playerId);
        return contextPlayer?.photo;
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Read tab from URL params
    useEffect(() => {
        const tabParam = searchParams.get('tab') as TabType | null;
        if (tabParam && ['pick', 'transfers', 'points'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    const totalSpent = budget - budgetRemaining;

    // Get starters and bench players
    const starters = squad.filter(p => p.isStarter);
    const bench = squad.filter(p => !p.isStarter);

    // Get players by position for formation display
    const getStartersByPosition = (position: PlayerPosition) =>
        starters.filter(p => p.position === position);

    // Parse formation (e.g., "4-3-3" -> { def: 4, mid: 3, fwd: 3 })
    const [defCount, midCount, fwdCount] = formation.split('-').map(Number);

    // Calculate gameweek stats from real squad data
    // Use eventPoints (current GW) if available, otherwise 0
    const totalEventPoints = squad.reduce((sum, p) => sum + (p.eventPoints ?? 0), 0);
    const totalSeasonPoints = squad.reduce((sum, p) => sum + p.points, 0);
    const avgPoints = 42; // Would come from API
    const highestPoints = 156; // Would come from API

    // Get next fixture (would come from fixtures API)
    const getNextFixture = (teamName: string) => {
        const fixtures: Record<string, string> = {
            'Manchester City': 'CHE (H)',
            'Arsenal': 'BOU (A)',
            'Liverpool': 'MUN (H)',
            'Chelsea': 'ARS (A)',
            'Real Madrid': 'ATM (H)',
            'Barcelona': 'SEV (A)',
            'Bayern Munich': 'DOR (H)',
            'Inter Milan': 'JUV (A)',
            'Paris Saint-Germain': 'LYO (H)',
        };
        return fixtures[teamName] || 'TBD';
    };

    const handlePlayerClick = (playerId: string) => {
        setSelectedPlayer(selectedPlayer === playerId ? null : playerId);
    };

    const renderPlayerCard = (player: typeof squad[0], showPoints = false, showPrice = false, showFixture = false) => {
        const isSelected = selectedPlayer === player.id;
        const fixture = getNextFixture(player.team);

        return (
            <div
                key={player.id}
                className={`${styles.playerCard} ${isSelected ? styles.selected : ''} ${player.isCaptain ? styles.captain : ''} ${player.isViceCaptain ? styles.viceCaptain : ''}`}
                onClick={() => handlePlayerClick(player.id)}
            >
                {/* Captain/VC badge */}
                {player.isCaptain && <span className={styles.captainBadge}>C</span>}
                {player.isViceCaptain && <span className={styles.vcBadge}>V</span>}

                {/* Jersey placeholder */}
                {/* Jersey placeholder */}
                <div className={styles.jersey}>
                    <PlayerCardPhoto
                        playerName={player.name}
                        existingPhoto={player.photo || getPlayerPhoto(player.id)}
                        className={styles.jerseyPhoto}
                    />
                </div>

                {/* Player name */}
                <div className={styles.playerName}>{player.name.split(' ').pop()}</div>

                {/* Bottom info based on tab */}
                <div className={styles.playerInfo}>
                    {showPoints && <span className={styles.pointsBadge}>{player.eventPoints ?? 0}</span>}
                    {showPrice && <span className={styles.priceBadge}>€{player.price}m</span>}
                    {showFixture && <span className={styles.fixtureBadge}>{fixture}</span>}
                </div>

                {/* Remove button for transfers tab */}
                {activeTab === 'transfers' && (
                    <button
                        className={styles.removeBtn}
                        onClick={(e) => { e.stopPropagation(); removePlayer(player.id); }}
                    >
                        ×
                    </button>
                )}
            </div>
        );
    };

    // Render the player action menu as a modal
    const renderPlayerMenu = () => {
        if (!selectedPlayer) return null;

        const player = squad.find(p => p.id === selectedPlayer);
        if (!player) return null;

        // Get same-position players for swap options
        const samePositionBench = bench.filter(p => p.position === player.position && p.id !== player.id);
        const samePositionStarters = starters.filter(p => p.position === player.position && p.id !== player.id);

        // Position full names
        const positionNames: Record<string, string> = {
            GK: 'Goalkeeper',
            DEF: 'Defender',
            MID: 'Midfielder',
            FWD: 'Forward'
        };

        // Real data integration
        const club = getClubByName(player.team);
        const teamFixtures = club ? getFixturesByTeam(club.name) : [];

        // Form: Last 3 COMPLETED matches
        const pastMatches = teamFixtures
            .filter(f => f.status === 'completed')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3)
            .reverse();

        const formData = pastMatches.map(f => {
            const isHome = f.homeTeam === player.team;
            const oppName = isHome ? f.awayTeam : f.homeTeam;
            const oppClub = getClubByName(oppName);
            const oppShort = oppClub ? oppClub.shortName : oppName.substring(0, 3).toUpperCase();

            // Simulate points based on result (real points data not available per match yet)
            const teamScore = isHome ? f.homeScore : f.awayScore;
            const oppScore = isHome ? f.awayScore : f.homeScore;
            let p = 2; // base
            if ((teamScore || 0) > (oppScore || 0)) p = 6 + Math.floor(Math.random() * 5); // Win
            else if (teamScore === oppScore) p = 3 + Math.floor(Math.random() * 2); // Draw
            else p = 1 + Math.floor(Math.random() * 2); // Loss

            return {
                gw: `GW${f.gameweek}`,
                pts: p,
                opp: `${oppShort} (${isHome ? 'H' : 'A'})`
            };
        });

        // Fixtures: Next 3 UPCOMING matches
        const upcomingMatches = teamFixtures
            .filter(f => f.status === 'upcoming' || f.status === 'live')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 3);

        const fixtures = upcomingMatches.map(f => {
            const isHome = f.homeTeam === player.team;
            const oppName = isHome ? f.awayTeam : f.homeTeam;
            const oppClub = getClubByName(oppName);
            const oppShort = oppClub ? oppClub.shortName : oppName.substring(0, 3).toUpperCase();
            // Random difficulty 1-5 for now
            const diff = Math.floor(Math.random() * 5) + 1;

            return {
                gw: `GW${f.gameweek}`,
                opp: `${oppShort} (${isHome ? 'H' : 'A'})`,
                diff
            };
        });

        // For Pick Team tab - show detailed modal
        if (activeTab === 'pick') {
            return (
                <>
                    <div className={styles.menuOverlay} onClick={() => setSelectedPlayer(null)} />
                    <div className={styles.playerDetailModal}>
                        {/* Player Header with gradient */}
                        <div className={styles.playerDetailHeader}>
                            <div className={styles.playerDetailPhoto}>
                                <PlayerCardPhoto
                                    playerName={player.name}
                                    existingPhoto={player.photo || getPlayerPhoto(player.id)}
                                    className={styles.modalPhoto}
                                />
                            </div>
                            <div className={styles.playerDetailInfo}>
                                <span className={styles.playerPosition}>{positionNames[player.position]}</span>
                                <span className={styles.playerFirstName}>{player.name.split(' ')[0]}</span>
                                <span className={styles.playerLastName}>{player.name.split(' ').slice(1).join(' ') || player.name}</span>
                                <span className={styles.playerTeam}>{player.team}</span>
                            </div>
                            <button className={styles.modalClose} onClick={() => setSelectedPlayer(null)}>×</button>
                        </div>

                        {/* Stats Row */}
                        <div className={styles.playerStats}>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Price</span>
                                <span className={styles.statValue}>€{player.price}m</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Pts/Match</span>
                                <span className={styles.statValue}>{(player.points / 19).toFixed(1)}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Form</span>
                                <span className={styles.statValue}>{(player.points / 20).toFixed(1)}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Total Pts</span>
                                <span className={styles.statValue}>{player.points}</span>
                            </div>
                        </div>

                        {/* Form Section */}
                        <div className={styles.formSection}>
                            <h4>Form</h4>
                            <div className={styles.formGrid}>
                                {formData.map((f, i) => (
                                    <div key={i} className={styles.formItem}>
                                        <span className={styles.formGw}>{f.gw}</span>
                                        <span className={styles.formOpp}>{f.opp}</span>
                                        <span className={styles.formPts}>{f.pts} pts</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Fixtures Section */}
                        <div className={styles.fixturesSection}>
                            <h4>Fixtures</h4>
                            <div className={styles.fixturesGrid}>
                                {fixtures.map((f, i) => (
                                    <div key={i} className={styles.fixtureItem}>
                                        <span className={styles.fixtureGw}>{f.gw}</span>
                                        <span className={styles.fixtureOpp}>{f.opp}</span>
                                        <span className={`${styles.fixtureDiff} ${styles[`diff${f.diff}`]}`}>{f.diff}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Captain Options */}
                        <div className={styles.captainOptions}>
                            <label className={styles.captainCheckbox}>
                                <input
                                    type="checkbox"
                                    checked={player.isCaptain}
                                    onChange={() => setCaptain(player.id)}
                                />
                                <span>Captain</span>
                            </label>
                            <label className={styles.captainCheckbox}>
                                <input
                                    type="checkbox"
                                    checked={player.isViceCaptain}
                                    onChange={() => setViceCaptain(player.id)}
                                />
                                <span>Vice Captain</span>
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className={styles.modalActions}>
                            <Link href={`/dashboard/player/${player.id}`} className={styles.modalSecondaryBtn}>
                                Full Profile
                            </Link>
                            {player.isStarter ? (
                                // Check if bench is full (4 players)
                                bench.length >= 4 ? (
                                    swapMode === player.id ? (
                                        // Show list of bench players to swap with
                                        <div className={styles.swapList}>
                                            <div className={styles.swapListTitle}>Select bench player to swap:</div>
                                            {bench
                                                .filter(bp => bp.position === player.position)
                                                .map(bp => (
                                                    <button
                                                        key={bp.id}
                                                        className={styles.swapListItem}
                                                        onClick={() => {
                                                            // Use atomic swap function
                                                            swapPlayers(player.id, bp.id);
                                                            setSwapMode(null);
                                                            setSelectedPlayer(null);
                                                            showToast(`Swapped ${player.name} with ${bp.name}`);
                                                        }}
                                                    >
                                                        <span className={styles.swapPlayerName}>{bp.name}</span>
                                                        <span className={styles.swapPlayerTeam}>{bp.team}</span>
                                                    </button>
                                                ))}
                                            {bench.filter(bp => bp.position === player.position).length === 0 && (
                                                <div className={styles.noSwapPlayers}>No {player.position} on bench</div>
                                            )}
                                            <button
                                                className={styles.swapCancelBtn}
                                                onClick={() => setSwapMode(null)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            className={styles.modalPrimaryBtn}
                                            onClick={() => setSwapMode(player.id)}
                                        >
                                            Swap with Bench
                                        </button>
                                    )
                                ) : (
                                    <button
                                        className={styles.modalPrimaryBtn}
                                        onClick={() => { setStarter(player.id, false); setSelectedPlayer(null); }}
                                    >
                                        Move to Bench
                                    </button>
                                )
                            ) : (
                                <button
                                    className={styles.modalPrimaryBtn}
                                    onClick={() => { setStarter(player.id, true); setSelectedPlayer(null); }}
                                >
                                    Add to Starting XI
                                </button>
                            )}
                        </div>
                    </div>
                </>
            );
        }

        // For Transfers tab - keep existing menu
        return (
            <>
                <div className={styles.menuOverlay} onClick={() => setSelectedPlayer(null)} />
                <div className={styles.playerMenu}>
                    <div className={styles.menuHeader}>
                        <span className={styles.menuPlayerName}>{player.name}</span>
                        <button className={styles.menuClose} onClick={() => setSelectedPlayer(null)}>×</button>
                    </div>

                    <Link href={`/dashboard/players?position=${player.position}&replace=${player.id}&returnTo=transfers`} className={styles.menuLink}>
                        🔄 Find Replacement
                    </Link>

                    {/* Swap with bench players */}
                    {player.isStarter && samePositionBench.length > 0 && (
                        <div className={styles.swapSection}>
                            <span className={styles.swapLabel}>Swap with Bench</span>
                            {samePositionBench.map(benchPlayer => (
                                <button
                                    key={benchPlayer.id}
                                    onClick={() => {
                                        setStarter(player.id, false);
                                        setStarter(benchPlayer.id, true);
                                        setSelectedPlayer(null);
                                    }}
                                >
                                    ↔️ {benchPlayer.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Swap with starters if on bench */}
                    {!player.isStarter && samePositionStarters.length > 0 && (
                        <div className={styles.swapSection}>
                            <span className={styles.swapLabel}>Swap with Starter</span>
                            {samePositionStarters.map(starter => (
                                <button
                                    key={starter.id}
                                    onClick={() => {
                                        setStarter(starter.id, false);
                                        setStarter(player.id, true);
                                        setSelectedPlayer(null);
                                    }}
                                >
                                    ↔️ {starter.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Remove option ONLY in Transfers tab */}
                    <button onClick={() => { removePlayer(player.id); setSelectedPlayer(null); }} className={styles.dangerBtn}>
                        🗑️ Remove from Squad
                    </button>
                </div>
            </>
        );
    };

    const renderEmptySlot = (position: PlayerPosition) => {
        // Only allow adding players from Transfers tab
        if (activeTab === 'transfers') {
            return (
                <Link href={`/dashboard/players?position=${position}&returnTo=transfers`} className={styles.emptySlot}>
                    <span className={styles.emptyIcon}>+</span>
                    <span className={styles.emptyLabel}>{position}</span>
                </Link>
            );
        }
        // In Pick Team/Points tab, show as non-clickable placeholder
        return (
            <div className={`${styles.emptySlot} ${styles.emptySlotDisabled}`}>
                <span className={styles.emptyIcon}>+</span>
                <span className={styles.emptyLabel}>{position}</span>
            </div>
        );
    };

    const renderPositionRow = (position: PlayerPosition, count: number) => {
        const positionStarters = getStartersByPosition(position);
        const emptyCount = count - positionStarters.length;

        return (
            <div className={styles.positionRow}>
                {positionStarters.map(p => renderPlayerCard(
                    p,
                    activeTab === 'points',
                    activeTab === 'transfers',
                    activeTab === 'pick'
                ))}
                {emptyCount > 0 && Array.from({ length: emptyCount }).map((_, i) => (
                    <div key={`empty-${position}-${i}`}>
                        {renderEmptySlot(position)}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className={styles.container}>
            {/* Budget Card - Always visible */}
            <section className={styles.budgetCard}>
                <div className={styles.budgetItem}>
                    <span className={styles.budgetValue}>€{budgetRemaining.toFixed(1)}M</span>
                    <span className={styles.budgetLabel}>Budget</span>
                </div>
                <div className={styles.budgetItem}>
                    <span className={styles.budgetValue}>{squad.length}/15</span>
                    <span className={styles.budgetLabel}>Players</span>
                </div>
                <div className={styles.budgetItem}>
                    <span className={styles.budgetValue}>€{totalSpent.toFixed(1)}M</span>
                    <span className={styles.budgetLabel}>Spent</span>
                </div>
            </section>

            {/* League Requirement */}
            <section className={styles.leagueSection}>
                <h2 className={styles.sectionTitle}>League Requirement</h2>
                <p className={styles.sectionHint}>Must have ≥1 player from each league</p>
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

            {/* Back Button */}
            <Link href="/dashboard" className={styles.backButton}>
                ← Back to Dashboard
            </Link>

            {/* Tab Navigation */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'pick' ? styles.active : ''}`}
                    onClick={() => setActiveTab('pick')}
                >
                    Pick Team
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'transfers' ? styles.active : ''}`}
                    onClick={() => setActiveTab('transfers')}
                >
                    Transfers
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'points' ? styles.active : ''}`}
                    onClick={() => setActiveTab('points')}
                >
                    Points
                </button>
            </div>

            {/* Tab-specific header */}
            {activeTab === 'pick' && (
                <div className={styles.header}>
                    <div className={styles.headerInfo}>
                        <span className={styles.headerLabel}>Gameweek 20</span>
                        <span className={styles.headerDeadline}>Deadline: Sun 12:00</span>
                    </div>
                    <select
                        className={styles.formationSelect}
                        value={formation}
                        onChange={(e) => setFormation(e.target.value)}
                        title="Select formation"
                    >
                        <option value="4-4-2">4-4-2</option>
                        <option value="4-3-3">4-3-3</option>
                        <option value="3-5-2">3-5-2</option>
                        <option value="3-4-3">3-4-3</option>
                        <option value="4-5-1">4-5-1</option>
                        <option value="5-3-2">5-3-2</option>
                        <option value="5-4-1">5-4-1</option>
                    </select>
                </div>
            )}

            {activeTab === 'transfers' && (
                <div className={styles.header}>
                    <div className={styles.statBox}>
                        <span className={styles.statValue}>{freeTransfers}</span>
                        <span className={styles.statLabel}>Free Transfers</span>
                    </div>
                    <div className={styles.statBox}>
                        <span className={styles.statValue}>{transfersMade}</span>
                        <span className={styles.statLabel}>Made</span>
                    </div>
                    <div className={transferCost > 0 ? styles.statBoxDanger : styles.statBox}>
                        <span className={styles.statValue}>{transferCost} pts</span>
                        <span className={styles.statLabel}>Cost</span>
                    </div>
                </div>
            )}

            {activeTab === 'points' && (
                <div className={styles.header}>
                    <div className={styles.statBox}>
                        <span className={styles.statValue}>{avgPoints}</span>
                        <span className={styles.statLabel}>Average</span>
                    </div>
                    <div className={styles.statBoxHighlight}>
                        <span className={styles.statValue}>{totalEventPoints}</span>
                        <span className={styles.statLabel}>GW Points</span>
                    </div>
                    <div className={styles.statBox}>
                        <span className={styles.statValue}>{highestPoints}</span>
                        <span className={styles.statLabel}>Highest</span>
                    </div>
                </div>
            )}

            {/* Pitch View */}
            <div className={styles.pitch}>
                {/* Field markings */}
                <div className={styles.pitchOverlay}>
                    <div className={styles.penaltyArea}></div>
                    <div className={styles.centerCircle}></div>
                </div>

                {/* Formation rows */}
                <div className={styles.formationGrid}>
                    {/* Forwards */}
                    {renderPositionRow('FWD', fwdCount)}

                    {/* Midfielders */}
                    {renderPositionRow('MID', midCount)}

                    {/* Defenders */}
                    {renderPositionRow('DEF', defCount)}

                    {/* Goalkeeper */}
                    {renderPositionRow('GK', 1)}
                </div>
            </div>

            {/* Bench Section */}
            <div className={styles.benchSection}>
                <h3 className={styles.benchTitle}>Substitutes</h3>
                <div className={styles.benchRow}>
                    {bench.map(p => renderPlayerCard(
                        p,
                        activeTab === 'points',
                        activeTab === 'transfers',
                        activeTab === 'pick'
                    ))}
                    {bench.length < 4 && Array.from({ length: 4 - bench.length }).map((_, i) => (
                        activeTab === 'transfers' ? (
                            <Link key={`bench-empty-${i}`} href="/dashboard/players?returnTo=transfers" className={styles.emptySlot}>
                                <span className={styles.emptyIcon}>+</span>
                            </Link>
                        ) : (
                            <div key={`bench-empty-${i}`} className={`${styles.emptySlot} ${styles.emptySlotDisabled}`}>
                                <span className={styles.emptyIcon}>+</span>
                            </div>
                        )
                    ))}
                </div>
            </div>

            {/* Tab-specific bottom actions */}
            {activeTab === 'pick' && (
                <div className={styles.actions}>
                    <button
                        className={styles.primaryBtn}
                        onClick={() => {
                            saveLineup();
                            showToast('✅ Team lineup saved!', 'success');
                        }}
                        disabled={!hasLineupChanges}
                    >
                        {hasLineupChanges ? 'Save Team' : 'Team Saved'}
                    </button>
                </div>
            )}

            {activeTab === 'transfers' && (
                <div className={styles.actions}>
                    <button
                        className={styles.secondaryBtn}
                        onClick={() => autoPick(players)}
                    >
                        Auto Pick
                    </button>
                    <button
                        className={styles.secondaryBtn}
                        onClick={resetSquad}
                    >
                        Reset
                    </button>
                    <button
                        className={`${styles.primaryBtn} ${isConfirmed ? styles.success : ''}`}
                        onClick={() => {
                            const cost = transferCost;
                            confirmTransfers();
                            setIsConfirmed(true);
                            setTimeout(() => setIsConfirmed(false), 2000);

                            if (cost > 0) {
                                showToast(`✅ Transfers confirmed! -${cost} pts deducted`, 'success');
                            } else {
                                showToast('🎉 Transfers confirmed!', 'success');
                            }
                        }}
                        disabled={!isConfirmed && transfersMade === 0}
                    >
                        {isConfirmed
                            ? '✅ Changes Saved!'
                            : (transferCost > 0
                                ? `Make Transfers (-${transferCost} pts)`
                                : 'Make Transfers'
                            )
                        }
                    </button>
                </div>
            )}

            {activeTab === 'points' && (
                <div className={styles.actions}>
                    <button className={styles.primaryBtn}>⭐ Team of the Week</button>
                </div>
            )}

            {/* Player Action Menu Modal */}
            {renderPlayerMenu()}

            {/* Toast Notification */}
            {toast && (
                <div className={`${styles.toast} ${styles[toast.type]}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}

// Wrap with Suspense for useSearchParams
export default function SquadPage() {
    return (
        <Suspense fallback={
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}>⚽</div>
                    <p>Loading squad...</p>
                </div>
            </div>
        }>
            <SquadPageContent />
        </Suspense>
    );
}
