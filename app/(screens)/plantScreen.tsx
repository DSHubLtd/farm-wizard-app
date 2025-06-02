// higher level, the higher the score &  Seed purchase - later

import React, { useCallback, useEffect, useRef, useState } from "react";
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
  BackHandler,
  AppState,
} from "react-native";
import { icons, images, levelmages } from "@/constants";
import { usePlantGrowth, usePlantGrowthMessages } from "@/constants/plants";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  usePathname,
} from "expo-router";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserPlantLevel } from "@/services/user";
import { Image as ExpoImage } from "expo-image";
import {
  addToInventory,
  getUserPIventory,
  updateInventory,
} from "@/services/userInventory";
import InterstitialAdComponent from "@/utils/InterstitialAdComponent";
import { useLoginContext } from "@/context/LoginProvider";
import { useFramedAvatarArray } from "../../hooks/useAvatarArray";
import ConfirmModal, { CustomConfirmDialog } from "@/components/ConfirmDialog";
import MessageDialog from "@/components/MessageDialog";
import { useThrottle } from "@/hooks/useThrottle";
import { useTranslation } from "react-i18next";
import { getThreatPanelty } from "@/utils/getThreatPanelty";
import { playSound } from "@/utils/audio";
import { API_BASE } from "@/config/client";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const TEN_MINUTES = 10 * 60;
const PHASE_DURATION = 150; // 2.5 minutes
//const SEASON_DURATION = 200; // seconds per season
const SEASON_DURATION = TEN_MINUTES / 3;

const SEASONS = ["normal", "dry", "raining"] as const;
type SeasonType = (typeof SEASONS)[number];
type InventoryItemType = "Fertilizer" | "Pesticide" | "Water";
type InventoryKey = "fertilizerQty" | "pesticideQty" | "waterQty";

const PlantScreen = () => {
  const { name } = useLocalSearchParams();
  const { user } = useLoginContext();
  if (!user) {
    router.replace("/");
  }
  const isPremiumUser = user?.isPremium === true;
  const { t } = useTranslation();

  const [userInventory, setUserInventory] = useState({
    fertilizerQty: 0,
    pesticideQty: 0,
    waterQty: 0,
  });
  const [userLevel, setUserLevel] = useState(1);
  const MAX_BUGS = userLevel; //2;
  const plants = usePlantGrowth();
  const plant = plants.find((plant) => plant.name === name);

  if (!plant) {
    router.replace("/(screens)/selectSeed");
    return null;
  }

  const plantImages = plant?.plantImages; // Healthy (Normal session)
  const plantRainImages = plant?.plantRainImages; // Rain (raining session)
  const plantSickImages = plant?.plantSickImages;

  const plantScale = useRef(new Animated.Value(1)).current;
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState("");

  const [timeLeft, setTimeLeft] = useState(TEN_MINUTES); // in seconds
  const [isTimerActive, setIsTimerActive] = useState(true);
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
  const [drySound, setDrySound] = useState<Audio.Sound | null>(null);
  const [rainSound, setRainSound] = useState<Audio.Sound | null>(null);
  const [growthSound, setGrowthSound] = useState<Audio.Sound | null>(null);
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
  const [soilVisible, setSoilVisible] = useState(true);
  const [confirmModal, setConfirmModal] = useState(false);

  const [isDead, setIsDead] = useState(false);

  const [currentSeason, setCurrentSeason] = useState<SeasonType>("normal");

  const [showAd, setShowAd] = useState(true);
  const [showGiftMessage, setShowGiftMessage] = useState("");
  const [isThrottled, setIsThrottled] = useState(false);
  const [isThrottledW, setIsThrottledW] = useState(false);
  const [isThrottledF, setIsThrottledF] = useState(false);
  const [growthModal, setGrowthModal] = useState(false);
  const [sickModal, setSickModal] = useState(false);
  const [sickModalShown, setSickModalShown] = useState(false);
  const [lowItemModal, setLowItemModal] = useState(false);
  const [lowItemText, setLowItemText] = useState("");

  const fetchUserPlantLevelData = async (): Promise<void> => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (token !== null) {
        const res = await getUserPlantLevel(token, plant.name);
        // console.log("res ", res);

        if (res.data.plantLevel !== null) {
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
      console.log("error user plant level error", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchUserInventoryData = async () => {
    //setInvLoading(true);
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

  const handleUpdateInventory = async (item: InventoryItemType, qty = 1) => {
    //  setSubmitting(true);
    const token = await AsyncStorage.getItem("token");
    if (token !== null) {
      try {
        await updateInventory(token, item, qty);
        const key = `${item.toLowerCase()}Qty` as InventoryKey;
        // Optimistically update local state
        setUserInventory((prev) => ({
          ...prev,
          [key]: Math.max((prev[key] || 0) - qty, 0),
        }));
        fetchUserInventoryData();
      } catch (error: any) {
        //  Alert.alert("Error", error.message);
      } finally {
        //  setSubmitting(false);
      }
    }
  };
  const handleGiftInventoryItem = async (item: string, qty = 10) => {
    const token = await AsyncStorage.getItem("token");
    if (token !== null) {
      try {
        await addToInventory(token, item, qty);
        const key = `${item.toLowerCase()}Qty` as InventoryKey;
        setUserInventory((prev) => ({
          ...prev,
          [key]: (prev[key] || 0) + qty,
          //[key]: Math.max((prev[key] || 0) + qty, 0),
        }));
        fetchUserInventoryData();
      } catch (error: any) {
        console.log("Error", error.message);
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
  // growth modal message
  const growthCycles = usePlantGrowthMessages();
  const growthCycle = growthCycles.find(
    (cycle) => cycle.stage === getPlantStage()
  );
  if (!growthCycle) {
    router.replace("/(screens)/selectSeed");
    return null;
  }

  const getCurrentSeason = (): SeasonType => {
    const elapsed = TEN_MINUTES - timeLeft;
    const seasonIndex = Math.floor(elapsed / SEASON_DURATION) % SEASONS.length;
    return (SEASONS[seasonIndex] as SeasonType) || "normal";
  };

  const getThreatChance = (season: SeasonType) => {
    if (season === "dry") return 0.2;
    if (season === "raining") return 0.25;
    return 0.1;
  };

  const saveGameState = async () => {
    const token = await AsyncStorage.getItem("token");

    if (!token || !plant?.name) {
      console.warn("Missing token or plant name. Aborting save.");
      return;
    }

    const plantName = plant.name;

    const gameState = {
      timeLeft,
      plantHealth,
      waterLevel,
      nutrientLevel,
      activeThreat,
      score,
      userLevel,
      pausedAt: new Date().toISOString(),
      plantName,
    };

    try {
      // 🔄 Load existing saved states
      const allStatesRaw = await AsyncStorage.getItem("gameStates");
      const allStates = allStatesRaw ? JSON.parse(allStatesRaw) : {};

      // 💾 Save the state under the current plant name
      allStates[plantName] = gameState;

      await AsyncStorage.setItem("gameStates", JSON.stringify(allStates));

      // 🌐 Optional: sync only this plant to backend
      await fetch(`${API_BASE}/game-state/save`, {
        method: "POST",
        headers: {
          Authorization: `JWT ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gameState),
      });

      // console.log(`Saved state for ${plantName}`, gameState);
    } catch (err) {
      console.error("Failed to save game state", err);
    }
  };

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevPathRef = useRef<string>("");
  const pathname = usePathname();
  // Save previous route
  useEffect(() => {
    return () => {
      prevPathRef.current = pathname;
    };
  }, [pathname]);

  // Auto-resume if coming from /inventory
  useEffect(() => {
    const comingFromInventory = prevPathRef.current === "/inventory";

    // if (comingFromInventory && isTimerActive && intervalRef.current === null) {
    if (comingFromInventory && intervalRef.current === null) {
      setIsTimerActive(true);
      //console.log("Auto-resuming timer from /inventory");
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            return 0;
          }
          return prev - 1;
        });

        setCurrentSeason(getCurrentSeason());
        handlePlantLifeCycle();
      }, 1000);
    }

    // Pause when leaving timer page
    if (pathname !== "/plantScreen" && intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [pathname, isTimerActive, waterLevel, nutrientLevel]);

  // Manual start/pause/resume logic
  useEffect(() => {
    if (isTimerActive && intervalRef.current === null) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });

        setCurrentSeason(getCurrentSeason());
        handlePlantLifeCycle();
      }, 1000);
    }

    // Pause the timer
    if (!isTimerActive && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [pathname, isTimerActive, waterLevel, nutrientLevel]);

  const resetBackgroundSound = () => {
    if (drySound) {
      drySound.stopAsync();
      drySound.unloadAsync();
    }
    if (rainSound) {
      rainSound.stopAsync();
      rainSound.unloadAsync();
    }
  };

  const handlePlantLifeCycle = () => {
    const now = Date.now();

    // Decay logic
    const waterDecay =
      currentSeason === "dry" ? 5 : currentSeason === "normal" ? 3 : 0;
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
      setPlantDamaged(true);
    }

    // Threat logic
    if (activeThreat) {
      const timeSinceThreat = now - activeThreat.createdAt;

      if (!activeThreat.resolved) {
        if (activeThreat.type === "disease" && timeSinceThreat > 10000) {
          // angoing health drain
          setPlantHealth((h) => Math.max(0, h - getThreatPanelty(userLevel)));
          //handleToolUse("☠️ Disease is hurting your plant!");
          setPlantDamaged(true);
          if (!sickModalShown) {
            setSickModal(true);
            setSickModalShown(true);
          }
        }

        // if (userLevel > 1) {
        if (activeThreat.type === "storm" && timeSinceThreat > 5000) {
          // One-time hit
          setPlantHealth((h) =>
            Math.max(0, h - getThreatPanelty(userLevel) + 5)
          );
          // setActiveThreat({ ...activeThreat, resolved: true }); // Mark as done even if not "handled"
          setPlantDamaged(true);
          if (!sickModalShown) {
            setSickModal(true);
            setSickModalShown(true);
          }
        }
        // }

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
      resetBackgroundSound();
      // setTimeout(() => {
      router.replace({ pathname: "/(screens)/gameOver", params: { name } });
      // }, 50);
    }
    // harvest time
    if (timeLeft <= 2 || getPlantStage() > 3) {
      setIsTimerActive(false);
      resetBackgroundSound();
      // setTimeout(() => {
      router.replace({
        pathname: "/(screens)/harvest",
        params: { name, score, userLevel, plantHealth },
      });
      // }, 50);
    }

    // initial modal popup
    if (timeLeft === 595 && getPlantStage() === 0) {
      setSoilVisible(false);
      setIsTimerActive(false);
      setGrowthModal(true);
      if (growthSound) growthSound.replayAsync();
    }
    const { phaseElapsedTime } = getPhaseInfo();
    // each growth stage
    if (phaseElapsedTime === 0 && getPlantStage() > 0) {
      setIsTimerActive(false);
      setGrowthModal(true);
      if (growthSound) growthSound.replayAsync();
    }

    if (currentSeason === "dry") {
      if (drySound) {
        drySound.playAsync();
      }
    }
    if (currentSeason === "raining") {
      if (rainSound) {
        rainSound.playAsync();
      }
      if (drySound) {
        drySound.stopAsync();
      }
    }
  };

  const restoreGameState = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const plantName = plant?.name;

      if (!token || !plantName) {
        console.warn("Missing token or plant name. Aborting restore.");
        return;
      }

      // ✅ Try to load from local first
      const allStatesRaw = await AsyncStorage.getItem("gameStates");
      const allStates = allStatesRaw ? JSON.parse(allStatesRaw) : {};
      let parsedState = allStates[plantName];

      // 🔄 If local state doesn't exist, try backend
      if (!parsedState) {
        //console.log("Trying to restore from backend...");
        const res = await fetch(`${API_BASE}/game-state/get/${plantName}`, {
          headers: { Authorization: `JWT ${token}` },
        });

        if (res.ok) {
          parsedState = await res.json();

          // 💾 Optionally cache it locally for future offline use
          allStates[plantName] = parsedState;
          await AsyncStorage.setItem("gameStates", JSON.stringify(allStates));
        } else {
          console.warn("No saved game state found on backend.");
          return;
        }
      }

      // ✅ Restore the game state
      setTimeLeft(parsedState.timeLeft);
      setPlantHealth(parsedState.plantHealth);
      setWaterLevel(parsedState.waterLevel);
      setNutrientLevel(parsedState.nutrientLevel);
      setActiveThreat(parsedState.activeThreat);
      setScore(parsedState.score);
      setUserLevel(parsedState.userLevel || 1);
      if (parsedState.timeLeft >= 595) setSoilVisible(false);

      setIsTimerActive(parsedState.timeLeft > 0);

      //console.log(`Restored state for "${plantName}"`, parsedState);
    } catch (err) {
      console.error("Failed to restore game state", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        setConfirmModal(true);
        return true; // Prevent default back action
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      let isMounted = true;

      const loadSounds = async () => {
        try {
          const [pesticide, fertilizer, water, dry, rain, growth] =
            await Promise.all([
              Audio.Sound.createAsync(
                require("@/assets/sounds/pesticide.mp3"),
                {
                  volume: 0.4,
                }
              ),
              Audio.Sound.createAsync(
                require("@/assets/sounds/fertilizer.mp3"),
                {
                  volume: 0.4,
                }
              ),
              Audio.Sound.createAsync(require("@/assets/sounds/water.mp3"), {
                volume: 0.4,
              }),
              Audio.Sound.createAsync(require("@/assets/sounds/dry.mp3"), {
                volume: 0.4,
                isLooping: true,
              }),
              Audio.Sound.createAsync(
                require("@/assets/sounds/rain-storm.mp3"),
                {
                  volume: 0.4,
                  isLooping: true,
                }
              ),
              Audio.Sound.createAsync(
                require("@/assets/sounds/growth-level-reach.mp3"),
                { volume: 0.4 }
              ),
            ]);
          if (!isMounted) return;
          setSpraySound(pesticide.sound);
          setFertilizerSound(fertilizer.sound);
          setWaterSound(water.sound);
          setDrySound(dry.sound);
          setRainSound(rain.sound);
          setGrowthSound(growth.sound);
        } catch (e) {
          console.warn("Failed to load one or more sounds:", e);
        }
      };
      loadSounds();
      restoreGameState();
      // PLANT ANIMATION
      // animatePlantGrowing();
      fetchUserPlantLevelData();
      fetchUserInventoryData();
      return () => {
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
        isMounted = false;

        // Stop and unload all sounds properly
        spraySound?.unloadAsync();
        fertilizerSound?.unloadAsync();
        waterSound?.unloadAsync();

        if (drySound) {
          drySound.stopAsync();
          drySound.unloadAsync();
        }

        if (rainSound) {
          rainSound.stopAsync();
          rainSound.unloadAsync();
        }

        growthSound?.unloadAsync();
      };
    }, [router])
  );
  /* useEffect(() => {
    let isMounted = true;

    const loadSounds = async () => {
      try {
        const [pesticide, fertilizer, water, dry, rain, growth] =
          await Promise.all([
            Audio.Sound.createAsync(require("@/assets/sounds/pesticide.mp3"), {
              volume: 0.4,
            }),
            Audio.Sound.createAsync(require("@/assets/sounds/fertilizer.mp3"), {
              volume: 0.4,
            }),
            Audio.Sound.createAsync(require("@/assets/sounds/water.mp3"), {
              volume: 0.4,
            }),
            Audio.Sound.createAsync(require("@/assets/sounds/dry.mp3"), {
              volume: 0.4,
              isLooping: true,
            }),
            Audio.Sound.createAsync(require("@/assets/sounds/rain-storm.mp3"), {
              volume: 0.4,
              isLooping: true,
            }),
            Audio.Sound.createAsync(
              require("@/assets/sounds/growth-level-reach.mp3"),
              { volume: 0.4 }
            ),
          ]);
        if (!isMounted) return;
        setSpraySound(pesticide.sound);
        setFertilizerSound(fertilizer.sound);
        setWaterSound(water.sound);
        setDrySound(dry.sound);
        setRainSound(rain.sound);
        setGrowthSound(growth.sound);
      } catch (e) {
        console.warn("Failed to load one or more sounds:", e);
      }
    };
    loadSounds();
    restoreGameState();
    // PLANT ANIMATION
    // animatePlantGrowing();
    fetchUserPlantLevelData();
    fetchUserInventoryData();
    return () => {
      isMounted = false;

      // Stop and unload all sounds properly
      spraySound?.unloadAsync();
      fertilizerSound?.unloadAsync();
      waterSound?.unloadAsync();

      if (drySound) {
        drySound.stopAsync();
        drySound.unloadAsync();
      }

      if (rainSound) {
        rainSound.stopAsync();
        rainSound.unloadAsync();
      }

      growthSound?.unloadAsync();
    };
  }, []);*/

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
  const handleLowItem = (message: string) => {
    setLowItemText(message);
    setLowItemModal(true);
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

  const triggerSpray = async () => {
    if (!activeThreat || activeThreat.resolved) return;
    setIsThrottled(true); // Disable further click
    setTimeout(() => {
      setIsThrottled(false);
    }, 2000);

    const currentQty = userInventory.pesticideQty;

    // Gifting logic
    if (currentQty <= 2 && userLevel === 1) {
      await handleGiftInventoryItem("Pesticide", 10);
      setShowGiftMessage("You have received 10 pesticide for free");
      setTimeout(() => setShowGiftMessage(""), 4000);
    }

    if (currentQty > 0) {
      await handleUpdateInventory("Pesticide", 1);
    } else {
      handleLowItem(
        t("game.insufficient_item", { item: `${t("inventory.pesticide")}` })
      );
      return;
    }

    setTimeout(() => {
      setActiveThreat(null);
    }, 1000);

    setSoilVisible(false);
    setPlantDamaged(false);
    setSickModalShown(false);
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
  const triggerFertilizer = async () => {
    if (nutrientLevel > 50) return;
    setIsThrottledF(true); // Disable further click
    setTimeout(() => {
      setIsThrottledF(false);
    }, 2000);
    const currentQty = userInventory.fertilizerQty;

    // Gifting logic
    if (currentQty <= 2 && userLevel === 1) {
      await handleGiftInventoryItem("Fertilizer", 10);
      setShowGiftMessage("You have received 10 Fertilizer for free");
      setTimeout(() => setShowGiftMessage(""), 4000);
    }

    if (currentQty > 0) {
      await handleUpdateInventory("Fertilizer", 1);
    } else {
      handleLowItem(
        t("game.insufficient_item", { item: `${t("inventory.fertilizer")}` })
      );
      return;
    }

    setNutrientLevel(100);
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
  const triggerWater = async () => {
    if (waterLevel > 40) return;
    setIsThrottledW(true); // Disable further click
    setTimeout(() => {
      setIsThrottledW(false);
    }, 2000);
    const currentQty = userInventory.waterQty;

    // Gifting logic
    if (currentQty <= 2 && userLevel === 1) {
      await handleGiftInventoryItem("Water", 10);
      setShowGiftMessage("You have received 10 Water for free");
      setTimeout(() => setShowGiftMessage(""), 4000);
    }

    if (currentQty > 0) {
      await handleUpdateInventory("Water", 1);
    } else {
      handleLowItem(
        t("game.insufficient_item", { item: `${t("inventory.water")}` })
      );
      return;
    }

    setWaterLevel(100);
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
    return levelmages.level;
  };
  // Wrap in throttle (once every 1 second)
  const throttledTriggerSpray = useThrottle(triggerSpray, 1000);
  const throttledTriggerFertilizer = useThrottle(triggerFertilizer, 1000);
  const throttledTriggerWater = useThrottle(triggerWater, 1000);

  if (loading || invloading)
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  return (
    <TouchableWithoutFeedback
      onPress={throttledTriggerSpray}
      disabled={isThrottled}
    >
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
                source={useFramedAvatarArray(user.avatar || 0)}
                className="w-16 h-16 rounded-full"
              />
            </TouchableOpacity>
            <View className="flex my-4">
              <Text className="text-white text-md">
                {t("hi_user", { name: `${user.fullName}` })}
              </Text>
              <Text className="text-white text-md">
                {Number(user.score).toFixed(2)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            className="bg-[#D5B85A] w-14 h-14 items-center justify-center rounded-full"
            onPress={() => setConfirmModal(true)}
          >
            <Image source={icons.close} className="w-8 h-8" />
          </TouchableOpacity>
        </View>

        <View className="absolute top-28 left-0 right-0 items-center">
          <View className="w-full relative items-center mb-1">
            <View
              className="w-full rounded-t-[40px] pb-8 pt-6 flex-row justify-between items-end px-20"
              style={{
                borderBottomLeftRadius: 80,
                borderBottomRightRadius: 80,
                height: 180,
                transform: [{ scaleY: 0.9 }],
              }}
            >
              {/* nutrient */}
              <View className="items-center w-1/4 -mb-8">
                <>
                  <Image
                    source={images.nutrient}
                    className="w-20 h-20 rounded-full"
                  />
                  <Text className="text-black text-lg mt-2 font-primary">
                    {t("game.nutrient")}
                  </Text>
                  <Text className="text-black text-lg font-primary">
                    {nutrientLevel}%
                  </Text>
                </>
              </View>

              {/* Health (center) */}
              <View className="items-center w-1/3 -mt-4">
                <>
                  <Image
                    source={images.heart}
                    className="w-20 h-20 rounded-full"
                  />
                  <Text className="text-black text-lg mt-2 font-primary">
                    {t("game.health")}
                  </Text>
                  <Text className="text-black text-lg font-primary">
                    {plantHealth}%
                  </Text>
                </>
              </View>

              {/* water 3 */}
              <View className="items-center w-1/4 -mb-8">
                <>
                  <Image
                    source={images.water}
                    className="w-20 h-22 rounded-full"
                  />
                  <Text className="text-black text-lg font-primary ">
                    {t("game.water")}
                  </Text>
                  <Text className="text-black text-lg font-primary">
                    {waterLevel}%
                  </Text>
                </>
              </View>
            </View>
          </View>

          {activeThreat && !activeThreat.resolved && (
            <Text style={{ color: "red", marginTop: 10 }}>
              ⚠️{"🐛"}
              {activeThreat.type.toUpperCase() === "DISEASE"
                ? t("game.disease")
                : t("game.storm")}{" "}
              - {t("game.respond_threat")}
              {"  "}
              {activeThreat.type === "disease" ? "10" : "5"}s!
            </Text>
          )}
          {waterLevel < 20 && (
            <Text className="text-red text-md">⚠️ {t("game.low_water")}</Text>
          )}
          {nutrientLevel < 20 && (
            <Text className="text-red text-md">
              ⚠️ {t("game.low_nutrient")}
            </Text>
          )}
          <Text className="text-yellow-600 text-lg">{showGiftMessage}</Text>
          <Text className="text-white text-3xl font-bold">{score}</Text>
        </View>

        {spraying && (
          <Animated.View
            style={{
              position: "absolute",
              top: SCREEN_HEIGHT / 2 - 5,
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
              backgroundColor: "rgba(100, 180, 200, 0.4)",
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
          {soilVisible && (
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
          {isTimerActive && !soilVisible && (
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
            onPress={throttledTriggerFertilizer}
            itemQty={userInventory.fertilizerQty}
            disabled={isThrottledF}
          />
          <ToolIcon
            itemQty={userInventory.pesticideQty}
            icon={images.pesticied}
            onPress={throttledTriggerSpray}
            disabled={isThrottled}
          />

          <ToolIcon
            itemQty={userInventory.waterQty}
            icon={images.kettle}
            onPress={throttledTriggerWater}
            disabled={isThrottledW}
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
        {/* <Text className="text-center text-white text-xl">
          {formatTime(timeLeft)}
        </Text> */}

        {/* Action buttons */}
        <View className="flex-row justify-around items-center ">
          <ActionButton
            icon={getLevelImage()}
            // icon={images/levelDoc}
            label={`LV ${userLevel}`}
            onPress={() =>
              handleToolUse(t("game.level_info", { level: userLevel }))
            }
          />
          {isTimerActive && (
            <ActionButton
              icon={images.pause}
              label=""
              onPress={() => {
                setIsTimerActive(false);
                playSound(require("@/assets/sounds/pause.mp3"), 0.4);
                handleToolUse(
                  t("game.growth_cycle", { type: `${t("game.pause")}` })
                );
              }}
            />
          )}
          {!isTimerActive && (
            <ActionButton
              icon={images.play}
              label=""
              onPress={() => {
                setIsTimerActive(true);
                playSound(require("@/assets/sounds/play.mp3"), 0.4);
                handleToolUse(
                  t("game.growth_cycle", { type: `${t("game.resume")}` })
                );
              }}
            />
          )}

          <ActionButton
            icon={images.inventory}
            label=""
            onPress={() => {
              saveGameState();
              router.push("/(screens)/inventory");
              setIsTimerActive(false);
            }}
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

        <ConfirmModal
          visible={confirmModal}
          message={t("comfirmation.close_game")}
          confirmTitle={t("comfirmation.title")}
          confirmBtnText={t("buttons.ok")}
          cancelBtnText={t("buttons.cancel")}
          onConfirm={() => {
            resetBackgroundSound();
            setConfirmModal(false);
            saveGameState();
            setTimeout(() => {
              router.replace("/(tabs)/home");
            }, 100);
          }}
          onCancel={() => {
            setConfirmModal(false);
          }}
        />
        <MessageDialog
          visible={growthModal}
          onClose={() => setGrowthModal(false)}
          onPress={() => {
            setIsTimerActive(true);
            setGrowthModal(false);
          }}
          messageText={growthCycle.message}
          imageSource={growthCycle.image}
          buttonText={t("buttons.ok")}
        />
        <MessageDialog
          visible={sickModal}
          onClose={() => setSickModal(false)}
          onPress={() => {
            setSickModal(false);
          }}
          messageText={
            "Oh no! A strange blight has spread through your crops. Take action to heal your plants and protect your farm’s magic before it fades further."
          }
          imageSource={images.sickPlant}
          buttonText={t("buttons.ok")}
        />

        <CustomConfirmDialog
          visible={lowItemModal}
          onClose={() => setLowItemModal(false)}
          onConfirmPress={() => {
            setLowItemModal(false);
            setIsTimerActive(false);
            saveGameState();
            router.push("/(screens)/inventory");
          }}
          onCancelPress={() => {
            setIsTimerActive(false);
            setLowItemModal(false);
          }}
          messageText={lowItemText}
          imageSource={images.inventory}
          confirmButtonText={"Open Inventory"}
          concelButtonText={"Pause & Exit"}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const ToolIcon = ({
  itemQty,
  icon,
  onPress,
  disabled,
}: {
  itemQty: number;
  icon: any;
  onPress: () => void;
  disabled: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    className="relative w-26 h-26 rounded-full bg-cream border-4 border-[#e6d6aa] flex items-center justify-center shadow-md"
  >
    <Image source={icon} className="w-20 h-20" resizeMode="contain" />

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
