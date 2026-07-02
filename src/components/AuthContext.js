"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '@/actions/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (e) {
        setCurrentUser(null);
      }
      setIsAuthLoaded(true);
    };

    checkAuth();
    window.addEventListener('auth-change', checkAuth);
    return () => window.removeEventListener('auth-change', checkAuth);
  }, []);

  // Helpers
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin';
  const isSuperAdmin = currentUser?.role === 'Super Admin';
  const isViewer = currentUser?.role === 'Viewer';

  const value = {
    currentUser,
    isAuthLoaded,
    isAdmin,
    isSuperAdmin,
    isViewer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
