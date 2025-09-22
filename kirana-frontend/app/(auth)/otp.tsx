// app/(auth)/otp.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { verifySellerOtp, resendSellerOtp } from "@/features/auth/api";
import { useAuth } from "@/context/AuthContext";

function maskEmail(email?: string) {
  if (!email) return "";
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const head = user.slice(0, 2);
  const tail = user.length > 4 ? user.slice(-1) : "";
  return `${head}${"*".repeat(Math.max(1, user.length - head.length - tail.length))}${tail}@${domain}`;
}

function maskPhone(phone?: string) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  return `${"*".repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}

export default function SellerOtp() {
  const router = useRouter();
  const { setSession } = useAuth();
  const { email, phone } = useLocalSearchParams<{ email?: string; phone?: string }>();

  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [seconds, setSeconds] = useState(30); // resend cooldown

  const inputRef = useRef<TextInput>(null);

  const targetLabel = useMemo(() => {
    if (email) return maskEmail(email);
    if (phone) return maskPhone(phone);
    return "";
  }, [email, phone]);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const onChangeCode = (t: string) => {
    const v = t.replace(/\D/g, "").slice(0, 6);
    setCode(v);
  };

  // const onVerify = async () => {
  //   if (code.length !== 6) {
  //     Alert.alert("Invalid code", "Please enter the 6-digit code.");
  //     return;
  //   }
  //   try {
  //     setVerifying(true);
  //     const res = await verifySellerOtp({ email, phone, code });
  //     if (res.success) {
  //       // persist and go to seller dashboard
  //       await setSession(res.data.user, res.data.user.token);
  //       router.replace("/(seller)");
  //     } else {
  //       Alert.alert("Verification failed", res.error || "Please try again");
  //     }
  //   } catch (e: any) {
  //     Alert.alert("Error", e?.message ?? "Something went wrong");
  //   } finally {
  //     setVerifying(false);
  //   }
  // };

  const onVerify = async () => {
  if (code.length !== 6) { /* ... */ }
  try {
    setVerifying(true);
    const res = await verifySellerOtp({ email, phone, code });
    if (res.success) {
      // ❌ remove this (there is no token in response)
      // await setSession(res.data.user, res.data.user.token);
      // router.replace("/(seller)");

      // ✅ go to login instead
      router.replace("/(auth)/login");
    } else {
      Alert.alert("Verification failed", res.error || "Please try again");
    }
  } catch (e: any) {
    Alert.alert("Error", e?.message ?? "Something went wrong");
  } finally {
    setVerifying(false);
  }
};


  const onResend = async () => {
    if (seconds > 0) return;
    try {
      setResending(true);
      const res = await resendSellerOtp({ email, phone });
      if (!("success" in res) || !res.success) {
        Alert.alert("Resend failed", (res as any)?.error || "Please try again");
      } else {
        setSeconds(30);
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to resend code");
    } finally {
      setResending(false);
      inputRef.current?.focus();
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-16">
        <Text className="text-3xl font-extrabold text-emerald-700">Verify your account</Text>
        <Text className="text-neutral-700 mt-2">
          We’ve sent a 6-digit code to{" "}
          <Text className="font-semibold">{targetLabel || "your contact"}</Text>.
        </Text>
        {!!email && <Text className="text-neutral-600 mt-1">Email: {maskEmail(email)}</Text>}
        {!!phone && <Text className="text-neutral-600">Phone: {maskPhone(phone)}</Text>}

        {/* OTP input */}
        <View className="mt-8">
          <Text className="text-neutral-700 mb-2 font-semibold">Enter 6-digit code</Text>
          <View className="rounded-2xl border border-neutral-300 bg-white px-3">
            <TextInput
              ref={inputRef}
              className="py-3 text-center tracking-[10px] text-xl"
              value={code}
              onChangeText={onChangeCode}
              placeholder="••••••"
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
          </View>
        </View>

        {/* Verify button */}
        <TouchableOpacity
          onPress={onVerify}
          disabled={verifying || code.length !== 6}
          className={`mt-6 rounded-2xl py-4 items-center ${verifying || code.length !== 6 ? "bg-emerald-300" : "bg-emerald-600"}`}
        >
          {verifying ? <ActivityIndicator /> : <Text className="text-white font-bold text-base">Verify</Text>}
        </TouchableOpacity>

        {/* Resend */}
        <View className="mt-4 flex-row items-center">
          <Text className="text-neutral-700">Didn’t get the code?</Text>
          <TouchableOpacity
            onPress={onResend}
            disabled={seconds > 0 || resending}
            className="ml-2"
          >
            <Text className={`font-semibold ${seconds > 0 || resending ? "text-emerald-300" : "text-emerald-700"}`}>
              {seconds > 0 ? `Resend in ${seconds}s` : resending ? "Sending…" : "Resend"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Change contact hint */}
        <View className="mt-2">
          <Text className="text-neutral-500 text-sm">
            Entered wrong email/phone? Go back and update details on the signup screen.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
