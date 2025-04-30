import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  Modal,
  Dimensions,
} from "react-native";
import { icons, images } from "@/constants";
import { plantGrowth } from "@/constants/plants";
import { useLocalSearchParams } from "expo-router";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const TEN_MINUTES = 10 * 60;
const PHASE_DURATION = 150; // 2.5 minutes
const MAX_BUGS = 2;

const PlantScreen = () => {
  const { name } = useLocalSearchParams();

  const plant = plantGrowth.filter((plant) => plant.name === name)[0];
  const plantImages = plant.plantImages;
  const plantSickImages = plant.plantSickImages;

  const plantScale = useRef(new Animated.Value(1)).current;
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState("");
  const [bugs, setBugs] = useState<any[]>([]);
  const [plantLevel, setPlantLevel] = useState(0);

  const [timeLeft, setTimeLeft] = useState(TEN_MINUTES); // in seconds
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [score, setScore] = useState(0);
  const [activeThreat, setActiveThreat] = useState<null | {
    type: "disease" | "storm";
    resolved: boolean;
    createdAt: number;
  }>(null);
  const [lastBugPhase, setLastBugPhase] = useState<number | null>(null);
  const [bugSpawnTime, setBugSpawnTime] = useState<number | null>(null);
  const [plantDamaged, setPlantDamaged] = useState(false);

  const getPhaseInfo = () => {
    const elapsed = TEN_MINUTES - timeLeft;
    const currentStage = Math.floor(elapsed / PHASE_DURATION); // 0 to 3
    const phaseElapsedTime = elapsed % PHASE_DURATION; // 0 to 150
    return { currentStage, phaseElapsedTime };
  };

  const getPlantStage = () => getPhaseInfo().currentStage;

  // PLANT ANIMATION
  useEffect(() => {
    animatePlantGrowing();
    // spawnBugsLoop();
  }, []);

  // COUNTDOWN + THREAT TRACKING
  useEffect(() => {
    if (!isTimerActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return TEN_MINUTES;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive]);

  // WEATHER THREAT + RESPONSE POINT TRACKER
  useEffect(() => {
    if (!isTimerActive) return;

    const { currentStage, phaseElapsedTime } = getPhaseInfo();

    // Trigger bugs at start of each phase (5s delay to look natural)
    if (phaseElapsedTime === 0 && lastBugPhase !== currentStage) {
      setLastBugPhase(currentStage); // Prevent re-spawning in same phase
      setTimeout(() => {
        spawnBugs();
      }, 5000);
    }

    if (phaseElapsedTime === 60 && !activeThreat) {
      const threatType = Math.random() > 0.5 ? "disease" : "storm";
      setActiveThreat({
        type: threatType,
        resolved: false,
        createdAt: Date.now(),
      });
    }

    // Threat expires if not resolved within 40s
    if (
      activeThreat &&
      !activeThreat.resolved &&
      Date.now() - activeThreat.createdAt > 40000
    ) {
      setActiveThreat(null); // threat expired
    }

    // Check if bugs have lived too long
    if (bugSpawnTime && bugs.length > 0) {
      const bugAge = Date.now() - bugSpawnTime;

      if (bugAge > 30000) {
        // More than 30s → apply penalty once
        setScore((s) => Math.max(s - 5, 0));
        setBugSpawnTime(null);
        setPlantDamaged(true); // trigger damage effect

        handleToolUse("Bugs damaged your plant! -5 pts");

        // Reset damage effect after short delay
        setTimeout(() => setPlantDamaged(false), 40000);
        // setTimeout(() => setPlantDamaged(false), 1200);
      }
    }
  }, [timeLeft]);

  // ANIMATION
  const animatePlantGrowing = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(plantScale, {
          toValue: 1.05,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(plantScale, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const handleToolUse = (message: string) => {
    setPopupText(message);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 1500);
  };

  // MORE FREQUENT BUGS
  const spawnBugs = () => {
    setBugSpawnTime(Date.now());
    const newBugs: any[] = [];

    const createBug = (index: number) => {
      const delay = index < 4 ? 0 : (index - 3) * 150;

      setTimeout(() => {
        const id = Math.random().toString();
        const angle = new Animated.Value(0);
        const radius = 100 + Math.random() * 20; // Orbit radius
        const scale = new Animated.Value(0.5); // Start small for pop-in

        // Animate the orbit angle (no native driver due to interpolate)
        Animated.loop(
          Animated.timing(angle, {
            toValue: 2 * Math.PI,
            duration: 8000 + Math.random() * 2000,
            useNativeDriver: false, // Must be false due to interpolation
          })
        ).start();

        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: false,
          friction: 5,
        }).start();

        const offset = (index * 360) / MAX_BUGS; // unique angle per bug
        newBugs.push({ id, angle, radius, scale, offset });

        if (newBugs.length === MAX_BUGS) {
          setBugs(newBugs);

          // Remove bugs after 90 seconds
          setTimeout(() => {
            setBugs([]);
          }, 90000);
        }
      }, delay);
    };

    for (let i = 0; i < MAX_BUGS; i++) {
      createBug(i);
    }
  };

  // FORMAT TIMER AS MM:SS
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  const getPlantSize = () => {
    const plantStage = getPlantStage();

    if (plantStage === 0) return 200;
    if (plantStage === 1) return 300;
    if (plantStage === 2) return 400;
    if (plantStage === 3) return 600;
    return 100;
  };

  return (
    <View className="flex-1 relative bg-green-200">
      {/* Background  */}
      {!activeThreat && (
        <Image
          source={images.background1}
          className="absolute w-full h-full"
          resizeMode="cover"
        />
      )}
      {activeThreat && (
        <Image
          source={images.rainingBg}
          className="absolute w-full h-full"
          resizeMode="cover"
        />
      )}

      {/* Bugs */}
      {bugs.map((bug) => {
        const angleWithOffset = Animated.add(
          bug.angle,
          (bug.offset * Math.PI) / 180
        );

        const x = angleWithOffset.interpolate({
          inputRange: [0, 2 * Math.PI],
          outputRange: [-bug.radius, bug.radius],
        });

        const y = angleWithOffset.interpolate({
          inputRange: [0, Math.PI, 2 * Math.PI],
          outputRange: [0, bug.radius, 0],
        });

        return (
          <Animated.View
            key={bug.id}
            style={{
              position: "absolute",
              top: SCREEN_HEIGHT / 2 + 60, // Adjust to center plant
              left: SCREEN_WIDTH / 2 - 40,
              width: 100,
              height: 100,
              transform: [
                // { translateX: x },
                // { translateY: y },
                { scale: bug.scale },
                {
                  rotate: angleWithOffset.interpolate({
                    inputRange: [0, 2 * Math.PI],
                    outputRange: ["0deg", "180deg"],
                  }),
                },
              ],
            }}
          >
            <Image
              source={images.bugs}
              style={{ width: 100, height: 100 }} // Increased size
              resizeMode="cover"
            />
          </Animated.View>
        );
      })}

      {/* Top bar */}
      <View className="flex-row justify-between items-center px-4 pt-10">
        <TouchableOpacity className="bg-white/30 p-2 rounded-full">
          <Image source={icons.profile} className="w-10 h-10" />
        </TouchableOpacity>
        <TouchableOpacity className="bg-white/30 p-2 rounded-full">
          <Image source={icons.close} className="w-10 h-10" />
        </TouchableOpacity>
      </View>

      {/* Points */}
      <View className="absolute top-28 left-0 right-0 items-center">
        <Text className="text-white text-3xl font-bold">1,472</Text>
        <Text className="text-white text-xl font-bold">Score: {score}</Text>
      </View>

      {/* Threat alert */}
      {/* {activeThreat && !activeThreat.resolved && (
        <View className="absolute top-36 left-0 right-0 items-center">
          <Text className="text-red-600 text-lg font-bold">
            ⚠️{" "}
            {activeThreat.type === "disease"
              ? "Disease Detected!"
              : "Storm Incoming!"}
          </Text>
          <Text className="text-white text-sm">(Protect your plant!)</Text>
        </View>
      )} */}

      {bugs.length > 0 && (
        <View className="absolute top-48 left-0 right-0 items-center">
          <Text className="text-red-700 font-bold text-lg">
            {/* {bugs.length} */}
            🐛 bugs around your plant!
          </Text>
          <Text className="text-black/40 text-sm">
            Use pesticide to clear them
          </Text>
        </View>
      )}

      {/* Plant */}
      <View
        className={`flex-1 justify-center items-center mt-80 mb-10`}
        style={{
          borderRadius: 100,
          padding: 4,
          // backgroundColor: plantDamaged ? "rgba(255,0,0,0.2)" : "transparent",
        }}
      >
        <Animated.Image
          source={
            plantDamaged
              ? plantSickImages[getPlantStage()]
              : plantImages[getPlantStage()]
          }
          className={`w-48 `}
          resizeMode="contain"
          style={{
            height: getPlantSize(),
            transform: [{ scale: plantScale }],
          }}
        />
      </View>

      {/* Tool buttons */}
      <View className="absolute left-4 top-40 space-y-4 py-80">
        <ToolIcon
          icon={images.fertilizer}
          onPress={() => handleToolUse("Fertilizer used!")}
        />
        <ToolIcon
          icon={images.pesticied}
          onPress={() => {
            if (bugs.length > 0) {
              setBugs([]);
              setBugSpawnTime(null); // reset
              handleToolUse("Pesticide used! Bugs removed.");
            } else {
              handleToolUse("No bugs right now");
            }
          }}
        />

        <ToolIcon
          icon={images.kettle}
          onPress={() => handleToolUse("Water used!")}
        />
      </View>

      {/* Progress bar */}

      <View className="px-6">
        <View className="h-3 bg-white/30 rounded-full">
          <View
            className="h-3 bg-yellow-400 rounded-full"
            style={{ width: `${(getPlantStage() / 3) * 100}%` }}
          />
        </View>
        <Text className="text-center text-white mt-1">
          {getPlantStage() * 25}
        </Text>
      </View>

      {/* Timer */}
      <Text className="text-center text-white text-2xl mt-6">
        {formatTime(timeLeft)}
      </Text>

      {/* Action buttons */}
      <View className="flex-row justify-around items-center mt-4 mb-6">
        <ActionButton
          icon={images.levelDoc}
          label="LV"
          onPress={() => handleToolUse("Level info")}
        />
        <ActionButton
          icon={images.timer}
          label=""
          onPress={() => {
            if (!isTimerActive) {
              setIsTimerActive(true);
              handleToolUse("Growth cycle started");
              setTimeout(() => {
                spawnBugs();
              }, 5000);
            }
          }}
        />
        <ActionButton
          icon={images.inventory}
          label=""
          onPress={() => handleToolUse("Inventory opened")}
        />
      </View>

      {/* <ToolIcon
        icon={images.medicine}
        onPress={() => {
          if (activeThreat?.type === "disease" && !activeThreat.resolved) {
            setScore((s) => s + 10);
            handleToolUse("Medicine applied! +10 pts");
            setActiveThreat({ ...activeThreat, resolved: true });
          } else {
            handleToolUse("No disease to cure");
          }
        }}
      />

      <ToolIcon
        icon={images.umbrella}
        onPress={() => {
          if (activeThreat?.type === "storm" && !activeThreat.resolved) {
            setScore((s) => s + 10);
            handleToolUse("Storm blocked! +10 pts");
            setActiveThreat({ ...activeThreat, resolved: true });
          } else {
            handleToolUse("No storm to block");
          }
        }}
      /> */}

      {/* Harvest */}
      {plantLevel === 3 && (
        <TouchableOpacity
          className="absolute bottom-20 self-center bg-yellow-400 px-4 py-2 rounded-full"
          onPress={() => {
            handleToolUse("Crop harvested!");
            setPlantLevel(0);
            setTimeLeft(TEN_MINUTES);
            setIsTimerActive(false);
          }}
        >
          <Text className="text-white font-bold">🌾 Harvest</Text>
        </TouchableOpacity>
      )}

      {/* Popup */}
      <Modal transparent visible={showPopup}>
        <View className="flex-1 justify-center items-center bg-black/40">
          <View className="bg-white rounded-xl p-6">
            <Text className="text-lg font-bold">{popupText}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const ToolIcon = ({ icon, onPress }: { icon: any; onPress: () => void }) => (
  <TouchableOpacity className="p-1 rounded-full" onPress={onPress}>
    <Image source={icon} className="w-16 h-16" resizeMode="contain" />
  </TouchableOpacity>
);

const ActionButton = ({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity className="items-center" onPress={onPress}>
    <Image source={icon} className="w-24 h-24" resizeMode="contain" />
    {label !== "" && (
      <Text className="text-white text-xs font-bold mt-1">{label}</Text>
    )}
  </TouchableOpacity>
);

export default PlantScreen;
