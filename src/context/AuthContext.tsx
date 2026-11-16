import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../firebase';
import { authApi } from '../api/authApi';
import { getStoredToken, setStoredToken } from '../api/httpClient';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginPatient: (email: string, password: string) => Promise<User>;
  registerPatient: (payload: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<User>;
  loginWithGoogle: (credential: string) => Promise<User>;
  loginDoctorAdmin: (password: string, email?: string) => Promise<User>;
  changeDoctorAdminPassword: (currentPassword: string | undefined, newPassword: string) => Promise<User>;
  refreshUser: () => Promise<void>;
  updateUserState: (next: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      setStoredToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const loginPatient = async (email: string, password: string) => {
    const session = await authApi.login({ email, password });
    setStoredToken(session.accessToken);
    setUser(session.user);
    return session.user;
  };

  const registerPatient = async (payload: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    const session = await authApi.register(payload);
    setStoredToken(session.accessToken);
    setUser(session.user);
    return session.user;
  };

  const loginWithGoogle = async (credential: string) => {
    const session = await authApi.loginWithGoogle(credential);
    setStoredToken(session.accessToken);
    setUser(session.user);
    return session.user;
  };

  const loginDoctorAdmin = async (password: string, email?: string) => {
    const session = await authApi.loginDoctorAdmin({ password, email });
    setStoredToken(session.accessToken);
    setUser(session.user);
    return session.user;
  };

  const changeDoctorAdminPassword = async (
    currentPassword: string | undefined,
    newPassword: string
  ) => {
    const updated = await authApi.changeDoctorAdminPassword({ currentPassword, newPassword });
    setUser(updated);
    return updated;
  };

  const updateUserState = (next: User) => setUser(next);

  const logout = () => {
    setStoredToken(null);
    setUser(null);
    firebaseSignOut(auth).catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        loginPatient,
        registerPatient,
        loginWithGoogle,
        loginDoctorAdmin,
        changeDoctorAdminPassword,
        refreshUser,
        updateUserState,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
