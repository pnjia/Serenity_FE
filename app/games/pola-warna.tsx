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
  error: "#FF6B6B",
};

const GAME_COLORS = [
  { id: 1, color: "#EF4444", name: "Merah" },
  { id: 2, color: "#06B6D4", name: "Biru" },
  { id: 3, color: "#FBBF24", name: "Kuning" },
  { id: 4, color: "#10B981", name: "Hijau" },
  { id: 5, color: "#EC4899", name: "Pink" },
  { id: 6, color: "#8B5CF6", name: "Ungu" },
];

interface Pattern {
  sequence: number[];
  colors: typeof GAME_COLORS;
}

export default function PolaWarnaGame() {
  const router = useRouter();
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [gameState, setGameState] = useState<"ready" | "showing" | "playing">(
    "ready"
  );
  const [showingIndex, setShowingIndex] = useState(-1);
  const [saving, setSaving] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    generatePattern();
  }, [level]);

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
    console.log("[Pola-Warna] Back button pressed");
    setShowExitModal(true);
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    router.push("/(tabs)" as any);
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  const handleRetry = () => {
    setShowFailModal(false);
    // Reset to level 1 and score 0
    setLevel(1);
    setScore(0);
  };

  const handleQuitGame = () => {
    setShowFailModal(false);
    router.push("/(tabs)" as any);
  };

  const generatePattern = () => {
    // Increase pattern length every 10 levels (start with 3, max 10)
    const patternLength = Math.min(3 + Math.floor((level - 1) / 10), 10);

    // Determine how many colors to use (start with 3, max 6)
    const numColors = Math.min(3 + Math.floor(level / 3), 6);

    // Warna tetap berurutan
    const availableColors = GAME_COLORS.slice(0, numColors);

    // ===== GENERATE POLA YANG PASTI BERBEDA SETIAP LEVEL =====
    // Gunakan level sebagai seed untuk memastikan pola berbeda
    const seed = level * 12345 + Date.now();
    const seededRandom = (index: number) => {
      const x = Math.sin(seed + index * 9999) * 10000;
      return Math.abs(x - Math.floor(x));
    };

    const sequence: number[] = [];

    for (let i = 0; i < patternLength; i++) {
      let nextColorIndex;
      let attempt = 0;

      do {
        // Gunakan seeded random + Math.random untuk variasi maksimal
        const randomValue = (seededRandom(i + attempt) + Math.random()) / 2;
        nextColorIndex = Math.floor(randomValue * numColors);
        attempt++;
      } while (i > 0 && nextColorIndex === sequence[i - 1] && attempt < 10);

      sequence.push(nextColorIndex);
    }

    console.log(
      "🎨 Level",
      level,
      "| WARNA YANG DIPAKAI:",
      availableColors.map((c) => c.name).join(", "),
      "\n📝 URUTAN POLA:",
      sequence.map((idx) => availableColors[idx].name).join(" → ")
    );

    setPattern({ sequence, colors: availableColors });
    setUserSequence([]);
    setGameState("ready");
    setShowingIndex(-1);
  };

  const showPattern = () => {
    if (!pattern) return;
    setGameState("showing");
    setShowingIndex(0);

    let currentIndex = 0;

    // Speed increases with level: 800ms at level 1, down to 400ms at level 10+
    const baseSpeed = 800;
    const speedReduction = Math.min(level * 40, 400); // Max 400ms reduction
    const displaySpeed = Math.max(baseSpeed - speedReduction, 400);

    const interval = setInterval(() => {
      if (currentIndex >= pattern.sequence.length) {
        clearInterval(interval);
        setShowingIndex(-1);
        setGameState("playing");
        return;
      }
      setShowingIndex(currentIndex);
      currentIndex++;
    }, displaySpeed);
  };

  const handleColorPress = (colorIndex: number) => {
    if (gameState !== "playing" || !pattern) return;

    const newSequence = [...userSequence, colorIndex];
    setUserSequence(newSequence);

    // Check if the current input is correct
    const currentStep = newSequence.length - 1;
    if (newSequence[currentStep] !== pattern.sequence[currentStep]) {
      // Wrong answer - Reset game completely
      setGameState("ready");
      setUserSequence([]);
      setShowFailModal(true);
      return;
    }

    // Check if pattern is complete
    if (newSequence.length === pattern.sequence.length) {
      const levelPoints = level * 10;
      const newScore = score + levelPoints;
      const nextLevel = level + 1;
      setScore(newScore);

      // Reset game state immediately
      setGameState("ready");
      setUserSequence([]);

      // Show success modal immediately
      setSuccessMessage(
        `Pola benar! +${levelPoints} poin\nTotal Skor: ${newScore}`
      );
      setShowSuccessModal(true);

      // Save score to backend in background
      setSaving(true);
      saveGameScore({
        gameType: "pola-warna",
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
          <Text style={styles.headerTitle}>Pola & Warna</Text>
          <Text style={styles.headerSubtitle}>
            Level {level} • Skor: {score}
          </Text>
        </View>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        {/* Instructions */}
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>
            {gameState === "ready" && "Tekan Mulai untuk melihat pola"}
            {gameState === "showing" && "Perhatikan urutan warna..."}
            {gameState === "playing" && "Ulangi pola yang ditampilkan!"}
          </Text>
          {gameState === "playing" && (
            <Text style={styles.progressText}>
              {userSequence.length} / {pattern?.sequence.length || 0}
            </Text>
          )}
        </View>

        {/* Pattern Display Area */}
        <View style={styles.patternArea}>
          {pattern?.sequence.map((colorIndex, index) => (
            <View
              key={index}
              style={[
                styles.patternDot,
                {
                  backgroundColor:
                    showingIndex === index
                      ? pattern.colors[colorIndex].color
                      : index < userSequence.length && gameState === "playing"
                      ? pattern.colors[colorIndex].color
                      : COLORS.muted,
                  opacity:
                    showingIndex === index
                      ? 1
                      : index < userSequence.length && gameState === "playing"
                      ? 0.8
                      : 0.3,
                  transform: [
                    {
                      scale:
                        showingIndex === index
                          ? 1.2
                          : index < userSequence.length &&
                            gameState === "playing"
                          ? 1.1
                          : 1,
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>

        {/* Color Buttons */}
        <View style={styles.colorGrid}>
          {pattern?.colors.map((colorItem, index) => (
            <Pressable
              key={colorItem.id}
              style={[
                styles.colorButton,
                { backgroundColor: colorItem.color },
                gameState !== "playing" && styles.colorButtonDisabled,
              ]}
              onPress={() => handleColorPress(index)}
              disabled={gameState !== "playing"}
            >
              <Text style={styles.colorName}>{colorItem.name}</Text>
            </Pressable>
          ))}
        </View>

        {/* Start Button */}
        {gameState === "ready" && (
          <Pressable style={styles.startButton} onPress={showPattern}>
            <Text style={styles.startButtonText}>Mulai</Text>
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
        visible={showFailModal}
        title="❌ Gagal!"
        message={`Pola tidak sesuai!\n\nLevel: ${level}\nSkor Saat Ini: ${score}\n\nApakah anda ingin mengulang dari awal?`}
        onConfirm={handleRetry}
        onCancel={handleQuitGame}
        confirmText="Ulangi"
        cancelText="Keluar"
      />

      <ConfirmModal
        visible={showSuccessModal}
        title="🎉 Hebat!"
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
  progressText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    color: COLORS.primary,
    textAlign: "center",
    marginTop: 6,
  },
  patternArea: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    flexWrap: "wrap",
    minHeight: 50,
  },
  patternDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  colorButton: {
    width: "45%",
    minHeight: 100,
    maxHeight: 140,
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    cursor: "pointer",
  },
  colorButtonDisabled: {
    opacity: 0.5,
  },
  colorName: {
    fontFamily: "Nunito_700Bold",
    fontSize: 18,
    color: COLORS.white,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    cursor: "pointer",
  },
  startButtonText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 18,
    color: COLORS.white,
  },
});
