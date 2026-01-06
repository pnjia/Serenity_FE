import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Animated,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
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

const SOUND_NOTES = [
  { id: 1, note: "C", frequency: 261.63, color: "#FF6B6B", label: "Do" },
  { id: 2, note: "D", frequency: 293.66, color: "#4ECDC4", label: "Re" },
  { id: 3, note: "E", frequency: 329.63, color: "#FFE66D", label: "Mi" },
  { id: 4, note: "F", frequency: 349.23, color: "#A8E6CF", label: "Fa" },
  { id: 5, note: "G", frequency: 392.0, color: "#FF8B94", label: "Sol" },
  { id: 6, note: "A", frequency: 440.0, color: "#9B5DE5", label: "La" },
];

export default function RitmeSuaraGame() {
  const router = useRouter();
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [gameState, setGameState] = useState<"ready" | "showing" | "playing">(
    "ready"
  );
  const [playingNote, setPlayingNote] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [animatedValues] = useState(
    SOUND_NOTES.map(() => new Animated.Value(1))
  );

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
    console.log("[Ritme-Suara] Back button pressed");
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
    setLevel(1);
    setScore(0);
    setSequence([]);
    setUserSequence([]);
    setGameState("ready");
  };

  const handleQuitGame = () => {
    setShowFailModal(false);
    router.push("/(tabs)" as any);
  };

  const playSound = async (frequency: number, noteIndex: number) => {
    try {
      // Create a simple beep tone using Web Audio API (for web)
      // For native, you'd need actual sound files or use expo-audio
      if (typeof window !== "undefined" && window.AudioContext) {
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.5
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      }

      // Animate the note
      setPlayingNote(noteIndex);
      Animated.sequence([
        Animated.timing(animatedValues[noteIndex], {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValues[noteIndex], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setPlayingNote(null);
      });
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const generateSequence = () => {
    const sequenceLength = Math.min(2 + level, 8);
    // Increase available notes every 5 levels: Level 1-4: 3 notes, Level 5-9: 4 notes, etc.
    const availableNotes = Math.min(3 + Math.floor(level / 5), 6);
    const newSequence: number[] = [];

    // Generate sequence with variety - avoid same note 3 times in a row
    for (let i = 0; i < sequenceLength; i++) {
      let note = Math.floor(Math.random() * availableNotes);

      // Avoid same note appearing more than 2 times in a row
      if (
        i >= 2 &&
        newSequence[i - 1] === note &&
        newSequence[i - 2] === note
      ) {
        note = (note + 1) % availableNotes;
      }

      newSequence.push(note);
    }

    setSequence(newSequence);
    setUserSequence([]);
    setGameState("ready");
  };

  useEffect(() => {
    generateSequence();
  }, [level]);

  const playSequence = async () => {
    setGameState("showing");

    for (let i = 0; i < sequence.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, i === 0 ? 0 : 600));
      const noteIndex = sequence[i];
      await playSound(SOUND_NOTES[noteIndex].frequency, noteIndex);
    }

    await new Promise((resolve) => setTimeout(resolve, 800));
    setGameState("playing");
  };

  const handleNotePress = async (noteIndex: number) => {
    if (gameState !== "playing") return;

    await playSound(SOUND_NOTES[noteIndex].frequency, noteIndex);

    const newUserSequence = [...userSequence, noteIndex];
    setUserSequence(newUserSequence);

    // Check if the current note is correct
    const currentStep = newUserSequence.length - 1;
    if (newUserSequence[currentStep] !== sequence[currentStep]) {
      // Wrong answer
      setGameState("ready");
      setUserSequence([]);
      setShowFailModal(true);
      return;
    }

    // Check if sequence is complete
    if (newUserSequence.length === sequence.length) {
      const newScore = score + level * 15;
      setScore(newScore);

      // Show success modal immediately
      setSuccessMessage(
        `Melodi yang indah! +${level * 15} poin\nTotal Skor: ${newScore}`
      );
      setShowSuccessModal(true);

      // Save score to backend in background
      setSaving(true);
      saveGameScore({
        gameType: "ritme-suara",
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
          <Text style={styles.headerTitle}>Ritme dan Suara</Text>
          <Text style={styles.headerSubtitle}>
            Level {level} • Skor: {score}
          </Text>
        </View>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>
            {gameState === "ready" && "Tekan Mulai untuk mendengar melodi"}
            {gameState === "showing" && "Dengarkan baik-baik..."}
            {gameState === "playing" && "Ulangi melodi yang kamu dengar!"}
          </Text>
          {gameState === "playing" && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {userSequence.length} / {sequence.length}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${
                        (userSequence.length / sequence.length) * 100
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </View>

        {/* Note Buttons */}
        <View style={styles.notesContainer}>
          {SOUND_NOTES.slice(0, Math.min(3 + level, 6)).map((note, index) => (
            <Animated.View
              key={note.id}
              style={[
                styles.noteButtonContainer,
                {
                  transform: [{ scale: animatedValues[index] }],
                },
              ]}
            >
              <Pressable
                style={[
                  styles.noteButton,
                  { backgroundColor: note.color },
                  playingNote === index && styles.noteButtonActive,
                  gameState !== "playing" && styles.noteButtonDisabled,
                ]}
                onPress={() => handleNotePress(index)}
                disabled={gameState !== "playing"}
              >
                <Ionicons name="musical-note" size={32} color={COLORS.white} />
                <Text style={styles.noteLabel}>{note.label}</Text>
                <Text style={styles.noteText}>{note.note}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {/* Start Button */}
        {gameState === "ready" && (
          <Pressable style={styles.startButton} onPress={playSequence}>
            <Ionicons
              name="play"
              size={24}
              color={COLORS.white}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.startButtonText}>Dengarkan Melodi</Text>
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
        message={`Nada tidak sesuai!\n\nLevel: ${level}\nSkor Saat Ini: ${score}\n\nApakah anda ingin mengulang dari awal?`}
        onConfirm={handleRetry}
        onCancel={handleQuitGame}
        confirmText="Ulangi"
        cancelText="Keluar"
      />

      <ConfirmModal
        visible={showSuccessModal}
        title="🎉 Sempurna!"
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
    marginBottom: 20,
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
  progressContainer: {
    marginTop: 12,
  },
  progressText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 6,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.backdrop,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.success,
    borderRadius: 4,
  },
  notesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  noteButtonContainer: {
    width: "30%",
  },
  noteButton: {
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    gap: 4,
    cursor: "pointer",
  },
  noteButtonActive: {
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  noteButtonDisabled: {
    opacity: 0.5,
  },
  noteLabel: {
    fontFamily: "Nunito_700Bold",
    fontSize: 18,
    color: COLORS.white,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  noteText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
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
