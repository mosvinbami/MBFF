'use client';

import { useState } from 'react';
import { useSquad, Player, PlayerPosition } from '@/contexts/SquadContext';
import styles from './page.module.css';

// All available players for transfer (same as in players page)
const allPlayers: Player[] = [
    { id: '1', name: 'Erling Haaland', team: 'Manchester City', league: 'PL', position: 'FWD', price: 14.0, points: 156 },
    { id: '2', name: 'Kylian Mbappé', team: 'Real Madrid', league: 'LL', position: 'FWD', price: 13.5, points: 142 },
    { id: '3', name: 'Lautaro Martínez', team: 'Inter Milan', league: 'SA', position: 'FWD', price: 11.0, points: 128 },
    { id: '4', name: 'Harry Kane', team: 'Bayern Munich', league: 'BL', position: 'FWD', price: 12.5, points: 145 },
    { id: '5', name: 'Bradley Barcola', team: 'Paris Saint-Germain', league: 'FL1', position: 'FWD', price: 9.5, points: 98 },
    { id: '6', name: 'Bukayo Saka', team: 'Arsenal', league: 'PL', position: 'MID', price: 10.5, points: 134 },
    { id: '7', name: 'Vinícius Jr.', team: 'Real Madrid', league: 'LL', position: 'MID', price: 11.5, points: 138 },
    { id: '8', name: 'Nicolò Barella', team: 'Inter Milan', league: 'SA', position: 'MID', price: 8.5, points: 112 },
    { id: '9', name: 'Jamal Musiala', team: 'Bayern Munich', league: 'BL', position: 'MID', price: 9.5, points: 118 },
    { id: '10', name: 'Ousmane Dembélé', team: 'Paris Saint-Germain', league: 'FL1', position: 'MID', price: 9.0, points: 105 },
    { id: '11', name: 'Virgil van Dijk', team: 'Liverpool', league: 'PL', position: 'DEF', price: 7.0, points: 98 },
    { id: '12', name: 'Antonio Rüdiger', team: 'Real Madrid', league: 'LL', position: 'DEF', price: 6.0, points: 85 },
    { id: '13', name: 'Alessandro Bastoni', team: 'Inter Milan', league: 'SA', position: 'DEF', price: 6.5, points: 92 },
    { id: '14', name: 'Dayot Upamecano', team: 'Bayern Munich', league: 'BL', position: 'DEF', price: 5.5, points: 78 },
    { id: '15', name: 'Achraf Hakimi', team: 'Paris Saint-Germain', league: 'FL1', position: 'DEF', price: 6.0, points: 88 },
    { id: '16', name: 'Alisson Becker', team: 'Liverpool', league: 'PL', position: 'GK', price: 6.0, points: 95 },
    { id: '17', name: 'Thibaut Courtois', team: 'Real Madrid', league: 'LL', position: 'GK', price: 6.0, points: 92 },
    { id: '18', name: 'Mike Maignan', team: 'AC Milan', league: 'SA', position: 'GK', price: 5.5, points: 88 },
    { id: '19', name: 'Manuel Neuer', team: 'Bayern Munich', league: 'BL', position: 'GK', price: 5.5, points: 82 },
    { id: '20', name: 'Gianluigi Donnarumma', team: 'Paris Saint-Germain', league: 'FL1', position: 'GK', price: 5.5, points: 85 },
];

export default function TransfersPage() {
    const { squad, transferPlayer, budgetRemaining } = useSquad();
    const [activeTab, setActiveTab] = useState<'make' | 'history'>('make');
    const [selectedOut, setSelectedOut] = useState<string | null>(null);
    const [selectedIn, setSelectedIn] = useState<string | null>(null);
    const [selectingFor, setSelectingFor] = useState<'out' | 'in' | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [transferHistory, setTransferHistory] = useState<Array<{ outName: string; inName: string; date: string }>>([]);

    const freeTransfers = 1;

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const playerOut = squad.find(p => p.id === selectedOut);
    const playerIn = allPlayers.find(p => p.id === selectedIn);

    // Available players to transfer in (same position as player out, not in squad)
    const availableIn = playerOut
        ? allPlayers.filter(p =>
            p.position === playerOut.position &&
            !squad.some(s => s.id === p.id)
        )
        : [];

    const budgetAfterTransfer = playerOut && playerIn
        ? budgetRemaining + playerOut.price - playerIn.price
        : budgetRemaining;

    const handleConfirmTransfer = () => {
        if (!selectedOut || !playerIn) return;

        const result = transferPlayer(selectedOut, playerIn);
        if (result.success) {
            setTransferHistory(prev => [
                { outName: playerOut!.name, inName: playerIn.name, date: new Date().toLocaleDateString() },
                ...prev
            ]);
            showToast(`Transferred ${playerIn.name} in!`, 'success');
            setSelectedOut(null);
            setSelectedIn(null);
        } else {
            showToast(result.error || 'Transfer failed', 'error');
        }
    };

    return (
        <div className={styles.container}>
            {/* Toast */}
            {toast && (
                <div className={`${styles.toast} ${styles[toast.type]}`}>
                    {toast.message}
                </div>
            )}

            {/* Transfer Credits */}
            <section className={styles.creditCard}>
                <div className={styles.creditInfo}>
                    <span className={styles.creditLabel}>Free Transfers</span>
                    <span className={styles.creditValue}>{freeTransfers}</span>
                </div>
            </section>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'make' ? styles.active : ''}`}
                    onClick={() => setActiveTab('make')}
                >
                    Make Transfer
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    History
                </button>
            </div>

            {activeTab === 'make' ? (
                <div className={styles.transferSection}>
                    {squad.length === 0 ? (
                        <div className={styles.emptySquad}>
                            <p>Build your squad first before making transfers</p>
                        </div>
                    ) : (
                        <>
                            {/* Transfer Out */}
                            <div className={styles.transferBox}>
                                <h3 className={styles.transferLabel}>
                                    <span className={styles.outIcon}>↑</span> Transfer Out
                                </h3>
                                <button
                                    className={styles.playerSelect}
                                    onClick={() => setSelectingFor('out')}
                                >
                                    {playerOut ? (
                                        <>
                                            <span className={styles.selectedName}>{playerOut.name}</span>
                                            <span className={styles.selectedMeta}>{playerOut.position} • €{playerOut.price}M</span>
                                        </>
                                    ) : (
                                        <span className={styles.selectPlaceholder}>Select player to sell</span>
                                    )}
                                    <span className={styles.selectArrow}>›</span>
                                </button>
                            </div>

                            {/* Transfer In */}
                            <div className={styles.transferBox}>
                                <h3 className={styles.transferLabel}>
                                    <span className={styles.inIcon}>↓</span> Transfer In
                                </h3>
                                <button
                                    className={styles.playerSelect}
                                    onClick={() => playerOut && setSelectingFor('in')}
                                    disabled={!playerOut}
                                >
                                    {playerIn ? (
                                        <>
                                            <span className={styles.selectedName}>{playerIn.name}</span>
                                            <span className={styles.selectedMeta}>{playerIn.position} • €{playerIn.price}M</span>
                                        </>
                                    ) : (
                                        <span className={styles.selectPlaceholder}>
                                            {playerOut ? 'Select player to buy' : 'Select player to sell first'}
                                        </span>
                                    )}
                                    <span className={styles.selectArrow}>›</span>
                                </button>
                            </div>

                            {/* Transfer Summary */}
                            <div className={styles.summary}>
                                <div className={styles.summaryRow}>
                                    <span>Cost</span>
                                    <span className={styles.free}>Free</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Budget After</span>
                                    <span className={budgetAfterTransfer < 0 ? styles.negative : ''}>
                                        €{budgetAfterTransfer.toFixed(1)}M
                                    </span>
                                </div>
                            </div>

                            <button
                                className={styles.confirmBtn}
                                disabled={!playerOut || !playerIn || budgetAfterTransfer < 0}
                                onClick={handleConfirmTransfer}
                            >
                                Confirm Transfer
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div className={styles.historySection}>
                    {transferHistory.length === 0 ? (
                        <div className={styles.emptyHistory}>
                            <span className={styles.emptyIcon}>📋</span>
                            <p>No transfers made yet</p>
                            <span className={styles.emptyHint}>Your transfer history will appear here</span>
                        </div>
                    ) : (
                        <div className={styles.historyList}>
                            {transferHistory.map((transfer, i) => (
                                <div key={i} className={styles.historyItem}>
                                    <div className={styles.transferPlayers}>
                                        <div className={styles.playerOut}>
                                            <span className={styles.outBadge}>OUT</span>
                                            <span>{transfer.outName}</span>
                                        </div>
                                        <div className={styles.playerIn}>
                                            <span className={styles.inBadge}>IN</span>
                                            <span>{transfer.inName}</span>
                                        </div>
                                    </div>
                                    <span className={styles.transferDate}>{transfer.date}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Player Selector Modal */}
            {selectingFor && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>{selectingFor === 'out' ? 'Select Player to Sell' : 'Select Player to Buy'}</h3>
                            <button onClick={() => setSelectingFor(null)}>×</button>
                        </div>
                        <div className={styles.modalList}>
                            {selectingFor === 'out' ? (
                                squad.map(player => (
                                    <button
                                        key={player.id}
                                        className={styles.modalPlayer}
                                        onClick={() => {
                                            setSelectedOut(player.id);
                                            setSelectedIn(null);
                                            setSelectingFor(null);
                                        }}
                                    >
                                        <span className={styles.modalPlayerName}>{player.name}</span>
                                        <span className={styles.modalPlayerMeta}>
                                            {player.position} • {player.team} • €{player.price}M
                                        </span>
                                    </button>
                                ))
                            ) : (
                                availableIn.map(player => (
                                    <button
                                        key={player.id}
                                        className={`${styles.modalPlayer} ${player.price > budgetRemaining + (playerOut?.price || 0) ? styles.tooExpensive : ''}`}
                                        onClick={() => {
                                            setSelectedIn(player.id);
                                            setSelectingFor(null);
                                        }}
                                        disabled={player.price > budgetRemaining + (playerOut?.price || 0)}
                                    >
                                        <span className={styles.modalPlayerName}>{player.name}</span>
                                        <span className={styles.modalPlayerMeta}>
                                            {player.team} • €{player.price}M
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Rules Card */}
            <div className={styles.rulesCard}>
                <h4>📌 Transfer Rules</h4>
                <ul>
                    <li>1 free transfer per gameweek</li>
                    <li>Must replace with same position</li>
                    <li>Must maintain 5-league rule</li>
                    <li>Max 3 players per team</li>
                </ul>
            </div>
        </div>
    );
}
