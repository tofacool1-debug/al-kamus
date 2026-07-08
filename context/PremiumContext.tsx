import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dbSettings } from '../lib/db';
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
      try {
        const savedPremium = await dbSettings.get<boolean>("isPremium_v2");
        setIsPremium(savedPremium === true);
      } catch (error) {
        console.warn("Error checking premium status:", error);
        // Default to false if there's an error
        setIsPremium(false);
      } finally {
        setLoading(false);
      }
    };
    checkPremium();
  }, []);

  // 2. FUNGSI BUAT BUKA PREMIUM
  const unlockPremium = async () => {
    try {
      await dbSettings.set("isPremium_v2", true); // Simpan ke IDB
      setIsPremium(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error unlocking premium:", error);
      throw error; // Re-throw so caller can handle
    }
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