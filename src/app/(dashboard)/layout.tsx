'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';
import { SquadProvider } from '@/contexts/SquadContext';
import { PlayersProvider } from '@/contexts/PlayersContext';
import { WatchlistProvider } from '@/contexts/WatchlistContext';
import { UserProfileProvider, useUserProfile } from '@/contexts/UserProfileContext';

function DashboardHeader() {
    const { profile } = useUserProfile();

    return (
        <header className={styles.header}>
            <div className={styles.topBar}>
                <div className={styles.logoSection}>
                    <img
                        src="/logo.png"
                        alt="MBFF"
                        width={36}
                        height={36}
                        className={styles.logoIcon}
                    />
                    <span className={styles.logoText}>MBFF</span>
                </div>
                <div className={styles.headerActions}>
                    <Link href="/dashboard/profile" className={styles.avatarLink}>
                        <div className={styles.avatar}>
                            {profile.avatarUrl ? (
                                <img
                                    src={profile.avatarUrl}
                                    alt={profile.username}
                                    className={styles.avatarImage}
                                />
                            ) : (
                                <span>👤</span>
                            )}
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className={styles.container}>
            <DashboardHeader />

            {/* Main Content */}
            <main className={styles.main}>
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className={styles.bottomNav}>
                <Link
                    href="/dashboard"
                    className={`${styles.navItem} ${pathname === '/dashboard' ? styles.active : ''}`}
                >
                    <span className={styles.navIcon}>🏠</span>
                    <span className={styles.navLabel}>Home</span>
                </Link>
                <Link
                    href="/dashboard/players"
                    className={`${styles.navItem} ${pathname === '/dashboard/players' ? styles.active : ''}`}
                >
                    <span className={styles.navIcon}>👥</span>
                    <span className={styles.navLabel}>Players</span>
                </Link>
                <Link
                    href="/dashboard/fixtures"
                    className={`${styles.navItem} ${pathname === '/dashboard/fixtures' ? styles.active : ''}`}
                >
                    <span className={styles.navIcon}>📅</span>
                    <span className={styles.navLabel}>Fixtures</span>
                </Link>
                <Link
                    href="/dashboard/squad"
                    className={`${styles.navItem} ${pathname === '/dashboard/squad' ? styles.active : ''}`}
                >
                    <span className={styles.navIcon}>📋</span>
                    <span className={styles.navLabel}>Squad</span>
                </Link>

                <Link
                    href="/dashboard/leaderboard"
                    className={`${styles.navItem} ${pathname === '/dashboard/leaderboard' ? styles.active : ''}`}
                >
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
        <UserProfileProvider>
            <PlayersProvider>
                <WatchlistProvider>
                    <SquadProvider>
                        <DashboardContent>{children}</DashboardContent>
                    </SquadProvider>
                </WatchlistProvider>
            </PlayersProvider>
        </UserProfileProvider>
    );
}

