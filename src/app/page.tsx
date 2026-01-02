import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navBrand}>
          <div className={styles.logo}>⚽</div>
          <span>MBFF</span>
        </div>
        <div className={styles.navLinks}>
          <Link href="/login" className="btn btn-secondary">
            Log In
          </Link>
          <Link href="/register" className="btn btn-primary">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <span className={styles.gradientText}>One Team.</span>
            <br />
            Five Leagues.
            <br />
            Unlimited Glory.
          </h1>
          <p className={styles.heroDescription}>
            Build your ultimate fantasy squad from the Premier League, La Liga, Serie A,
            Bundesliga, and Ligue 1. Every competitive match counts toward your weekly score.
          </p>
          <div className={styles.heroCta}>
            <Link href="/register" className="btn btn-primary">
              Create Your Team
            </Link>
            <Link href="#how-it-works" className="btn btn-secondary">
              How It Works
            </Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.leagueBadges}>
            <span className={styles.leagueBadge} data-league="pl">PL</span>
            <span className={styles.leagueBadge} data-league="ll">LL</span>
            <span className={styles.leagueBadge} data-league="sa">SA</span>
            <span className={styles.leagueBadge} data-league="bl">BL</span>
            <span className={styles.leagueBadge} data-league="fl1">L1</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features} id="how-it-works">
        <h2 className={styles.sectionTitle}>Why MBFF Is Different</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🌍</div>
            <h3>5 Leagues, 1 Team</h3>
            <p>
              Pick players from any of the top 5 European leagues. Your squad must include
              at least one player from each league.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3>All Matches Count</h3>
            <p>
              League games, cup matches, Champions League — if it&apos;s competitive, your
              players earn points from every minute played.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔄</div>
            <h3>Smart Autosubs</h3>
            <p>
              If your starter doesn&apos;t play, we automatically sub in a bench player
              while maintaining your formation and league balance.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>💰</div>
            <h3>Strategic Transfers</h3>
            <p>
              1 free transfer per week, with bonus 2-transfer weeks each month.
              Manage your budget and build the perfect squad.
            </p>
          </div>
        </div>
      </section>

      {/* Scoring Section */}
      <section className={styles.scoring}>
        <h2 className={styles.sectionTitle}>Scoring System</h2>
        <div className={styles.scoringGrid}>
          <div className={styles.scoringCategory}>
            <h4>Goals</h4>
            <div className={styles.scoringItem}>
              <span>Goalkeeper/Defender</span>
              <span className={styles.points}>+6</span>
            </div>
            <div className={styles.scoringItem}>
              <span>Midfielder</span>
              <span className={styles.points}>+5</span>
            </div>
            <div className={styles.scoringItem}>
              <span>Forward</span>
              <span className={styles.points}>+4</span>
            </div>
          </div>
          <div className={styles.scoringCategory}>
            <h4>Assists & Defense</h4>
            <div className={styles.scoringItem}>
              <span>Assist</span>
              <span className={styles.points}>+3</span>
            </div>
            <div className={styles.scoringItem}>
              <span>Clean Sheet (GK/DEF)</span>
              <span className={styles.points}>+4</span>
            </div>
            <div className={styles.scoringItem}>
              <span>Every 3 Saves (GK)</span>
              <span className={styles.points}>+1</span>
            </div>
          </div>
          <div className={styles.scoringCategory}>
            <h4>Penalties</h4>
            <div className={styles.scoringItem}>
              <span>Yellow Card</span>
              <span className={styles.pointsNegative}>-1</span>
            </div>
            <div className={styles.scoringItem}>
              <span>Red Card</span>
              <span className={styles.pointsNegative}>-3</span>
            </div>
            <div className={styles.scoringItem}>
              <span>Own Goal</span>
              <span className={styles.pointsNegative}>-2</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2>Ready to Build Your Dream Team?</h2>
          <p>Join thousands of managers competing across 5 leagues.</p>
          <Link href="/register" className="btn btn-primary">
            Start Playing Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <div className={styles.logo}>⚽</div>
            <span>Mosvin Bami Fantasy Football</span>
          </div>
          <p className={styles.footerCopy}>
            © 2026 MBFF. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
