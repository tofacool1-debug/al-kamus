import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dbSettings } from '../lib/initDB';
import * as Haptics from 'expo-haptics';

interface PremiumContextType {
  isPremium: boolean;
  unlockPremium: () => Promise<void>;
  loading: boolean;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. PAS BUKA APP: CEK DI IDB APA UDAH PREMIUM
  useEffect(() => {
    const checkPremium = async () => {
      const savedPremium = await dbSettings.get<boolean>("isPremium_v2");
      setIsPremium(savedPremium === true);
      setLoading(false);
    };
    checkPremium();
  }, []);

  // 2. FUNGSI BUAT BUKA PREMIUM
  const unlockPremium = async () => {
    await dbSettings.set("isPremium_v2", true); // Simpan ke IDB
    setIsPremium(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <PremiumContext.Provider value={{ isPremium, unlockPremium, loading }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) throw new Error("usePremium must be used within PremiumProvider");
  return context;
}
