import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
    user: any | null; // TODO: Define User type
    isAuthenticated: boolean;
    login: (credentials: any) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);

    const login = async (credentials: any) => {
        // TODO: Implement login logic
        console.log('Login', credentials);
        setUser({ name: 'Admin User' });
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
