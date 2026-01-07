import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import RetroButton from "../../components/RetroButton";
import { AuthUser, fetchProfile, logoutUser } from "../../services/authService";
import {
  getUserProgress,
  updateStreak,
  UserProgress,
} from "../../services/questService";
import { COLORS } from "../../styles/authStyles";

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchData = async () => {
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

          // Fetch and update streak
          try {
            const updatedProgress = await updateStreak();
            if (isActive) {
              setProgress(updatedProgress);
            }
          } catch (error) {
            console.error("Failed to update streak:", error);
            // Try to get progress without updating
            try {
              const currentProgress = await getUserProgress();
              if (isActive) {
                setProgress(currentProgress);
              }
            } catch (progressError) {
              console.error("Failed to get progress:", progressError);
            }
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

      fetchData();

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
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#F5F7FB" />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 140 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* App Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/images/appLogo.png")}
                style={styles.logo}
              />
            </View>

            {/* Profile Header */}
            <View style={styles.header}>
              <View style={styles.avatarContainer}>
                {user?.picture ? (
                  <Image
                    source={{ uri: user.picture }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={50} color="#020bb5" />
                  </View>
                )}
              </View>
              <Text style={styles.name}>{user?.name}</Text>
              {providerLabel && (
                <Text style={styles.email}>{providerLabel}</Text>
              )}
              {user?.provider && (
                <View style={styles.providerBadge}>
                  <Text style={styles.providerText}>
                    {user.provider.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            {/* Stats Section */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Ionicons name="flame" size={32} color="#FF6B6B" />
                <Text style={styles.statValue}>{progress?.streak || 0}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="game-controller" size={32} color="#020bb5" />
                <Text style={styles.statValue}>
                  {progress?.totalGamesPlayed || 0}
                </Text>
                <Text style={styles.statLabel}>Games Played</Text>
              </View>
            </View>

            {/* Profile Actions */}
            <View style={styles.actionsContainer}>
              <RetroButton
                title={isLoggingOut ? "Keluar..." : "Keluar"}
                backgroundColor={COLORS.primary}
                shadowColor={COLORS.deepIndigo}
                onPress={handleLogout}
                disabled={isLoggingOut}
              />
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    width: "100%",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E8EEFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#020bb5",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    shadowColor: "#020bb5",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1B2559",
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: "#A3AED0",
    marginBottom: 12,
  },
  providerBadge: {
    backgroundColor: "#020bb5",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  providerText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 20,
    marginTop: 20,
    width: "100%",
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#020bb5",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1B2559",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: "#A3AED0",
    marginTop: 4,
    fontWeight: "600",
    textAlign: "center",
  },
  actionsContainer: {
    marginTop: "auto",
    paddingHorizontal: 20,
    width: "100%",
    marginBottom: 20,
  },
});
