'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../auth.module.css';

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        teamName: '',
        password: '',
        confirmPassword: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        try {
            // TODO: Implement Supabase auth
            await new Promise(resolve => setTimeout(resolve, 1000));
            router.push('/dashboard');
        } catch {
            setError('Failed to create account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <div className={styles.header}>
                    <Link href="/" className={styles.logo}>
                        <span className={styles.logoIcon}>⚽</span>
                        <span>MBFF</span>
                    </Link>
                    <h1>Create Your Account</h1>
                    <p>Start building your ultimate fantasy team</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                className="input"
                                placeholder="johndoe"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="teamName">Team Name</label>
                            <input
                                type="text"
                                id="teamName"
                                className="input"
                                placeholder="My MBFF Team"
                                value={formData.teamName}
                                onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="input"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                className="input"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                className="input"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>
                        Already have an account?{' '}
                        <Link href="/login">Sign in</Link>
                    </p>
                </div>
            </div>

            <div className={styles.visual}>
                <div className={styles.visualContent}>
                    <h2>Join the Ultimate Fantasy League</h2>
                    <p>Compete with managers from around the world.</p>
                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>5</span>
                            <span className={styles.statLabel}>Leagues</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>15</span>
                            <span className={styles.statLabel}>Player Squad</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>€100M</span>
                            <span className={styles.statLabel}>Budget</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
