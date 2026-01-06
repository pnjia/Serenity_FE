import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthUser, fetchProfile } from "../../services/authService";
import { getUserProgress, UserProgress } from "../../services/gameService";

const COLORS = {
  primary: "#020bb5",
  backdrop: "#F4F7FE",
  white: "#FFFFFF",
  headline: "#1B2559",
  muted: "#A3AED0",
  cardBg: "#FFFFFF",
};

interface GameCard {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  route: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadUser = async () => {
        setLoading(true);
        try {
          const profile = await fetchProfile();
          if (!profile && isActive) {
            router.replace({ pathname: "/login" } as any);
            return;
          }
          if (isActive) {
            setUser(profile);

            // Load user progress
            try {
              const { progress: userProgress } = await getUserProgress();
              setProgress(userProgress);
            } catch (error) {
              console.log("Failed to load progress:", error);
            }
          }
        } catch (error) {
          if (isActive) {
            router.replace({ pathname: "/login" } as any);
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      loadUser();

      return () => {
        isActive = false;
      };
    }, [router])
  );

  const gameCards: GameCard[] = [
    {
      id: "1",
      title: "Pola & Warna",
      icon: <FontAwesome5 name="palette" size={40} color={COLORS.primary} />,
      description: "Main",
      route: "/games/pola-warna",
    },
    {
      id: "2",
      title: "Mengorganisir",
      icon: <Ionicons name="book" size={40} color={COLORS.primary} />,
      description: "Main",
      route: "/games/mengorganisir",
    },
    {
      id: "3",
      title: "Logika Zen",
      icon: (
        <MaterialCommunityIcons
          name="flower-tulip"
          size={40}
          color={COLORS.primary}
        />
      ),
      description: "Main",
      route: "/games/logika-zen",
    },
    {
      id: "4",
      title: "Ritme dan Suara",
      icon: <Ionicons name="musical-note" size={40} color={COLORS.primary} />,
      description: "Main",
      route: "/games/ritme-suara",
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Memuat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={COLORS.backdrop} />
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/appLogo.png")}
            style={styles.logo}
          />
          <View>
            <Text style={styles.greeting}>Halo, Pengguna!</Text>
            {user && <Text style={styles.userName}>{user.name}</Text>}
          </View>
          <View style={styles.streakContainer}>
            <Text style={styles.streakLabel}>Streak anda</Text>
            <Text style={styles.streakValue}>{progress?.streak || 0}</Text>
          </View>
          <View style={styles.avatarContainer}>
            {user?.picture ? (
              <Image source={{ uri: user.picture }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={24} color={COLORS.white} />
              </View>
            )}
          </View>
        </View>

        {/* Game Section */}
        <View style={styles.gameSection}>
          <Text style={styles.sectionTitle}>Main Game Apa Hari Ini?</Text>
          <View style={styles.gameGrid}>
            {gameCards.map((card) => (
              <Pressable
                key={card.id}
                style={styles.gameCard}
                onPress={() => {
                  router.push(card.route as any);
                }}
              >
                <View style={styles.iconWrapper}>{card.icon}</View>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <View style={styles.playButton}>
                  <Ionicons
                    name="play"
                    size={16}
                    color={COLORS.primary}
                    style={{ marginLeft: 2 }}
                  />
                  <Text style={styles.playText}>{card.description}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backdrop,
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 16,
    color: COLORS.headline,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100,
    width: "100%",
    maxWidth: 900,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 20,
    maxWidth: 900,
    width: "100%",
    alignSelf: "center",
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  greeting: {
    fontFamily: "Nunito_700Bold",
    fontSize: 24,
    color: COLORS.headline,
  },
  userName: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 2,
  },
  streakContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  streakLabel: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    color: COLORS.muted,
  },
  streakValue: {
    fontFamily: "Nunito_700Bold",
    fontSize: 20,
    color: COLORS.primary,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  gameSection: {
    flex: 1,
    paddingHorizontal: 24,
    maxWidth: 900,
    width: "100%",
    alignSelf: "center",
  },
  sectionTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 20,
    color: COLORS.headline,
    marginBottom: 20,
  },
  gameGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "flex-start",
  },
  gameCard: {
    width: "47%",
    minWidth: 180,
    maxWidth: 220,
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.backdrop,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    color: COLORS.headline,
    textAlign: "center",
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  playText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    color: COLORS.primary,
  },
});
