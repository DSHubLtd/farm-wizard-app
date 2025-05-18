import BackgroundImage from "@/components/BackgroundImage";
import { icons, images } from "@/constants";
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { CustomButton } from "../../components";
import { useRouter } from "expo-router";
import { plantGrowth as seeds } from "@/constants/plants";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");

const SelectSeed = () => {
  const router = useRouter();

  const [selectedIndex, setSelectedIndex] = useState(1); // Default: Maize
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const selectedSeed = seeds[selectedIndex];

  const handleSeedChange = (index: number) => {
    // Animate fade-out → change → fade-in
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSelectedIndex(index);
    });
  };

  const nextSeed = () => handleSeedChange((selectedIndex + 1) % seeds.length);
  const prevSeed = () =>
    handleSeedChange((selectedIndex - 1 + seeds.length) % seeds.length);

  const { t } = useTranslation();
  return (
    //  <View
    //   style={{
    //     flex: 1,
    //     backgroundColor: "#A7D7A8",
    //     alignItems: "center",
    //     paddingTop: height * 0.1,
    //   }}
    // >
    <View className="flex-1 bg-green-200 items-center justify-start pt-20">
      {/* Background */}
      <BackgroundImage
        source={images.background}
        style={{ width: "100%", height: "100vh", position: "absolute" }}
      />

      {/* Title */}
      {/* <Text className="text-white text-3xl font-primary my-6">Select Seed</Text> */}
      <Text
        style={{
          color: "white",
          fontSize: 24,
          fontFamily: "System",
          marginBottom: 20,
        }}
      >
        {t("buttons.exit_to_menu")}
      </Text>

      {/* Scrollable Icons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          backgroundColor: "#78693963",
          paddingHorizontal: 8,
          paddingVertical: 10,
          borderRadius: 20,
          maxHeight: height * 0.12,
          marginBottom: 20,
        }}
      >
        {seeds.map((seed, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleSeedChange(index)}
            // className={`w-16 h-14  mx-2 items-center justify-center rounded-xl border-2 ${
            //   selectedIndex === index
            //     ? "border-yellow-400 bg-white"
            //     : "border-transparent bg-white/40"
            // } `}
            style={{
              width: width * 0.15,
              height: height * 0.07,
              marginHorizontal: 6,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 12,
              borderWidth: 2,
              borderColor: selectedIndex === index ? "#FCD34D" : "transparent",
              backgroundColor:
                selectedIndex === index ? "white" : "rgba(255,255,255,0.4)",
            }}
          >
            <Image
              source={seed.icon}
              // className="w-8 h-8"
              resizeMode="contain"
              style={{ width: width * 0.08, height: width * 0.08 }}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Seed Info Card with Animation */}
      <Animated.View
        // className="w-[80%] bg-[#78693982] rounded-2xl border border-yellow-400 px-6 mb-8 items-center relative"
        // style={{ opacity: fadeAnim }}
        style={{
          width: "85%",
          backgroundColor: "#78693982",
          borderRadius: 20,
          borderColor: "#FCD34D",
          borderWidth: 1,
          padding: 20,
          alignItems: "center",
          opacity: fadeAnim,
          marginBottom: 10,
          position: "relative",
        }}
      >
        {/* Navigation Arrows */}
        <TouchableOpacity
          onPress={prevSeed}
          className="absolute left-[-4] top-1/2 -translate-y-1/2 z-10"
        >
          <View className="w-14 h-14 rounded-full bg-buttonColor justify-center items-center">
            <Image
              source={icons.leftChevron}
              className="w-18 h-14"
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>

        {/* Seed Name + Icon */}
        <View
          // className="items-center my-10 bg-white rounded-3xl p-6"
          style={{
            alignItems: "center",
            backgroundColor: "white",
            borderRadius: 24,
            padding: 16,
            marginVertical: 10,
            width: "100%",
          }}
        >
          <Text
            // className="text-[#DFC666] text-xl font-primary mb-10"
            style={{
              color: "#DFC666",
              fontSize: 18,
              fontWeight: "600",
              marginBottom: 10,
            }}
          >
            {selectedSeed.name}
          </Text>
          <Image
            source={selectedSeed.iconLg}
            // className="w-40 h-40 mb-6"
            style={{
              width: width * 0.5,
              height: width * 0.5,
              marginBottom: 10,
            }}
            resizeMode="contain"
          />
          <Text
            //className="text-[#7B6C32] text-center px-2 mb-6"
            style={{
              color: "#7B6C32",
              textAlign: "center",
              paddingHorizontal: 10,
            }}
          >
            Select your seed to plant. Each plant has four unique levels.
          </Text>
        </View>

        {/* Levels (Dots) */}
        {/* <View className="flex-row justify-center mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <View
              key={i}
              className={`w-3 h-3 mx-1 rounded-full ${
                i < selectedSeed.levels ? "bg-yellow-400" : "bg-gray-300"
              }`}
            />
          ))}
        </View> */}

        {/* Planting Progress Bar */}
        {/* <View className="w-full h-3 bg-white/30 rounded-full mb-4 overflow-hidden">
          <View
            className="bg-yellow-400 h-3 rounded-full"
            style={{ width: `${selectedSeed.progress * 100}%` }}
          />
        </View> */}

        {/* Right Nav */}
        <TouchableOpacity
          onPress={nextSeed}
          className="absolute right-[-4] top-1/2 -translate-y-1/2 z-10"
        >
          <View className="w-14 h-14 rounded-full bg-buttonColor justify-center items-center">
            <Image
              source={icons.rightChevron}
              className="w-18 h-14"
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </Animated.View>

      <CustomButton
        title={t("buttons.exit_to_menu")}
        handlePress={() =>
          router.push({
            pathname: "/(screens)/sessionStarted",
            params: { name: selectedSeed.name },
          })
        }
        containerStyles="w-[200px] mb-1"
        textStyles={"font-pbold text-white"}
        isLoading={false}
      />
    </View>
  );
};

export default SelectSeed;
