'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Company, DateFilter, AppUser } from '@/types';

interface AppContextValue {
  company: Company;
  setCompany: (c: Company) => void;
  dateFilter: DateFilter;
  setDateFilter: (d: DateFilter) => void;
  user: AppUser | null;
  setUser: (u: AppUser | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<Company>('All');
  const [dateFilter, setDateFilter] = useState<DateFilter>({ type: 'all' });
  const [user, setUser] = useState<AppUser | null>(null);

  // Restore user from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('im_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  const handleSetUser = (u: AppUser | null) => {
    setUser(u);
    if (u) sessionStorage.setItem('im_user', JSON.stringify(u));
    else sessionStorage.removeItem('im_user');
  };

  return (
    <AppContext.Provider value={{ company, setCompany, dateFilter, setDateFilter, user, setUser: handleSetUser }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
