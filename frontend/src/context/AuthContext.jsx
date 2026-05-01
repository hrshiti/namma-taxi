import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback((key) => {
        if (key && typeof key === 'string') {
            localStorage.removeItem(key);
        } else {
            // Clear based on current user role or all known tokens
            localStorage.removeItem('admin_token');
            localStorage.removeItem('driver_token');
            localStorage.removeItem('customer_token');
        }
        setUser(null);
    }, []);

    const checkAuth = useCallback(async () => {
        const pathname = window.location.pathname;
        let tokenKey = 'customer_token';
        
        // Context-aware token selection
        if (pathname.startsWith('/admin')) tokenKey = 'admin_token';
        else if (pathname.startsWith('/driver')) tokenKey = 'driver_token';

        const token = localStorage.getItem(tokenKey);
        
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await api.get('/auth/me');
            if (res && res.data) {
                setUser(res.data);
            } else {
                logout(tokenKey);
            }
        } catch (err) {
            console.error('Session verification failed:', err);
            logout(tokenKey);
        } finally {
            setLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = (userData, token) => {
        const role = userData.role;
        let tokenKey = 'customer_token';
        
        if (role === 'admin' || role === 'staff') tokenKey = 'admin_token';
        else if (role === 'driver') tokenKey = 'driver_token';

        localStorage.setItem(tokenKey, token);
        setUser(userData);
    };

    // Role helpers
    const isAdmin = user?.role === 'admin' || user?.role === 'staff';
    const isDriver = user?.role === 'driver';
    const isCustomer = user?.role === 'customer' || user?.role === 'user';

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            login, 
            logout, 
            checkAuth,
            isAdmin,
            isDriver,
            isCustomer,
            // Aliases for backward compatibility if needed during migration
            customer: isCustomer ? user : null,
            setCustomer: setUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
