import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { BackHandler, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConfirmModal from "../../components/ConfirmModal";
import { saveGameScore } from "../../services/gameService";

const COLORS = {
  primary: "#020bb5",
  backdrop: "#F4F7FE",
  white: "#FFFFFF",
  headline: "#1B2559",
  muted: "#A3AED0",
  success: "#05CD99",
};

interface Item {
  id: number;
  value: number;
  color: string;
}

const ITEM_COLORS = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A8E6CF", "#FF8B94"];

export default function MengorganisirGame() {
  const router = useRouter();
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [maxMoves, setMaxMoves] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleBackPress();
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  const handleBackPress = () => {
    console.log("[Mengorganisir] Back button pressed");
    setShowExitModal(true);
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    router.push("/(tabs)" as any);
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  const startGame = () => {
    // Increase item count every 10 levels
    const itemCount = Math.min(4 + Math.floor((level - 1) / 10), 10);

    // Determine sort order: every 10 levels alternates between ascending and descending
    // Level 1-10: ascending, Level 11-20: descending, Level 21-30: ascending, etc.
    const ascending = Math.floor((level - 1) / 10) % 2 === 0;
    setIsAscending(ascending);

    const newItems: Item[] = Array.from({ length: itemCount }, (_, i) => ({
      id: i,
      value: i + 1,
      color: ITEM_COLORS[i % ITEM_COLORS.length],
    }));

    // Better shuffle algorithm - Fisher-Yates with multiple passes for higher levels
    const shufflePasses = Math.min(Math.floor(level / 3) + 1, 3);
    for (let pass = 0; pass < shufflePasses; pass++) {
      for (let i = newItems.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newItems[i], newItems[j]] = [newItems[j], newItems[i]];
      }
    }

    // Calculate max moves based on item count and some randomness
    // Base formula: itemCount + random(0 to 2) for variety
    const baseMaxMoves = itemCount + Math.floor(Math.random() * 3);
    setMaxMoves(baseMaxMoves);

    setItems(newItems);
    setMoves(0);
    setSelectedItem(null);
    setGameStarted(true);
  };

  const handleItemPress = (index: number) => {
    if (!gameStarted) return;

    if (selectedItem === null) {
      setSelectedItem(index);
    } else {
      // Swap items
      const newItems = [...items];
      [newItems[selectedItem], newItems[index]] = [
        newItems[index],
        newItems[selectedItem],
      ];
      setItems(newItems);
      setSelectedItem(null);
      const newMoves = moves + 1;
      setMoves(newMoves);

      // Check if moves exceeded
      if (newMoves > maxMoves) {
        setGameStarted(false);
        setSuccessMessage(
          `Gagal! Kamu melebihi batas langkah (${maxMoves}).\n\nCoba lagi!`
        );
        setShowSuccessModal(true);
        return;
      }

      // Check if sorted correctly
      const isSorted = isAscending
        ? newItems.every((item, idx) => item.value === idx + 1)
        : newItems.every((item, idx) => item.value === newItems.length - idx);

      if (isSorted) {
        // Calculate bonus: more points for fewer moves
        const efficiencyBonus = Math.max((maxMoves - newMoves) * 10, 0);
        const basePoints = 50;
        const bonusPoints = basePoints + efficiencyBonus;
        const newScore = score + bonusPoints;
        setScore(newScore);
        setGameStarted(false);

        // Show success modal immediately
        setSuccessMessage(
          `Berhasil mengurutkan dalam ${newMoves}/${maxMoves} langkah!\n+${bonusPoints} poin\nTotal Skor: ${newScore}`
        );
        setShowSuccessModal(true);

        // Save score to backend in background
        setSaving(true);
        saveGameScore({
          gameType: "mengorganisir",
          score: newScore,
          level: level,
        })
          .then(() => {
            console.log("Score saved successfully");
          })
          .catch((error) => {
            console.error("Failed to save score:", error);
          })
          .finally(() => {
            setSaving(false);
          });
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={COLORS.backdrop} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.headline} />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Mengorganisir</Text>
          <Text style={styles.headerSubtitle}>
            Level {level} • Skor: {score}
          </Text>
        </View>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>
            {!gameStarted
              ? "Ketuk Mulai untuk bermain"
              : isAscending
              ? "Urutkan angka dari yang terkecil!"
              : "Urutkan angka dari yang terbesar!"}
          </Text>
          {gameStarted && (
            <Text style={styles.instructionSubtitle}>
              Langkah: {moves}/{maxMoves}
            </Text>
          )}
        </View>

        {/* Items Grid */}
        <View style={styles.itemsContainer}>
          {items.map((item, index) => (
            <Pressable
              key={item.id}
              style={[
                styles.itemCard,
                { backgroundColor: item.color },
                selectedItem === index && styles.itemCardSelected,
              ]}
              onPress={() => handleItemPress(index)}
            >
              <Text style={styles.itemValue}>{item.value}</Text>
              {selectedItem === index && (
                <View style={styles.selectedIndicator}>
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={COLORS.white}
                  />
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {/* Start Button */}
        {!gameStarted && (
          <Pressable style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>
              {items.length === 0 ? "Mulai" : "Main Lagi"}
            </Text>
          </Pressable>
        )}
      </View>

      <ConfirmModal
        visible={showExitModal}
        title="Keluar Game"
        message="Apakah anda yakin ingin keluar?"
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
        confirmText="Ya"
        cancelText="Tidak"
      />

      <ConfirmModal
        visible={showSuccessModal}
        title="🎉 Selesai!"
        message={successMessage}
        onConfirm={() => {
          setShowSuccessModal(false);
          setLevel(level + 1);
        }}
        onCancel={() => {
          setShowSuccessModal(false);
          setLevel(level + 1);
        }}
        confirmText={`Lanjut ke Level ${level + 1}`}
        cancelText="Lanjut"
      />
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
    paddingVertical: 16,
    gap: 16,
    width: "100%",
    maxWidth: 800,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    cursor: "pointer",
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 24,
    color: COLORS.headline,
  },
  headerSubtitle: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 2,
  },
  gameArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
  },
  instructionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  instructionTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    color: COLORS.headline,
    textAlign: "center",
  },
  instructionSubtitle: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 4,
  },
  itemsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  itemCard: {
    width: 70,
    height: 70,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
    cursor: "pointer",
  },
  itemCardSelected: {
    borderWidth: 4,
    borderColor: COLORS.white,
    transform: [{ scale: 1.1 }],
  },
  itemValue: {
    fontFamily: "Nunito_700Bold",
    fontSize: 32,
    color: COLORS.white,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  selectedIndicator: {
    position: "absolute",
    top: -8,
    right: -8,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginTop: "auto",
    cursor: "pointer",
  },
  startButtonText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 18,
    color: COLORS.white,
  },
});
