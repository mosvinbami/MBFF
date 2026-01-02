'use client';

import Link from 'next/link';
import styles from './layout.module.css';
import { SquadProvider, useSquad } from '@/contexts/SquadContext';
import { PlayersProvider } from '@/contexts/PlayersContext';

function DashboardHeader() {
    const { squad, budgetRemaining } = useSquad();

    return (
        <header className={styles.header}>
            <div className={styles.headerLeft}>
                <div className={styles.logo}>⚽</div>
                <div className={styles.headerInfo}>
                    <span className={styles.headerTitle}>Gameweek 1</span>
                    <span className={styles.headerSubtitle}>€{budgetRemaining.toFixed(1)}M left</span>
                </div>
            </div>
            <div className={styles.headerStats}>
                <div className={styles.headerStat}>
                    <span className={styles.statValue}>{squad.length}</span>
                    <span className={styles.statLabel}>Squad</span>
                </div>
                <div className={styles.headerStat}>
                    <span className={styles.statValue}>{squad.filter(p => p.isStarter).length}</span>
                    <span className={styles.statLabel}>XI</span>
                </div>
            </div>
        </header>
    );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.container}>
            <DashboardHeader />

            {/* Main Content */}
            <main className={styles.main}>
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className={styles.bottomNav}>
                <Link href="/dashboard" className={styles.navItem}>
                    <span className={styles.navIcon}>🏠</span>
                    <span className={styles.navLabel}>Home</span>
                </Link>
                <Link href="/dashboard/players" className={styles.navItem}>
                    <span className={styles.navIcon}>👥</span>
                    <span className={styles.navLabel}>Players</span>
                </Link>
                <Link href="/dashboard/fixtures" className={styles.navItem}>
                    <span className={styles.navIcon}>📅</span>
                    <span className={styles.navLabel}>Fixtures</span>
                </Link>
                <Link href="/dashboard/squad" className={styles.navItem}>
                    <span className={styles.navIcon}>📋</span>
                    <span className={styles.navLabel}>Squad</span>
                </Link>
                <Link href="/dashboard/transfers" className={styles.navItem}>
                    <span className={styles.navIcon}>⇄</span>
                    <span className={styles.navLabel}>Transfers</span>
                </Link>
                <Link href="/dashboard/leaderboard" className={styles.navItem}>
                    <span className={styles.navIcon}>🏆</span>
                    <span className={styles.navLabel}>Rank</span>
                </Link>
            </nav>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PlayersProvider>
            <SquadProvider>
                <DashboardContent>{children}</DashboardContent>
            </SquadProvider>
        </PlayersProvider>
    );
}

