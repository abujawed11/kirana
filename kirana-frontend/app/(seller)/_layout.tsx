import { Stack } from "expo-router";
import React from "react";

export default function SellerLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Seller Dashboard", headerShown: true }}
      />
    </Stack>
  );
}
