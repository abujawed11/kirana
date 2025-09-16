// app/(auth)/signup.tsx
import React, { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { signupSeller } from "@/features/auth/api";

type Errors = Partial<Record<"name"|"email"|"phone"|"password"|"confirmPassword", string>>;

function validate(values: {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}): Errors {
  const e: Errors = {};
  if (!values.name || values.name.trim().length < 2) e.name = "Enter full name";
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email);
  if (!emailOk) e.email = "Enter a valid email";
  const digits = values.phone.replace(/\D/g, "");
  if (digits.length !== 10) e.phone = "Enter 10-digit mobile";
  if (!values.password || values.password.length < 6) e.password = "At least 6 characters";
  if (!values.confirmPassword) e.confirmPassword = "Confirm password";
  if (values.password && values.confirmPassword && values.password !== values.confirmPassword) {
    e.confirmPassword = "Passwords do not match";
  }
  return e;
}

export default function SellerSignup() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const isValid = useMemo(() => Object.keys(validate(form)).length === 0, [form]);

  const update = (key: keyof typeof form) => (t: string) =>
    setForm((s) => ({ ...s, [key]: key === "phone" ? t.replace(/[^0-9]/g, "").slice(0, 10) : t }));

  const onSubmit = async () => {
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) return;

    try {
      setSubmitting(true);
      const res = await signupSeller({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone,
        password: form.password,
      });

      if (res.success) {
        // Navigate to OTP (if your backend sends one)
        router.push({ pathname: "/(auth)/otp", params: { phone: form.phone } });
      } else {
        Alert.alert("Signup failed", res.error || "Please try again");
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="mt-6 mb-8">
          <Text className="text-3xl font-extrabold text-emerald-700">Create Seller Account</Text>
          <Text className="text-neutral-600 mt-2">Start listing your products and accept orders.</Text>
        </View>

        {/* Name */}
        <View className="mb-4">
          <Text className="text-neutral-700 mb-2 font-semibold">Full Name</Text>
          <View className="rounded-2xl border border-neutral-300 bg-white px-3">
            <TextInput
              className="py-3 text-base"
              value={form.name}
              onChangeText={update("name")}
              placeholder="e.g. Rakesh Gupta"
              autoCapitalize="words"
            />
          </View>
          {errors.name ? <Text className="text-red-600 mt-1 text-sm">{errors.name}</Text> : null}
        </View>

        {/* Email */}
        <View className="mb-4">
          <Text className="text-neutral-700 mb-2 font-semibold">Email</Text>
          <View className="rounded-2xl border border-neutral-300 bg-white px-3">
            <TextInput
              className="py-3 text-base"
              value={form.email}
              onChangeText={update("email")}
              placeholder="you@store.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          {errors.email ? <Text className="text-red-600 mt-1 text-sm">{errors.email}</Text> : null}
        </View>

        {/* Phone */}
        <View className="mb-4">
          <Text className="text-neutral-700 mb-2 font-semibold">Mobile Number</Text>
          <View className="rounded-2xl border border-neutral-300 bg-white px-3">
            <TextInput
              className="py-3 text-base"
              value={form.phone}
              onChangeText={update("phone")}
              placeholder="10-digit number"
              keyboardType="phone-pad"
            />
          </View>
          {errors.phone ? <Text className="text-red-600 mt-1 text-sm">{errors.phone}</Text> : null}
        </View>

        {/* Password */}
        <View className="mb-4">
          <Text className="text-neutral-700 mb-2 font-semibold">Password</Text>
          <View className="flex-row items-center rounded-2xl border border-neutral-300 bg-white px-3">
            <TextInput
              className="flex-1 py-3 text-base"
              value={form.password}
              onChangeText={update("password")}
              placeholder="At least 6 characters"
              secureTextEntry={!showPwd}
              autoCapitalize="none"
            />
            <TouchableOpacity className="px-2 py-2" onPress={() => setShowPwd((s) => !s)}>
              <Text className="text-emerald-700 font-semibold">{showPwd ? "Hide" : "Show"}</Text>
            </TouchableOpacity>
          </View>
          {errors.password ? <Text className="text-red-600 mt-1 text-sm">{errors.password}</Text> : null}
        </View>

        {/* Confirm Password */}
        <View className="mb-2">
          <Text className="text-neutral-700 mb-2 font-semibold">Confirm Password</Text>
          <View className="flex-row items-center rounded-2xl border border-neutral-300 bg-white px-3">
            <TextInput
              className="flex-1 py-3 text-base"
              value={form.confirmPassword}
              onChangeText={update("confirmPassword")}
              placeholder="Re-enter password"
              secureTextEntry={!showPwd2}
              autoCapitalize="none"
            />
            <TouchableOpacity className="px-2 py-2" onPress={() => setShowPwd2((s) => !s)}>
              <Text className="text-emerald-700 font-semibold">{showPwd2 ? "Hide" : "Show"}</Text>
            </TouchableOpacity>
          </View>
          {errors.confirmPassword ? <Text className="text-red-600 mt-1 text-sm">{errors.confirmPassword}</Text> : null}
        </View>

        {/* Submit */}
        <TouchableOpacity
          disabled={!isValid || submitting}
          onPress={onSubmit}
          className={`mt-3 rounded-2xl py-4 items-center ${!isValid || submitting ? "bg-emerald-300" : "bg-emerald-600"}`}
        >
          {submitting ? <ActivityIndicator /> : <Text className="text-white font-bold text-base">Create Account</Text>}
        </TouchableOpacity>

        {/* Link to Login */}
        <View className="mt-4 flex-row justify-center">
          <Text className="text-neutral-700">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text className="text-emerald-700 font-semibold">Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
