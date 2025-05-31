import React, { useCallback } from "react";
import BackgroundImage from "@/components/BackgroundImage";
import { images } from "@/constants";
import { View, Text, Image, Dimensions } from "react-native";
import { CustomButton } from "../../components";
import { useFocusEffect, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Audio } from "expo-av";

const { width, height } = Dimensions.get("window");

const GameOver = () => {
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const stopAndPlayNewSound = async () => {
        try {
          // 1. Stop all previously playing sounds
          await Audio.setIsEnabledAsync(false);
          await Audio.setIsEnabledAsync(true);

          // 2. Load and play a new sound
          const { sound } = await Audio.Sound.createAsync(
            require("@/assets/sounds/game-over.wav"),
            {
              volume: 0.4,
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

      stopAndPlayNewSound();
    }, [])
  );

  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-green-200 items-center justify-start pt-20">
      {/* Background */}
      <BackgroundImage
        blurRadius={2}
        source={images.bgRainfall}
        style={{
          width: "100%",
          height: "100vh",
          position: "absolute",
        }}
      />

      {/* Title */}
      <Text className="text-white text-3xl font-primary my-4">Game Over</Text>

      {/* <View
        style={{
          width: "85%",
          backgroundColor: "#78693982",
          borderRadius: 20,
          borderColor: "#FCD34D",
          borderWidth: 1,
          padding: 20,
          alignItems: "center",
          marginBottom: 10,
          position: "relative",
        }}
      > */}
      <View
        className="items-center my-8 rounded-3xl p-4"
        // style={{
        //   alignItems: "center",
        //   backgroundColor: "white",
        //   borderRadius: 24,
        //   padding: 16,
        //   marginVertical: 10,
        //   width: "100%",
        // }}
      >
        {/* <Text
            // className="text-[#DFC666] text-xl font-primary mb-10"
            style={{
              color: "#DFC666",
              fontSize: 18,
              fontWeight: "600",
              marginBottom: 10,
            }}
          >
            Ooopps!!!
          </Text> */}
        <Image
          source={images.gameOver}
          style={{
            width: width * 0.5,
            height: width * 0.5,
          }}
          resizeMode="contain"
        />

        <Text
          className="text-center text-xl px-2 font-secondary"
          style={{
            color: "#fff",
            textAlign: "center",
            paddingHorizontal: 10,
          }}
        >
          {t("messages.game_over")}
        </Text>
      </View>

      {/* </View> */}
      <View className="flex-row justify-between m-3">
        <CustomButton
          title={t("buttons.go_again")}
          handlePress={() => router.push("/(screens)/selectSeed")}
          containerStyles="w-[150px]"
          textStyles={"font-pbold text-white"}
          isLoading={false}
        />
        <CustomButton
          title={t("buttons.exit_to_menu")}
          handlePress={() => router.push("/(tabs)/home")}
          containerStyles="w-[150px]"
          textStyles={"font-pbold text-white"}
          isLoading={false}
        />
      </View>
    </View>
  );
};

export default GameOver;
