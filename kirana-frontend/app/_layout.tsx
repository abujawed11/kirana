import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShadowVisible: false }}>
        {/* Expo Router will auto-register routes.
            Keeping it minimal; no need to predeclare screens here. */}
      </Stack>
    </AuthProvider>
  );
}
