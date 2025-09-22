// // app/(auth)/signup.tsx
// import React, { useMemo, useState } from "react";
// import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Alert } from "react-native";
// import { useRouter } from "expo-router";
// import { signupSeller } from "@/features/auth/api";

// type Errors = Partial<Record<"name"|"email"|"phone"|"password"|"confirmPassword", string>>;

// function validate(values: {
//   name: string;
//   email: string;
//   phone: string;
//   password: string;
//   confirmPassword: string;
// }): Errors {
//   const e: Errors = {};
//   if (!values.name || values.name.trim().length < 2) e.name = "Enter full name";
//   const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email);
//   if (!emailOk) e.email = "Enter a valid email";
//   const digits = values.phone.replace(/\D/g, "");
//   if (digits.length !== 10) e.phone = "Enter 10-digit mobile";
//   if (!values.password || values.password.length < 6) e.password = "At least 6 characters";
//   if (!values.confirmPassword) e.confirmPassword = "Confirm password";
//   if (values.password && values.confirmPassword && values.password !== values.confirmPassword) {
//     e.confirmPassword = "Passwords do not match";
//   }
//   return e;
// }

// export default function SellerSignup() {
//   const router = useRouter();
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     password: "",
//     confirmPassword: "",
//   });
//   const [showPwd, setShowPwd] = useState(false);
//   const [showPwd2, setShowPwd2] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [errors, setErrors] = useState<Errors>({});

//   const isValid = useMemo(() => Object.keys(validate(form)).length === 0, [form]);

//   const update = (key: keyof typeof form) => (t: string) =>
//     setForm((s) => ({ ...s, [key]: key === "phone" ? t.replace(/[^0-9]/g, "").slice(0, 10) : t }));

//   const onSubmit = async () => {
//     const e = validate(form);
//     setErrors(e);
//     if (Object.keys(e).length) return;

//     try {
//       setSubmitting(true);
//       const res = await signupSeller({
//         name: form.name.trim(),
//         email: form.email.trim().toLowerCase(),
//         phone: form.phone,
//         password: form.password,
//       });

//       if (res.success) {
//         // Navigate to OTP (if your backend sends one)
//         router.push({ pathname: "/(auth)/otp", params: { phone: form.phone } });
//       } else {
//         Alert.alert("Signup failed", res.error || "Please try again");
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
//           <Text className="text-3xl font-extrabold text-emerald-700">Create Seller Account</Text>
//           <Text className="text-neutral-600 mt-2">Start listing your products and accept orders.</Text>
//         </View>

//         {/* Name */}
//         <View className="mb-4">
//           <Text className="text-neutral-700 mb-2 font-semibold">Full Name</Text>
//           <View className="rounded-2xl border border-neutral-300 bg-white px-3">
//             <TextInput
//               className="py-3 text-base"
//               value={form.name}
//               onChangeText={update("name")}
//               placeholder="e.g. Rakesh Gupta"
//               autoCapitalize="words"
//             />
//           </View>
//           {errors.name ? <Text className="text-red-600 mt-1 text-sm">{errors.name}</Text> : null}
//         </View>

//         {/* Email */}
//         <View className="mb-4">
//           <Text className="text-neutral-700 mb-2 font-semibold">Email</Text>
//           <View className="rounded-2xl border border-neutral-300 bg-white px-3">
//             <TextInput
//               className="py-3 text-base"
//               value={form.email}
//               onChangeText={update("email")}
//               placeholder="you@store.com"
//               autoCapitalize="none"
//               keyboardType="email-address"
//             />
//           </View>
//           {errors.email ? <Text className="text-red-600 mt-1 text-sm">{errors.email}</Text> : null}
//         </View>

//         {/* Phone */}
//         <View className="mb-4">
//           <Text className="text-neutral-700 mb-2 font-semibold">Mobile Number</Text>
//           <View className="rounded-2xl border border-neutral-300 bg-white px-3">
//             <TextInput
//               className="py-3 text-base"
//               value={form.phone}
//               onChangeText={update("phone")}
//               placeholder="10-digit number"
//               keyboardType="phone-pad"
//             />
//           </View>
//           {errors.phone ? <Text className="text-red-600 mt-1 text-sm">{errors.phone}</Text> : null}
//         </View>

//         {/* Password */}
//         <View className="mb-4">
//           <Text className="text-neutral-700 mb-2 font-semibold">Password</Text>
//           <View className="flex-row items-center rounded-2xl border border-neutral-300 bg-white px-3">
//             <TextInput
//               className="flex-1 py-3 text-base"
//               value={form.password}
//               onChangeText={update("password")}
//               placeholder="At least 6 characters"
//               secureTextEntry={!showPwd}
//               autoCapitalize="none"
//             />
//             <TouchableOpacity className="px-2 py-2" onPress={() => setShowPwd((s) => !s)}>
//               <Text className="text-emerald-700 font-semibold">{showPwd ? "Hide" : "Show"}</Text>
//             </TouchableOpacity>
//           </View>
//           {errors.password ? <Text className="text-red-600 mt-1 text-sm">{errors.password}</Text> : null}
//         </View>

//         {/* Confirm Password */}
//         <View className="mb-2">
//           <Text className="text-neutral-700 mb-2 font-semibold">Confirm Password</Text>
//           <View className="flex-row items-center rounded-2xl border border-neutral-300 bg-white px-3">
//             <TextInput
//               className="flex-1 py-3 text-base"
//               value={form.confirmPassword}
//               onChangeText={update("confirmPassword")}
//               placeholder="Re-enter password"
//               secureTextEntry={!showPwd2}
//               autoCapitalize="none"
//             />
//             <TouchableOpacity className="px-2 py-2" onPress={() => setShowPwd2((s) => !s)}>
//               <Text className="text-emerald-700 font-semibold">{showPwd2 ? "Hide" : "Show"}</Text>
//             </TouchableOpacity>
//           </View>
//           {errors.confirmPassword ? <Text className="text-red-600 mt-1 text-sm">{errors.confirmPassword}</Text> : null}
//         </View>

//         {/* Submit */}
//         <TouchableOpacity
//           disabled={!isValid || submitting}
//           onPress={onSubmit}
//           className={`mt-3 rounded-2xl py-4 items-center ${!isValid || submitting ? "bg-emerald-300" : "bg-emerald-600"}`}
//         >
//           {submitting ? <ActivityIndicator /> : <Text className="text-white font-bold text-base">Create Account</Text>}
//         </TouchableOpacity>

//         {/* Link to Login */}
//         <View className="mt-4 flex-row justify-center">
//           <Text className="text-neutral-700">Already have an account? </Text>
//           <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
//             <Text className="text-emerald-700 font-semibold">Log in</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }







// app/(auth)/signup.tsx
import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  StatusBar,
  Keyboard,
  BackHandler,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { signupSeller } from "@/features/auth/api";
import { MotiView, MotiText, AnimatePresence } from "moti";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Enhanced validation with security checks
type ValidationErrors = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

type FormData = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type PasswordStrength = "weak" | "fair" | "good" | "strong";

// Advanced validation with security best practices
const validateForm = (values: FormData): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  // Name validation - more comprehensive
  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!values.name.trim()) {
    errors.name = "Full name is required";
  } else if (values.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  } else if (!nameRegex.test(values.name.trim())) {
    errors.name = "Name can only contain letters and spaces";
  } else if (values.name.trim().length > 50) {
    errors.name = "Name cannot exceed 50 characters";
  }

  // Enhanced email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(values.email.trim())) {
    errors.email = "Please enter a valid email address";
  } else if (values.email.trim().length > 254) {
    errors.email = "Email address is too long";
  }

  // Enhanced phone validation with Indian number formats
  const phoneRegex = /^[6-9]\d{9}$/;
  const cleanedPhone = values.phone.replace(/\D/g, "");
  if (!values.phone) {
    errors.phone = "Mobile number is required";
  } else if (cleanedPhone.length < 10) {
    errors.phone = "Mobile number must be 10 digits";
  } else if (!phoneRegex.test(cleanedPhone)) {
    errors.phone = "Please enter a valid Indian mobile number";
  }

  // Advanced password validation
  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(values.password)) {
    errors.password = "Password must contain uppercase, lowercase, and number";
  } else if (values.password.length > 128) {
    errors.password = "Password cannot exceed 128 characters";
  }

  // Confirm password validation
  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (values.password && values.confirmPassword && values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

// Password strength checker
const checkPasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  if (password.length >= 12) score++;

  if (score <= 2) return "weak";
  if (score <= 3) return "fair";
  if (score <= 4) return "good";
  return "strong";
};

// Animated text with better performance
const AnimatedText = React.memo(({
  text,
  delay = 25,
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
          from={{ opacity: 0, translateY: 12, scale: 0.8 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{
            delay: index * delay,
            type: "spring",
            damping: 15,
            stiffness: 100,
          }}
        >
          <Text style={style}>{char === " " ? "\u00A0" : char}</Text>
        </MotiView>
      ))}
    </View>
  );
});

// Password strength indicator
const PasswordStrengthIndicator = React.memo(({ strength, password }: { strength: PasswordStrength; password: string }) => {
  const getStrengthColor = (strength: PasswordStrength) => {
    switch (strength) {
      case "weak": return "#EF4444";
      case "fair": return "#F59E0B";
      case "good": return "#3B82F6";
      case "strong": return "#10B981";
    }
  };

  const getStrengthWidth = (strength: PasswordStrength) => {
    switch (strength) {
      case "weak": return "25%";
      case "fair": return "50%";
      case "good": return "75%";
      case "strong": return "100%";
    }
  };

  if (!password) return null;

  return (
    <MotiView
      from={{ opacity: 0, translateY: -10 }}
      animate={{ opacity: 1, translateY: 0 }}
      style={{ marginTop: 8 }}
    >
      <View style={{
        height: 4,
        backgroundColor: "#F3F4F6",
        borderRadius: 2,
        marginBottom: 4,
      }}>
        <MotiView
          from={{ width: "0%" }}
          animate={{ width: getStrengthWidth(strength) }}
          transition={{ type: "timing", duration: 300 }}
          style={{
            height: "100%",
            backgroundColor: getStrengthColor(strength),
            borderRadius: 2,
          }}
        />
      </View>
      <Text style={{
        fontSize: 12,
        color: getStrengthColor(strength),
        fontWeight: "600",
        textTransform: "capitalize",
      }}>
        Password strength: {strength}
      </Text>
    </MotiView>
  );
});

// Enhanced form input with accessibility and better UX
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
  accessibilityLabel,
  accessibilityHint,
  maxLength,
  multiline = false,
  onSubmitEditing,
  returnKeyType = "next",
  blurOnSubmit = false,
  inputRef,
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
  accessibilityLabel?: string;
  accessibilityHint?: string;
  maxLength?: number;
  multiline?: boolean;
  onSubmitEditing?: () => void;
  returnKeyType?: "done" | "go" | "next" | "search" | "send";
  blurOnSubmit?: boolean;
  inputRef?: React.RefObject<TextInput | null>;
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
      }}>
        {label}
        {maxLength && value && (
          <Text style={{ color: "#9CA3AF", fontWeight: "400" }}>
            {` (${value.length}/${maxLength})`}
          </Text>
        )}
      </Text>
      <MotiView
        animate={{
          borderColor: error ? "#EF4444" : isFocused ? "#10B981" : "#D1D5DB",
          shadowOpacity: isFocused ? 0.1 : 0,
          shadowRadius: isFocused ? 8 : 0,
        }}
        transition={{ type: "timing", duration: 200 }}
        style={{
          borderRadius: 12,
          borderWidth: 1.5,
          backgroundColor: "#FFFFFF",
          flexDirection: "row",
          alignItems: multiline ? "flex-start" : "center",
          paddingHorizontal: 16,
          minHeight: multiline ? 80 : 52,
          shadowColor: "#10B981",
          shadowOffset: { width: 0, height: 2 },
          elevation: isFocused ? 3 : 0,
        }}
      >
        <TextInput
          ref={inputRef}
          testID={testID}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          style={{
            flex: 1,
            fontSize: 16,
            color: "#111827",
            paddingVertical: multiline ? 16 : 12,
            textAlignVertical: multiline ? "top" : "center",
          }}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCorrect={false}
          spellCheck={false}
          maxLength={maxLength}
          multiline={multiline}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          blurOnSubmit={blurOnSubmit}
          enablesReturnKeyAutomatically
        />
        {rightElement}
      </MotiView>
      <AnimatePresence>
        {error && (
          <MotiView
            key={error}
            from={{ opacity: 0, translateY: -5, scale: 0.95 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            exit={{ opacity: 0, translateY: -5, scale: 0.95 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            style={{ 
              marginTop: 6,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Ionicons name="alert-circle" size={14} color="#EF4444" />
            <Text style={{
              color: "#EF4444",
              fontSize: 13,
              fontWeight: "500",
              marginLeft: 4,
              flex: 1,
            }}>
              {error}
            </Text>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
});

// Loading overlay component
const LoadingOverlay = React.memo(({ visible }: { visible: boolean }) => (
  <AnimatePresence>
    {visible && (
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 24,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={{
            marginTop: 12,
            fontSize: 16,
            fontWeight: "600",
            color: "#374151",
          }}>
            Creating your account...
          </Text>
        </MotiView>
      </MotiView>
    )}
  </AnimatePresence>
));

// Main signup component
export default function SellerSignup() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Refs for input focus management
  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  
  const passwordStrength = useMemo(
    () => checkPasswordStrength(formData.password),
    [formData.password]
  );
  
  const isFormValid = useMemo(
    () => Object.keys(validateForm(formData)).length === 0,
    [formData]
  );

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Handle back button on Android
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isSubmitting) {
          return true; // Prevent going back while submitting
        }
        return false;
      };

      const backHandler = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => backHandler.remove();
    }, [isSubmitting])
  );

  const updateField = useCallback(
    (field: keyof FormData) => (value: string) => {
      let processedValue = value;
      
      // Field-specific processing
      switch (field) {
        case "phone":
          processedValue = value.replace(/[^0-9]/g, "").slice(0, 10);
          break;
        case "email":
          processedValue = value.toLowerCase().trim();
          break;
        case "name":
          // Remove extra spaces and limit length
          processedValue = value.replace(/\s+/g, " ").slice(0, 50);
          break;
      }
      
      setFormData(prev => ({ ...prev, [field]: processedValue }));
      
      // Clear field error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  // Enhanced input navigation
  const focusNextInput = useCallback((nextInputRef: React.RefObject<TextInput | null>) => {
    setTimeout(() => nextInputRef.current?.focus(), 100);
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      setSubmitAttempts(prev => prev + 1);
      
      const validationErrors = validateForm(formData);
      setErrors(validationErrors);
      
      if (Object.keys(validationErrors).length > 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      setIsSubmitting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const response = await signupSeller({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone,
        password: formData.password,
      });

      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Clear form on success
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
        });
        
        // Navigate to OTP verification
        router.replace({ 
          pathname: "/(auth)/otp", 
          params: { 
            phone: formData.phone,
            email: formData.email 
          } 
        });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setErrors({
          general: response.error || "Signup failed. Please try again.",
        });
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      setErrors({
        general: error?.message || "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, router]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const navigateToLogin = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(auth)/login");
  }, [router]);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: "height" })}
        style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: Platform.OS === "ios" ? 60 : 50,
            paddingBottom: keyboardVisible ? 20 : 40,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header Section */}
          <MotiView
            from={{ opacity: 0, translateY: 40 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 100, type: "spring", damping: 15 }}
            style={{ 
              marginBottom: keyboardVisible ? 20 : 40, 
              alignItems: "center" 
            }}
          >
            {/* Logo/Brand */}
            <MotiView
              from={{ scale: 0, rotate: "180deg" }}
              animate={{ scale: 1, rotate: "0deg" }}
              transition={{ delay: 200, type: "spring", damping: 12 }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                backgroundColor: "#10B981",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 24,
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <Ionicons name="person-add-outline" size={40} color="#FFFFFF" />
            </MotiView>

            <AnimatedText
              text="Create Account"
              delay={30}
              style={{
                fontSize: 32,
                fontWeight: "800",
                color: "#111827",
                textAlign: "center",
              }}
            />
            
            <MotiText
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 800 }}
              style={{
                fontSize: 16,
                color: "#6B7280",
                textAlign: "center",
                marginTop: 8,
                lineHeight: 24,
              }}
            >
              Join thousands of successful sellers
            </MotiText>
          </MotiView>

          {/* Form Section */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300, type: "spring", damping: 15 }}
          >
            {/* General Error Message */}
            <AnimatePresence>
              {errors.general && (
                <MotiView
                  key={errors.general}
                  from={{ opacity: 0, scale: 0.9, translateY: -10 }}
                  animate={{ opacity: 1, scale: 1, translateY: 0 }}
                  exit={{ opacity: 0, scale: 0.9, translateY: -10 }}
                  transition={{ type: "spring", damping: 15 }}
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
            </AnimatePresence>

            <FormInput
              testID="name-input"
              inputRef={nameInputRef}
              label="Full Name"
              value={formData.name}
              onChangeText={updateField("name")}
              placeholder="Enter your full name"
              autoCapitalize="words"
              error={errors.name}
              accessibilityLabel="Full Name Input"
              accessibilityHint="Enter your complete name as it appears on official documents"
              maxLength={50}
              onSubmitEditing={() => focusNextInput(emailInputRef)}
            />

            <FormInput
              testID="email-input"
              inputRef={emailInputRef}
              label="Email Address"
              value={formData.email}
              onChangeText={updateField("email")}
              placeholder="Enter your email address"
              keyboardType="email-address"
              error={errors.email}
              accessibilityLabel="Email Address Input"
              accessibilityHint="Enter your email address for account verification"
              maxLength={254}
              onSubmitEditing={() => focusNextInput(phoneInputRef)}
            />

            <FormInput
              testID="phone-input"
              inputRef={phoneInputRef}
              label="Mobile Number"
              value={formData.phone}
              onChangeText={updateField("phone")}
              placeholder="Enter your 10-digit mobile number"
              keyboardType="phone-pad"
              error={errors.phone}
              accessibilityLabel="Mobile Number Input"
              accessibilityHint="Enter your 10-digit Indian mobile number"
              maxLength={10}
              onSubmitEditing={() => focusNextInput(passwordInputRef)}
            />

            <View>
              <FormInput
                testID="password-input"
                inputRef={passwordInputRef}
                label="Password"
                value={formData.password}
                onChangeText={updateField("password")}
                placeholder="Create a strong password"
                secureTextEntry={!showPassword}
                error={errors.password}
                accessibilityLabel="Password Input"
                accessibilityHint="Create a strong password with at least 8 characters"
                maxLength={128}
                onSubmitEditing={() => focusNextInput(confirmPasswordInputRef)}
                rightElement={
                  <TouchableOpacity
                    onPress={togglePasswordVisibility}
                    style={{
                      padding: 8,
                      marginLeft: 8,
                    }}
                    testID="toggle-password"
                    accessibilityLabel={showPassword ? "Hide Password" : "Show Password"}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                }
              />
              <PasswordStrengthIndicator 
                strength={passwordStrength} 
                password={formData.password} 
              />
            </View>

            <FormInput
              testID="confirm-password-input"
              inputRef={confirmPasswordInputRef}
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={updateField("confirmPassword")}
              placeholder="Re-enter your password"
              secureTextEntry={!showConfirmPassword}
              error={errors.confirmPassword}
              accessibilityLabel="Confirm Password Input"
              accessibilityHint="Re-enter your password to confirm"
              maxLength={128}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              blurOnSubmit
              rightElement={
                <TouchableOpacity
                  onPress={toggleConfirmPasswordVisibility}
                  style={{
                    padding: 8,
                    marginLeft: 8,
                  }}
                  testID="toggle-confirm-password"
                  accessibilityLabel={showConfirmPassword ? "Hide Confirm Password" : "Show Confirm Password"}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              }
            />

            {/* Submit Button */}
            <MotiView
              animate={{
                scale: isFormValid ? 1 : 0.98,
                opacity: isFormValid ? 1 : 0.7,
              }}
              transition={{ type: "timing", duration: 200 }}
            >
              <TouchableOpacity
                testID="signup-button"
                // disabled={!isFormValid || isSubmitting}
                onPress={handleSubmit}
                style={{
                  backgroundColor: (!isFormValid || isSubmitting) ? "#D1FAE5" : "#10B981",
                  borderRadius: 12,
                  height: 52,
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 8,
                  marginBottom: 24,
                  shadowColor: isFormValid ? "#10B981" : "transparent",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: isFormValid ? 4 : 0,
                }}
                activeOpacity={0.8}
                accessibilityLabel="Create Account Button"
                accessibilityHint="Submit the form to create your seller account"
              >
                <Text style={{
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontWeight: "700",
                }}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </MotiView>

            {/* Terms and Privacy */}
            <Text style={{
              fontSize: 12,
              color: "#6B7280",
              textAlign: "center",
              lineHeight: 18,
              marginBottom: 24,
            }}>
              By creating an account, you agree to our{" "}
              <Text style={{ color: "#10B981", fontWeight: "600" }}>Terms of Service</Text>
              {" "}and{" "}
              <Text style={{ color: "#10B981", fontWeight: "600" }}>Privacy Policy</Text>
            </Text>

            {/* Login Link */}
            <View style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}>
              <Text style={{
                color: "#6B7280",
                fontSize: 14,
              }}>
                Already have an account? 
              </Text>
              <TouchableOpacity 
                onPress={navigateToLogin}
                accessibilityLabel="Sign In Link"
                accessibilityHint="Navigate to sign in page"
              >
                <Text style={{
                  color: "#10B981",
                  fontSize: 14,
                  fontWeight: "600",
                  marginLeft: 4,
                }}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        </ScrollView>
        
        {/* Loading Overlay */}
        <LoadingOverlay visible={isSubmitting} />
      </KeyboardAvoidingView>
    </>
  );
}