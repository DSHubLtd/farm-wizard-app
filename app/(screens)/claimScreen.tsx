import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Animated,
  Pressable,
} from "react-native";
import { BlurView } from "expo-blur";
import { icons, images } from "@/constants";
import BackgroundImage from "@/components/BackgroundImage";
import HeaderNavigation from "@/components/HeaderNavigation";
import { router } from "expo-router";

const tabs = ["Token", "Airtime", "Data bundle"] as const;

type Provider = {
  name: string;
  icon: any;
  bg: string;
};

const providers = {
  Token: [
    {
      name: "Telegram",
      icon: icons.settings,
      bg: "bg-blue-500",
    },
    {
      name: "Binance",
      icon: icons.settings,
      bg: "bg-yellow-500",
    },
    {
      name: "Paypal",
      icon: icons.settings,
      bg: "bg-blue-900",
    },
  ],
  Airtime: [
    {
      name: "MTN",
      icon: icons.settings,
      bg: "bg-yellow-600",
    },
    {
      name: "Airtel",
      icon: icons.settings,
      bg: "bg-red-500",
    },
  ],
  "Data bundle": [
    {
      name: "Glo",
      icon: icons.settings,
      bg: "bg-green-700",
    },
    {
      name: "9Mobile",
      icon: icons.settings,
      bg: "bg-green-500",
    },
  ],
};

const ClaimScreen = () => {
  const [activeTab, setActiveTab] = useState<keyof typeof providers>("Token");
  const [selectedProvider, setSelectedProvider] = useState<Provider>();
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const handleTabChange = (tab: "Token" | "Airtime" | "Data bundle") => {
    setActiveTab(tab);
  };

  const openModal = (provider: Provider) => {
    setSelectedProvider(provider);
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedProvider(undefined);
    });
  };

  return (
    <View className="flex-1 bg-green-200 items-center justify-start relative">
      <BackgroundImage
        source={images.background}
        style={{ width: "100%", height: "100%", position: "absolute" }}
      />

      {/* Header */}
      <HeaderNavigation
        onLeftPress={() => router.push("/(screens)/settings")}
        onRightPress={() => null}
        leftIcon={icons.back}
        rightIcon={icons.settings}
        showLeftButton={true}
        showRightButton={false}
      />
      <Text className="text-white text-3xl font-primary mt-4">Claim</Text>

      {/* Balance Box */}
      <View className="mt-2 px-6 py-3 bg-[#E0C145B8] rounded-xl shadow-lg border border-white/30">
        <Text className="text-white text-sm text-center">USD 0.00</Text>
        <Text className="text-white/80 text-xs text-center">
          1000 = 0.01 USD
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row justify-around space-x-6">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => handleTabChange(tab)}
            className="flex-row items-center justify-between m-30 p-9 "
          >
            <Text
              className={`text-sm ${
                activeTab === tab
                  ? "text-white font-bold underline"
                  : "text-white/60"
              }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Choose Provider */}
      <Text className="text-white mb-8 text-base font-primary ">
        Choose provider
      </Text>

      {/* Provider Buttons */}
      <View className="w-[85%] space-y-2">
        {providers[activeTab].map((provider, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => openModal(provider)}
            className={`flex-row justify-between items-center px-6 py-4 mb-6 rounded-xl shadow-md ${provider.bg}`}
          >
            <Text className="text-white font-semibold text-base">
              {provider.name}
            </Text>
            <Image
              source={provider.icon}
              className="w-16 h-16 tint-white"
              resizeMode="contain"
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Popup Modal */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <BlurView
          intensity={50}
          tint="dark"
          className="flex-1 items-center justify-center"
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            }}
            className="bg-white rounded-2xl w-[80%] p-6 items-center shadow-2xl"
          >
            <Image source={selectedProvider?.icon} className="w-12 h-12 mb-4" />
            <Text className="text-xl font-bold mb-2 text-center">
              {selectedProvider?.name}
            </Text>
            <Text className="text-gray-600 text-center mb-6">
              Are you sure you want to claim via {selectedProvider?.name}?
            </Text>

            <View className="flex-row space-x-4">
              <TouchableOpacity
                className="px-4 py-2 bg-yellow-500 rounded-full"
                onPress={closeModal}
              >
                <Text className="text-white font-semibold">Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-2 bg-gray-300 rounded-full"
                onPress={closeModal}
              >
                <Text className="text-black font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </BlurView>
      </Modal>
    </View>
  );
};

export default ClaimScreen;
