import { FontAwesome } from "@expo/vector-icons";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import RetroButton from "../components/RetroButton";
import RetroInput from "../components/RetroInput";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import {
  authenticateWithGoogle,
  ensureSession,
  registerUser,
} from "../services/authService";
import { authStyles, COLORS } from "../styles/authStyles";

export default function Register() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const { isReady: isGoogleReady, getIdToken } = useGoogleAuth();

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const redirectIfLoggedIn = async () => {
        const current = await ensureSession();
        if (current && isMounted) {
          router.replace({ pathname: "/home" });
        }
      };

      redirectIfLoggedIn();

      return () => {
        isMounted = false;
      };
    }, [router])
  );

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Registrasi", "Mohon lengkapi semua field terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser({ name: fullName, email, password });
      router.replace({ pathname: "/home" });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat registrasi.";
      Alert.alert("Registrasi gagal", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleRegister = async () => {
    if (!isGoogleReady) {
      Alert.alert(
        "Google Login",
        "Konfigurasi Google belum siap. Periksa variabel EXPO_PUBLIC_GOOGLE_*."
      );
      return;
    }

    setIsGoogleSubmitting(true);
    try {
      const idToken = await getIdToken();
      await authenticateWithGoogle(idToken, "register");
      router.replace({ pathname: "/home" });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Tidak dapat terhubung ke Google.";
      Alert.alert("Google Login", message);
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const googleButtonDisabled =
    isSubmitting || isGoogleSubmitting || !isGoogleReady;
  const googleButtonTitle = !isGoogleReady
    ? "Menunggu konfigurasi Google"
    : isGoogleSubmitting
    ? "Menghubungkan Google..."
    : "Daftar dengan Google";

  return (
    <SafeAreaView style={authStyles.container}>
      <StatusBar style="dark" backgroundColor={COLORS.backdrop} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={authStyles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={authStyles.logoWrapper}>
            <Image
              source={require("../assets/images/appLogo.png")}
              style={authStyles.logo}
            />
          </View>

          <View style={authStyles.formSection}>
            <View style={authStyles.fieldGroup}>
              <Text style={authStyles.label}>Nama Lengkap</Text>
              <RetroInput
                placeholder="Masukkan nama lengkap"
                placeholderTextColor={COLORS.muted}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={authStyles.fieldGroup}>
              <Text style={authStyles.label}>Email</Text>
              <RetroInput
                placeholder="Masukkan email"
                placeholderTextColor={COLORS.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={authStyles.fieldGroup}>
              <Text style={authStyles.label}>Password</Text>
              <RetroInput
                placeholder="Masukkan password"
                placeholderTextColor={COLORS.muted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                rightAccessory={
                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    hitSlop={8}
                    style={authStyles.inputIconButton}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                  >
                    <FontAwesome
                      name={showPassword ? "eye-slash" : "eye"}
                      size={20}
                      color={COLORS.headline}
                    />
                  </Pressable>
                }
              />
            </View>

            <RetroButton
              title={isSubmitting ? "Mendaftarkan..." : "Daftar"}
              onPress={handleRegister}
              disabled={isSubmitting || isGoogleSubmitting}
            />

            <View style={authStyles.dividerRow}>
              <Text style={authStyles.dividerLabel}>atau</Text>
            </View>

            <RetroButton
              title={googleButtonTitle}
              backgroundColor={COLORS.primary}
              shadowColor={COLORS.deepIndigo}
              leftIcon={
                <FontAwesome name="google" size={20} color={COLORS.white} />
              }
              onPress={handleGoogleRegister}
              disabled={googleButtonDisabled}
            />

            <Text style={authStyles.footerText}>
              Sudah punya akun?{" "}
              <Link href={{ pathname: "/" }} style={authStyles.footerLink}>
                Login
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
