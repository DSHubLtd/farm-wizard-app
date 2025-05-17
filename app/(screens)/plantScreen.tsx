import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  Modal,
  Dimensions,
  ImageBackground,
  StyleSheet,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { icons, images, levelmages } from "@/constants";
import { plantGrowth } from "@/constants/plants";
import { router, useLocalSearchParams } from "expo-router";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserPlantLevel } from "@/services/user";
import { Image as ExpoImage } from "expo-image";
import { getUserPIventory, updateInventory } from "@/services/userInventory";
import InterstitialAdComponent from "@/utils/InterstitialAdComponent";
import { useLoginContext } from "@/context/LoginProvider";
import { useAvatarArray } from "../../hooks/useAvatarArray";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const TEN_MINUTES = 10 * 60;
const PHASE_DURATION = 150; // 2.5 minutes
//const SEASON_DURATION = 200; // seconds per season
const SEASON_DURATION = TEN_MINUTES / 3;

const SEASONS = ["normal", "dry", "raining"] as const;
type SeasonType = (typeof SEASONS)[number];
const PlantScreen = () => {
  const { name } = useLocalSearchParams();
  const { user } = useLoginContext();
  if (!user) {
    router.replace("/");
  }
  const isPremiumUser = user?.isPremium === true;

  const [userInventory, setUserInventory] = useState({
    fertilizerQty: 0,
    pesticideQty: 0,
    waterQty: 0,
  });
  const [userLevel, setUserLevel] = useState(1);
  const MAX_BUGS = userLevel; //2;
  const plant = plantGrowth.filter((plant) => plant.name === name)[0];
  const plantImages = plant.plantImages; // Healthy (Normal session)
  const plantRainImages = plant.plantRainImages; // Rain (raining session)
  const plantSickImages = plant.plantSickImages;

  const plantScale = useRef(new Animated.Value(1)).current;
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState("");

  const [timeLeft, setTimeLeft] = useState(TEN_MINUTES); // in seconds
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [score, setScore] = useState(0);
  const [activeThreat, setActiveThreat] = useState<null | {
    type: "disease" | "storm";
    resolved: boolean;
    createdAt: number;
  }>(null);

  const [plantDamaged, setPlantDamaged] = useState(false);
  const [spraySound, setSpraySound] = useState<Audio.Sound | null>(null);
  const [fertilizerSound, setFertilizerSound] = useState<Audio.Sound | null>(
    null
  );
  const [waterSound, setWaterSound] = useState<Audio.Sound | null>(null);
  const [spraying, setSpraying] = useState(false);
  const sprayAnim = useRef(new Animated.Value(0)).current;
  const [watering, setWatering] = useState(false);
  const waterAnim = useRef(new Animated.Value(0)).current;
  const [fertilizing, setFertilizing] = useState(false);
  const fertAnim = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(true);
  const [invloading, setInvLoading] = useState(true);
  const SEASONS = ["normal", "dry", "raining"];

  const [plantHealth, setPlantHealth] = useState(100);
  const [waterLevel, setWaterLevel] = useState(100);
  const [nutrientLevel, setNutrientLevel] = useState(100);

  const [isDead, setIsDead] = useState(false);

  const [currentSeason, setCurrentSeason] = useState<SeasonType>("normal");

  const [showAd, setShowAd] = useState(true);

  const fetchUserPlantLevelData = async (): Promise<void> => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (token !== null) {
        const res = await getUserPlantLevel(token, plant.name);

        if (res.data.plantLevel) {
          setUserLevel(res.data.plantLevel.level);
        } else {
          setUserLevel(1);
        }
        setLoading(false);
      } else {
        console.log("no token");
        setLoading(false);
      }
    } catch (error) {
      console.log("no error");
    } finally {
      setLoading(false);
    }
  };
  const fetchUserInventotyData = async () => {
    setInvLoading(true);
    const token = await AsyncStorage.getItem("token");
    if (token !== null) {
      const res = await getUserPIventory(token);
      const { pesticideItems, fertilizerItems, waterItems } = res;
      if (res) {
        setUserInventory({
          fertilizerQty: fertilizerItems?.quantity || 0,
          pesticideQty: pesticideItems?.quantity || 0,
          waterQty: waterItems?.quantity || 0,
        });
      } else {
        setUserInventory({
          fertilizerQty: 0,
          pesticideQty: 0,
          waterQty: 0,
        });
      }
      setInvLoading(false);
    } else {
      console.log("no token");
      setInvLoading(false);
    }
  };
  const handleUpdateInventory = async (item: string, qty = 1) => {
    //  setSubmitting(true);
    const token = await AsyncStorage.getItem("token");
    if (token !== null) {
      try {
        const result = await updateInventory(token, item, qty);
        await fetchUserInventotyData();
      } catch (error: any) {
        //  Alert.alert("Error", error.message);
      } finally {
        //  setSubmitting(false);
      }
    }
  };

  const getPhaseInfo = () => {
    const elapsed = TEN_MINUTES - timeLeft;
    const currentStage = Math.floor(elapsed / PHASE_DURATION); // 0 to 3
    const phaseElapsedTime = elapsed % PHASE_DURATION; // 0 to 150
    return { currentStage, phaseElapsedTime };
  };
  const getPlantStage = () => getPhaseInfo().currentStage;

  const getCurrentSeason = (): SeasonType => {
    const elapsed = TEN_MINUTES - timeLeft;
    const seasonIndex = Math.floor(elapsed / SEASON_DURATION) % SEASONS.length;
    return (SEASONS[seasonIndex] as SeasonType) || "normal";
  };

  const getThreatChance = (season: SeasonType) => {
    if (season === "dry") return 0.2;
    if (season === "raining") return 0.15;
    return 0.1;
  };

  useEffect(() => {
    if (!isTimerActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });

      setCurrentSeason(getCurrentSeason());
      handlePlantLifeCycle();
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive, waterLevel, nutrientLevel]);

  const handlePlantLifeCycle = () => {
    const now = Date.now();

    // Decay logic
    const waterDecay =
      currentSeason === "dry" ? 5 : currentSeason === "normal" ? 3 : 1;
    const nutrientDecay = currentSeason === "raining" ? 2 : 1;

    setWaterLevel((prev) => Math.max(0, prev - waterDecay));
    setNutrientLevel((prev) => Math.max(0, prev - nutrientDecay));

    // Health penalties
    if (waterLevel < 20) {
      setPlantHealth((h) => Math.max(0, h - 5));
      //handleToolUse("⚠️ Your plant is drying out!");
      setPlantDamaged(true);
    }

    if (nutrientLevel < 20) {
      setPlantHealth((h) => Math.max(0, h - 3));
      //handleToolUse("⚠️ Your plant lacks nutrients!");
      setPlantDamaged(true);
    }

    // Threat logic
    if (activeThreat) {
      const timeSinceThreat = now - activeThreat.createdAt;

      if (!activeThreat.resolved) {
        if (activeThreat.type === "disease" && timeSinceThreat > 10000) {
          // Ongoing health drain
          setPlantHealth((h) => Math.max(0, h - 10));
          //handleToolUse("☠️ Disease is hurting your plant!");
          setPlantDamaged(true);
        }

        if (activeThreat.type === "storm" && timeSinceThreat > 5000) {
          // One-time hit
          setPlantHealth((h) => Math.max(0, h - 20));
          //handleToolUse("🌩️ Storm hit your plant!");
          //setActiveThreat({ ...activeThreat, resolved: true }); // Mark as done even if not "handled"
          setPlantDamaged(true);
        }
        // Remove threat after 15s regardless
        /*if (timeSinceThreat > 15000) {
          setActiveThreat(null);
          handleToolUse("Threat disappeared...");
        }*/
      }
    } else {
      // Maybe spawn new threat
      if (Math.random() < getThreatChance(currentSeason)) {
        const type = Math.random() > 0.5 ? "disease" : "storm";
        setActiveThreat({
          type,
          resolved: false,
          createdAt: now,
        });
        // handleToolUse(`⚠️ A ${type} has appeared! Respond quickly!`);
      }
    }

    // Check plant death
    if (plantHealth <= 0) {
      setIsDead(true);
      setIsTimerActive(false);
      router.replace("/(screens)/gameOver");
    }
  };

  const waterPlant = () => {
    if (waterLevel > 40) return;
    setWaterLevel(100);
    triggerWater();
  };

  const fertilizePlant = () => {
    if (nutrientLevel > 50) return;
    setNutrientLevel(100);
    triggerFertilizer();
  };

  const respondToThreat = () => {
    if (!activeThreat || activeThreat.resolved) return;
    setTimeout(() => {
      setActiveThreat(null);
    }, 3000);
    triggerSpray();
  };

  useEffect(() => {
    const loadSounds = async () => {
      try {
        const [pesticide, fertilizer, water] = await Promise.all([
          Audio.Sound.createAsync({
            uri: "https://orangefreesounds.com/wp-content/uploads/2023/09/Bug-zapper-sound-effect.mp3",
          }),
          Audio.Sound.createAsync({
            uri: "https://orangefreesounds.com/wp-content/uploads/2023/09/Bug-zapper-sound-effect.mp3",
          }),
          Audio.Sound.createAsync({
            uri: "https://orangefreesounds.com/wp-content/uploads/2023/09/Bug-zapper-sound-effect.mp3",
          }),
          // Audio.Sound.createAsync(require("@/assets/sounds/zapper.mp3")),
        ]);
        setSpraySound(pesticide.sound);
        setFertilizerSound(fertilizer.sound);
        setWaterSound(water.sound);
      } catch (e) {
        console.warn("Failed to load one or more sounds:", e);
      }
    };
    loadSounds();
    // PLANT ANIMATION
    // animatePlantGrowing();
    fetchUserPlantLevelData();
    fetchUserInventotyData();
    return () => {
      spraySound?.unloadAsync();
      fertilizerSound?.unloadAsync();
      waterSound?.unloadAsync();
    };
  }, []);

  if (loading || invloading)
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
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

    if (plantStage === 0) return 150;
    if (plantStage === 1) return 200;
    if (plantStage === 2) return 300;
    if (plantStage === 3) return 400;
    return 150;
  };

  const triggerSpray = () => {
    // if (bugs.length === 0) {
    //   handleToolUse("No bugs right now");
    //   return;
    // }
    // if (userInventory.pesticideQty > 0) {
    //   handleUpdateInventory("Pesticide");
    // } else {
    //   handleToolUse("Insufficient pesticide item, Please purchase");
    //   return;
    // }
    setPlantDamaged(false);

    setSpraying(true);
    sprayAnim.setValue(0);
    // 🔊 Play spray sound
    if (spraySound) {
      spraySound.replayAsync();
    }

    setScore((s) => Math.min(s + 3, 100000));

    // Start spray animation
    Animated.timing(sprayAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      setSpraying(false);
    });
  };
  const triggerFertilizer = () => {
    // if (userInventory.fertilizerQty > 0) {
    //   handleUpdateInventory("Fertilizer");
    // } else {
    //   handleToolUse("Insufficient fertilizer item, Please purchase");
    //   return;
    // }
    setScore((s) => Math.min(s + 3, 100000));
    setFertilizing(true);
    fertAnim.setValue(0);
    animatePlantGrowing();
    // 🔊 Play sound
    fertilizerSound?.replayAsync();

    Animated.timing(fertAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      setFertilizing(false);
      //handleToolUse("Fertilizer used! +3");
    });
  };
  const triggerWater = () => {
    // if (userInventory.waterQty > 0) {
    //   handleUpdateInventory("Water");
    // } else {
    //   handleToolUse("Insufficient water item, Please purchase");
    //   return;
    // }
    setScore((s) => Math.min(s + 3, 100000));
    setWatering(true);
    waterAnim.setValue(0);

    // 🔊 Play water sound
    waterSound?.replayAsync();

    Animated.timing(waterAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      setWatering(false);
      //handleToolUse("Water used! +3");
    });
  };
  const getLevelImage = () => {
    if (userLevel === 1) return levelmages.lv1;
    if (userLevel === 2) return levelmages.lv2;
    if (userLevel === 3) return levelmages.lv3;
    if (userLevel === 4) return levelmages.lv4;
    return levelmages.lv1;
  };

  return (
    <TouchableWithoutFeedback onPress={respondToThreat}>
      <View className="flex-1 relative bg-green-200" pointerEvents="box-none">
        {/* Background  */}
        {currentSeason === "normal" && (
          <Image
            source={images.background1}
            className="absolute w-full h-full"
            resizeMode="cover"
          />
        )}
        {currentSeason === "raining" && (
          <ImageBackground
            source={images.bgRainfall}
            style={styles.background}
            resizeMode="cover"
            className="absolute w-full h-full"
          >
            <ExpoImage
              source={images.storm}
              style={styles.rain}
              pointerEvents="none"
            />
          </ImageBackground>
        )}
        {currentSeason === "dry" && (
          <Image
            source={images.bgDry}
            className="absolute w-full h-full"
            resizeMode="cover"
          />
        )}

        {/* control show ads  */}
        {showAd && !isPremiumUser && (
          <InterstitialAdComponent
            onClose={() => {
              setShowAd(false); // Hide the component after ad closes
              //console.log("Ad finished!");
            }}
          />
        )}

        {/* Top bar */}
        <View className="flex-row justify-between items-center px-4 pt-10">
          <View className="flex-row">
            <TouchableOpacity className="">
              <Image
                source={useAvatarArray(user.avatar || 0)}
                className="w-12 h-12 rounded-full"
              />
            </TouchableOpacity>
            <Text className="my-4 text-white text-md">Hi, {user.fullName}</Text>
          </View>
          <TouchableOpacity
            className="bg-yellow-300 p-2 rounded-full"
            onPress={() => router.replace("/(tabs)/home")}
          >
            <Image source={icons.close} className="w-10 h-10" />
          </TouchableOpacity>
        </View>

        {/* Points */}
        <View className="absolute top-28 left-0 right-0 items-center">
          <Text className="text-white text-3xl font-bold">{score}</Text>

          <Text className="text-2xl text-gray-700">
            {"🌦️"} Current Season: {currentSeason.toUpperCase()}
          </Text>
        </View>

        <View className="absolute top-48 left-0 right-0 items-center">
          <Text>❤️ Health: {plantHealth}</Text>
          <Text>💧 Water Level: {waterLevel}</Text>
          <Text>🌿 Nutrient Level: {nutrientLevel}</Text>

          {activeThreat && !activeThreat.resolved && (
            <Text style={{ color: "red", marginTop: 10 }}>
              ⚠️{"🐛"} {activeThreat.type.toUpperCase()} - Respond within{" "}
              {activeThreat.type === "disease" ? "10" : "5"}s!
            </Text>
          )}
          {waterLevel < 20 && (
            <Text className="text-red text-md">
              ⚠️ Your plant is drying out of water!
            </Text>
          )}
          {nutrientLevel < 20 && (
            <Text className="text-red text-md">
              ⚠️ Your plant lacks nutrients!
            </Text>
          )}
        </View>

        {spraying && (
          <Animated.View
            style={{
              position: "absolute",
              top: SCREEN_HEIGHT / 2 - 80,
              left: SCREEN_WIDTH / 2 - 80,
              width: 160,
              height: 160,
              backgroundColor: "rgba(200,255,200,0.3)",
              borderRadius: 80,
              transform: [
                {
                  scale: sprayAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.2, 1.2],
                  }),
                },
              ],
              opacity: sprayAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 0],
              }),
            }}
          />
        )}

        {watering && (
          <Animated.View
            style={{
              position: "absolute",
              top: SCREEN_HEIGHT / 2,
              left: SCREEN_WIDTH / 2 - 30,
              width: 60,
              height: 100,
              opacity: waterAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
              transform: [
                {
                  translateY: waterAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 100],
                  }),
                },
              ],
              backgroundColor: "rgba(0,150,255,0.4)",
              borderRadius: 20,
            }}
          />
        )}

        {fertilizing && (
          <Animated.View
            style={{
              position: "absolute",
              top: SCREEN_HEIGHT / 2 - 80,
              left: SCREEN_WIDTH / 2 - 80,
              width: 160,
              height: 160,
              backgroundColor: "rgba(100,200,100,0.3)",
              borderRadius: 80,
              opacity: fertAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 0],
              }),
              transform: [
                {
                  scale: fertAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1.5],
                  }),
                },
              ],
            }}
          />
        )}

        {/* Plant */}
        <View
          className={`flex-1 justify-center items-center mt-80`}
          style={{
            borderRadius: 100,
            padding: 2,
            // backgroundColor: plantDamaged ? "rgba(255,0,0,0.2)" : "transparent",
          }}
        >
          {!isTimerActive && (
            <Animated.Image
              source={images.soil}
              style={{
                width: 100,
                height: 130,
                bottom: 80,
                position: "absolute",
              }}
              resizeMode="contain"
              className={`w-48 `}
            />
          )}
          {activeThreat && !activeThreat.resolved && (
            <ExpoImage
              source={images.bugs}
              style={{
                width: 30,
                height: 30,
                position: "absolute", // <-- This removes it from layout flow
                top: 120, // Adjust as needed
                left: 170, // Adjust as needed
                zIndex: 10, // Make sure it's above the plant
              }}
            />
          )}
          {isTimerActive && (
            <Animated.Image
              source={
                plantDamaged
                  ? plantSickImages[getPlantStage()]
                  : currentSeason === "raining"
                  ? plantRainImages[getPlantStage()]
                  : plantImages[getPlantStage()]
              }
              className={`w-48 `}
              resizeMode="contain"
              style={{
                height: getPlantSize(),
                // transform: [{ scale: plantScale }],
              }}
            />
          )}
        </View>

        {/* Tool buttons */}

        <View className="absolute left-4 top-[18%] gap-y-1 py-80">
          <ToolIcon
            icon={images.fertilizer}
            // onPress={triggerFertilizer}
            onPress={fertilizePlant}
            itemQty={userInventory.fertilizerQty}
          />
          <ToolIcon
            itemQty={userInventory.pesticideQty}
            icon={images.pesticied}
            onPress={respondToThreat}
          />

          <ToolIcon
            itemQty={userInventory.waterQty}
            icon={images.kettle}
            // onPress={triggerWater}
            onPress={waterPlant}
          />
        </View>

        {/* Progress bar */}
        <View className="px-6 mt-5">
          <View className="h-3 bg-white/30 rounded-full">
            <View
              className="h-3 bg-yellow-400 rounded-full"
              style={{ width: `${(getPlantStage() / 4) * 100}%` }}
            />
          </View>
          <Text className="text-center text-white mt-1">
            {getPlantStage() * 25}
          </Text>
        </View>

        {/* Timer */}
        <Text className="text-center text-white text-xl">
          {formatTime(timeLeft)}
        </Text>

        {/* Action buttons */}
        <View className="flex-row justify-around items-center ">
          <ActionButton
            icon={getLevelImage()}
            // icon={images/levelDoc}
            label={`LV ${userLevel}`}
            onPress={() => handleToolUse(`Level info ${userLevel}`)}
          />

          {timeLeft > 0 && (
            <ActionButton
              icon={images.timer}
              label=""
              onPress={() => {
                if (!isTimerActive) {
                  setIsTimerActive(true);
                  handleToolUse("Growth cycle started");
                }
              }}
            />
          )}
          <ActionButton
            icon={images.inventory}
            label=""
            onPress={() => router.push("/(screens)/inventory")}
          />
        </View>

        {/* Popup */}
        <Modal transparent visible={showPopup}>
          <View className="flex-1 justify-center items-center bg-black/40">
            <View className="bg-white rounded-xl p-6">
              <Text className="text-lg font-bold">{popupText}</Text>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

const ToolIcon = ({
  itemQty,
  icon,
  onPress,
}: {
  itemQty: number;
  icon: any;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="relative w-20 h-20 rounded-full bg-cream border-4 border-[#e6d6aa] flex items-center justify-center shadow-md"
  >
    <Image source={icon} className="w-26 h-26" resizeMode="contain" />

    <Text className="absolute bottom-2 right-2 bg-[#9D863B] text-white text-sm font-bold w-6 h-6 rounded-full flex text-center items-center justify-center shadow">
      {itemQty}
    </Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: "center",
  },
  rain: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.8,
    // zIndex: 2,
    opacity: 0.6,
  },
  // rain: {
  //   ...StyleSheet.absoluteFillObject, // fills the parent
  // },
});
