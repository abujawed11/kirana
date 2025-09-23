import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import CustomDrawer from "@/components/CustomDrawer";

export default function SellerLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#FFFFFF",
          },
          headerTintColor: "#111827",
          headerTitleStyle: {
            fontWeight: "700",
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => setIsDrawerOpen(true)}
              style={{ marginLeft: 16 }}
            >
              <Ionicons name="menu" size={24} color="#111827" />
            </TouchableOpacity>
          ),
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Seller Dashboard",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="kyc"
          options={{
            title: "KYC Verification",
            headerShown: true,
            presentation: "modal"
          }}
        />
      </Stack>

      <CustomDrawer
        isVisible={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
