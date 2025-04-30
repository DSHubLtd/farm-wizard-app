import BackgroundImage from "@/components/BackgroundImage";
import { icons, images } from "@/constants";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import { CustomButton } from "../../components";
import { useRouter } from "expo-router";
import { plantGrowth as seeds } from "@/constants/plants";

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

  return (
    <View className="flex-1 bg-green-200 items-center justify-start pt-20">
      {/* Background */}
      <BackgroundImage
        source={images.background}
        style={{ width: "100%", height: "100vh", position: "absolute" }}
      />

      {/* Title */}
      <Text className="text-white text-3xl font-primary my-6">Select Seed</Text>

      {/* Scrollable Icons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-[#78693963] px-2 py-4 max-h-[10vh] mb-4 rounded-2xl"
      >
        {seeds.map((seed, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleSeedChange(index)}
            className={`w-16 h-14  mx-2 items-center justify-center rounded-xl border-2 ${
              selectedIndex === index
                ? "border-yellow-400 bg-white"
                : "border-transparent bg-white/40"
            } `}
          >
            <Image
              source={seed.icon}
              className="w-8 h-8"
              resizeMode="contain"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Seed Info Card with Animation */}
      <Animated.View
        className="w-[80%] bg-[#78693982] rounded-2xl border border-yellow-400 px-6 mb-8 items-center relative"
        style={{ opacity: fadeAnim }}
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
        <View className="items-center my-10 bg-white rounded-3xl p-6">
          <Text className="text-[#DFC666] text-xl font-primary mb-10">
            {selectedSeed.name}
          </Text>
          <Image
            source={selectedSeed.iconLg}
            className="w-40 h-40 mb-6"
            resizeMode="contain"
          />
          <Text className="text-[#7B6C32] text-center px-2 mb-6">
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
        title="Select Seed"
        handlePress={() =>
          router.push({
            pathname: "/(screens)/plantScreen",
            params: { name: selectedSeed.name },
          })
        }
        containerStyles="w-[200px]"
        textStyles={"font-pbold text-white"}
        isLoading={false}
      />
    </View>
  );
};

export default SelectSeed;
