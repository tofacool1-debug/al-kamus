import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { initDB } from "../lib/initDB";
import { PremiumProvider } from "../context/PremiumContext";

// 1. Cegah splash auto hide
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  const [fontsLoaded] = useFonts({
    "Amiri": require("../assets/fonts/Amiri-Regular.ttf"),
  });

  // 2. Init DB
  useEffect(() => {
    async function prepare() {
      try {
        await initDB();
      } catch (e) {
        console.warn("Gagal init DB", e);
      } finally {
        setDbReady(true);
      }
    }
    prepare();
  }, []);

  // 3. Sembunyikan splash kalau font + db udah siap
  useEffect(() => {
    if (fontsLoaded && dbReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, dbReady]);

  if (!fontsLoaded ||!dbReady) {
    return null;
  }

  return (
    <PremiumProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="not-found" options={{ presentation: "modal" }} />
      </Stack>
    </PremiumProvider>
  );
}
