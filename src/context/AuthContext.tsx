import { onAuthStateChanged, User } from "firebase/auth";
import React, { createContext, useCallback, useEffect, useState } from "react";
import { NavbarSkeleton } from "../components/Skeleton";
import { auth } from "../services/firebase";

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Login function
    const login = useCallback((user: User) => {
        setUser(user);
        setIsLoggedIn(true);
    }, []);

    // Logout function
    const logout = useCallback(() => {
        setUser(null);
        setIsLoggedIn(false);
    }, []);

    // Listen for authentication state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                setIsLoggedIn(true);
            } else {
                setUser(null);
                setIsLoggedIn(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Navbar skeleton */}
                <NavbarSkeleton />
                
                {/* Main content skeleton */}
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
                        {/* Hero section skeleton */}
                        <div className="text-center space-y-4">
                            <div className="h-12 bg-gray-300 rounded w-2/3 mx-auto"></div>
                            <div className="h-6 bg-gray-300 rounded w-1/2 mx-auto"></div>
                        </div>
                        
                        {/* Search skeleton */}
                        <div className="max-w-2xl mx-auto">
                            <div className="h-12 bg-gray-300 rounded-lg"></div>
                        </div>
                        
                        {/* Categories skeleton */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                                    <div className="h-12 w-12 bg-gray-300 rounded mx-auto mb-4"></div>
                                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-300 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
