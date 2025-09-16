// app/(auth)/login.tsx
import React, { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { loginSeller } from "@/features/auth/api";

type Errors = Partial<Record<"phoneOrEmail" | "password", string>>;

function validate(values: { phoneOrEmail: string; password: string }): Errors {
  const e: Errors = {};
  const v = values.phoneOrEmail.trim();
  if (!v) {
    e.phoneOrEmail = "Enter phone or email";
  } else {
    const asDigits = v.replace(/\D/g, "");
    const looksEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (!looksEmail && asDigits.length !== 10) {
      e.phoneOrEmail = "Enter valid email or 10-digit phone";
    }
  }
  if (!values.password) e.password = "Enter password";
  return e;
}

export default function SellerLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ phoneOrEmail: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const isValid = useMemo(() => Object.keys(validate(form)).length === 0, [form]);
  const update = (key: keyof typeof form) => (t: string) => setForm((s) => ({ ...s, [key]: t }));

  const onSubmit = async () => {
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) return;

    try {
      setSubmitting(true);
      const res = await loginSeller({
        phoneOrEmail: form.phoneOrEmail.trim(),
        password: form.password,
      });

      if (res.success) {
        // Persist token/user as needed, then take seller to dashboard:
        router.replace("/(seller)");
      } else {
        Alert.alert("Login failed", res.error || "Please try again");
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
          <Text className="text-3xl font-extrabold text-emerald-700">Welcome back</Text>
          <Text className="text-neutral-600 mt-2">Log in to manage your store.</Text>
        </View>

        {/* Phone/Email */}
        <View className="mb-4">
          <Text className="text-neutral-700 mb-2 font-semibold">Phone or Email</Text>
          <View className="rounded-2xl border border-neutral-300 bg-white px-3">
            <TextInput
              className="py-3 text-base"
              value={form.phoneOrEmail}
              onChangeText={update("phoneOrEmail")}
              placeholder="e.g. 9876543210 or you@store.com"
              autoCapitalize="none"
              keyboardType="default"
            />
          </View>
          {errors.phoneOrEmail ? <Text className="text-red-600 mt-1 text-sm">{errors.phoneOrEmail}</Text> : null}
        </View>

        {/* Password */}
        <View className="mb-2">
          <Text className="text-neutral-700 mb-2 font-semibold">Password</Text>
          <View className="flex-row items-center rounded-2xl border border-neutral-300 bg-white px-3">
            <TextInput
              className="flex-1 py-3 text-base"
              value={form.password}
              onChangeText={update("password")}
              placeholder="Your password"
              secureTextEntry={!showPwd}
              autoCapitalize="none"
            />
            <TouchableOpacity className="px-2 py-2" onPress={() => setShowPwd((s) => !s)}>
              <Text className="text-emerald-700 font-semibold">{showPwd ? "Hide" : "Show"}</Text>
            </TouchableOpacity>
          </View>
          {errors.password ? <Text className="text-red-600 mt-1 text-sm">{errors.password}</Text> : null}
        </View>

        {/* Submit */}
        <TouchableOpacity
          disabled={!isValid || submitting}
          onPress={onSubmit}
          className={`mt-3 rounded-2xl py-4 items-center ${!isValid || submitting ? "bg-emerald-300" : "bg-emerald-600"}`}
        >
          {submitting ? <ActivityIndicator /> : <Text className="text-white font-bold text-base">Log in</Text>}
        </TouchableOpacity>

        {/* Link to Signup */}
        <View className="mt-4 flex-row justify-center">
          <Text className="text-neutral-700">New to Kirana? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
            <Text className="text-emerald-700 font-semibold">Create an account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
