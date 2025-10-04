import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/config/api";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!emailOrPhone.trim()) return "Enter email or phone.";
    if (!password) return "Enter password.";
    return null;
  };

  const onLogin = async () => {
    const err = validate();
    if (err) {
      Alert.alert("Missing info", err);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrPhone: emailOrPhone.trim(),
          password,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data: { success: boolean; token?: string; user?: any; message?: string } = await res.json();
      if (!data.success || !data.token) throw new Error(data.message || "Invalid credentials.");

      // Persist via AuthContext (uses SecureStore internally from your AuthContext)
      await login(data.token, data.user);

      // Redirect to typed route for dashboard folder index
      router.replace("/(main)/dashboard");
    } catch (e: any) {
      Alert.alert("Login failed", e?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <Text className="text-3xl font-bold mb-2 text-green-700">Welcome back</Text>
      <Text className="text-gray-600 mb-6">Apne Mohalle ka Apna App</Text>

      {/* Email / Phone */}
      <Text className="mb-1 text-gray-600">Email or Phone</Text>
      <TextInput
        value={emailOrPhone}
        onChangeText={setEmailOrPhone}
        autoCapitalize="none"
        keyboardType="default"
        placeholder="you@example.com or 98XXXXXXXX"
        className="border border-gray-300 rounded-2xl px-4 py-3 mb-4 bg-white"
      />

      {/* Password */}
      <Text className="mb-1 text-gray-600">Password</Text>
      <View className="flex-row items-center border border-gray-300 rounded-2xl px-4 mb-2 bg-white">
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPwd}
          placeholder="Your password"
          className="flex-1 py-3"
        />
        <TouchableOpacity onPress={() => setShowPwd((s) => !s)} className="py-3 pl-3">
          <Text className="text-green-700">{showPwd ? "Hide" : "Show"}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={onLogin}
        disabled={loading}
        className="mt-4 rounded-2xl py-3 items-center"
        style={{ backgroundColor: loading ? "#93c5fd" : "#16a34a" }}
      >
        {loading ? <ActivityIndicator /> : <Text className="text-white font-semibold">Login</Text>}
      </TouchableOpacity>

      <View className="flex-row justify-between mt-4">
        <Link href="/(auth)/forgot-password" className="text-green-700">Forgot password?</Link>
        <Link href="/(auth)/signup" className="text-orange-600">Create account</Link>
      </View>
    </View>
  );
}
