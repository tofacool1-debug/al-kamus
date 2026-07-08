import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { initDB } from "@/lib/db";
import { PremiumProvider } from "@/context/PremiumContext";
import { AppProvider } from "@/context/AppContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [fontsLoaded] = useFonts({
    // Tambahkan font khusus di sini bila diperlukan.
  });

  useEffect(() => {
    let isMounted = true;

    async function prepare() {
      try {
        await initDB();
      } catch (error) {
        console.warn("Gagal init DB", error);
      } finally {
        if (isMounted) {
          setDbReady(true);
        }
      }
    }

    prepare();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded && dbReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, dbReady]);

  if (!fontsLoaded || !dbReady) {
    return null;
  }

  return (
    <ErrorBoundary
      onError={(error, stackTrace) => {
        console.error("App crashed:", error);
        console.error("Stack:", stackTrace);
      }}
    >
      <AppProvider>
        <PremiumProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }} />
        </PremiumProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}