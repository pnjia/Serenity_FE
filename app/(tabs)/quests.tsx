import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserQuests, Quest } from "../../services/questService";

const COLORS = {
  backdrop: "#F4F7FE",
  headline: "#1B2559",
  primary: "#020bb5",
  white: "#FFFFFF",
  muted: "#A3AED0",
  success: "#05CD99",
  warning: "#FFB547",
};

export default function QuestsScreen() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchQuests = async () => {
        setLoading(true);
        try {
          const data = await getUserQuests();
          if (isActive) {
            setQuests(data);
          }
        } catch (error) {
          console.error("Failed to fetch quests:", error);
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      fetchQuests();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const renderQuestItem = ({ item }: { item: Quest }) => {
    const progressPercentage = (item.progress / item.target) * 100;
    const isCompleted = item.completed;

    return (
      <View style={styles.questCard}>
        <View style={styles.questHeader}>
          <View style={styles.questIcon}>
            <Ionicons
              name={isCompleted ? "checkmark-circle" : "trophy"}
              size={28}
              color={isCompleted ? COLORS.success : COLORS.primary}
            />
          </View>
          <View style={styles.questInfo}>
            <Text style={styles.questTitle}>{item.title}</Text>
            <Text style={styles.questDescription}>{item.description}</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(progressPercentage, 100)}%`,
                  backgroundColor: isCompleted
                    ? COLORS.success
                    : COLORS.primary,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {item.progress}/{item.target}
          </Text>
        </View>

        <View style={styles.rewardContainer}>
          <Ionicons name="star" size={16} color={COLORS.warning} />
          <Text style={styles.rewardText}>+{item.reward} XP</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={COLORS.backdrop} />

      <View style={styles.header}>
        <Image
          source={require("../../assets/images/appLogo.png")}
          style={styles.logo}
        />
        <Ionicons name="trophy" size={32} color={COLORS.primary} />
        <Text style={styles.headerTitle}>Quest Harian</Text>
      </View>

      {/* Quest Icon */}
      <View style={styles.questIconContainer}>
        <View style={styles.questIconWrapper}>
          <Ionicons name="trophy" size={80} color={COLORS.primary} />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={quests}
          renderItem={renderQuestItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="checkbox-outline"
                size={64}
                color={COLORS.muted}
              />
              <Text style={styles.emptyText}>Belum ada quest tersedia</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backdrop,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  headerTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 28,
    color: COLORS.headline,
  },
  questIconContainer: {
    alignItems: "center",
    marginVertical: 24,
    width: "100%",
  },
  questIconWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 20,
    gap: 16,
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    paddingBottom: 100,
  },
  questCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  questHeader: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  questIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F4FF",
    justifyContent: "center",
    alignItems: "center",
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    color: COLORS.headline,
    marginBottom: 4,
  },
  questDescription: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 13,
    color: COLORS.muted,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#E8EEFF",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: COLORS.headline,
    minWidth: 45,
    textAlign: "right",
  },
  rewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rewardText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 13,
    color: COLORS.warning,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 16,
    color: COLORS.muted,
    marginTop: 16,
  },
});
