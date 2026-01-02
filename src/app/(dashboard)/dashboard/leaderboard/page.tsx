'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

// User ID mapping for leaderboard
const userIdMap: Record<string, string> = {
  'FootballGenius': 'user-1',
  'TacticMaster': 'user-2',
  'GoalHunter': 'user-3',
  'MidfielMaestro': 'user-4',
  'DefensiveWall': 'user-5',
  'WingerKing': 'user-6',
  'SetPieceSpecial': 'user-7',
  'YouthScout': 'user-8',
  'VeteranPro': 'user-9',
  'WildcardWizard': 'user-10',
};

// Mock detailed user stats
const mockUserStats = [
  {
    rank: 1,
    username: 'FootballGenius',
    teamName: 'The Invincibles',
    avatar: '👑',
    // Weekly stats
    gwPoints: 68, gwGoals: 8, gwAssists: 5, gwCleanSheets: 3, gwYellowCards: 2, gwRedCards: 0, gwOwnGoals: 0, gwSaves: 12, gwPenaltySaves: 1,
    // Overall stats
    totalPoints: 452, totalGoals: 45, totalAssists: 28, totalCleanSheets: 18, totalYellowCards: 15, totalRedCards: 1, totalOwnGoals: 2, totalSaves: 85, totalPenaltySaves: 3,
  },
  {
    rank: 2,
    username: 'TacticMaster',
    teamName: 'Dream Team FC',
    avatar: '🥈',
    gwPoints: 45, gwGoals: 5, gwAssists: 3, gwCleanSheets: 2, gwYellowCards: 3, gwRedCards: 0, gwOwnGoals: 1, gwSaves: 8, gwPenaltySaves: 0,
    totalPoints: 438, totalGoals: 42, totalAssists: 25, totalCleanSheets: 16, totalYellowCards: 18, totalRedCards: 0, totalOwnGoals: 3, totalSaves: 72, totalPenaltySaves: 2,
  },
  {
    rank: 3,
    username: 'GoalHunter',
    teamName: 'Strike Force',
    avatar: '🥉',
    gwPoints: 72, gwGoals: 10, gwAssists: 4, gwCleanSheets: 1, gwYellowCards: 1, gwRedCards: 0, gwOwnGoals: 0, gwSaves: 5, gwPenaltySaves: 0,
    totalPoints: 425, totalGoals: 52, totalAssists: 22, totalCleanSheets: 12, totalYellowCards: 12, totalRedCards: 2, totalOwnGoals: 1, totalSaves: 48, totalPenaltySaves: 1,
  },
  {
    rank: 4,
    username: 'MidfielMaestro',
    teamName: 'Control FC',
    avatar: '😎',
    gwPoints: 58, gwGoals: 6, gwAssists: 6, gwCleanSheets: 2, gwYellowCards: 2, gwRedCards: 0, gwOwnGoals: 0, gwSaves: 6, gwPenaltySaves: 0,
    totalPoints: 412, totalGoals: 38, totalAssists: 32, totalCleanSheets: 15, totalYellowCards: 16, totalRedCards: 1, totalOwnGoals: 2, totalSaves: 55, totalPenaltySaves: 0,
  },
  {
    rank: 5,
    username: 'DefensiveWall',
    teamName: 'Clean Sheet United',
    avatar: '🛡️',
    gwPoints: 42, gwGoals: 2, gwAssists: 2, gwCleanSheets: 5, gwYellowCards: 4, gwRedCards: 0, gwOwnGoals: 0, gwSaves: 15, gwPenaltySaves: 2,
    totalPoints: 398, totalGoals: 18, totalAssists: 15, totalCleanSheets: 28, totalYellowCards: 22, totalRedCards: 0, totalOwnGoals: 1, totalSaves: 110, totalPenaltySaves: 5,
  },
  {
    rank: 6,
    username: 'WingerKing',
    teamName: 'Speed Demons',
    avatar: '⚡',
    gwPoints: 65, gwGoals: 7, gwAssists: 8, gwCleanSheets: 1, gwYellowCards: 1, gwRedCards: 0, gwOwnGoals: 0, gwSaves: 3, gwPenaltySaves: 0,
    totalPoints: 385, totalGoals: 35, totalAssists: 38, totalCleanSheets: 10, totalYellowCards: 8, totalRedCards: 0, totalOwnGoals: 0, totalSaves: 30, totalPenaltySaves: 0,
  },
  {
    rank: 7,
    username: 'SetPieceSpecial',
    teamName: 'Dead Ball FC',
    avatar: '🎯',
    gwPoints: 38, gwGoals: 4, gwAssists: 2, gwCleanSheets: 2, gwYellowCards: 3, gwRedCards: 1, gwOwnGoals: 0, gwSaves: 7, gwPenaltySaves: 0,
    totalPoints: 372, totalGoals: 30, totalAssists: 20, totalCleanSheets: 14, totalYellowCards: 20, totalRedCards: 2, totalOwnGoals: 3, totalSaves: 62, totalPenaltySaves: 1,
  },
  {
    rank: 8,
    username: 'YouthScout',
    teamName: 'Future Stars',
    avatar: '🌟',
    gwPoints: 55, gwGoals: 6, gwAssists: 5, gwCleanSheets: 2, gwYellowCards: 0, gwRedCards: 0, gwOwnGoals: 0, gwSaves: 9, gwPenaltySaves: 0,
    totalPoints: 358, totalGoals: 32, totalAssists: 26, totalCleanSheets: 13, totalYellowCards: 6, totalRedCards: 0, totalOwnGoals: 1, totalSaves: 68, totalPenaltySaves: 2,
  },
  {
    rank: 9,
    username: 'VeteranPro',
    teamName: 'Old Guard FC',
    avatar: '👴',
    gwPoints: 48, gwGoals: 5, gwAssists: 3, gwCleanSheets: 3, gwYellowCards: 2, gwRedCards: 0, gwOwnGoals: 1, gwSaves: 10, gwPenaltySaves: 1,
    totalPoints: 345, totalGoals: 28, totalAssists: 18, totalCleanSheets: 20, totalYellowCards: 14, totalRedCards: 1, totalOwnGoals: 4, totalSaves: 78, totalPenaltySaves: 3,
  },
  {
    rank: 10,
    username: 'WildcardWizard',
    teamName: 'Chaos Theory',
    avatar: '🎲',
    gwPoints: 82, gwGoals: 12, gwAssists: 6, gwCleanSheets: 0, gwYellowCards: 1, gwRedCards: 0, gwOwnGoals: 0, gwSaves: 2, gwPenaltySaves: 0,
    totalPoints: 332, totalGoals: 48, totalAssists: 30, totalCleanSheets: 8, totalYellowCards: 10, totalRedCards: 1, totalOwnGoals: 2, totalSaves: 25, totalPenaltySaves: 0,
  },
];

// Sort for weekly ranking
const weeklyRanking = [...mockUserStats]
  .sort((a, b) => b.gwPoints - a.gwPoints)
  .map((entry, index) => ({ ...entry, gwRank: index + 1 }));

export default function LeaderboardPage() {
  const [view, setView] = useState<'overall' | 'weekly'>('overall');
  const currentGameweek = 8;

  // User stats
  const myGwRank = 89;
  const myOverallRank = 156;
  const myGwPoints = 52;
  const myTotalPoints = 245;

  const data = view === 'weekly' ? weeklyRanking : mockUserStats;

  return (
    <div className={styles.container}>
      {/* My Stats Card */}
      <section className={styles.myCard}>
        <div className={styles.myRankSection}>
          <span className={styles.myRankLabel}>
            {view === 'overall' ? 'Overall' : `GW${currentGameweek}`} Rank
          </span>
          <span className={styles.myRankValue}>
            #{view === 'overall' ? myOverallRank : myGwRank}
          </span>
        </div>
        <div className={styles.myStatsRow}>
          <div className={styles.myStat}>
            <span className={styles.myStatValue}>{myGwPoints}</span>
            <span className={styles.myStatLabel}>GW Pts</span>
          </div>
          <div className={styles.myStatDivider} />
          <div className={styles.myStat}>
            <span className={styles.myStatValue}>{myTotalPoints}</span>
            <span className={styles.myStatLabel}>Total</span>
          </div>
        </div>
      </section>

      {/* Toggle */}
      <div className={styles.toggle}>
        <button
          className={`${styles.toggleBtn} ${view === 'overall' ? styles.active : ''}`}
          onClick={() => setView('overall')}
        >
          Overall Season
        </button>
        <button
          className={`${styles.toggleBtn} ${view === 'weekly' ? styles.active : ''}`}
          onClick={() => setView('weekly')}
        >
          GW{currentGameweek} Weekly
        </button>
      </div>

      {/* Stats Legend */}
      <div className={styles.legend}>
        <span>⚽ Goals</span>
        <span>🅰️ Assists</span>
        <span>🧤 CS</span>
        <span>🟡 YC</span>
        <span>🔴 RC</span>
        <span>⛔ OG</span>
      </div>

      {/* Table Header */}
      <div className={styles.tableHeader}>
        <span className={styles.colPos}>#</span>
        <span className={styles.colManager}>Manager</span>
        <span className={styles.colStat}>⚽</span>
        <span className={styles.colStat}>🅰️</span>
        <span className={styles.colStat}>🧤</span>
        <span className={styles.colStat}>🟡</span>
        <span className={styles.colStat}>🔴</span>
        <span className={styles.colStat}>⛔</span>
        <span className={styles.colPts}>Pts</span>
      </div>

      {/* Table Body */}
      <div className={styles.tableBody}>
        {data.map((user, index) => {
          const rank = view === 'weekly' ? (user as typeof user & { gwRank: number }).gwRank : user.rank;
          const goals = view === 'weekly' ? user.gwGoals : user.totalGoals;
          const assists = view === 'weekly' ? user.gwAssists : user.totalAssists;
          const cleanSheets = view === 'weekly' ? user.gwCleanSheets : user.totalCleanSheets;
          const yellowCards = view === 'weekly' ? user.gwYellowCards : user.totalYellowCards;
          const redCards = view === 'weekly' ? user.gwRedCards : user.totalRedCards;
          const ownGoals = view === 'weekly' ? user.gwOwnGoals : user.totalOwnGoals;
          const points = view === 'weekly' ? user.gwPoints : user.totalPoints;

          const userId = userIdMap[user.username] || 'user-1';

          return (
            <Link
              key={user.username}
              href={`/dashboard/profile/${userId}`}
              className={`${styles.tableRow} ${rank <= 3 ? styles.topThree : ''}`}
              data-rank={rank}
            >
              <span className={styles.rowPos}>
                {rank <= 3 ? (rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉') : rank}
              </span>
              <div className={styles.rowManager}>
                <span className={styles.avatar}>{user.avatar}</span>
                <div className={styles.managerInfo}>
                  <span className={styles.username}>{user.username}</span>
                  <span className={styles.teamName}>{user.teamName}</span>
                </div>
              </div>
              <span className={styles.rowStat}>{goals}</span>
              <span className={styles.rowStat}>{assists}</span>
              <span className={styles.rowStat}>{cleanSheets}</span>
              <span className={`${styles.rowStat} ${styles.yellow}`}>{yellowCards}</span>
              <span className={`${styles.rowStat} ${styles.red}`}>{redCards}</span>
              <span className={`${styles.rowStat} ${styles.ownGoal}`}>{ownGoals}</span>
              <span className={styles.rowPts}>{points}</span>
            </Link>
          );
        })}
      </div>

      {/* Stats Info */}
      <div className={styles.statsInfo}>
        <p>Stats from all {view === 'weekly' ? 'gameweek' : 'season'} matches across 5 leagues</p>
      </div>
    </div>
  );
}
