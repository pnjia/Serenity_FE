import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import RetroButton from "../components/RetroButton";
import { AuthUser, fetchProfile, logoutUser } from "../services/authService";
import { COLORS } from "../styles/authStyles";
import { homeStyles } from "../styles/homeStyles";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchUser = async () => {
        setLoading(true);
        try {
          const profile = await fetchProfile();
          if (!profile) {
            router.replace({ pathname: "/login" } as any);
            return;
          }

          if (isActive) {
            setUser(profile);
          }
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Sesi kamu telah berakhir. Silakan login kembali.";
          if (isActive) {
            Alert.alert("Autentikasi", message, [
              {
                text: "OK",
                onPress: () => router.replace({ pathname: "/login" } as any),
              },
            ]);
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      fetchUser();

      return () => {
        isActive = false;
      };
    }, [router])
  );

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      router.replace({ pathname: "/login" } as any);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Tidak dapat keluar dari sesi saat ini.";
      Alert.alert("Logout", message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const providerLabel =
    user?.provider === "google" ? "Masuk melalui Google" : user?.email;

  return (
    <SafeAreaView style={homeStyles.container}>
      <StatusBar style="dark" backgroundColor={COLORS.backdrop} />
      <View style={homeStyles.content}>
        <View style={homeStyles.card}>
          {loading ? (
            <ActivityIndicator color={COLORS.primary} size="large" />
          ) : (
            <>
              <Text style={homeStyles.greeting}>Selamat datang,</Text>
              <Text style={homeStyles.name}>{user?.name}</Text>
              {providerLabel ? (
                <Text style={homeStyles.caption}>{providerLabel}</Text>
              ) : null}
              {user?.provider ? (
                <Text style={homeStyles.providerTag}>{user.provider}</Text>
              ) : null}
            </>
          )}
          <View style={homeStyles.actions}>
            <RetroButton
              title={isLoggingOut ? "Keluar..." : "Keluar"}
              backgroundColor={COLORS.primary}
              shadowColor={COLORS.deepIndigo}
              onPress={handleLogout}
              disabled={isLoggingOut}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
