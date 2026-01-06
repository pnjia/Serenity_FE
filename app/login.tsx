import { FontAwesome } from "@expo/vector-icons";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
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
  loginUser,
} from "../services/authService";
import { authStyles, COLORS } from "../styles/authStyles";

export default function Index() {
  const router = useRouter();
  const emailValidator = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [formError, setFormError] = useState("");
  const { isReady: isGoogleReady, getIdToken } = useGoogleAuth();

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const redirectIfLoggedIn = async () => {
        const current = await ensureSession();
        if (current && isMounted) {
          router.replace("/(tabs)" as any);
        }
      };

      redirectIfLoggedIn();

      return () => {
        isMounted = false;
      };
    }, [router])
  );

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    const nextErrors = {
      email: !trimmedEmail
        ? "Email wajib diisi."
        : emailValidator.test(trimmedEmail)
        ? ""
        : "Format email tidak valid.",
      password: !trimmedPassword
        ? "Password wajib diisi."
        : trimmedPassword.length < 6
        ? "Password minimal 6 karakter."
        : "",
    };

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    try {
      await loginUser(trimmedEmail, trimmedPassword);
      router.replace("/(tabs)" as any);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat login.";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isGoogleReady) {
      Alert.alert(
        "Google Login",
        "Konfigurasi Google belum siap. Periksa variabel EXPO_PUBLIC_GOOGLE_*."
      );
      return;
    }

    setIsGoogleSubmitting(true);
    setFormError("");
    try {
      console.log("[Google Login] Starting Google authentication...");
      const idToken = await getIdToken();
      console.log(
        "[Google Login] Got ID token, authenticating with backend..."
      );
      await authenticateWithGoogle(idToken, "login");
      console.log("[Google Login] Authentication successful, redirecting...");
      router.replace("/(tabs)" as any);
    } catch (error) {
      console.error("[Google Login] Error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Tidak dapat terhubung ke Google.";
      setFormError(message);
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
    : "Lanjutkan dengan Google";

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
              <Text style={authStyles.label}>Email</Text>
              <RetroInput
                placeholder="Masukkan email"
                placeholderTextColor={COLORS.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }
                }}
              />
              {errors.email ? (
                <Text style={authStyles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            <View style={authStyles.fieldGroup}>
              <Text style={authStyles.label}>Password</Text>
              <RetroInput
                placeholder="Masukkan password"
                placeholderTextColor={COLORS.muted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }
                }}
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
              {errors.password ? (
                <Text style={authStyles.errorText}>{errors.password}</Text>
              ) : null}
            </View>

            {formError ? (
              <Text style={authStyles.errorText}>{formError}</Text>
            ) : null}

            <RetroButton
              title={isSubmitting ? "Memproses..." : "Login"}
              onPress={handleLogin}
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
              onPress={handleGoogleLogin}
              disabled={googleButtonDisabled}
            />

            <Text style={authStyles.footerText}>
              Belum punya akun?{" "}
              <Link
                href={{ pathname: "/register" }}
                style={authStyles.footerLink}
              >
                Daftar sekarang
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
