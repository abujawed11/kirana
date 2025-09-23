import { Dimensions } from "react-native";

const { width: screenWidth } = Dimensions.get('window');

export const DRAWER_WIDTH = screenWidth * 0.85;

export const DRAWER_ANIMATION_DURATION = {
  OPEN: 300,
  CLOSE: 250
};

export const DRAWER_COLORS = {
  BACKGROUND: "#FFFFFF",
  HEADER_BACKGROUND: "#1F2937",
  HEADER_TEXT: "#FFFFFF",
  OVERLAY: "rgba(0, 0, 0, 0.5)",
  MENU_BACKGROUND: "#F9FAFB",
  MENU_ITEM_BACKGROUND: "#FFFFFF",
  BORDER: "#E5E7EB",
  KYC_VERIFIED: "#10B981",
  KYC_PENDING: "#F59E0B",
  LOGOUT_BACKGROUND: "#FEE2E2",
  LOGOUT_BORDER: "#FECACA",
  LOGOUT_TEXT: "#DC2626"
};