import React, { useCallback, useEffect, useState } from "react";
import BackgroundImage from "@/components/BackgroundImage";
import { images } from "@/constants";
import { View, Text, Image, Dimensions, Alert } from "react-native";
import { CustomButton } from "../../components";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { usePlantGrowth } from "@/constants/plants";
import { updatePlantLevels } from "@/services/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLoginContext } from "@/context/LoginProvider";
import { useTranslation } from "react-i18next";
import { Audio } from "expo-av";
import { API_BASE } from "@/config/client";

const { width, height } = Dimensions.get("window");

const Harvest = () => {
  const { user, setUser } = useLoginContext();
  if (!user) {
    router.replace("/");
  }
  const [isSubmitting, setSubmitting] = useState(false);
  const { name, userLevel, score, plantHealth } = useLocalSearchParams();
  // const plant = plantGrowth.filter((plant) => plant.name === name)[0];
  const plants = usePlantGrowth();
  const plant = plants.find((plant) => plant.name === name);
  const params = useLocalSearchParams();
  const plantName = Array.isArray(params.name) ? params.name[0] : params.name;
  if (!plant) {
    router.replace("/(screens)/selectSeed");
    return null;
  }

  let level = parseInt(userLevel as string) + 1; // next level
  let bonus = (parseInt(plantHealth as string) / 100).toFixed(2);
  const totalSocre = Number(score) + bonus + 500 * Number(userLevel);

  const updateLevel = async () => {
    if (!plant || !level || !score) {
      Alert.alert("Error", "Some error occurs");
      return;
    }

    setSubmitting(true);
    const token = await AsyncStorage.getItem("token");
    if (token !== null) {
      try {
        const result = await updatePlantLevels(
          token,
          plant.name,
          level,
          Number(totalSocre)
        );

        if (result.data.success === false) {
          Alert.alert("Error", result.data.message);
          return;
        }
        // Alert.alert(
        //   "Success",
        //   "Session completed & level upgraded successfully"
        // );
        setUser(result.data.updateUser);
        // setTimeout(() => {
        //   router.replace({
        //     pathname: "/(screens)/profile",
        //     params: { name },
        //   });
        // }, 3000);
      } catch (error: any) {
        Alert.alert("Error", error.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      const stopAndPlayNewSound = async () => {
        try {
          // 1. Stop all previously playing sounds
          await Audio.setIsEnabledAsync(false);
          await Audio.setIsEnabledAsync(true);

          // 2. Load and play a new sound
          const { sound } = await Audio.Sound.createAsync(
            require("@/assets/sounds/level-up.wav"),
            {
              volume: 0.1,
              isLooping: false,
            }
          );

          await sound.playAsync();

          // Optional: unload the sound after it's done playing
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              sound.unloadAsync();
            }
          });
        } catch (e) {
          console.warn("Error managing sound:", e);
        }
      };
      const clearGame = async () => {
        const raw = await AsyncStorage.getItem("gameStates");
        const all = raw ? JSON.parse(raw) : {};

        delete all[plantName];
        await AsyncStorage.setItem("gameStates", JSON.stringify(all));

        const token = await AsyncStorage.getItem("token");
        if (!token) return;
        await fetch(`${API_BASE}/api/v1/game-state/clear/${plantName}`, {
          method: "DELETE",
          headers: { Authorization: `JWT ${token}` },
        });

        // console.log(`Cleared local save for ${plantName}`);
      };
      updateLevel();
      stopAndPlayNewSound();
      clearGame();
    }, [])
  );

  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-green-200 items-center justify-start pt-20">
      {/* Background */}
      <BackgroundImage
        source={images.bgRainfall}
        style={{ width: "100%", height: "100vh", position: "absolute" }}
      />

      {/* Title */}

      <View className="items-center justify-center my-14">
        <Text className="text-white text-3xl font-primary">
          {" "}
          {t("menu.session")}
        </Text>
        <Text className="text-white text-3xl font-primary">
          {t("menu.completed")}
        </Text>

        <Image
          source={images.sessionComplete}
          style={{
            width: width * 0.5,
            height: width * 0.5,
            marginBottom: 10,
          }}
          resizeMode="contain"
        />

        <Text className="text-center text-xl p-4 my-2 text-white">
          {t("game.total_points")}
        </Text>

        <Text className="text-center text-5xl font-bold font-secondary p-4 text-[#FEDA42]">
          {Number(totalSocre).toFixed(2)}
          {/* {score} */}
        </Text>
        <Text className="text-center text-xl p-4 my-2 text-white">
          {t("messages.harvest")}
        </Text>

        <View className="flex-row justify-between m-3">
          <CustomButton
            title={t("buttons.keep_going")}
            handlePress={() => router.replace("/(screens)/selectSeed")}
            containerStyles="w-[150px]"
            textStyles={"font-pbold text-white"}
            isLoading={isSubmitting}
          />
          <CustomButton
            title={t("buttons.exit_to_menu")}
            handlePress={() => router.replace("/(tabs)/home")}
            containerStyles="w-[150px]"
            textStyles={"font-pbold text-white"}
            isLoading={isSubmitting}
          />
        </View>

        {/* <CustomButton
          title="Harvest"
          handlePress={updateLevel}
          containerStyles="w-[200px] mb-1"
          textStyles={"font-pbold text-white"}
          isLoading={isSubmitting}
        /> */}
      </View>
    </View>
  );
};

export default Harvest;
