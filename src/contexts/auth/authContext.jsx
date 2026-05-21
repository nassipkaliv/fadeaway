import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, tokenStore } from '../../api/client';

const authContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchMe = useCallback(async () => {
        if (!tokenStore.getAccess()) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            const me = await api.me();
            setUser(me);
        } catch {
            tokenStore.clear();
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMe();
    }, [fetchMe]);

    const login = async (username, password) => {
        await api.login({ username, password });
        const me = await api.me();
        setUser(me);
        return me;
    };

    const register = async ({ username, email, password }) => {
        await api.register({ username, email, password });
        return login(username, password);
    };

    const logout = () => {
        tokenStore.clear();
        setUser(null);
    };

    return (
        <authContext.Provider value={{ user, loading, login, register, logout, refresh: fetchMe }}>
            {children}
        </authContext.Provider>
    );
};

export const useAuth = () => useContext(authContext);

export default authContext;
export { AuthProvider };
