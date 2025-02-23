import React, { createContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";


export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const token = localStorage.getItem("authToken");
        return token ? !isTokenExpired(token) : false;
    });

    // Function to check if token is expired
    function isTokenExpired(token) {
        try {
            const decoded = jwtDecode(token);
            return decoded.exp * 1000 < Date.now();
        } catch (error) {
            return true;
        }
    }

    // Login function
    const login = useCallback((token) => {
        localStorage.setItem("authToken", token);
        setIsLoggedIn(true);
    }, []);

    // Logout function
    const logout = useCallback(() => {
        localStorage.removeItem("authToken");
        setIsLoggedIn(false);
    }, []);

    // Auto-logout if token is expired
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token || isTokenExpired(token)) {
            logout();
        }
    }, [logout]);

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
