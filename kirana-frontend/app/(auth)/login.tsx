// app/(auth)/login.tsx
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
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { loginSeller } from "@/features/auth/api";
import { useAuth } from "@/context/AuthContext";
import { MotiView, MotiText, AnimatePresence } from "moti";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Enhanced validation with security checks
type ValidationErrors = {
  phoneOrEmail?: string;
  password?: string;
  general?: string;
};

type FormData = {
  phoneOrEmail: string;
  password: string;
};

// Advanced validation with security best practices
const validateForm = (values: FormData): ValidationErrors => {
  const errors: ValidationErrors = {};
  const identifier = values.phoneOrEmail.trim();
  
  if (!identifier) {
    errors.phoneOrEmail = "Phone number or email is required";
    return errors;
  }

  // Enhanced email validation (RFC 5322 compliant)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const phoneRegex = /^[6-9]\d{9}$/; // Indian phone number format
  const cleanedPhone = identifier.replace(/\D/g, "");

  const isValidEmail = emailRegex.test(identifier);
  const isValidPhone = phoneRegex.test(cleanedPhone);

  if (!isValidEmail && !isValidPhone) {
    errors.phoneOrEmail = "Please enter a valid email or Indian mobile number";
  } else if (identifier.length > 254) {
    errors.phoneOrEmail = "Input is too long";
  }

  // Enhanced password validation
  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  } else if (values.password.length > 128) {
    errors.password = "Password cannot exceed 128 characters";
  }

  return errors;
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
          alignItems: "center",
          paddingHorizontal: 16,
          minHeight: 52,
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
            paddingVertical: 12,
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
            Signing you in...
          </Text>
        </MotiView>
      </MotiView>
    )}
  </AnimatePresence>
));

// Biometric authentication component
const BiometricAuth = React.memo(({ 
  onBiometricLogin, 
  biometricType 
}: { 
  onBiometricLogin: () => void;
  biometricType: string;
}) => {
  const getBiometricIcon = () => {
    switch (biometricType) {
      case 'face':
        return "scan-outline";
      case 'fingerprint':
        return "finger-print-outline";
      case 'iris':
        return "eye-outline";
      default:
        return "finger-print-outline";
    }
  };

  const getBiometricText = () => {
    switch (biometricType) {
      case 'face':
        return "Use Face ID";
      case 'fingerprint':
        return "Use Fingerprint";
      case 'iris':
        return "Use Iris Scan";
      default:
        return "Use Biometric Login";
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8, translateY: 20 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ delay: 1000, type: "spring", damping: 15 }}
      style={{ alignItems: "center", marginVertical: 20 }}
    >
      <Text style={{
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 12,
        fontWeight: "500",
      }}>
        Or sign in with biometrics
      </Text>
      
      <TouchableOpacity
        onPress={onBiometricLogin}
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: "#F3F4F6",
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 2,
          borderColor: "#E5E7EB",
          shadowColor: "#10B981",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
        accessibilityLabel={getBiometricText()}
        accessibilityHint="Authenticate using your device biometrics"
        activeOpacity={0.7}
      >
        <Ionicons 
          name={getBiometricIcon() as any} 
          size={28} 
          color="#10B981" 
        />
      </TouchableOpacity>
      
      <Text style={{
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 8,
        textAlign: "center",
      }}>
        {getBiometricText()}
      </Text>
    </MotiView>
  );
});

// Main login component
export default function SellerLogin() {
  const router = useRouter();
  const { setSession } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    phoneOrEmail: "",
    password: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>("fingerprint");
  
  // Refs for input focus management
  const phoneEmailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  
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

  // Check biometric availability
  useEffect(() => {
    const checkBiometricAvailability = async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        
        if (hasHardware && isEnrolled && supportedTypes.length > 0) {
          setBiometricAvailable(true);
          
          // Determine primary biometric type
          if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            setBiometricType("face");
          } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            setBiometricType("fingerprint");
          } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
            setBiometricType("iris");
          } else {
            setBiometricType("fingerprint"); // fallback
          }
        } else {
          setBiometricAvailable(false);
        }
      } catch (error) {
        console.log("Biometric check failed:", error);
        setBiometricAvailable(false);
      }
    };

    checkBiometricAvailability();
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
      if (field === "phoneOrEmail") {
        // Remove extra spaces and limit length
        processedValue = value.trim().slice(0, 254);
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
      
      // Rate limiting protection
      if (submitAttempts >= 5) {
        setErrors({
          general: "Too many login attempts. Please wait a moment before trying again.",
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      
      const validationErrors = validateForm(formData);
      setErrors(validationErrors);
      
      if (Object.keys(validationErrors).length > 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      setIsSubmitting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const response = await loginSeller({
        phoneOrEmail: formData.phoneOrEmail.trim(),
        password: formData.password,
      });

      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Use the updated setSession with token and refreshToken
        const { user, token, refreshToken } = response.data;
        await setSession(user, token, refreshToken);

        // Clear form on success
        setFormData({ phoneOrEmail: "", password: "" });
        setSubmitAttempts(0);

        // Navigate to seller dashboard
        router.replace("/(seller)");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setErrors({
          general: response.error || "Login failed. Please check your credentials and try again.",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      setErrors({
        general: error?.message || "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, router, submitAttempts]);

  const handleBiometricLogin = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const biometricResult = await LocalAuthentication.authenticateAsync({
        promptMessage: "Sign in with biometrics",
        subTitle: "Use your biometric credential to access your account",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
        fallbackLabel: "Use Password",
      });

      if (biometricResult.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // In a real app, you'd retrieve stored credentials or make an API call
        // with a biometric token. For demo purposes, we'll simulate success:
        Alert.alert(
          "Biometric Login Success", 
          "In a real app, this would log you in with stored biometric credentials.",
          [
            {
              text: "Continue to Dashboard",
              onPress: () => router.replace("/(seller)")
            },
            {
              text: "Stay Here",
              style: "cancel"
            }
          ]
        );
      } else if (biometricResult.error === "UserCancel") {
        // User cancelled, do nothing
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (biometricResult.error === "UserFallback") {
        // User chose to use password instead
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        phoneEmailInputRef.current?.focus();
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          "Biometric Authentication Failed",
          "Please try again or use your password to sign in."
        );
      }
    } catch (error: any) {
      console.error("Biometric authentication error:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Biometric Error",
        "Biometric authentication is not available. Please use your password."
      );
    }
  }, [router]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const navigateToSignup = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(auth)/signup");
  }, [router]);

  const navigateToForgotPassword = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(auth)/forgot-password");
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
              <Ionicons name="storefront-outline" size={40} color="#FFFFFF" />
            </MotiView>

            <AnimatedText
              text="Welcome Back"
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
              Sign in to continue managing your store
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
              testID="phone-email-input"
              inputRef={phoneEmailInputRef}
              label="Phone Number or Email"
              value={formData.phoneOrEmail}
              onChangeText={updateField("phoneOrEmail")}
              placeholder="Enter your phone or email"
              keyboardType="email-address"
              error={errors.phoneOrEmail}
              accessibilityLabel="Phone or Email Input"
              accessibilityHint="Enter your registered phone number or email address"
              maxLength={254}
              onSubmitEditing={() => focusNextInput(passwordInputRef)}
            />

            <FormInput
              testID="password-input"
              inputRef={passwordInputRef}
              label="Password"
              value={formData.password}
              onChangeText={updateField("password")}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              error={errors.password}
              accessibilityLabel="Password Input"
              accessibilityHint="Enter your account password"
              maxLength={128}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              blurOnSubmit
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

            {/* Submit Button */}
            <MotiView
              animate={{
                scale: isFormValid ? 1 : 0.98,
                opacity: isFormValid ? 1 : 0.7,
              }}
              transition={{ type: "timing", duration: 200 }}
            >
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
                  shadowColor: isFormValid ? "#10B981" : "transparent",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: isFormValid ? 4 : 0,
                }}
                activeOpacity={0.8}
                accessibilityLabel="Sign In Button"
                accessibilityHint="Submit the form to sign into your account"
              >
                <Text style={{
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontWeight: "700",
                }}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </MotiView>

            {/* Biometric Login Option */}
            {biometricAvailable && !keyboardVisible && (
              <BiometricAuth 
                onBiometricLogin={handleBiometricLogin}
                biometricType={biometricType}
              />
            )}

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={{ alignSelf: "center", marginBottom: 24 }}
              onPress={navigateToForgotPassword}
              accessibilityLabel="Forgot Password Link"
              accessibilityHint="Navigate to password recovery"
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
              <TouchableOpacity 
                onPress={navigateToSignup}
                accessibilityLabel="Create Account Link"
                accessibilityHint="Navigate to account creation page"
              >
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
        
        {/* Loading Overlay */}
        <LoadingOverlay visible={isSubmitting} />
      </KeyboardAvoidingView>
    </>
  );
}