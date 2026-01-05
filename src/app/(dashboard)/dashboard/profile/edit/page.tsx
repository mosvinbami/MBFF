'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/contexts/UserProfileContext';
import styles from './page.module.css';

export default function EditProfilePage() {
    const router = useRouter();
    const { profile, updateProfile, updateAvatar } = useUserProfile();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [teamName, setTeamName] = useState(profile.teamName);
    const [previewUrl, setPreviewUrl] = useState<string | null>(profile.avatarUrl);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Image must be less than 2MB');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreviewUrl(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAvatar = () => {
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSave = async () => {
        setIsSaving(true);

        // Update profile
        updateProfile({ teamName });
        updateAvatar(previewUrl);

        // Show success message
        setShowSuccess(true);

        setTimeout(() => {
            setIsSaving(false);
            router.push('/dashboard/profile');
        }, 1000);
    };

    return (
        <div className={styles.container}>
            <Link href="/dashboard/profile" className={styles.backBtn}>
                ← Back to Profile
            </Link>

            <div className={styles.editCard}>
                <h1 className={styles.editTitle}>Edit Profile</h1>

                {showSuccess && (
                    <div className={styles.successMessage}>
                        ✓ Profile updated successfully!
                    </div>
                )}

                {/* Avatar Section */}
                <div className={styles.avatarSection}>
                    <div className={styles.avatarPreview}>
                        <div className={styles.avatar}>
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Avatar preview"
                                    className={styles.avatarImage}
                                />
                            ) : (
                                <span>⚽</span>
                            )}
                        </div>
                        <label className={styles.avatarOverlay} htmlFor="avatarInput">
                            <span>📷 Change</span>
                        </label>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        id="avatarInput"
                        accept="image/*"
                        className={styles.avatarInput}
                        onChange={handleFileChange}
                    />
                    <div className={styles.avatarButtons}>
                        <button
                            type="button"
                            className={`${styles.avatarBtn} ${styles.primary}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            📷 Upload Photo
                        </button>
                        {previewUrl && (
                            <button
                                type="button"
                                className={`${styles.avatarBtn} ${styles.removeBtn}`}
                                onClick={handleRemoveAvatar}
                            >
                                Remove
                            </button>
                        )}
                    </div>
                </div>

                {/* Team Name Field */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="teamName">
                        Team Name
                    </label>
                    <input
                        type="text"
                        id="teamName"
                        className={styles.formInput}
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="Enter your team name"
                        maxLength={30}
                    />
                    <p className={styles.formHelp}>This is how your team appears to others.</p>
                </div>

                {/* Username Field (Read-only) */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="username">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        className={styles.formInput}
                        value={profile.username}
                        disabled
                    />
                    <p className={styles.formHelp}>Username cannot be changed.</p>
                </div>

                {/* Action Buttons */}
                <div className={styles.actions}>
                    <Link href="/dashboard/profile" className={styles.cancelBtn}>
                        Cancel
                    </Link>
                    <button
                        type="button"
                        className={styles.saveBtn}
                        onClick={handleSave}
                        disabled={isSaving || !teamName.trim()}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
