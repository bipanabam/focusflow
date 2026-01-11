// AuthContext.jsx
import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin, authenticated, logout as apiLogout } from "../api/apiEndpoints";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(false);
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const navigate = useNavigate();
    const checkAuthCalled = useRef(false); // Prevent multiple auth checks

    // Check authentication status
    const checkAuth = useCallback(async () => {
        if (checkAuthCalled.current) return;

        checkAuthCalled.current = true;
        try {
            const data = await authenticated();
            setUser(data.user);
            setAuth(true);
        } catch {
            setAuth(false);
            setUser(null);
        } finally {
            setAuthLoading(false);
            checkAuthCalled.current = false;
        }
    }, []);


    // Login
    const authLogin = useCallback(async (email, password) => {
        try {
            const data = await apiLogin(email, password);
            if (data.success) {
                await checkAuth();
                navigate('/');
                return { success: true };
            }
            return { success: false, message: data.message || "Invalid credentials" };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.detail || "Login failed"
            };
        }
    }, [navigate]);

    // Logout
    const authLogout = useCallback(async () => {
        try {
            await apiLogout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setAuth(false);
            setUser(null);
            navigate("/login");
        }
    }, [navigate]);

    // Listen for auth failure events from axios interceptor
    useEffect(() => {
        const handleAuthLogout = () => {
            setAuth(false);
            setUser(null);
            navigate("/login", { replace: true });
        };

        window.addEventListener('auth:logout', handleAuthLogout);
        return () => window.removeEventListener('auth:logout', handleAuthLogout);
    }, [navigate]);

    // Check auth only once on mount
    useEffect(() => {
        checkAuth();
    }, []); // Empty dependency array - runs once

    const value = useMemo(() => ({
        auth,
        user,
        authLoading,
        authLogin,
        authLogout,
        refreshUser: checkAuth
    }), [auth, user, authLoading, authLogin, authLogout, checkAuth]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);