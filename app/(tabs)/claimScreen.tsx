import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Animated,
  ScrollView,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { icons, images } from "@/constants";
import BackgroundImage from "@/components/BackgroundImage";
import HeaderNavigation from "@/components/HeaderNavigation";
import { router } from "expo-router";
import { CustomButton, FormField } from "@/components";
const { height } = Dimensions.get("window");

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
      icon: icons.telegram,
      bg: "bg-blue-500",
    },
    {
      name: "Binance",
      icon: icons.binance,
      bg: "bg-yellow-500",
    },
    {
      name: "Paypal",
      icon: icons.paypal,
      bg: "bg-blue-900",
    },
  ],
  Airtime: [
    {
      name: "MTN",
      icon: icons.mtn,
      bg: "bg-yellow-600",
    },
    {
      name: "Airtel",
      icon: icons.airtel,
      bg: "bg-red-500",
    },
    {
      name: "9Mobile",
      icon: icons.nineMobile,
      bg: "bg-red-500",
    },
    {
      name: "Glo",
      icon: icons.glo,
      bg: "bg-red-500",
    },
  ],
  "Data bundle": [
    {
      name: "MTN",
      icon: icons.mtn,
      bg: "bg-yellow-600",
    },
    {
      name: "Airtel",
      icon: icons.airtel,
      bg: "bg-red-500",
    },
    {
      name: "9Mobile",
      icon: icons.nineMobile,
      bg: "bg-red-500",
    },
    {
      name: "Glo",
      icon: icons.glo,
      bg: "bg-red-500",
    },
  ],
};

const airtimeAmount = [
  { id: 1, value: 100 },
  { id: 2, value: 200 },
  { id: 3, value: 500 },
  { id: 4, value: 1000 },
];
const dataBundle = [
  { id: 1, value: 1 },
  { id: 2, value: 2 },
  { id: 3, value: 3 },
  { id: 4, value: 4 },
];

const ClaimScreen = () => {
  const [activeTab, setActiveTab] = useState<keyof typeof providers>("Token");
  const [selectedProvider, setSelectedProvider] = useState<Provider>();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [form, setForm] = useState({
    amount: "",
    phoneNo: "",
    data: "",
  });

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

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setForm({ ...form, amount: amount.toString() });
  };
  const handleNetworkSelect = (network: string) => {
    setSelectedNetwork(network);
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
      <Text className="text-white text-2xl font-primary">CLAIM</Text>

      {/* Balance Box */}
      <View className="bg-black/20 opacity-90 flex flex-row justify-center items-center p-2 rounded-lg">
        <View className="px-6 py-2 bg-[#E0C145B8] rounded-xl">
          <Text className="text-white text-sm text-center">USD 0.00</Text>
          <Text className="text-white/80 text-xs text-center">
            1000 = 0.01 USD
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row justify-around space-x-6">
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleTabChange(tab)}
            className="flex-row items-center justify-between m-30 p-8 "
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
      <Text className="text-white text-base font-primary ">
        Choose provider
      </Text>

      {/* Provider Buttons */}
      {activeTab === "Token" && (
        <ScrollView className="w-[85%]" style={{ height: "auto" }}>
          {providers[activeTab].map((provider, index) => (
            <View
              className="bg-black/20 opacity-90 p-2 mt-1 mb-2 rounded-lg"
              key={index}
            >
              <TouchableOpacity
                key={index}
                onPress={() => openModal(provider)}
                className={`flex-row justify-between items-center px-6 py-4 rounded-xl ${provider.bg}`}
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
            </View>
          ))}
        </ScrollView>
      )}

      {(activeTab === "Airtime" || activeTab === "Data bundle") && (
        <ScrollView className="max-h-80 p-2" style={{ height: height * 0.1 }}>
          <View className="flex-row justify-around space-x-6">
            {providers["Airtime"].map((provider, index) => (
              <ProviderCard
                key={provider.name || index}
                provider={provider}
                index={index}
                selectedNetwork={selectedNetwork}
                onNetworkSelect={handleNetworkSelect}
              />
            ))}
          </View>
          <FormField
            type="text"
            placeholder="Enter phone number"
            title=""
            value={form.phoneNo}
            handleChangeText={(e: any) => setForm({ ...form, phoneNo: e })}
            otherStyles=""
          />
          <Text className="text-white text-base font-primary text-center m-2">
            Amount
          </Text>

          <View className="flex-row justify-around space-x-6">
            {activeTab === "Airtime" ? (
              <>
                {airtimeAmount.map((amount, index) => (
                  <AmountCard
                    type="airtime"
                    key={amount.id || index}
                    amount={amount}
                    index={index}
                    selectedAmount={selectedAmount}
                    onAmountSelect={handleAmountSelect}
                  />
                ))}
              </>
            ) : (
              <>
                {dataBundle.map((amount, index) => (
                  <AmountCard
                    type="data"
                    key={amount.id || index}
                    amount={amount}
                    index={index}
                    selectedAmount={selectedAmount}
                    onAmountSelect={handleAmountSelect}
                  />
                ))}
              </>
            )}
          </View>
          <FormField
            type="text"
            placeholder="Enter amount"
            title=""
            value={form.amount}
            handleChangeText={(e: any) => setForm({ ...form, phoneNo: e })}
            otherStyles=""
          />
          <CustomButton
            title="Submit "
            handlePress={() => console.log("submit")}
            containerStyles="w-full mb-2"
            textStyles={"font-pbold text-white"}
            isLoading={false}
          />
          <Text className="text-md font-secondary text-white my-2">
            Airtime / data rewards are available in Nigeria only.
          </Text>
        </ScrollView>
      )}

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

const ProviderCard = ({
  provider,
  index,
  selectedNetwork,
  onNetworkSelect,
}: {
  provider: any;
  index: number;
  selectedNetwork: string;
  onNetworkSelect: any;
}) => {
  return (
    <TouchableOpacity
      key={index}
      onPress={() => onNetworkSelect(provider.name)}
      className={`m-1 py-1 rounded-xl ${
        selectedNetwork === provider.name ? "border border-white" : ""
      }`}
    >
      <Image
        source={provider.icon}
        className="w-20 h-12"
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

const AmountCard = ({
  amount,
  index,
  selectedAmount,
  onAmountSelect,
  type,
}: {
  amount: any;
  index: number;
  selectedAmount: number;
  onAmountSelect: any;
  type: string;
}) => {
  return (
    <TouchableOpacity
      key={index}
      onPress={() => onAmountSelect(amount.value)}
      className={`bg-black/20 m-1 rounded-lg ${
        selectedAmount === amount.value ? "border border-white" : ""
      }`}
    >
      <View className="m-1 p-4 bg-[#E0C145B8] rounded-xl">
        <Text className="text-white text-md font-bold font-secondary text-center">
          {type === "airtime" && "N"} {amount.value} {type === "data" && "GB"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ClaimScreen;
