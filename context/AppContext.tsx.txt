import React, { createContext, useContext, useState, useEffect } from "react";
import { safeStorage } from "../utils/safeStorage";
import { AppTheme, ThemeColors } from "@/types";
import { ThemeConfig } from "@/constants/theme";

const K_THEME = "sdr_app_theme";
const K_PREMIUM = "sdr_premium_unlocked";
const K_USERNAME = "sdr_username";
const K_PHOTO = "sdr_profile_photo";
const K_FAVORITES = "sdr_favorites";

interface AppContextValue {
  appTheme: AppTheme;
  tc: ThemeColors;
  isPremium: boolean;
  username: string;
  profilePhoto: string;
  favorites: string[];
  setAppTheme: (t: AppTheme) => void;
  setIsPremium: (v: boolean) => void;
  setUsername: (v: string) => void;
  setProfilePhoto: (v: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorited: (id: string) => boolean;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [appTheme, setAppThemeState] = useState<AppTheme>("dark");
  const [isPremium, setIsPremiumState] = useState(false);
  const [username, setUsernameState] = useState("Santri");
  const [profilePhoto, setProfilePhotoState] = useState("avatar1");
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [theme, premium, uname, photo, favs] = await Promise.all([
          safeStorage.getItem(K_THEME).catch(() => null),
          safeStorage.getItem(K_PREMIUM).catch(() => null),
          safeStorage.getItem(K_USERNAME).catch(() => null),
          safeStorage.getItem(K_PHOTO).catch(() => null),
          safeStorage.getItem(K_FAVORITES).catch(() => null),
        ]);
        if (theme) setAppThemeState(theme as AppTheme);
        if (premium === "true") setIsPremiumState(true);
        if (uname) setUsernameState(uname);
        if (photo) setProfilePhotoState(photo);
        if (favs) {
          try {
            setFavorites(JSON.parse(favs));
          } catch (e) {
            console.warn("Failed to parse favorites:", e);
          }
        }
      } catch (error) {
        console.warn("Error loading from safeStorage:", error);
      }
    })();
  }, []);

  const setAppTheme = (t: AppTheme) => {
    setAppThemeState(t);
    safeStorage.setItem(K_THEME, t).catch((error) => {
      console.warn("Error saving theme:", error);
    });
  };
  const setIsPremium = (v: boolean) => {
    setIsPremiumState(v);
    safeStorage.setItem(K_PREMIUM, v ? "true" : "false").catch((error) => {
      console.warn("Error saving premium status:", error);
    });
  };
  const setUsername = (v: string) => {
    setUsernameState(v);
    safeStorage.setItem(K_USERNAME, v).catch((error) => {
      console.warn("Error saving username:", error);
    });
  };
  const setProfilePhoto = (v: string) => {
    setProfilePhotoState(v);
    safeStorage.setItem(K_PHOTO, v).catch((error) => {
      console.warn("Error saving profile photo:", error);
    });
  };
  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      safeStorage.setItem(K_FAVORITES, JSON.stringify(next)).catch((error) => {
        console.warn("Error saving favorites:", error);
      });
      return next;
    });
  };
  const isFavorited = (id: string) => favorites.includes(id);
  const tc: ThemeColors = ThemeConfig[appTheme] ?? ThemeConfig.dark;

  return (
    <AppContext.Provider
      value={{ appTheme, tc, isPremium, username, profilePhoto, favorites, setAppTheme, setIsPremium, setUsername, setProfilePhoto, toggleFavorite, isFavorited }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be inside AppProvider");
  return ctx;
}
