'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSquad, PlayerPosition, Player } from '@/contexts/SquadContext';
import styles from './page.module.css';

const formations = ['3-4-3', '3-5-2', '4-3-3', '4-4-2', '4-5-1', '5-3-2', '5-4-1'];

export default function LineupPage() {
    const {
        squad,
        formation,
        setFormation,
        setStarter,
        setCaptain,
        setViceCaptain,
        setBenchOrder
    } = useSquad();

    const [showFormations, setShowFormations] = useState(false);
    const [selectingPosition, setSelectingPosition] = useState<PlayerPosition | null>(null);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [hasAutoFilled, setHasAutoFilled] = useState(false);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const [def, mid, fwd] = formation.split('-').map(Number);

    // Auto-fill starting XI based on formation when squad is complete
    const autoFillLineup = useCallback(() => {
        const starters = squad.filter(p => p.isStarter);

        // Only auto-fill if squad has players and no starters are set yet
        if (squad.length >= 11 && starters.length === 0 && !hasAutoFilled) {
            const gks = squad.filter(p => p.position === 'GK');
            const defs = squad.filter(p => p.position === 'DEF');
            const mids = squad.filter(p => p.position === 'MID');
            const fwds = squad.filter(p => p.position === 'FWD');

            // Select players based on formation (highest points first)
            const sortByPoints = (a: any, b: any) => (b.points || 0) - (a.points || 0);

            const selectedGK = gks.sort(sortByPoints).slice(0, 1);
            const selectedDEF = defs.sort(sortByPoints).slice(0, def);
            const selectedMID = mids.sort(sortByPoints).slice(0, mid);
            const selectedFWD = fwds.sort(sortByPoints).slice(0, fwd);

            // Set all selected players as starters
            const allSelected = [...selectedGK, ...selectedDEF, ...selectedMID, ...selectedFWD];

            allSelected.forEach(player => {
                setStarter(player.id, true);
            });

            setHasAutoFilled(true);
            showToast('Lineup auto-filled! Tap players to adjust.', 'success');
        }
    }, [squad, formation, def, mid, fwd, setStarter, hasAutoFilled]);

    // Run auto-fill when squad changes
    useEffect(() => {
        autoFillLineup();
    }, [autoFillLineup]);

    // Reset auto-fill flag when formation changes
    useEffect(() => {
        // When formation changes, re-calculate the lineup
        const starters = squad.filter(p => p.isStarter);
        if (starters.length > 0) {
            // Clear all starters first
            starters.forEach(p => setStarter(p.id, false));
            setHasAutoFilled(false);
        }
    }, [formation]);

    const starters = squad.filter(p => p.isStarter);
    const bench = squad.filter(p => !p.isStarter);

    const startersByPosition = (pos: PlayerPosition) => starters.filter(p => p.position === pos);
    const availableForPosition = (pos: PlayerPosition) => squad.filter(p => p.position === pos && !p.isStarter);

    const handleAddStarter = (playerId: string) => {
        const result = setStarter(playerId, true);
        if (!result.success) {
            showToast(result.error || 'Cannot add starter', 'error');
        }
        setSelectingPosition(null);
    };

    const handleRemoveStarter = (playerId: string) => {
        setStarter(playerId, false);
        setSelectedPlayer(null);
    };

    const handleSetCaptain = (playerId: string) => {
        setCaptain(playerId);
        showToast('Captain set! Gets 2x points each week', 'success');
        setSelectedPlayer(null);
    };

    const handleSetViceCaptain = (playerId: string) => {
        setViceCaptain(playerId);
        showToast('Vice Captain set! Gets +1 bonus point each week', 'success');
        setSelectedPlayer(null);
    };

    const handlePlayerClick = (player: Player) => {
        setSelectedPlayer(player);
    };

    const captain = squad.find(p => p.isCaptain);
    const viceCaptain = squad.find(p => p.isViceCaptain);

    return (
        <div className={styles.container}>
            {/* Toast */}
            {toast && (
                <div className={`${styles.toast} ${styles[toast.type]}`}>
                    {toast.message}
                </div>
            )}

            {/* Deadline Banner */}
            <div className={styles.deadline}>
                <span className={styles.deadlineIcon}>⏰</span>
                <span>Deadline: Sunday 12:00 UTC</span>
            </div>

            {/* Formation Selector */}
            <button
                className={styles.formationBtn}
                onClick={() => setShowFormations(!showFormations)}
            >
                <span>Formation</span>
                <span className={styles.formationValue}>{formation}</span>
            </button>

            {showFormations && (
                <div className={styles.formationPicker}>
                    {formations.map(f => (
                        <button
                            key={f}
                            className={`${styles.formationOption} ${f === formation ? styles.active : ''}`}
                            onClick={() => {
                                setFormation(f);
                                setShowFormations(false);
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            )}

            {/* Captain/Vice Captain Status */}
            <div className={styles.captainStatus}>
                <div className={styles.captainInfo}>
                    <span className={styles.captainIcon}>👑</span>
                    <span>{captain ? captain.name : 'No Captain'}</span>
                    <span className={styles.captainBonus}>2x pts</span>
                </div>
                <div className={styles.vcInfo}>
                    <span className={styles.vcIcon}>⭐</span>
                    <span>{viceCaptain ? viceCaptain.name : 'No Vice Captain'}</span>
                    <span className={styles.vcBonus}>+1 pt</span>
                </div>
            </div>

            {/* Starter Count */}
            <div className={styles.starterCount}>
                <span>Starting XI: {starters.length}/11</span>
            </div>

            {/* Squad Check */}
            {squad.length < 15 && (
                <div className={styles.squadWarning}>
                    <span>⚠️ Complete your squad first ({squad.length}/15 players)</span>
                    <Link href="/dashboard/squad" className={styles.squadLink}>Go to Squad →</Link>
                </div>
            )}

            {/* Pitch View */}
            <div className={styles.pitch}>
                {/* Forwards */}
                <div className={styles.pitchRow}>
                    {Array.from({ length: fwd }).map((_, i) => {
                        const player = startersByPosition('FWD')[i];
                        return (
                            <div key={`fwd-${i}`} className={styles.playerSlot}>
                                {player ? (
                                    <div
                                        className={`${styles.playerShirt} ${styles.fwd} ${styles.filled}`}
                                        onClick={() => handlePlayerClick(player)}
                                    >
                                        <span className={styles.shirtName}>{player.name.split(' ').pop()}</span>
                                        {player.isCaptain && <span className={styles.captainBadge}>C</span>}
                                        {player.isViceCaptain && <span className={styles.vcBadge}>V</span>}
                                    </div>
                                ) : (
                                    <div
                                        className={`${styles.playerShirt} ${styles.fwd}`}
                                        onClick={() => setSelectingPosition('FWD')}
                                    >
                                        <span>+</span>
                                    </div>
                                )}
                                <span className={styles.playerLabel}>{player?.league || 'FWD'}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Midfielders */}
                <div className={styles.pitchRow}>
                    {Array.from({ length: mid }).map((_, i) => {
                        const player = startersByPosition('MID')[i];
                        return (
                            <div key={`mid-${i}`} className={styles.playerSlot}>
                                {player ? (
                                    <div
                                        className={`${styles.playerShirt} ${styles.mid} ${styles.filled}`}
                                        onClick={() => handlePlayerClick(player)}
                                    >
                                        <span className={styles.shirtName}>{player.name.split(' ').pop()}</span>
                                        {player.isCaptain && <span className={styles.captainBadge}>C</span>}
                                        {player.isViceCaptain && <span className={styles.vcBadge}>V</span>}
                                    </div>
                                ) : (
                                    <div
                                        className={`${styles.playerShirt} ${styles.mid}`}
                                        onClick={() => setSelectingPosition('MID')}
                                    >
                                        <span>+</span>
                                    </div>
                                )}
                                <span className={styles.playerLabel}>{player?.league || 'MID'}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Defenders */}
                <div className={styles.pitchRow}>
                    {Array.from({ length: def }).map((_, i) => {
                        const player = startersByPosition('DEF')[i];
                        return (
                            <div key={`def-${i}`} className={styles.playerSlot}>
                                {player ? (
                                    <div
                                        className={`${styles.playerShirt} ${styles.def} ${styles.filled}`}
                                        onClick={() => handlePlayerClick(player)}
                                    >
                                        <span className={styles.shirtName}>{player.name.split(' ').pop()}</span>
                                        {player.isCaptain && <span className={styles.captainBadge}>C</span>}
                                        {player.isViceCaptain && <span className={styles.vcBadge}>V</span>}
                                    </div>
                                ) : (
                                    <div
                                        className={`${styles.playerShirt} ${styles.def}`}
                                        onClick={() => setSelectingPosition('DEF')}
                                    >
                                        <span>+</span>
                                    </div>
                                )}
                                <span className={styles.playerLabel}>{player?.league || 'DEF'}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Goalkeeper */}
                <div className={styles.pitchRow}>
                    {(() => {
                        const player = startersByPosition('GK')[0];
                        return (
                            <div className={styles.playerSlot}>
                                {player ? (
                                    <div
                                        className={`${styles.playerShirt} ${styles.gk} ${styles.filled}`}
                                        onClick={() => handlePlayerClick(player)}
                                    >
                                        <span className={styles.shirtName}>{player.name.split(' ').pop()}</span>
                                    </div>
                                ) : (
                                    <div
                                        className={`${styles.playerShirt} ${styles.gk}`}
                                        onClick={() => setSelectingPosition('GK')}
                                    >
                                        <span>+</span>
                                    </div>
                                )}
                                <span className={styles.playerLabel}>{player?.league || 'GK'}</span>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Player Options Modal */}
            {selectedPlayer && (
                <div className={styles.modal} onClick={() => setSelectedPlayer(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{selectedPlayer.name}</h3>
                            <button onClick={() => setSelectedPlayer(null)}>×</button>
                        </div>
                        <div className={styles.playerOptions}>
                            <button
                                className={`${styles.optionBtn} ${styles.captainOption}`}
                                onClick={() => handleSetCaptain(selectedPlayer.id)}
                                disabled={selectedPlayer.isCaptain}
                            >
                                <span className={styles.optionIcon}>👑</span>
                                <span className={styles.optionText}>
                                    {selectedPlayer.isCaptain ? 'Current Captain' : 'Make Captain'}
                                </span>
                                <span className={styles.optionBonus}>2x points</span>
                            </button>
                            <button
                                className={`${styles.optionBtn} ${styles.vcOption}`}
                                onClick={() => handleSetViceCaptain(selectedPlayer.id)}
                                disabled={selectedPlayer.isViceCaptain}
                            >
                                <span className={styles.optionIcon}>⭐</span>
                                <span className={styles.optionText}>
                                    {selectedPlayer.isViceCaptain ? 'Current Vice Captain' : 'Make Vice Captain'}
                                </span>
                                <span className={styles.optionBonus}>+1 point</span>
                            </button>
                            <button
                                className={`${styles.optionBtn} ${styles.removeOption}`}
                                onClick={() => handleRemoveStarter(selectedPlayer.id)}
                            >
                                <span className={styles.optionIcon}>🔄</span>
                                <span className={styles.optionText}>Move to Bench</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Player Selector Modal */}
            {selectingPosition && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>Select {selectingPosition}</h3>
                            <button onClick={() => setSelectingPosition(null)}>×</button>
                        </div>
                        <div className={styles.modalList}>
                            {availableForPosition(selectingPosition).length === 0 ? (
                                <p className={styles.noPlayers}>No available {selectingPosition}s on bench</p>
                            ) : (
                                availableForPosition(selectingPosition).map(player => (
                                    <button
                                        key={player.id}
                                        className={styles.modalPlayer}
                                        onClick={() => handleAddStarter(player.id)}
                                    >
                                        <span className={styles.modalPlayerName}>{player.name}</span>
                                        <span className={styles.modalPlayerTeam}>{player.team}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Bench Section */}
            <div className={styles.benchSection}>
                <h3 className={styles.benchTitle}>Bench ({bench.length}/4)</h3>
                <div className={styles.benchGrid}>
                    {bench.slice(0, 4).map((player, i) => (
                        <div key={player.id} className={styles.benchSlot}>
                            <div
                                className={`${styles.benchShirt} ${styles[player.position.toLowerCase()]}`}
                                onClick={() => {
                                    const result = setStarter(player.id, true);
                                    if (!result.success) showToast(result.error || 'Cannot add', 'error');
                                }}
                            >
                                <span className={styles.benchInitial}>{player.name[0]}</span>
                            </div>
                            <span className={styles.benchLabel}>{player.name.split(' ').pop()}</span>
                        </div>
                    ))}
                    {Array.from({ length: Math.max(0, 4 - bench.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className={styles.benchSlot}>
                            <div className={styles.benchEmpty}>-</div>
                            <span className={styles.benchLabel}>Empty</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Card */}
            <div className={styles.infoCard}>
                <h4>💡 Tips</h4>
                <ul>
                    <li>Tap a player to see options</li>
                    <li>Captain: Gets 2x their points each week</li>
                    <li>Vice Captain: Gets +1 bonus point each week</li>
                    <li>Tap bench player to move to starting XI</li>
                </ul>
            </div>
        </div>
    );
}
