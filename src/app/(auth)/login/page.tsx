'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../auth.module.css';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // TODO: Implement Supabase auth
            // For now, simulate login
            await new Promise(resolve => setTimeout(resolve, 1000));
            router.push('/dashboard');
        } catch {
            setError('Invalid email or password');
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
                    <h1>Welcome Back</h1>
                    <p>Sign in to manage your fantasy team</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

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

                    <div className={styles.forgotPassword}>
                        <Link href="/forgot-password">Forgot password?</Link>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>
                        Don&apos;t have an account?{' '}
                        <Link href="/register">Create one</Link>
                    </p>
                </div>
            </div>

            <div className={styles.visual}>
                <div className={styles.visualContent}>
                    <h2>Build Your Dream Team</h2>
                    <p>Pick players from 5 leagues. Score from every competitive match.</p>
                    <div className={styles.leagues}>
                        <span className={styles.league} data-league="pl">PL</span>
                        <span className={styles.league} data-league="ll">LL</span>
                        <span className={styles.league} data-league="sa">SA</span>
                        <span className={styles.league} data-league="bl">BL</span>
                        <span className={styles.league} data-league="fl1">L1</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
