import BackgroundImage from "@/components/BackgroundImage";
import { images } from "@/constants";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";

const seeds = [
  {
    name: "Eggplant",
    icon: images.maize,
    levels: 2,
    progress: 0.2,
  },
  {
    name: "Maize",
    icon: images.maize,
    levels: 4,
    progress: 0.65,
  },
  {
    name: "Cocoa",
    icon: images.maize,
    levels: 3,
    progress: 0.5,
  },
  {
    name: "Tomato",
    icon: images.maize,
    levels: 1,
    progress: 0.1,
  },
  {
    name: "Olive",
    icon: images.maize,
    levels: 4,
    progress: 0.9,
  },
];

const SelectSeed = () => {
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
      <Text className="text-white text-2xl font-bold mb-2">Select Seed</Text>

      {/* Scrollable Icons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-2 px-2 max-h-[30vh]"
      >
        {seeds.map((seed, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleSeedChange(index)}
            className={`w-16 h-12  mx-2 items-center justify-center border-2 ${
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
        className="w-[80%] bg-white/20 rounded-2xl border border-yellow-400 px-6 mb-4 items-center relative"
        style={{ opacity: fadeAnim }}
      >
        {/* Navigation Arrows */}
        <TouchableOpacity
          onPress={prevSeed}
          className="absolute left-[-20] top-1/2 -translate-y-1/2 z-10"
        >
          <View className="w-8 h-8 rounded-full bg-yellow-400 justify-center items-center">
            <Text className="text-white text-xl">‹</Text>
          </View>
        </TouchableOpacity>

        {/* Seed Name + Icon */}
        <View className="items-center mb-10 mt-10 bg-white rounded-3xl p-6">
          <Text className="text-yellow-300 text-xl font-bold mb-10">
            {selectedSeed.name}
          </Text>
          <Image
            source={selectedSeed.icon}
            className="w-20 h-20 mb-6"
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
          className="absolute right-[-20] top-1/2 -translate-y-1/2 z-10"
        >
          <View className="w-8 h-8 rounded-full bg-yellow-400 justify-center items-center">
            <Text className="text-white text-xl">›</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Select Button */}
      <TouchableOpacity className="mt-1 px-10 py-3 bg-yellow-400 rounded-xl shadow">
        <Text className="text-white font-bold text-base">Select</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SelectSeed;
