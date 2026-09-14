import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

interface AuthUser {
    id: number;
    email: string;
    hasSubscription?: boolean;
}

interface AuthContextData {
    user: AuthUser | null;
    token: string | null;
    login: (token: string, user: AuthUser) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('@SmartApp:token');
        const storedUser = localStorage.getItem('@SmartApp:user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, newUser: any) => {
        const now = new Date();
        const trialExpires = newUser.trialExpiresAt ? new Date(newUser.trialExpiresAt) : null;
        const isTrialActive = trialExpires && trialExpires > now;
        const hasSub = newUser.subscriptionStatus === 'active' || isTrialActive;
        const userWithSub = { ...newUser, hasSubscription: newUser.hasSubscription ?? hasSub };

        localStorage.setItem('@SmartApp:token', newToken);
        localStorage.setItem('@SmartApp:user', JSON.stringify(userWithSub));
        setToken(newToken);
        setUser(userWithSub);
    };

    const refreshUser = async () => {
        const token = localStorage.getItem('@SmartApp:token');
        if (!token) return;

        try {
            const response = await axios.get('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                const userData = response.data;
                const now = new Date();
                const trialExpires = userData.trialExpiresAt ? new Date(userData.trialExpiresAt) : null;
                const isTrialActive = trialExpires && trialExpires > now;
                const hasSub = userData.subscriptionStatus === 'active' || isTrialActive;
                const updatedUser = { ...userData, hasSubscription: hasSub };

                localStorage.setItem('@SmartApp:user', JSON.stringify(updatedUser));
                setUser(updatedUser);
            }
        } catch (error: any) {
            console.error("Failed to refresh user", error);
            if (error.response?.status === 401 || error.response?.status === 404) {
                // Token invalid or user deleted
                logout();
            }
        }
    };

    const logout = () => {
        localStorage.removeItem('@SmartApp:token');
        localStorage.removeItem('@SmartApp:user');
        setToken(null);
        setUser(null);
        window.location.href = '/'; // Force a clean redirect to landing
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            logout,
            refreshUser, // Will be used in App.tsx
            isAuthenticated: !!token,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
