
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Link, useRouter } from "expo-router";
import { API_BASE } from "@/config/api";

export default function Signup() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");      // optional if email present
    const [email, setEmail] = useState("");      // optional if phone present
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);

    //   const validate = () => {
    //     const cleanPhone = phone.replace(/\D/g, "");
    //     const hasEmail = !!email.trim();
    //     const hasPhone = !!cleanPhone;

    //     if (name.trim().length < 2) return "Please enter your full name.";
    //     if (!hasEmail && !hasPhone) return "Provide either email or 10-digit phone.";
    //     if (hasEmail && !/^\S+@\S+\.\S+$/.test(email.trim())) return "Please enter a valid email.";
    //     if (hasPhone && cleanPhone.length !== 10) return "Enter a valid 10-digit mobile number.";
    //     if (password.length < 6) return "Password must be at least 6 characters.";
    //     if (password !== confirm) return "Passwords do not match.";
    //     return null;
    //   };

    const validate = () => {
        const cleanPhone = phone.replace(/\D/g, "");

        if (name.trim().length < 2) return "Please enter your full name.";
        if (!email.trim()) return "Email is required.";
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Please enter a valid email.";
        if (!cleanPhone) return "Phone is required.";
        if (cleanPhone.length !== 10) return "Enter a valid 10-digit mobile number.";
        if (password.length < 6) return "Password must be at least 6 characters.";
        if (password !== confirm) return "Passwords do not match.";
        return null;
    };

    const onSignup = async () => {
        const err = validate();
        if (err) return Alert.alert("Invalid details", err);

        try {
            setLoading(true);

            const body = {
                name: name.trim(),
                email: email.trim() || undefined,
                phone: phone.replace(/\D/g, "") || undefined,
                password,
                // store_name will be collected later during KYC
            };

            const url = `${API_BASE}/auth/seller/signup`;
            console.log("🔎 POST", url, body);

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(text || `HTTP ${res.status}`);
            }

            const data: { success: boolean; message?: string } = await res.json();
            if (!data.success) throw new Error(data.message || "Signup failed. Try again.");

            Alert.alert("Success", "Seller account created! Please log in.");
            router.replace("/(auth)/login");
        } catch (e: any) {
            Alert.alert("Error", e?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white px-6 justify-center">
            <Text className="text-3xl font-bold mb-2 text-green-700">Create seller account</Text>
            <Text className="text-gray-600 mb-6">Apne Mohalle ka Apna App</Text>

            {/* Name */}
            <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Full Name"
                className="border border-gray-300 rounded-2xl px-4 py-3 mb-4 bg-white"
            />

            <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="10-digit Phone"
                maxLength={14}
                className="border border-gray-300 rounded-2xl px-4 py-3 mb-4 bg-white"
            />

            <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Email"
                className="border border-gray-300 rounded-2xl px-4 py-3 mb-4 bg-white"
            />

            {/* Password */}
            <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Password (min 6 chars)"
                className="border border-gray-300 rounded-2xl px-4 py-3 mb-4 bg-white"
            />

            {/* Confirm Password */}
            <TextInput
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
                placeholder="Confirm Password"
                className="border border-gray-300 rounded-2xl px-4 py-3 mb-2 bg-white"
            />

            <TouchableOpacity
                onPress={onSignup}
                disabled={loading}
                className="mt-4 rounded-2xl py-3 items-center"
                style={{ backgroundColor: loading ? "#93c5fd" : "#f97316" }}
            >
                {loading ? <ActivityIndicator /> : <Text className="text-white font-semibold">Create Account</Text>}
            </TouchableOpacity>

            <View className="mt-4">
                <Link href="/(auth)/login" className="text-green-700">
                    Already have an account? Login
                </Link>
            </View>
        </View>
    );
}
