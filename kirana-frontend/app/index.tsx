import { useAuth } from "@/context/AuthContext";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  // ✅ if user exists, go to products page
  if (user) {
    return <Redirect href="/products" />;
  }

  // ❌ not logged in → go to login
  return <Redirect href="/(auth)/login" />;
}
