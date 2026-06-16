import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  Modal,
  Alert,
  ScrollView,
} from "react-native";
import { icons, images } from "@/constants";
import BackgroundImage from "@/components/BackgroundImage";
import { router } from "expo-router";
import HeaderNavigation from "@/components/HeaderNavigation";
import { CustomButton } from "@/components";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLoginContext } from "@/context/LoginProvider";
import { BlurView } from "expo-blur";
import { useFramedAvatarArray } from "@/hooks/useAvatarArray";
import { ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import MessageDialog from "@/components/MessageDialog";
import { Dimensions } from "react-native";
import { playSound } from "@/utils/audio";
import { API_BASE } from "@/config/client";
import analytics from "@react-native-firebase/analytics";

const { width } = Dimensions.get("window");

const tabs = ["Daily", "Weekly", "Monthly"] as const;
type TabType = (typeof tabs)[number];

// Sample datasets
const datasets = {
  Daily: {
    data: [100, 320, 150, 650, 300, 280, 120],
    labels: ["1", "7", "14", "21", "28", "5", "13"],
  },
  Weekly: {
    data: [250, 500, 400, 600],
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
  },
  Monthly: {
    data: [800, 950, 700, 600, 1100],
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
  },
};

const maxValue = 1200; // Global max value for consistent height scaling
const yAxisLabels = Array.from({ length: 7 }, (_, i) => i * 200).reverse();
const xAxisLabels = [1, 7, 14, 21, 28, 5, 13];

const Profile = () => {
  const { user, setUser } = useLoginContext();
  if (!user) {
    router.replace("/");
  }
  const isPremiumUser = user?.isPremium === true;

  // Equipped avatar frame -> ring color (no frame art assets yet).
  const FRAME_COLORS: Record<string, string> = {
    frame_gold: "#FFD700",
    frame_emerald: "#50C878",
    frame_royal: "#7B2FBE",
  };
  const frameColor = user?.equippedFrame
    ? FRAME_COLORS[user.equippedFrame]
    : null;

  const [activeTab, setActiveTab] = useState<TabType>("Daily");
  const { data, labels } = datasets[activeTab];

  const [chartData, setChartData] = useState<{
    data: number[];
    labels: string[];
  }>({
    data: [],
    labels: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const logEvent = async () => {
      await analytics().logEvent("screen_view", {
        screen_name: "Profile",
        screen_class: "Profile",
      });
    };
    logEvent();
    const fetchData = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token !== null) {
        setLoading(true);
        try {
          const res = await fetch(
            `${API_BASE}/api/v1/earning/usd-chart/${activeTab}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `JWT ${token}`,
              },
            }
          );
          const json = await res.json();
          setChartData(json);
        } catch (err) {
          console.error("Chart fetch error:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [activeTab]);

  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-green-200 items-center">
      <BackgroundImage
        source={images.background}
        style={{ width: "100%", height: "100%", position: "absolute" }}
      />

      {/* Header */}
      <HeaderNavigation
        onLeftPress={() => router.push("/(tabs)/home")}
        onRightPress={() => router.push("/(tabs)/(sub-tabs)/settings")}
        leftIcon={icons.back}
        rightIcon={icons.settings}
        showLeftButton={true}
        showRightButton={true}
      />

      <Text className="text-white text-2xl font-primary font-bold mt-4 capitalize">
        {t("profile")}
      </Text>

      {/* Avatar + Info */}
      <View className="items-center">
        <View
          style={{
            borderWidth: frameColor ? 3 : 0,
            borderColor: frameColor || "transparent",
            borderRadius: 999,
            padding: frameColor ? 3 : 0,
          }}
        >
          <Image
            source={useFramedAvatarArray(user.avatar || 0)}
            resizeMode="contain"
            className="w-[80px] h-[80px] md:w-48 md:h-48"
          />
        </View>
        <Text className="text-white font-secondary text-xl text-center">
          {user.fullName}
        </Text>
      </View>

      <View>
        {!isPremiumUser ? (
          <>
            <View className="flex-row justify-center items-center">
              <Image
                source={images.nonPremimuUser}
                resizeMode="contain"
                style={{ height: 40, width: 40 }}
              />
              <Text className="text-white font-secondary text-lg">
                Humble Farmstead
              </Text>
            </View>
            {/* <TouchableOpacity onPress={() => setShowUpgradeModale(true)}>
              <Text className="text-center text-buttonColor underline">
                {t("messages.upgrade_to_premium")}
              </Text>
            </TouchableOpacity> */}
          </>
        ) : (
          <>
            <View className="flex-row justify-center items-center">
              <Image
                source={images.premimUser}
                resizeMode="contain"
                style={{ height: 30, width: 40 }}
              />
              <Text className="text-white font-secondary text-lg">
                Enchanted Farmer
              </Text>
              <Text className="text-center text-buttonColor underline">
                {t("messages.premium_user")}
              </Text>
            </View>
          </>
        )}
      </View>
      <Text className="text-yellow-300 font-secondary font-bold my-2">
        WZP: {Number(user?.score).toFixed(2) || 0}
        {/* || USD:{" "}
        {Number(user?.usdBalance).toFixed(5) || 0} */}
      </Text>

      {/* Tabs */}
      <View className="w-[90%] flex-row justify-around mt-2 ">
        {tabs.map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <Text
              className={`text-white ${
                activeTab === tab ? "font-bold" : "opacity-60"
              }`}
            >
              {activeTab === tab ? "● " : ""}
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart Container */}

      <View className="w-[90%] mt-4 rounded-3xl bg-[#D4B75873] p-4">
        {loading ? (
          <ActivityIndicator size="large" color="#fff" className="mt-8" />
        ) : (
          <>
            <View className="flex-row items-end">
              {/* Y-Axis Labels */}
              <View className="h-[200px] justify-between mr-2">
                {yAxisLabels.map((val, i) => (
                  <Text key={i} className="text-white text-xs">
                    {val}
                  </Text>
                ))}
              </View>

              {/* Chart */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 30 }}
              >
                <View className="flex-row items-end justify-between h-[200px] gap-6">
                  {chartData.data.map((value: any, index: number) => {
                    const heightPercent = (value / maxValue) * 100;

                    return (
                      <View key={index} className="items-center">
                        {/* Bar Container */}
                        <View className="w-4 h-[200px] bg-white/20 rounded-md overflow-hidden justify-end">
                          {/* Filled Bar */}
                          <View
                            className="w-full bg-white"
                            style={{ height: `${heightPercent}%` }}
                          />
                        </View>
                        {/* <Text className="text-white mt-2">
                        {chartData.labels[index]}
                      </Text> */}
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
            <View className="flex-row justify-between w-[60%] gap-8 ml-16">
              {xAxisLabels.map((val, i) => (
                <Text key={i} className="text-white text-xs">
                  {val}
                </Text>
              ))}
            </View>
          </>
        )}
      </View>

      {/* Withdraw */}
      <CustomButton
        title={t("buttons.claim")}
        handlePress={() => {
          router.push("/(tabs)/(sub-tabs)/claimScreen");
          playSound(require("@/assets/sounds/click.mp3"), 0.05);
        }}
        containerStyles="w-[200px]"
        textStyles={"font-pbold text-white"}
        isLoading={false}
      />

    </View>
  );
};

export default Profile;
