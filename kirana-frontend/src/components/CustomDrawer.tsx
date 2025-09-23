import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Dimensions, Animated, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useKyc } from "@/context/KYCContext";
import { useRouter } from "expo-router";

const { width: screenWidth } = Dimensions.get('window');
const DRAWER_WIDTH = screenWidth * 0.85;

interface CustomDrawerProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function CustomDrawer({ isVisible, onClose }: CustomDrawerProps) {
  const { user, logout } = useAuth();
  const { kycStatus, needsKyc } = useKyc();
  const router = useRouter();

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      slideAnim.setValue(-DRAWER_WIDTH);
      opacityAnim.setValue(0);

      setModalVisible(true);

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, 50);
    } else if (modalVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [isVisible]);

  const menuItems = [
    {
      title: "Dashboard",
      icon: "home-outline",
      route: "/(seller)/",
      description: "Overview & Quick Actions"
    },
    {
      title: "Products",
      icon: "cube-outline",
      route: "/(seller)/products",
      description: "Manage your inventory",
      requiresKyc: true
    },
    {
      title: "Orders",
      icon: "bag-handle-outline",
      route: "/(seller)/orders",
      description: "Track customer orders",
      requiresKyc: true
    },
    {
      title: "Analytics",
      icon: "bar-chart-outline",
      route: "/(seller)/analytics",
      description: "Sales insights",
      requiresKyc: true
    },
    {
      title: "KYC Verification",
      icon: kycStatus?.status === 'verified' ? "shield-checkmark" : "shield-outline",
      route: "/(seller)/kyc",
      description: kycStatus?.status === 'verified' ? "Verified" : "Complete verification"
    },
    {
      title: "Settings",
      icon: "settings-outline",
      route: "/(seller)/settings",
      description: "Account & preferences"
    }
  ];

  return (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" barStyle="light-content" />

      <Animated.View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        opacity: opacityAnim,
      }}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      <Animated.View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: DRAWER_WIDTH,
        backgroundColor: "#FFFFFF",
        transform: [{ translateX: slideAnim }],
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
      }}>
        <View style={{
          paddingTop: 50,
          paddingBottom: 30,
          paddingHorizontal: 24,
          backgroundColor: "#1F2937",
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}>
          <TouchableOpacity
            onPress={onClose}
            style={{
              position: 'absolute',
              top: 45,
              right: 20,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={{ marginTop: 20 }}>
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: "#374151",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}>
              <Text style={{
                fontSize: 24,
                fontWeight: "700",
                color: "#FFFFFF"
              }}>
                {(user?.name || "S").charAt(0).toUpperCase()}
              </Text>
            </View>

            <Text style={{
              fontSize: 20,
              fontWeight: "700",
              color: "#FFFFFF",
              marginBottom: 4
            }}>
              {user?.name || "Seller"}
            </Text>

            <Text style={{
              fontSize: 14,
              color: "#D1D5DB",
              marginBottom: 16
            }}>
              {user?.email || user?.phone}
            </Text>

            <View style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: kycStatus?.status === 'verified'
                ? 'rgba(16, 185, 129, 0.2)'
                : 'rgba(245, 158, 11, 0.2)',
              borderRadius: 20,
              alignSelf: "flex-start",
              borderWidth: 1,
              borderColor: kycStatus?.status === 'verified' ? "#10B981" : "#F59E0B",
            }}>
              <Ionicons
                name={kycStatus?.status === 'verified' ? "checkmark-circle" : "time"}
                size={16}
                color={kycStatus?.status === 'verified' ? "#10B981" : "#F59E0B"}
              />
              <Text style={{
                marginLeft: 8,
                fontSize: 12,
                fontWeight: "600",
                color: kycStatus?.status === 'verified' ? "#10B981" : "#F59E0B"
              }}>
                {kycStatus?.status === 'verified' ? "KYC Verified" : "KYC Pending"}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView style={{
          flex: 1,
          backgroundColor: "#F9FAFB",
          paddingTop: 8
        }}>
          <View style={{ paddingHorizontal: 12 }}>
            {menuItems.map((item, index) => {
              const isLocked = item.requiresKyc && needsKyc;

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    if (isLocked) {
                      router.push("/(seller)/kyc");
                    } else {
                      router.push(item.route as any);
                    }
                    onClose();
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 16,
                    paddingHorizontal: 20,
                    marginVertical: 4,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                    borderLeftWidth: 4,
                    borderLeftColor: isLocked ? "#F59E0B" : "transparent",
                  }}
                >
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: isLocked ? "#FEF3C7" : "#F3F4F6",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 16,
                  }}>
                    <Ionicons
                      name={isLocked ? "lock-closed" : item.icon as any}
                      size={22}
                      color={isLocked ? "#D97706" : "#374151"}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: isLocked ? "#D97706" : "#111827",
                      marginBottom: 4
                    }}>
                      {item.title}
                    </Text>
                    <Text style={{
                      fontSize: 13,
                      color: isLocked ? "#92400E" : "#6B7280",
                      lineHeight: 18
                    }}>
                      {isLocked ? "Complete KYC to unlock" : item.description}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={{
          padding: 20,
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          backgroundColor: "#FFFFFF"
        }}>
          <TouchableOpacity
            onPress={async () => {
              await logout();
              onClose();
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 14,
              paddingHorizontal: 20,
              backgroundColor: "#FEE2E2",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#FECACA",
            }}
          >
            <Ionicons name="log-out-outline" size={22} color="#DC2626" />
            <Text style={{
              marginLeft: 12,
              fontSize: 16,
              fontWeight: "600",
              color: "#DC2626"
            }}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}