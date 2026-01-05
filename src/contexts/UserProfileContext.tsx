'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserProfile {
    id: string;
    username: string;
    teamName: string;
    email: string;
    avatarUrl: string | null;
    joinedDate: string;
    favoriteLeague: string;
    overallRank: number;
    gwRank: number;
    totalPoints: number;
    gwPoints: number;
    transfersUsed: number;
    gameweeksPlayed: number;
    isActive: boolean;
}

interface UserProfileContextType {
    profile: UserProfile;
    updateProfile: (updates: Partial<UserProfile>) => void;
    updateAvatar: (imageDataUrl: string | null) => void;
}

const defaultProfile: UserProfile = {
    id: 'current-user',
    username: 'FootballFan23',
    teamName: 'FC Thunder',
    email: 'user@example.com',
    avatarUrl: null,
    joinedDate: '2025-08-15',
    favoriteLeague: 'Premier League',
    overallRank: 156,
    gwRank: 89,
    totalPoints: 342,
    gwPoints: 52,
    transfersUsed: 8,
    gameweeksPlayed: 8,
    isActive: true,
};

const STORAGE_KEY = 'mbff_user_profile';

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<UserProfile>(defaultProfile);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setProfile({ ...defaultProfile, ...parsed });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
        setIsHydrated(true);
    }, []);

    // Save to localStorage when profile changes
    useEffect(() => {
        if (isHydrated) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
            } catch (error) {
                console.error('Error saving profile:', error);
            }
        }
    }, [profile, isHydrated]);

    const updateProfile = (updates: Partial<UserProfile>) => {
        setProfile(prev => ({ ...prev, ...updates }));
    };

    const updateAvatar = (imageDataUrl: string | null) => {
        setProfile(prev => ({ ...prev, avatarUrl: imageDataUrl }));
    };

    return (
        <UserProfileContext.Provider value={{ profile, updateProfile, updateAvatar }}>
            {children}
        </UserProfileContext.Provider>
    );
}

export function useUserProfile() {
    const context = useContext(UserProfileContext);
    if (context === undefined) {
        throw new Error('useUserProfile must be used within a UserProfileProvider');
    }
    return context;
}
