import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { initDB } from "@/lib/initDB";
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { initDB } from '@/lib/db';
import { PremiumProvider } from '@/context/PremiumContext';

export default function RootLayout() {
  useEffect(() => { initDB(); }, []);

  return (
    <PremiumProvider>
      <Stack />
    </PremiumProvider>
  );
}

// Cegah splash auto hide
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  const [fontsLoaded] = useFonts({
    // taruh font kamu di sini kalau ada
    // "Amiri": require("../assets/fonts/Amiri-Regular.ttf"),
  });

  // 1. Init DB + Font
  useEffect(() => {
    async function prepare() {
      try {
        await initDB(); // buka IndexedDB
      } catch (e) {
        console.warn("Gagal init DB", e);
      } finally {
        setDbReady(true);
      }
    }
    prepare();
  }, []);

  // 2. Sembunyikan splash kalau font + db udah siap
  useEffect(() => {
    if (fontsLoaded && dbReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, dbReady]);

  if (!fontsLoaded ||!dbReady) {
    return null; // tetap tampilkan splash
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="not-found" options={{ presentation: "modal" }} />
      </Stack>
    </>
  );
}