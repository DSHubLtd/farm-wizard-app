import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Cloud,
  Sun,
  Droplets,
  Wallet,
  Timer,
  Star,
  ArrowLeft,
  ArrowRight,
} from "lucide-react-native";
import { useState, useEffect, useCallback } from "react";

type Seed = {
  id: number;
  name: string;
  image: string;
  growthTime: number;
  reward: number;
  cost: number;
};

const SEEDS: Seed[] = [
  {
    id: 1,
    name: "Mystic Rose",
    image:
      "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=200&h=200&fit=crop",
    growthTime: 600, // 10 minutes
    reward: 25,
    cost: 10,
  },
  {
    id: 2,
    name: "Dragon Fruit",
    image:
      "https://images.unsplash.com/photo-1527325678964-54921661f888?w=200&h=200&fit=crop",
    growthTime: 1200, // 20 minutes
    reward: 50,
    cost: 20,
  },
  {
    id: 3,
    name: "Star Bloom",
    image:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=200&h=200&fit=crop",
    growthTime: 300, // 5 minutes
    reward: 15,
    cost: 5,
  },
];

type GameState = "select" | "play" | "protect" | "complete";

type Plot = {
  id: number;
  planted: boolean;
  seedId: number | null;
  progress: number;
  needsWater: boolean;
  needsSunlight: boolean;
  diseased: boolean;
};

export default function FarmScreen() {
  const [gameState, setGameState] = useState<GameState>("select");
  const [selectedSeedIndex, setSelectedSeedIndex] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [coins, setCoins] = useState(100);
  const [plots, setPlots] = useState<Plot[]>(
    Array.from({ length: 1 }, (_, i) => ({
      id: i,
      planted: false,
      seedId: null,
      progress: 0,
      needsWater: false,
      needsSunlight: false,
      diseased: false,
    }))
  );

  useEffect(() => {
    if (gameState !== "play") return;

    const interval = setInterval(() => {
      setSessionTime((prev) => prev + 1);
      setPlots((currentPlots) =>
        currentPlots.map((plot) => {
          if (!plot.planted) return plot;

          const seed = SEEDS.find((s) => s.id === plot.seedId);
          if (!seed) return plot;

          const newProgress = plot.progress + 1;
          if (newProgress >= seed.growthTime) {
            setSessionScore((prev) => prev + seed.reward);
            return {
              ...plot,
              planted: false,
              seedId: null,
              progress: 0,
              needsWater: false,
              needsSunlight: false,
              diseased: false,
            };
          }

          // Random events
          const shouldNeedWater = Math.random() < 0.05;
          const shouldNeedSun = Math.random() < 0.05;
          const shouldGetDisease = Math.random() < 0.03;

          return {
            ...plot,
            progress: newProgress,
            needsWater: shouldNeedWater || plot.needsWater,
            needsSunlight: shouldNeedSun || plot.needsSunlight,
            diseased: shouldGetDisease || plot.diseased,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  const plantSeed = useCallback(
    (plotId: number) => {
      const seed = SEEDS[selectedSeedIndex];
      if (coins < seed.cost) return;

      setCoins((current) => current - seed.cost);
      setPlots((current) =>
        current.map((plot) =>
          plot.id === plotId
            ? { ...plot, planted: true, seedId: seed.id, progress: 0 }
            : plot
        )
      );
    },
    [selectedSeedIndex, coins]
  );

  const treatPlot = useCallback(
    (plotId: number, treatment: "water" | "sun" | "disease") => {
      if (coins < 5) return;

      setCoins((current) => current - 5);
      setPlots((current) =>
        current.map((plot) =>
          plot.id === plotId
            ? {
                ...plot,
                needsWater: treatment === "water" ? false : plot.needsWater,
                needsSunlight: treatment === "sun" ? false : plot.needsSunlight,
                diseased: treatment === "disease" ? false : plot.diseased,
              }
            : plot
        )
      );
    },
    [coins]
  );

  const renderSeedSelection = () => (
    <View style={styles.seedSelection}>
      <Text style={styles.title}>Select Your Seed</Text>
      <View style={styles.seedCarousel}>
        <TouchableOpacity
          onPress={() => setSelectedSeedIndex((prev) => Math.max(0, prev - 1))}
          style={styles.carouselButton}
        >
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.seedCard}>
          <Image
            source={{ uri: SEEDS[selectedSeedIndex].image }}
            style={styles.seedImage}
          />
          <Text style={styles.seedName}>{SEEDS[selectedSeedIndex].name}</Text>
          <View style={styles.seedInfo}>
            <View style={styles.infoItem}>
              <Timer size={16} color="#ffffff" />
              <Text style={styles.infoText}>
                {SEEDS[selectedSeedIndex].growthTime}s
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Star size={16} color="#FFD700" />
              <Text style={styles.infoText}>
                {SEEDS[selectedSeedIndex].reward}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Wallet size={16} color="#FFD700" />
              <Text style={styles.infoText}>
                {SEEDS[selectedSeedIndex].cost}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={() =>
            setSelectedSeedIndex((prev) => Math.min(SEEDS.length - 1, prev + 1))
          }
          style={styles.carouselButton}
        >
          <ArrowRight size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.playButton}
        onPress={() => setGameState("play")}
      >
        <Text style={styles.playButtonText}>Start Farming</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGame = () => (
    <View style={styles.gameContainer}>
      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <Star size={24} color="#FFD700" />
          <Text style={styles.scoreText}>{sessionScore}</Text>
        </View>
        <View style={styles.timerContainer}>
          <Timer size={24} color="#ffffff" />
          <Text style={styles.timerText}>{sessionTime}s</Text>
        </View>
        <View style={styles.coinsContainer}>
          <Wallet size={24} color="#FFD700" />
          <Text style={styles.coinsText}>{coins}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {plots.map((plot) => (
          <View key={plot.id} style={styles.plot}>
            {!plot.planted ? (
              <TouchableOpacity
                style={styles.emptyPlot}
                onPress={() => plantSeed(plot.id)}
              >
                <Text style={styles.plantText}>Plant</Text>
                <Text style={styles.costText}>
                  {SEEDS[selectedSeedIndex].cost} coins
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.plantedPlot}>
                <Image
                  source={{
                    uri: SEEDS.find((s) => s.id === plot.seedId)?.image,
                  }}
                  style={[
                    styles.cropImage,
                    {
                      opacity:
                        0.3 +
                        (plot.progress /
                          SEEDS.find((s) => s.id === plot.seedId)
                            ?.growthTime!) *
                          0.7,
                    },
                  ]}
                />
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${
                          (plot.progress /
                            SEEDS.find((s) => s.id === plot.seedId)
                              ?.growthTime!) *
                          100
                        }%`,
                      },
                    ]}
                  />
                </View>
                <View style={styles.statusIcons}>
                  {plot.needsWater && (
                    <TouchableOpacity
                      onPress={() => treatPlot(plot.id, "water")}
                      style={styles.statusIcon}
                    >
                      <Droplets size={20} color="#60A5FA" />
                    </TouchableOpacity>
                  )}
                  {plot.needsSunlight && (
                    <TouchableOpacity
                      onPress={() => treatPlot(plot.id, "sun")}
                      style={styles.statusIcon}
                    >
                      <Sun size={20} color="#FCD34D" />
                    </TouchableOpacity>
                  )}
                  {plot.diseased && (
                    <TouchableOpacity
                      onPress={() => treatPlot(plot.id, "disease")}
                      style={styles.statusIcon}
                    >
                      <Cloud size={20} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <LinearGradient colors={["#065F46", "#047857"]} style={styles.container}>
      {gameState === "select" && renderSeedSelection()}
      {gameState === "play" && renderGame()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  seedSelection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter-Bold",
    color: "#ffffff",
    marginBottom: 30,
  },
  seedCarousel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  carouselButton: {
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
  },
  seedCard: {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    width: 200,
  },
  seedImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  seedName: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
    color: "#ffffff",
    marginBottom: 10,
  },
  seedInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  infoText: {
    color: "#ffffff",
    fontFamily: "Inter-Regular",
  },
  playButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 40,
  },
  playButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontFamily: "Inter-Bold",
  },
  gameContainer: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 10,
    borderRadius: 20,
    gap: 8,
  },
  scoreText: {
    color: "#ffffff",
    fontSize: 18,
    fontFamily: "Inter-Bold",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 10,
    borderRadius: 20,
    gap: 8,
  },
  timerText: {
    color: "#ffffff",
    fontSize: 18,
    fontFamily: "Inter-Bold",
  },
  coinsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 10,
    borderRadius: 20,
    gap: 8,
  },
  coinsText: {
    color: "#ffffff",
    fontSize: 18,
    fontFamily: "Inter-Bold",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  plot: {
    width: "100%",
    aspectRatio: 1,
    marginBottom: 15,
  },
  emptyPlot: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
  },
  plantText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Inter-Bold",
  },
  costText: {
    color: "#FFD700",
    fontSize: 12,
    fontFamily: "Inter-Regular",
  },
  plantedPlot: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  cropImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  progressBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10B981",
  },
  statusIcons: {
    position: "absolute",
    top: 5,
    right: 5,
    flexDirection: "column",
  },
  statusIcon: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 5,
    borderRadius: 15,
    marginBottom: 5,
  },
});
