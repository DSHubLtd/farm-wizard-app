import React from "react";
import { View, Pressable, Image } from "react-native";
import { icons, images } from "@/constants";
import Svg, { Path } from "react-native-svg";
import { router } from "expo-router";

export function WavyBackground() {
  return (
    <View className="absolute bottom-0 w-full h-24">
      <Svg height="100%" width="100%" viewBox="0 0 1440 320">
        <Path
          fill="#2C6C3B"
          d="M0,96 C240,160 480,0 720,96 C960,192 1200,96 1440,128 L1440,320 L0,320 Z"
        />
      </Svg>
    </View>
  );
}
export default function CustomBottomTab() {
  return (
    <View className="absolute bottom-0 w-full">
      {/* <WavyBackground /> */}
      <Image source={images.bgTabs} className="absolute bottom-0 w-full h-16" />
      <View className="absolute bottom-2 w-full h-24 flex-row justify-between items-end px-6 pt-6">
        {/* Left Tab */}
        <Pressable
          className="w-16 h-16 rounded-full bg-[#d1a635] items-center justify-center border-2 border-white"
          onPress={() => router.push("/(tabs)/profile")}
        >
          <Image source={icons.claim} className="w-6 h-6 tint-white" />
        </Pressable>

        {/* Center Tab */}
        <Pressable
          className="w-20 h-20 rounded-full bg-[#d1a635] items-center justify-center border-4 border-white mb-2 shadow-lg shadow-black"
          onPress={() => router.push("/(tabs)/home")}
        >
          <Image source={icons.home} className="w-12 h-8 tint-white" />
        </Pressable>

        {/* Right Tab */}
        <Pressable
          className="w-16 h-16 rounded-full bg-[#d1a635] items-center justify-center border-2 border-white"
          onPress={() => router.push("/(tabs)/leaderboard")}
        >
          <Image source={icons.stats} className="w-6 h-6 tint-white" />
        </Pressable>
      </View>
    </View>
  );
}
