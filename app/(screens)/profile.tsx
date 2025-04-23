import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, Animated } from "react-native";
import { BlurView } from "expo-blur";
import { icons, images } from "@/constants";
import BackgroundImage from "@/components/BackgroundImage";
import { router } from "expo-router";
import HeaderNavigation from "@/components/HeaderNavigation";

const chartData = {
  Daily: [250, 180, 300, 120, 260, 190, 230, 210, 150, 200, 170, 240],
  Weekly: [400, 350, 280, 460, 300, 370, 420],
  Monthly: [600, 720, 530, 650, 700, 630, 710, 580],
};

const tabs = ["Daily", "Weekly", "Monthly"] as const;
type TabType = (typeof tabs)[number];

const Profile = () => {
  const [activeTab, setActiveTab] = useState<TabType>("Daily");
  const [animatedValues, setAnimatedValues] = useState<Animated.Value[]>([]);

  // Animate bar chart on tab switch
  useEffect(() => {
    const newData = chartData[activeTab];
    const newAnimatedValues = newData.map(() => new Animated.Value(0));
    setAnimatedValues(newAnimatedValues);

    Animated.stagger(
      50,
      newAnimatedValues.map((val, i) =>
        Animated.timing(val, {
          toValue: newData[i],
          duration: 500,
          useNativeDriver: false,
        })
      )
    ).start();
  }, [activeTab]);

  return (
    <View className="flex-1 bg-green-200 items-center justify-start">
      <BackgroundImage
        source={images.background}
        style={{ width: "100%", height: "100%", position: "absolute" }}
      />

      {/* Header */}
      <HeaderNavigation
        onLeftPress={() => router.push("/(screens)/settings")}
        onRightPress={() => console.log("Settings pressed")}
        leftIcon={icons.back}
        rightIcon={icons.settings}
        showLeftButton={true}
        showRightButton={true}
      />

      <Text className="text-white text-3xl font-bold">Profile</Text>

      {/* Avatar + Info */}
      <View className="items-center my-6">
        <View className="w-20 h-20 rounded-full border-2 border-white/70 items-center justify-center">
          <Image
            source={icons.profile}
            className="w-10 h-10 tint-white"
            resizeMode="contain"
          />
        </View>
        <Text className="text-white font-semibold mt-2 text-base">
          Player Name
        </Text>
        <Text className="text-yellow-300 text-sm mt-1">$0.0007</Text>
      </View>

      {/* Chart Panel */}
      <BlurView
        intensity={60}
        // tint="light"
        className="mt-6 rounded-2xl w-[90%] px-4 py-5 bg-white/30"
      >
        {/* Tabs */}
        <View className="flex-row justify-around mb-4">
          {tabs.map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
              <Text
                className={`font-semibold ${
                  tab === activeTab ? "text-white underline" : "text-white/60"
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Animated Bars */}
        <View className="flex-row items-end justify-between space-x-1 h-40">
          {chartData[activeTab].map((value, i) => (
            <Animated.View
              key={i}
              className="bg-white rounded-full w-2"
              style={{
                height: animatedValues[i]
                  ? animatedValues[i].interpolate({
                      inputRange: [0, Math.max(...chartData[activeTab])],
                      outputRange: [0, 160],
                    })
                  : 0,
              }}
            />
          ))}
        </View>
      </BlurView>

      {/* Withdraw */}
      <TouchableOpacity
        className="mt-6 bg-yellow-400 px-12 py-3 rounded-lg shadow-lg"
        onPress={() => router.push("/(screens)/claimScreen")}
      >
        <Text className="text-white font-bold text-base">WITHDRAW</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Profile;
