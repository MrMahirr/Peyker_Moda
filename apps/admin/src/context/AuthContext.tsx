import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '../lib/axios';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: Record<string, unknown>) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    const me = response.data?.data || response.data;
                    setUser({
                        ...me,
                        role: me.role || me.roleName || '',
                    });
                } catch {
                    console.error('Session expired or invalid token');
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                }
            }
            setIsLoading(false);
        };
        checkAuth();

        // Global 401 hatalarını (Axios üzerinden gelen) yakalayıp kullanıcıyı logout yapıyoruz
        const handleUnauthorized = () => {
            console.warn('Unauthorized access detected, performing automatic logout...');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setUser(null);
            // window.location.href = '/login'; // Opsiyonel yönlendirme
        };

        window.addEventListener('auth:unauthorized', handleUnauthorized as EventListener);
        
        return () => {
            window.removeEventListener('auth:unauthorized', handleUnauthorized as EventListener);
        };
    }, []);

    const login = async (credentials: Record<string, unknown>) => {
        try {
            const res = await api.post('/auth/login', credentials);
            const data = res.data?.data || res.data; // Handles standard and our Custom Response structure
            
            if (data.accessToken) {
                localStorage.setItem('token', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                if (data.user) {
                    setUser(data.user);
                } else {
                    const meRes = await api.get('/auth/me');
                    const me = meRes.data?.data || meRes.data;
                    setUser({
                        ...me,
                        role: me.role || me.roleName || '',
                    });
                }
            }
        } catch (error) {
            console.error('Login Error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Optional: await api.post('/auth/logout');
        } catch (e) {
            console.error(e);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
