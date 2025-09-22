import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

const Card = ({ title, value, icon, onPress, color = "#10B981" }: {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  color?: string;
}) => (
  <TouchableOpacity
    activeOpacity={onPress ? 0.8 : 1}
    onPress={onPress}
    style={{
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      minWidth: "47%",
    }}
  >
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          backgroundColor: "#F3F4F6",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 10,
        }}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={{ color: "#6B7280", fontSize: 13, fontWeight: "600" }}>{title}</Text>
    </View>
    <Text style={{ fontSize: 22, fontWeight: "800", color: "#111827" }}>{value}</Text>
  </TouchableOpacity>
);

export default function SellerDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: 56,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: "#FFFFFF",
          borderBottomColor: "#E5E7EB",
          borderBottomWidth: 1,
        }}
      >
        <Text style={{ fontSize: 18, color: "#6B7280" }}>Welcome back,</Text>
        <Text style={{ fontSize: 26, fontWeight: "800", color: "#111827" }}>
          {user?.name ?? "Seller"}
        </Text>

        {/* Logout */}
        <TouchableOpacity
          onPress={async () => {
            await logout();
          }}
          style={{
            position: "absolute",
            right: 20,
            top: 56,
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: "#FEE2E2",
            borderRadius: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
          accessibilityLabel="Sign out"
        >
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          <Text style={{ color: "#DC2626", fontWeight: "700" }}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }}>
        {/* KPI Row */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <Card
            title="Orders Today"
            value="12"
            icon="bag-handle-outline"
            color="#10B981"
            onPress={() => router.push("/(seller)/orders")}
          />
          <Card
            title="Revenue Today"
            value="₹ 7,450"
            icon="cash-outline"
            color="#F59E0B"
            onPress={() => router.push("/(seller)/reports")}
          />
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <Card
            title="Pending Orders"
            value="3"
            icon="time-outline"
            color="#3B82F6"
            onPress={() => router.push("/(seller)/orders?filter=pending")}
          />
          <Card
            title="Low Stock"
            value="5"
            icon="alert-circle-outline"
            color="#EF4444"
            onPress={() => router.push("/(seller)/inventory?filter=low")}
          />
        </View>

        {/* Quick Actions */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.06,
            shadowRadius: 10,
            elevation: 3,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 12 }}>
            Quick Actions
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {[
              { label: "New Product", icon: "add-circle-outline", route: "/(seller)/inventory/new" },
              { label: "Bulk Upload", icon: "cloud-upload-outline", route: "/(seller)/inventory/bulk-upload" },
              { label: "Offers", icon: "pricetags-outline", route: "/(seller)/offers" },
              { label: "Payouts", icon: "card-outline", route: "/(seller)/payouts" },
            ].map((it) => (
              <TouchableOpacity
                key={it.label}
                onPress={() => router.push(it.route as any)}
                style={{
                  flexGrow: 1,
                  minWidth: "47%",
                  flexBasis: "47%",
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  borderRadius: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 12,
                  backgroundColor: "#F9FAFB",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Ionicons name={it.icon as any} size={18} color="#111827" />
                <Text style={{ fontWeight: "700", color: "#111827" }}>{it.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.06,
            shadowRadius: 10,
            elevation: 3,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 12 }}>
            Account
          </Text>
          <View style={{ gap: 8 }}>
            <Text style={{ color: "#374151" }}>
              <Text style={{ fontWeight: "700" }}>Name:</Text> {user?.name ?? "-"}
            </Text>
            <Text style={{ color: "#374151" }}>
              <Text style={{ fontWeight: "700" }}>Phone:</Text> {user?.phone ?? "-"}
            </Text>
            <Text style={{ color: "#374151" }}>
              <Text style={{ fontWeight: "700" }}>Email:</Text> {user?.email ?? "-"}
            </Text>
            <Text style={{ color: "#374151" }}>
              <Text style={{ fontWeight: "700" }}>Role:</Text> {user?.role ?? "-"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
