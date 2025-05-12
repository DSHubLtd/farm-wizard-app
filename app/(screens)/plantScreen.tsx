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
} from "react-native";
import { icons, images, levelmages } from "@/constants";
import { plantGrowth } from "@/constants/plants";
import { router, useLocalSearchParams } from "expo-router";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserPlantLevel } from "@/services/user";
import { Image as ExpoImage } from "expo-image";
import { getUserPIventory, updateInventory } from "@/services/userInventory";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const TEN_MINUTES = 10 * 60;
const PHASE_DURATION = 150; // 2.5 minutes
const SEASON_DURATION = 200; // seconds per season

const PlantScreen = () => {
  const { name } = useLocalSearchParams();

  const [userInventory, setUserInventory] = useState({
    fertilizerQty: 0,
    pesticideQty: 0,
    waterQty: 0,
  });
  const [userLevel, setUserLevel] = useState(1);
  const MAX_BUGS = userLevel; //2;
  const plant = plantGrowth.filter((plant) => plant.name === name)[0];
  const plantImages = plant.plantImages;
  const plantSickImages = plant.plantSickImages;

  const plantScale = useRef(new Animated.Value(1)).current;
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState("");
  const [bugs, setBugs] = useState<any[]>([]);

  const [timeLeft, setTimeLeft] = useState(TEN_MINUTES); // in seconds
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [score, setScore] = useState(0);
  const [activeThreat, setActiveThreat] = useState<null | {
    type: "disease" | "storm";
    resolved: boolean;
    createdAt: number;
  }>(null);
  const [lastBugPhase, setLastBugPhase] = useState<number | string | null>(
    null
  );
  const [bugSpawnTime, setBugSpawnTime] = useState<number | null>(null);
  const [plantDamaged, setPlantDamaged] = useState(false);
  const [plantDamagedTime, setPlantDamagedTime] = useState<number | null>(null);
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
  const [harvest, setHarvest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [invloading, setInvLoading] = useState(true);
  const SEASONS = ["normal", "dry", "raining"];

  const getPhaseInfo = () => {
    const elapsed = TEN_MINUTES - timeLeft;
    const currentStage = Math.floor(elapsed / PHASE_DURATION); // 0 to 3
    const phaseElapsedTime = elapsed % PHASE_DURATION; // 0 to 150
    return { currentStage, phaseElapsedTime };
  };
  const getPlantStage = () => getPhaseInfo().currentStage;
  const getCurrentSeason = () => {
    const elapsed = TEN_MINUTES - timeLeft;
    const seasonIndex = Math.floor(elapsed / SEASON_DURATION); // 0, 1, or 2
    return SEASONS[seasonIndex] || "normal"; // fallback
  };
  const [currentSeason, setCurrentSeason] = useState(getCurrentSeason());

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

  // COUNTDOWN + THREAT TRACKING
  useEffect(() => {
    if (!isTimerActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimerActive(false); // Stops future intervals
          //setShowSummary(true); // Or trigger harvest
          return 0;
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
      setScore((s) => Math.min(s + 200, 100000)); // give score after each stage
    }
    if (
      phaseElapsedTime % 25 === 0 && // Every 25 seconds
      bugs.length === 0 &&
      !bugSpawnTime &&
      lastBugPhase !== `${currentStage}-${phaseElapsedTime}` // Ensure no double-spawn
    ) {
      setLastBugPhase(`${currentStage}-${phaseElapsedTime}`); // Store to prevent multiple spawns
      spawnBugs();
    }

    if (phaseElapsedTime === 60 && !activeThreat) {
      const threatType = Math.random() > 0.5 ? "disease" : "storm";
      setActiveThreat({
        type: threatType,
        resolved: false,
        createdAt: Date.now(),
      });
    }

    // Threat expires if not resolved within 40s (no need now)
    /*if (
      activeThreat &&
      !activeThreat.resolved &&
      Date.now() - activeThreat.createdAt > 40000
    ) {
      setActiveThreat(null); // threat expired
    }*/

    // Check if bugs have lived too long
    if (bugSpawnTime && bugs.length > 0) {
      const bugAge = Date.now() - bugSpawnTime;

      if (bugAge > 30000) {
        // More than 30s → apply penalty once
        setScore((s) => Math.max(s - 50, 0));
        setBugSpawnTime(null);
        setPlantDamaged(true); // trigger damage effect
        //setTimeLeft((prev) => prev + 10); // delay growth by 10s (optional)
        //setPlantLevel((prev)=> prev -1); // reduce plant level (optional)
        setPlantDamagedTime(Date.now());
        handleToolUse("Bugs damaged your plant! -50 pts");
        // Reset damage effect after short delay
        //setTimeout(() => setPlantDamaged(false), 40000);
      }
    }
    if (plantDamagedTime && Date.now() - plantDamagedTime > 40000) {
      router.replace("/(screens)/gameOver");
    }
    // harvest time
    if (timeLeft === 1 || getPlantStage() > 3) {
      setIsTimerActive(false);
      setHarvest(true);
      handleToolUse("Harvest time");
      setBugs([]);
      router.replace({
        pathname: "/(screens)/harvest",
        params: { name, score, userLevel },
      });
    }

    const season = getCurrentSeason();
    setCurrentSeason(season);
    const now = Date.now();

    if (season === "raining") {
      // Boost growth, maybe reduce need for watering
      // setGrowthMultiplier(1.5); // Optional state
      // if (!lastThreatTime || now - lastThreatTime > 40000) {
      //setActiveThreat({ type: "storm", resolved: false, createdAt: Date.now() });
      //   setLastThreatTime(now);
    }
    //}
    if (season === "dry") {
      // Slow growth, increase disease
      // setGrowthMultiplier(0.5);
      // if (!lastThreatTime || now - lastThreatTime > 30000) {
      setActiveThreat({
        type: "disease",
        resolved: false,
        createdAt: Date.now(),
      });
      //   setLastThreatTime(now);
      // }
      // setWateringDisabled(true); // Optional
    }

    if (season === "normal") {
      // setGrowthMultiplier(1);
      // Standard threat logic
    }
  }, [timeLeft]);

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
      <Text className="text-2xl justify-center text-center">Loading...</Text>
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

  // MORE FREQUENT BUGS
  const spawnBugs = () => {
    setBugSpawnTime(Date.now());
    const newBugs: any[] = [];

    const createBug = (index: number) => {
      const delay = index < 4 ? 0 : (index - 3) * 150;

      setTimeout(() => {
        const id = Math.random().toString();

        const position = new Animated.ValueXY({
          x: 0,
          y: 0,
        });

        const scale = new Animated.Value(0.5);
        const opacity = new Animated.Value(1);

        const wander = () => {
          const toX = (Math.random() - 0.5) * 150; // +/- 75 px
          const toY = (Math.random() - 0.5) * 150;

          Animated.sequence([
            Animated.timing(position, {
              toValue: { x: toX, y: toY },
              duration: 3000 + Math.random() * 2000,
              useNativeDriver: false,
            }),
            Animated.delay(500),
          ]).start(() => {
            wander(); // loop
          });
        };

        wander();

        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: false,
          friction: 5,
        }).start();

        const offset = (index * 360) / MAX_BUGS;

        newBugs.push({
          id,
          position,
          scale,
          offset,
          opacity,
          tapCount: 1,
        });

        if (newBugs.length === MAX_BUGS) {
          setBugs(newBugs);

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

    if (plantStage === 0) return 150;
    if (plantStage === 1) return 200;
    if (plantStage === 2) return 300;
    if (plantStage === 3) return 400;
    return 150;
  };
  const resetGame = () => {
    setTimeLeft(TEN_MINUTES);
    setIsTimerActive(false);
    setBugs([]);
    setBugSpawnTime(null);
    setActiveThreat(null);
    setScore(0);
    setPlantDamaged(false);
  };

  const triggerSpray = () => {
    if (bugs.length === 0) {
      handleToolUse("No bugs right now");
      return;
    }
    // if (userInventory.pesticideQty > 0) {
    //   handleUpdateInventory("Pesticide");
    // } else {
    //   handleToolUse("Insufficient pesticide item, Please purchase");
    //   return;
    // }
    setPlantDamaged(false);
    setPlantDamagedTime(null);
    setBugSpawnTime(null);
    setSpraying(true);
    sprayAnim.setValue(0);
    // 🔊 Play spray sound
    if (spraySound) {
      spraySound.replayAsync();
    }

    setScore((s) => Math.min(s + 3, 100000));
    setBugs((prevBugs) => {
      // Increase tapCount for all bugs
      const updatedBugs = prevBugs.map((bug) => {
        return { ...bug, tapCount: bug.tapCount + 1 };
      });

      // Find the first bug that reaches MAX_BUGS and remove it
      const bugToRemoveIndex = updatedBugs.findIndex(
        (bug) => bug.tapCount >= MAX_BUGS
      );

      if (bugToRemoveIndex !== -1) {
        // If we found a bug that reaches MAX_BUGS, remove it from the list
        updatedBugs.splice(bugToRemoveIndex, 1);
      }

      return updatedBugs;
    });

    // Start spray animation
    Animated.timing(sprayAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      setSpraying(false);
    });
    handleToolUse("Pesticide used! Bugs removed. +3");
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
      handleToolUse("Fertilizer used! +3");
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
      handleToolUse("Water used! +3");
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
        //  inputRange: [0, 0.2 * Math.PI, 2 * Math.PI],

        const y = angleWithOffset.interpolate({
          inputRange: [0, 0.5 * Math.PI, 0.5 * Math.PI],
          outputRange: [0, bug.radius, 0],
        });

        return (
          // <Animated.View
          //   key={bug.id}
          //   style={{
          //     position: "absolute",
          //     top: SCREEN_HEIGHT / 2 + 60, // Adjust to center plant
          //     left: SCREEN_WIDTH / 2 - 40,
          //     width: 100,
          //     height: 100,
          //     opacity: bug.opacity,
          //     transform: [
          //       // { translateX: x },
          //       { translateY: y },
          //       { scale: bug.scale },
          //       {
          //         rotate: angleWithOffset.interpolate({
          //           inputRange: [0, 2 * Math.PI],
          //           outputRange: ["0deg", "180deg"],
          //         }),
          //       },
          //     ],
          //   }}
          // >
          //   <Image
          //     source={images.bugs}
          //     style={{ width: 60, height: 60 }} // Increased size
          //     resizeMode="cover"
          //   />
          // </Animated.View>
          <Animated.View
            key={bug.id}
            className={`mt-80 mb-20`}
            style={[
              {
                position: "absolute",
                // left: SCREEN_WIDTH / 2,
                // top: SCREEN_HEIGHT / 2 + 160,
                marginTop: 480,
                marginLeft: 150,
              },
              bug.position.getLayout(),
              {
                transform: [{ scale: bug.scale }],
                // opacity: bug.opacity,
              },
            ]}
          >
            <ExpoImage
              source={images.bugs}
              style={{ width: 30, height: 30 }}
              // resizeMode="cover"
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
        <Text className="text-white text-3xl font-bold">{score}</Text>

        <Text className="text-2xl text-gray-500">
          Current Season: {currentSeason.toUpperCase()}
        </Text>
        <Text className="text-3xl text-yellow-500">
          {currentSeason === "dry" && "Use more water and fertilizer"}
        </Text>
      </View>

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
            // transform: [{ scale: plantScale }],
          }}
        />
      </View>

      {/* Tool buttons */}
      {/* <View
        // className={`absolute left-4`}
        style={{
          position: "absolute",
          height: SCREEN_HEIGHT * 0.5,
          top: -5,
        }}
      > */}
      <View className="absolute left-4 top-[18%] gap-y-1 py-80">
        <ToolIcon
          icon={images.fertilizer}
          onPress={triggerFertilizer}
          itemQty={userInventory.fertilizerQty}
        />
        <ToolIcon
          itemQty={userInventory.pesticideQty}
          icon={images.pesticied}
          onPress={() => {
            if (bugs.length > 0) {
              triggerSpray();
            } else {
              handleToolUse("No bugs right now");
            }
          }}
        />

        <ToolIcon
          itemQty={userInventory.waterQty}
          icon={images.kettle}
          onPress={triggerWater}
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
                setTimeout(() => {
                  spawnBugs();
                }, 5000);
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

      {/* Harvest */}
      {harvest && (
        <TouchableOpacity
          className="absolute bottom-20 self-center bg-yellow-400 px-4 py-2 rounded-full"
          onPress={() => {
            handleToolUse("Crop harvested!");
            resetGame();
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

// ImageBackground
//           className="absolute w-full h-full"
//           source={images.bgRainfall}
//           resizeMode="cover"
//         >
//           <HybridRainScene />
//         </ImageBackground>
