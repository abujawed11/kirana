// app/(seller)/kyc.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { MotiView, MotiText } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useKyc } from "@/context/KYCContext";
import { KycSubmissionData, GovernmentIdType, BusinessType } from "@/types/kyc";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type ValidationErrors = Partial<Record<keyof KycSubmissionData, string>>;

const GOVERNMENT_ID_OPTIONS: { value: GovernmentIdType; label: string }[] = [
  { value: "aadhaar", label: "Aadhaar Card" },
  { value: "pan", label: "PAN Card" },
  { value: "voter_id", label: "Voter ID" },
  { value: "driving_license", label: "Driving License" },
  { value: "passport", label: "Passport" },
];

const BUSINESS_TYPE_OPTIONS: { value: BusinessType; label: string }[] = [
  { value: "individual", label: "Individual/Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "private_limited", label: "Private Limited Company" },
  { value: "public_limited", label: "Public Limited Company" },
  { value: "llp", label: "Limited Liability Partnership" },
];

function validateKycForm(data: Partial<KycSubmissionData>): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.legalName?.trim()) {
    errors.legalName = "Legal name is required";
  } else if (data.legalName.trim().length < 2) {
    errors.legalName = "Legal name must be at least 2 characters";
  }

  if (!data.governmentId?.trim()) {
    errors.governmentId = "Government ID is required";
  } else if (data.governmentIdType === "aadhaar" && !/^\d{12}$/.test(data.governmentId)) {
    errors.governmentId = "Aadhaar must be 12 digits";
  } else if (data.governmentIdType === "pan" && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.governmentId)) {
    errors.governmentId = "PAN must be in format ABCDE1234F";
  }

  if (!data.governmentIdType) {
    errors.governmentIdType = "Please select government ID type";
  }

  if (!data.addressLine1?.trim()) {
    errors.addressLine1 = "Address is required";
  }

  if (!data.city?.trim()) {
    errors.city = "City is required";
  }

  if (!data.state?.trim()) {
    errors.state = "State is required";
  }

  if (!data.pincode?.trim()) {
    errors.pincode = "Pincode is required";
  } else if (!/^\d{6}$/.test(data.pincode)) {
    errors.pincode = "Pincode must be 6 digits";
  }

  if (!data.businessType) {
    errors.businessType = "Please select business type";
  }

  if (data.businessType !== "individual" && !data.businessName?.trim()) {
    errors.businessName = "Business name is required for this business type";
  }

  return errors;
}

export default function KycScreen() {
  const router = useRouter();
  const { kycStatus, loading, submitKyc, refreshKycStatus, isVerified, blockingReason } = useKyc();
  const [formData, setFormData] = useState<Partial<KycSubmissionData>>({
    legalName: "",
    governmentId: "",
    governmentIdType: "aadhaar",
    taxId: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    businessType: "individual",
    businessName: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const isValid = useMemo(() => {
    const validationErrors = validateKycForm(formData);
    return Object.keys(validationErrors).length === 0;
  }, [formData]);

  useEffect(() => {
    refreshKycStatus();
  }, [refreshKycStatus]);

  const updateField = (field: keyof KycSubmissionData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    try {
      const validationErrors = validateKycForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      setSubmitting(true);
      const result = await submitKyc(formData as KycSubmissionData);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          "KYC Submitted Successfully",
          "Your KYC application has been submitted for review. You will be notified once it's processed.",
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Submission Failed", result.error || "Failed to submit KYC application");
      }
    } catch (error) {
      console.error("KYC submission error:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "verified": return "#10B981";
      case "pending": return "#F59E0B";
      case "rejected": return "#EF4444";
      default: return "#6B7280";
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case "verified": return "checkmark-circle";
      case "pending": return "time";
      case "rejected": return "close-circle";
      default: return "document-text";
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 16, color: "#6B7280" }}>Loading KYC status...</Text>
      </View>
    );
  }

  if (isVerified) {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff", padding: 20, justifyContent: "center", alignItems: "center" }}>
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "timing", duration: 500 }}
          style={{ alignItems: "center" }}
        >
          <Ionicons name="checkmark-circle" size={80} color="#10B981" />
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#111827", marginTop: 16, textAlign: "center" }}>
            KYC Verified
          </Text>
          <Text style={{ fontSize: 16, color: "#6B7280", marginTop: 8, textAlign: "center" }}>
            Your identity has been verified successfully!
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              backgroundColor: "#2563EB",
              paddingHorizontal: 32,
              paddingVertical: 12,
              borderRadius: 8,
              marginTop: 24,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>Continue</Text>
          </TouchableOpacity>
        </MotiView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#fff" }}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Status Header */}
        <MotiView
          from={{ translateY: -20, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ type: "timing", duration: 300 }}
          style={{
            backgroundColor: "#F8FAFC",
            padding: 16,
            borderRadius: 12,
            marginBottom: 24,
            borderLeftWidth: 4,
            borderLeftColor: getStatusColor(kycStatus?.status),
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Ionicons name={getStatusIcon(kycStatus?.status)} size={24} color={getStatusColor(kycStatus?.status)} />
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111827", marginLeft: 8 }}>
              KYC Status: {kycStatus?.status?.charAt(0).toUpperCase() + kycStatus?.status?.slice(1) || "Unsubmitted"}
            </Text>
          </View>

          {blockingReason && (
            <Text style={{ color: "#6B7280", fontSize: 14 }}>{blockingReason}</Text>
          )}

          {kycStatus?.rejectionReason && (
            <View style={{ marginTop: 8, padding: 12, backgroundColor: "#FEF2F2", borderRadius: 8 }}>
              <Text style={{ color: "#DC2626", fontSize: 14, fontWeight: "600" }}>Rejection Reason:</Text>
              <Text style={{ color: "#DC2626", fontSize: 14, marginTop: 4 }}>{kycStatus.rejectionReason}</Text>
            </View>
          )}
        </MotiView>

        {/* Form */}
        <MotiView
          from={{ translateY: 20, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ type: "timing", duration: 400, delay: 100 }}
        >
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#111827", marginBottom: 8 }}>
            {kycStatus?.status === "rejected" ? "Resubmit KYC Application" : "Complete KYC Verification"}
          </Text>
          <Text style={{ color: "#6B7280", marginBottom: 24 }}>
            Please provide accurate information as it will be used for verification.
          </Text>

          {/* Personal Information */}
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827", marginBottom: 16 }}>
            Personal Information
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 8 }}>
              Legal Name *
            </Text>
            <TextInput
              value={formData.legalName}
              onChangeText={updateField("legalName")}
              placeholder="Enter your full legal name"
              style={{
                borderWidth: 1,
                borderColor: errors.legalName ? "#EF4444" : "#D1D5DB",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: "#fff",
              }}
            />
            {errors.legalName && (
              <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{errors.legalName}</Text>
            )}
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 8 }}>
              Government ID Type *
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {GOVERNMENT_ID_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => updateField("governmentIdType")(option.value)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: formData.governmentIdType === option.value ? "#2563EB" : "#D1D5DB",
                    backgroundColor: formData.governmentIdType === option.value ? "#EBF4FF" : "#fff",
                  }}
                >
                  <Text
                    style={{
                      color: formData.governmentIdType === option.value ? "#2563EB" : "#6B7280",
                      fontSize: 14,
                      fontWeight: "500",
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 8 }}>
              Government ID Number *
            </Text>
            <TextInput
              value={formData.governmentId}
              onChangeText={updateField("governmentId")}
              placeholder={`Enter your ${GOVERNMENT_ID_OPTIONS.find(o => o.value === formData.governmentIdType)?.label} number`}
              style={{
                borderWidth: 1,
                borderColor: errors.governmentId ? "#EF4444" : "#D1D5DB",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: "#fff",
              }}
              autoCapitalize="characters"
            />
            {errors.governmentId && (
              <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{errors.governmentId}</Text>
            )}
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 8 }}>
              Tax ID (Optional)
            </Text>
            <TextInput
              value={formData.taxId}
              onChangeText={updateField("taxId")}
              placeholder="Enter GST number or other tax ID"
              style={{
                borderWidth: 1,
                borderColor: "#D1D5DB",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: "#fff",
              }}
            />
          </View>

          {/* Address Information */}
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827", marginBottom: 16 }}>
            Address Information
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 8 }}>
              Address Line 1 *
            </Text>
            <TextInput
              value={formData.addressLine1}
              onChangeText={updateField("addressLine1")}
              placeholder="Street address, building number"
              style={{
                borderWidth: 1,
                borderColor: errors.addressLine1 ? "#EF4444" : "#D1D5DB",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: "#fff",
              }}
            />
            {errors.addressLine1 && (
              <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{errors.addressLine1}</Text>
            )}
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 8 }}>
              Address Line 2 (Optional)
            </Text>
            <TextInput
              value={formData.addressLine2}
              onChangeText={updateField("addressLine2")}
              placeholder="Apartment, suite, etc."
              style={{
                borderWidth: 1,
                borderColor: "#D1D5DB",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: "#fff",
              }}
            />
          </View>

          <View style={{ flexDirection: "row", gap: 16, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 8 }}>
                City *
              </Text>
              <TextInput
                value={formData.city}
                onChangeText={updateField("city")}
                placeholder="City"
                style={{
                  borderWidth: 1,
                  borderColor: errors.city ? "#EF4444" : "#D1D5DB",
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: "#fff",
                }}
              />
              {errors.city && (
                <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{errors.city}</Text>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 8 }}>
                State *
              </Text>
              <TextInput
                value={formData.state}
                onChangeText={updateField("state")}
                placeholder="State"
                style={{
                  borderWidth: 1,
                  borderColor: errors.state ? "#EF4444" : "#D1D5DB",
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: "#fff",
                }}
              />
              {errors.state && (
                <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{errors.state}</Text>
              )}
            </View>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 8 }}>
              Pincode *
            </Text>
            <TextInput
              value={formData.pincode}
              onChangeText={updateField("pincode")}
              placeholder="6-digit pincode"
              keyboardType="numeric"
              maxLength={6}
              style={{
                borderWidth: 1,
                borderColor: errors.pincode ? "#EF4444" : "#D1D5DB",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: "#fff",
              }}
            />
            {errors.pincode && (
              <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{errors.pincode}</Text>
            )}
          </View>

          {/* Business Information */}
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827", marginBottom: 16 }}>
            Business Information
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 8 }}>
              Business Type *
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {BUSINESS_TYPE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => updateField("businessType")(option.value)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: formData.businessType === option.value ? "#2563EB" : "#D1D5DB",
                    backgroundColor: formData.businessType === option.value ? "#EBF4FF" : "#fff",
                  }}
                >
                  <Text
                    style={{
                      color: formData.businessType === option.value ? "#2563EB" : "#6B7280",
                      fontSize: 14,
                      fontWeight: "500",
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {formData.businessType !== "individual" && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 8 }}>
                Business Name *
              </Text>
              <TextInput
                value={formData.businessName}
                onChangeText={updateField("businessName")}
                placeholder="Enter registered business name"
                style={{
                  borderWidth: 1,
                  borderColor: errors.businessName ? "#EF4444" : "#D1D5DB",
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: "#fff",
                }}
              />
              {errors.businessName && (
                <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{errors.businessName}</Text>
              )}
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!isValid || submitting}
            style={{
              backgroundColor: isValid && !submitting ? "#2563EB" : "#9CA3AF",
              paddingVertical: 16,
              borderRadius: 8,
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                {kycStatus?.status === "rejected" ? "Resubmit KYC" : "Submit KYC Application"}
              </Text>
            )}
          </TouchableOpacity>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}