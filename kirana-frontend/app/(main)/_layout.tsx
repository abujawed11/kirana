import { Stack, Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function MainLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/login" />;

  return (
    <Stack screenOptions={{ headerTitleAlign: "center" }}>
      <Stack.Screen name="dashboard/_layout" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard/index" options={{ title: "Dashboard" }} />
    </Stack>
  );
}
