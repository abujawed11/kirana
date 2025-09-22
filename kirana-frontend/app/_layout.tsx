// import { Stack } from "expo-router";

// export default function RootLayout() {
//   return <Stack />;
// }




// Keep Reanimated logger config at the very top (before other imports)
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false });

import "../global.css";

import React, { useEffect } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Slot } from "expo-router";
import * as Notifications from "expo-notifications";
import * as NavigationBar from "expo-navigation-bar";
import { QueryClient, QueryClientProvider, DefaultError } from "@tanstack/react-query";

import { AuthProvider } from "@/context/AuthContext";
import { KycProvider } from "@/context/KYCContext";

// Foreground Notification Handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        // Don’t retry on 4xx responses (if your fetch/axios attaches it as { response: { status } })
        const status = (error as DefaultError & { response?: { status?: number } })?.response?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: 5 * 60 * 1000, // 5 min
      gcTime: 10 * 60 * 1000,   // 10 min
      networkMode: "online",
    },
    mutations: {
      retry: 1,
      networkMode: "online",
    },
  },
});

// Utility: hide Android navigation bar (no-ops on iOS/Web)
const hideNavigationBar = async () => {
  if (Platform.OS !== "android") return;
  try {
    await NavigationBar.setBehaviorAsync("inset-swipe");
    await NavigationBar.setVisibilityAsync("hidden");
  } catch (e) {
    console.log("Failed to hide navigation bar:", e);
  }
};

export default function RootLayout() {
  useEffect(() => {
    const setupApp = async () => {
      try {
        // Notifications permission
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== "granted") {
          await Notifications.requestPermissionsAsync();
        }

        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            sound: "default",
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
          });

          // Android nav bar styling + hide
          try {
            await NavigationBar.setBackgroundColorAsync("#0a0a0a");
            await NavigationBar.setButtonStyleAsync("light");
            await NavigationBar.setBehaviorAsync("inset-swipe");
            await NavigationBar.setVisibilityAsync("hidden");

            // Re-hide after a short delay to ensure it sticks
            setTimeout(() => {
              NavigationBar.setVisibilityAsync("hidden").catch(() => { });
            }, 500);
          } catch (e) {
            console.log("Navigation bar configuration failed:", e);
          }
        }
      } catch (e) {
        console.log("App setup error:", e);
      }
    };

    setupApp();

    // auto-refetch on reconnect


    // re-hide nav bar when app becomes active
    const handleAppStateChange = (state: AppStateStatus) => {
      if (state === "active") {
        setTimeout(hideNavigationBar, 100);
      }
    };
    const appStateSubscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {

      appStateSubscription.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <KycProvider>
            <Slot />
          </KycProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
