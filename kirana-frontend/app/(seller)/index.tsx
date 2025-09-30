import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useKyc } from "@/context/KYCContext";

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
  const { needsKyc, blockingReason, kycStatus } = useKyc();

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
        {/* KYC Alert */}
        {needsKyc && (
          <TouchableOpacity
            onPress={() => router.push("/(seller)/kyc")}
            style={{
              backgroundColor: kycStatus?.status === 'rejected' ? "#FEF2F2" : "#FEF3C7",
              borderLeftWidth: 4,
              borderLeftColor: kycStatus?.status === 'rejected' ? "#EF4444" : "#F59E0B",
              borderRadius: 12,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: kycStatus?.status === 'rejected' ? "#FEE2E2" : "#FEF3C7",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons
                name={kycStatus?.status === 'rejected' ? "close-circle" : kycStatus?.status === 'pending' ? "time" : "shield-checkmark"}
                size={24}
                color={kycStatus?.status === 'rejected' ? "#EF4444" : "#F59E0B"}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: "700",
                color: kycStatus?.status === 'rejected' ? "#DC2626" : "#92400E",
                marginBottom: 4
              }}>
                {kycStatus?.status === 'rejected' ? 'KYC Verification Failed' :
                 kycStatus?.status === 'pending' ? 'KYC Under Review' : 'Complete KYC Verification'}
              </Text>
              <Text style={{
                fontSize: 14,
                color: kycStatus?.status === 'rejected' ? "#991B1B" : "#78350F",
                lineHeight: 20
              }}>
                {blockingReason}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={kycStatus?.status === 'rejected' ? "#DC2626" : "#92400E"} />
          </TouchableOpacity>
        )}

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
            onPress={() => router.push("/(seller)/orders?filter=pending" as any)}
          />
          <Card
            title="Low Stock"
            value="5"
            icon="alert-circle-outline"
            color="#EF4444"
            onPress={() => router.push("/(seller)/inventory?filter=low" as any)}
          />
        </View>

        {/* Featured Action - New Product */}
        {!needsKyc && (
          <TouchableOpacity
            onPress={() => router.push("/(seller)/inventory/new")}
            style={{
              backgroundColor: "#2563EB",
              borderRadius: 16,
              padding: 20,
              shadowColor: "#2563EB",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
              elevation: 8,
              marginBottom: 8,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}>
                    <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: "800", color: "#FFFFFF" }}>
                    Add New Product
                  </Text>
                </View>
                <Text style={{ fontSize: 14, color: "#E0E7FF", marginBottom: 4 }}>
                  List a new product in your inventory
                </Text>
                <Text style={{ fontSize: 12, color: "#C7D2FE" }}>
                  ✓ Easy product form  ✓ Auto SKU generation  ✓ Image upload
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}

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
              {
                label: "New Product",
                icon: "add-circle-outline",
                route: "/(seller)/inventory/new",
                color: "#2563EB",
                featured: true
              },
              {
                label: "Bulk Upload",
                icon: "cloud-upload-outline",
                route: "/(seller)/inventory/bulk-upload",
                color: "#059669"
              },
              {
                label: "Offers",
                icon: "pricetags-outline",
                route: "/(seller)/offers",
                color: "#DC2626"
              },
              {
                label: "Payouts",
                icon: "card-outline",
                route: "/(seller)/payouts",
                color: "#7C2D12"
              },
            ].map((it) => (
              <TouchableOpacity
                key={it.label}
                onPress={() => {
                  if (needsKyc) {
                    router.push("/(seller)/kyc");
                  } else {
                    router.push(it.route as any);
                  }
                }}
                style={{
                  flexGrow: 1,
                  minWidth: "47%",
                  flexBasis: "47%",
                  borderWidth: needsKyc ? 1 : 0,
                  borderColor: needsKyc ? "#FCD34D" : "transparent",
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 12,
                  backgroundColor: needsKyc ? "#FFFBEB" : "#F9FAFB",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  opacity: needsKyc ? 0.8 : 1,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: needsKyc ? "#FEF3C7" : `${it.color}15`,
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                  <Ionicons
                    name={needsKyc ? "lock-closed" : it.icon as any}
                    size={20}
                    color={needsKyc ? "#D97706" : it.color}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontWeight: "700",
                    color: needsKyc ? "#D97706" : "#111827",
                    fontSize: 15,
                    marginBottom: 2
                  }}>
                    {it.label}
                  </Text>
                  {needsKyc ? (
                    <Text style={{
                      fontSize: 11,
                      color: "#92400E",
                      fontWeight: "500"
                    }}>
                      Complete KYC to unlock
                    </Text>
                  ) : (
                    <Text style={{
                      fontSize: 12,
                      color: "#6B7280",
                      fontWeight: "500"
                    }}>
                      {it.label === "New Product" ? "Add inventory" :
                       it.label === "Bulk Upload" ? "Upload CSV" :
                       it.label === "Offers" ? "Create deals" : "View earnings"}
                    </Text>
                  )}
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="#9CA3AF"
                />
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
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
              <Text style={{ color: "#374151", fontWeight: "700" }}>KYC Status:</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 8 }}>
                <Ionicons
                  name={kycStatus?.status === 'verified' ? "checkmark-circle" :
                        kycStatus?.status === 'pending' ? "time" :
                        kycStatus?.status === 'rejected' ? "close-circle" : "shield-outline"}
                  size={16}
                  color={kycStatus?.status === 'verified' ? "#10B981" :
                         kycStatus?.status === 'pending' ? "#F59E0B" :
                         kycStatus?.status === 'rejected' ? "#EF4444" : "#6B7280"}
                  style={{ marginRight: 4 }}
                />
                <Text style={{
                  color: kycStatus?.status === 'verified' ? "#10B981" :
                         kycStatus?.status === 'pending' ? "#F59E0B" :
                         kycStatus?.status === 'rejected' ? "#EF4444" : "#6B7280",
                  fontWeight: "600",
                  textTransform: "capitalize"
                }}>
                  {kycStatus?.status || "Not Started"}
                </Text>
              </View>
            </View>
            {(needsKyc || kycStatus?.status) && (
              <TouchableOpacity
                onPress={() => router.push("/(seller)/kyc")}
                style={{
                  marginTop: 12,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  backgroundColor: kycStatus?.status === 'verified' ? "#F0FDF4" : "#2563EB",
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Ionicons
                  name={kycStatus?.status === 'verified' ? "eye" : "shield-checkmark"}
                  size={16}
                  color={kycStatus?.status === 'verified' ? "#059669" : "#fff"}
                />
                <Text style={{
                  color: kycStatus?.status === 'verified' ? "#059669" : "#fff",
                  fontWeight: "600",
                  fontSize: 14
                }}>
                  {kycStatus?.status === 'verified' ? "View KYC Details" : "Complete KYC"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
