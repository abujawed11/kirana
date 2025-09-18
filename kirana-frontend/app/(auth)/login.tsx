// // app/(auth)/login.tsx
// import React, { useMemo, useState } from "react";
// import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Alert } from "react-native";
// import { useRouter } from "expo-router";
// import { loginSeller } from "@/features/auth/api";

// type Errors = Partial<Record<"phoneOrEmail" | "password", string>>;

// function validate(values: { phoneOrEmail: string; password: string }): Errors {
//   const e: Errors = {};
//   const v = values.phoneOrEmail.trim();
//   if (!v) {
//     e.phoneOrEmail = "Enter phone or email";
//   } else {
//     const asDigits = v.replace(/\D/g, "");
//     const looksEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
//     if (!looksEmail && asDigits.length !== 10) {
//       e.phoneOrEmail = "Enter valid email or 10-digit phone";
//     }
//   }
//   if (!values.password) e.password = "Enter password";
//   return e;
// }

// export default function SellerLogin() {
//   const router = useRouter();
//   const [form, setForm] = useState({ phoneOrEmail: "", password: "" });
//   const [showPwd, setShowPwd] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [errors, setErrors] = useState<Errors>({});

//   const isValid = useMemo(() => Object.keys(validate(form)).length === 0, [form]);
//   const update = (key: keyof typeof form) => (t: string) => setForm((s) => ({ ...s, [key]: t }));

//   const onSubmit = async () => {
//     const e = validate(form);
//     setErrors(e);
//     if (Object.keys(e).length) return;

//     try {
//       setSubmitting(true);
//       const res = await loginSeller({
//         phoneOrEmail: form.phoneOrEmail.trim(),
//         password: form.password,
//       });

//       if (res.success) {
//         // Persist token/user as needed, then take seller to dashboard:
//         router.replace("/(seller)");
//       } else {
//         Alert.alert("Login failed", res.error || "Please try again");
//       }
//     } catch (err: any) {
//       Alert.alert("Error", err?.message ?? "Something went wrong");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} className="flex-1 bg-white">
//       <ScrollView contentContainerStyle={{ padding: 20 }}>
//         <View className="mt-6 mb-8">
//           <Text className="text-3xl font-extrabold text-emerald-700">Welcome back</Text>
//           <Text className="text-neutral-600 mt-2">Log in to manage your store.</Text>
//         </View>

//         {/* Phone/Email */}
//         <View className="mb-4">
//           <Text className="text-neutral-700 mb-2 font-semibold">Phone or Email</Text>
//           <View className="rounded-2xl border border-neutral-300 bg-white px-3">
//             <TextInput
//               className="py-3 text-base"
//               value={form.phoneOrEmail}
//               onChangeText={update("phoneOrEmail")}
//               placeholder="e.g. 9876543210 or you@store.com"
//               autoCapitalize="none"
//               keyboardType="default"
//             />
//           </View>
//           {errors.phoneOrEmail ? <Text className="text-red-600 mt-1 text-sm">{errors.phoneOrEmail}</Text> : null}
//         </View>

//         {/* Password */}
//         <View className="mb-2">
//           <Text className="text-neutral-700 mb-2 font-semibold">Password</Text>
//           <View className="flex-row items-center rounded-2xl border border-neutral-300 bg-white px-3">
//             <TextInput
//               className="flex-1 py-3 text-base"
//               value={form.password}
//               onChangeText={update("password")}
//               placeholder="Your password"
//               secureTextEntry={!showPwd}
//               autoCapitalize="none"
//             />
//             <TouchableOpacity className="px-2 py-2" onPress={() => setShowPwd((s) => !s)}>
//               <Text className="text-emerald-700 font-semibold">{showPwd ? "Hide" : "Show"}</Text>
//             </TouchableOpacity>
//           </View>
//           {errors.password ? <Text className="text-red-600 mt-1 text-sm">{errors.password}</Text> : null}
//         </View>

//         {/* Submit */}
//         <TouchableOpacity
//           disabled={!isValid || submitting}
//           onPress={onSubmit}
//           className={`mt-3 rounded-2xl py-4 items-center ${!isValid || submitting ? "bg-emerald-300" : "bg-emerald-600"}`}
//         >
//           {submitting ? <ActivityIndicator /> : <Text className="text-white font-bold text-base">Log in</Text>}
//         </TouchableOpacity>

//         {/* Link to Signup */}
//         <View className="mt-4 flex-row justify-center">
//           <Text className="text-neutral-700">New to Kirana? </Text>
//           <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
//             <Text className="text-emerald-700 font-semibold">Create an account</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }



// app/(auth)/login.tsx
import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
  Dimensions,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { loginSeller } from "@/features/auth/api";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Enhanced validation with better error messages
type ValidationErrors = {
  phoneOrEmail?: string;
  password?: string;
  general?: string;
};

type FormData = {
  phoneOrEmail: string;
  password: string;
};

const validateForm = (values: FormData): ValidationErrors => {
  const errors: ValidationErrors = {};
  const identifier = values.phoneOrEmail.trim();
  
  if (!identifier) {
    errors.phoneOrEmail = "Phone number or email is required";
    return errors;
  }

  // Enhanced email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^[6-9]\d{9}$/; // Indian phone number format
  const cleanedPhone = identifier.replace(/\D/g, "");

  const isValidEmail = emailRegex.test(identifier);
  const isValidPhone = phoneRegex.test(cleanedPhone);

  if (!isValidEmail && !isValidPhone) {
    errors.phoneOrEmail = "Please enter a valid email or 10-digit phone number";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  return errors;
};

// Professional animated text component
const AnimatedText = React.memo(({
  text,
  delay = 30,
  style,
  containerStyle,
}: {
  text: string;
  delay?: number;
  style?: any;
  containerStyle?: any;
}) => {
  return (
    <View style={[{ flexDirection: "row", flexWrap: "wrap" }, containerStyle]}>
      {text.split("").map((char, index) => (
        <MotiView
          key={`${char}-${index}`}
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            delay: index * delay,
            type: "timing",
            duration: 400,
          }}
        >
          <Text style={style}>{char === " " ? "\u00A0" : char}</Text>
        </MotiView>
      ))}
    </View>
  );
});

// Custom input component with better UX
const FormInput = React.memo(({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  keyboardType = "default",
  autoCapitalize = "none",
  rightElement,
  testID,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  error?: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  rightElement?: React.ReactNode;
  testID?: string;
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
      }}>
        {label}
      </Text>
      <View style={{
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: error ? "#EF4444" : isFocused ? "#10B981" : "#D1D5DB",
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        minHeight: 52,
      }}>
        <TextInput
          testID={testID}
          style={{
            flex: 1,
            fontSize: 16,
            color: "#111827",
            paddingVertical: 12,
          }}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCorrect={false}
          spellCheck={false}
        />
        {rightElement}
      </View>
      {error && (
        <MotiView
          from={{ opacity: 0, translateY: -5 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={{ marginTop: 6 }}
        >
          <Text style={{
            color: "#EF4444",
            fontSize: 13,
            fontWeight: "500",
          }}>
            {error}
          </Text>
        </MotiView>
      )}
    </View>
  );
});

// Main login component
export default function SellerLogin() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    phoneOrEmail: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  const isFormValid = useMemo(
    () => Object.keys(validateForm(formData)).length === 0,
    [formData]
  );

  const updateField = useCallback(
    (field: keyof FormData) => (value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      // Clear field error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const handleSubmit = useCallback(async () => {
    try {
      const validationErrors = validateForm(formData);
      setErrors(validationErrors);
      
      if (Object.keys(validationErrors).length > 0) {
        return;
      }

      setIsSubmitting(true);
      
      const response = await loginSeller({
        phoneOrEmail: formData.phoneOrEmail.trim(),
        password: formData.password,
      });

      if (response.success) {
        // Clear form on success
        setFormData({ phoneOrEmail: "", password: "" });
        router.replace("/(seller)");
      } else {
        setErrors({
          general: response.error || "Login failed. Please check your credentials and try again.",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setErrors({
        general: error?.message || "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, router]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const navigateToSignup = useCallback(() => {
    router.push("/(auth)/signup");
  }, [router]);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: "height" })}
        style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: Platform.OS === "ios" ? 60 : 40,
            paddingBottom: 40,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 100 }}
            style={{ marginBottom: 40, alignItems: "center" }}
          >
            {/* Logo/Brand */}
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              backgroundColor: "#10B981",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 24,
            }}>
              <Ionicons name="storefront-outline" size={40} color="#FFFFFF" />
            </View>

            <AnimatedText
              text="Welcome Back"
              delay={40}
              style={{
                fontSize: 32,
                fontWeight: "800",
                color: "#111827",
                textAlign: "center",
              }}
            />
            <Text style={{
              fontSize: 16,
              color: "#6B7280",
              textAlign: "center",
              marginTop: 8,
              lineHeight: 24,
            }}>
              Sign in to continue managing your store
            </Text>
          </MotiView>

          {/* Form Section */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
          >
            {/* General Error Message */}
            {errors.general && (
              <MotiView
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  backgroundColor: "#FEF2F2",
                  borderColor: "#FECACA",
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 20,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                <Text style={{
                  color: "#DC2626",
                  fontSize: 14,
                  fontWeight: "500",
                  marginLeft: 8,
                  flex: 1,
                }}>
                  {errors.general}
                </Text>
              </MotiView>
            )}

            <FormInput
              testID="phone-email-input"
              label="Phone Number or Email"
              value={formData.phoneOrEmail}
              onChangeText={updateField("phoneOrEmail")}
              placeholder="Enter your phone or email"
              keyboardType="email-address"
              error={errors.phoneOrEmail}
            />

            <FormInput
              testID="password-input"
              label="Password"
              value={formData.password}
              onChangeText={updateField("password")}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              error={errors.password}
              rightElement={
                <TouchableOpacity
                  onPress={togglePasswordVisibility}
                  style={{
                    padding: 8,
                    marginLeft: 8,
                  }}
                  testID="toggle-password"
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              }
            />

            {/* Submit Button */}
            <TouchableOpacity
              testID="login-button"
              disabled={!isFormValid || isSubmitting}
              onPress={handleSubmit}
              style={{
                backgroundColor: (!isFormValid || isSubmitting) ? "#D1FAE5" : "#10B981",
                borderRadius: 12,
                height: 52,
                justifyContent: "center",
                alignItems: "center",
                marginTop: 8,
                marginBottom: 24,
              }}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={{
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontWeight: "700",
                }}>
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={{ alignSelf: "center", marginBottom: 24 }}
              onPress={() => router.push("/(auth)/forgot-password")}
            >
              <Text style={{
                color: "#10B981",
                fontSize: 14,
                fontWeight: "600",
              }}>
                Forgot your password?
              </Text>
            </TouchableOpacity>

            {/* Signup Link */}
            <View style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}>
              <Text style={{
                color: "#6B7280",
                fontSize: 14,
              }}>
                New to our platform? 
              </Text>
              <TouchableOpacity onPress={navigateToSignup}>
                <Text style={{
                  color: "#10B981",
                  fontSize: 14,
                  fontWeight: "600",
                  marginLeft: 4,
                }}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}