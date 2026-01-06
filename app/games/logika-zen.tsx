import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
  flower: "#FF8B94",
};

interface Cell {
  row: number;
  col: number;
  hasFlower: boolean;
  revealed: boolean;
  number: number; // number of adjacent flowers
}

export default function LogikaZenGame() {
  const router = useRouter();
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [flaggedCells, setFlaggedCells] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
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
    console.log("[Logika-Zen] Back button pressed");
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
    startGame();
  };

  const handleQuitGame = () => {
    setShowFailModal(false);
    router.push("/(tabs)" as any);
  };

  const getGridSize = () => {
    // Level 1-2: 4x4, Level 3-5: 5x5, Level 6-8: 6x6, Level 9+: 7x7
    return Math.min(4 + Math.floor((level - 1) / 3), 7);
  };

  const getFlowerCount = () => {
    const size = getGridSize();
    // Start with fewer flowers, gradually increase
    // Level 1: ~20%, Level 5: ~25%, Level 10+: ~30%
    const percentage = 0.18 + Math.min(level, 10) * 0.012;
    return Math.max(Math.floor(size * size * percentage), 2);
  };

  const startGame = () => {
    const size = getGridSize();
    const flowerCount = getFlowerCount();

    // Initialize empty grid
    const newGrid: Cell[][] = Array.from({ length: size }, (_, row) =>
      Array.from({ length: size }, (_, col) => ({
        row,
        col,
        hasFlower: false,
        revealed: false,
        number: 0,
      }))
    );

    // Place flowers randomly
    let placed = 0;
    while (placed < flowerCount) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      if (!newGrid[row][col].hasFlower) {
        newGrid[row][col].hasFlower = true;
        placed++;
      }
    }

    // Calculate numbers
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (!newGrid[row][col].hasFlower) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = row + dr;
              const nc = col + dc;
              if (
                nr >= 0 &&
                nr < size &&
                nc >= 0 &&
                nc < size &&
                newGrid[nr][nc].hasFlower
              ) {
                count++;
              }
            }
          }
          newGrid[row][col].number = count;
        }
      }
    }

    setGrid(newGrid);
    setFlaggedCells(new Set());
    setGameStarted(true);
  };

  const revealCell = (row: number, col: number) => {
    if (!gameStarted || grid[row][col].revealed) return;

    const cellKey = `${row}-${col}`;
    if (flaggedCells.has(cellKey)) return;

    if (grid[row][col].hasFlower) {
      // Game over
      const newGrid = grid.map((r) => r.map((c) => ({ ...c, revealed: true })));
      setGrid(newGrid);
      setGameStarted(false);

      setShowFailModal(true);
      return;
    }

    // Reveal cell
    const newGrid = [...grid];
    newGrid[row][col].revealed = true;

    // Auto-reveal adjacent cells if number is 0
    if (newGrid[row][col].number === 0) {
      const queue: [number, number][] = [[row, col]];
      const visited = new Set<string>();

      while (queue.length > 0) {
        const [r, c] = queue.shift()!;
        const key = `${r}-${c}`;
        if (visited.has(key)) continue;
        visited.add(key);

        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (
              nr >= 0 &&
              nr < grid.length &&
              nc >= 0 &&
              nc < grid.length &&
              !newGrid[nr][nc].revealed &&
              !newGrid[nr][nc].hasFlower
            ) {
              newGrid[nr][nc].revealed = true;
              if (newGrid[nr][nc].number === 0) {
                queue.push([nr, nc]);
              }
            }
          }
        }
      }
    }

    setGrid(newGrid);

    // Check win condition
    const allSafeCellsRevealed = newGrid.every((row) =>
      row.every((cell) => cell.hasFlower || cell.revealed)
    );

    if (allSafeCellsRevealed) {
      const levelPoints = level * 20;
      const newScore = score + levelPoints;
      setScore(newScore);
      setGameStarted(false);

      // Save score to backend
      // Show success modal immediately
      setSuccessMessage(
        `Kamu menemukan semua sel aman!\n+${levelPoints} poin\nTotal Skor: ${newScore}`
      );
      setShowSuccessModal(true);

      // Save score to backend in background
      setSaving(true);
      saveGameScore({
        gameType: "logika-zen",
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

  const toggleFlag = (row: number, col: number) => {
    if (!gameStarted || grid[row][col].revealed) return;

    const cellKey = `${row}-${col}`;
    const newFlags = new Set(flaggedCells);

    if (newFlags.has(cellKey)) {
      newFlags.delete(cellKey);
    } else {
      newFlags.add(cellKey);
    }

    setFlaggedCells(newFlags);
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
          <Text style={styles.headerTitle}>Logika Zen</Text>
          <Text style={styles.headerSubtitle}>
            Level {level} • Skor: {score}
          </Text>
        </View>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>Temukan semua sel aman!</Text>
          <Text style={styles.instructionSubtitle}>
            Angka menunjukkan jumlah bunga di sekitarnya
          </Text>
          <Text style={styles.instructionSubtitle}>
            Tahan lama untuk menandai bunga
          </Text>
        </View>

        {/* Game Grid */}
        {grid.length > 0 && (
          <View style={styles.gridContainer}>
            {grid.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((cell, colIndex) => {
                  const cellKey = `${rowIndex}-${colIndex}`;
                  const isFlagged = flaggedCells.has(cellKey);

                  return (
                    <Pressable
                      key={colIndex}
                      style={[
                        styles.cell,
                        cell.revealed && styles.cellRevealed,
                        cell.revealed && cell.hasFlower && styles.cellFlower,
                      ]}
                      onPress={() => revealCell(rowIndex, colIndex)}
                      onLongPress={() => toggleFlag(rowIndex, colIndex)}
                    >
                      {cell.revealed ? (
                        cell.hasFlower ? (
                          <MaterialCommunityIcons
                            name="flower-tulip"
                            size={24}
                            color={COLORS.white}
                          />
                        ) : cell.number > 0 ? (
                          <Text style={styles.cellNumber}>{cell.number}</Text>
                        ) : null
                      ) : isFlagged ? (
                        <MaterialCommunityIcons
                          name="flag"
                          size={20}
                          color={COLORS.flower}
                        />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        {/* Start Button */}
        {!gameStarted && (
          <Pressable style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>
              {grid.length === 0 ? "Mulai" : "Main Lagi"}
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
        visible={showFailModal}
        title="❌ Gagal!"
        message={`Kamu menemukan bunga tersembunyi!\n\nLevel: ${level}\nSkor Saat Ini: ${score}\n\nApakah anda ingin mengulang dari awal?`}
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
    maxWidth: 900,
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
    alignItems: "center",
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
  },
  instructionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    width: "100%",
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
    fontSize: 11,
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 4,
  },
  gridContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    width: 42,
    height: 42,
    backgroundColor: COLORS.muted,
    margin: 1.5,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  },
  cellRevealed: {
    backgroundColor: COLORS.backdrop,
  },
  cellFlower: {
    backgroundColor: COLORS.flower,
  },
  cellNumber: {
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    color: COLORS.primary,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 60,
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
