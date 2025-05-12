import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, Animated } from "react-native";
import { icons, images } from "@/constants";
import BackgroundImage from "@/components/BackgroundImage";
import { router } from "expo-router";
import HeaderNavigation from "@/components/HeaderNavigation";
import { CustomButton } from "@/components";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLoginContext } from "@/context/LoginProvider";

const chartData = {
  Daily: [250, 180, 300, 120, 260, 190, 230, 210, 150, 200, 170, 240],
  Weekly: [400, 350, 280, 460, 300, 370, 420],
  Monthly: [600, 720, 530, 650, 700, 630, 710, 580],
};

const tabs = ["Daily", "Weekly", "Monthly"] as const;
type TabType = (typeof tabs)[number];

const Profile = () => {
  const { user } = useLoginContext();
  if (!user) {
    router.replace("/");
  }
  const [activeTab, setActiveTab] = useState<TabType>("Daily");
  const [animatedValues, setAnimatedValues] = useState<Animated.Value[]>([]);
  const [chartData, setChartData] = useState<{ [key in TabType]?: number[] }>(
    {}
  );
  const [chartLabels, setChartLabels] = useState<{
    [key in TabType]?: string[];
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token !== null) {
        try {
          const res = await fetch(
            `https://farm-wizard-api.onrender.com/api/v1/earning/chart/${activeTab}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `JWT ${token}`,
              },
              //body: JSON.stringify({ amount: 25.5 }),
            }
          );
          const json = await res.json();
          //console.log("res ", json);

          setChartData((prev) => ({ ...prev, [activeTab]: json.values }));
          setChartLabels((prev) => ({ ...prev, [activeTab]: json.labels }));

          const newAnimatedValues = json.values.map(
            () => new Animated.Value(0)
          );
          setAnimatedValues(newAnimatedValues);

          Animated.stagger(
            50,
            newAnimatedValues.map((val: any, i: any) =>
              Animated.timing(val, {
                toValue: json.values[i],
                duration: 500,
                useNativeDriver: false,
              })
            )
          ).start();
        } catch (err) {
          console.error("Chart fetch error:", err);
        }
      }
    };

    fetchData();
  }, [activeTab]);

  return (
    <View className="flex-1 bg-green-200 items-center">
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

      <Text className="text-white text-2xl font-primary font-bold mt-4">
        PROFILE
      </Text>

      {/* Avatar + Info */}
      <View className="items-center">
        <Image
          source={icons.profile}
          resizeMode="contain"
          // className="w-[50%] aspect-square max-w-[200px] "
          className="w-[80px] h-[80px] md:w-48 md:h-48"
        />
        <Text className="text-white font-secondary text-lg">
          {user.fullName}
        </Text>
        <Text className="text-yellow-300 font-secondary text-base">
          {user?.score || 0}
        </Text>
      </View>

      {/* Tabs */}
      <View className="w-[90%] flex-row justify-around mt-2 ">
        {tabs.map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <Text
              className={`font-secondary ${
                tab === activeTab
                  ? "text-white font-bold underline"
                  : "text-white/60"
              }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart with Axes */}
      {/* Chart Container */}
      <View className="mt-4 rounded-2xl w-[90%] px-4 bg-[#D4B75873]">
        <View className="flex-row items-end">
          {/* Y-Axis */}
          <View className="justify-between h-30 p-2">
            {[4, 3, 2, 1, 0].map((n) => {
              const max = Math.max(...(chartData[activeTab] || [1]));
              const label = Math.round((n * max) / 4);
              return (
                <Text
                  key={n}
                  className="text-white text-xs"
                  style={{ height: 32 }}
                >
                  {label}
                </Text>
              );
            })}
          </View>

          {/* Bars */}
          <View className="flex-1 flex-row items-end justify-between space-x-1 h-40">
            {(chartData[activeTab] || []).map((value, i) => (
              <Animated.View
                key={i}
                className="bg-white rounded-full w-2"
                style={{
                  height:
                    animatedValues[i]?.interpolate({
                      inputRange: [
                        0,
                        Math.max(...(chartData[activeTab] || [1])),
                      ],
                      outputRange: [0, 160],
                    }) || 0,
                }}
              />
            ))}
          </View>
        </View>

        {/* X-Axis */}
        <View className="flex-row justify-between px-2 mt-2">
          {(chartLabels[activeTab] || []).map((label, i) => (
            <Text key={i} className="text-white text-[10px] text-center w-2">
              {label}
            </Text>
          ))}
        </View>
      </View>

      {/* Withdraw */}

      <CustomButton
        title="Claim"
        handlePress={() => router.push("/(tabs)/claimScreen")}
        containerStyles="w-[200px]"
        textStyles={"font-pbold text-white"}
        isLoading={false}
      />
    </View>
  );
};

export default Profile;
