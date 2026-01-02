'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // TODO: Implement Supabase password reset
            // For now, simulate sending email
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSuccess(true);
        } catch {
            setError('Failed to send reset email. Please try again.');
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
                    <h1>Reset Password</h1>
                    <p>Enter your email to receive a reset link</p>
                </div>

                {success ? (
                    <div className={styles.successMessage}>
                        <span className={styles.successIcon}>✓</span>
                        <h3>Check your email</h3>
                        <p>We&apos;ve sent a password reset link to <strong>{email}</strong></p>
                        <p className={styles.hint}>Didn&apos;t receive it? Check your spam folder or try again.</p>
                        <Link href="/login" className={styles.backLink}>
                            ← Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && (
                            <div className={styles.error}>
                                {error}
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                className="input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={`btn btn-primary ${styles.fullWidth}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>

                        <div className={styles.backToLogin}>
                            <Link href="/login">← Back to Login</Link>
                        </div>
                    </form>
                )}
            </div>

            <div className={styles.visual}>
                <div className={styles.visualContent}>
                    <h2>Forgot Your Password?</h2>
                    <p>No worries! We&apos;ll send you an email with instructions to reset it.</p>
                </div>
            </div>
        </div>
    );
}
