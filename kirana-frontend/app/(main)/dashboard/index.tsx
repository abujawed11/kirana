import React from "react";
import { View, Text } from "react-native";

export default function Dashboard() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-xl font-semibold text-green-700">Dashboard</Text>
      <Text className="text-gray-600 mt-2">Soon: orders, inventory, earnings…</Text>
    </View>
  );
}
