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
import { Picker } from "@react-native-picker/picker";
import uuid from "react-native-uuid";
import FlutterwaveModal from "@/components/FlutterwaveModal";
import checkCurrency from "@/utils/checkCurrency";
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
  const [modalVisible, setModalVisible] = useState(false);
  const [showFlutterwave, setShowFlutterwave] = useState(false);
  const [showUpgradeModale, setShowUpgradeModale] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [usdEquivalent, setUsdEquivalent] = useState<string | null>(null);
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const txRef = `tx-${uuid.v4().split("-")[0]}`;
  const upgradeAmount = 4.99;

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

  const openModal = () => {
    setShowUpgradeModale(false);
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
    });
  };

  const handleSuccess = async (data: any) => {
    const { transaction_id } = data;

    try {
      const res = await fetch(
        `${API_BASE}/api/v1/payment/flutterwave/verify-upgrade-payment/${transaction_id}`
      );
      const json = await res.json();

      if (json.success) {
        Alert.alert(
          "Payment Verified",
          `Transaction Ref: ${json.data.tx_ref} and Transaction Id: ${transaction_id} Account upgraded successfully`
        );
        //refresh here
        setUser(json.updatedUser);
        // console.log("updatedUser ", json.updatedUser);
        setTimeout(() => {
          router.replace("/(screens)/transactionSuccess");
        }, 3000);
      } else {
        Alert.alert("Verification Failed", json.message);
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const handleCancel = () => {
    Alert.alert("Cancelled", "Payment process was cancelled.");
  };

  useEffect(() => {
    if (upgradeAmount) {
      (async () => {
        setExchangeLoading(true);
        const result = await checkCurrency(currency, upgradeAmount);
        setUsdEquivalent(result.toFixed(2));
        setExchangeLoading(false);
      })();
    }
  }, [currency, upgradeAmount]);

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

      <Text className="text-white text-2xl font-primary font-bold mt-4">
        {t("profile")}
      </Text>

      {/* Avatar + Info */}
      <View className="items-center">
        <Image
          source={useFramedAvatarArray(user.avatar || 0)}
          resizeMode="contain"
          className="w-[80px] h-[80px] md:w-48 md:h-48"
        />
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
            <TouchableOpacity onPress={() => setShowUpgradeModale(true)}>
              <Text className="text-center text-buttonColor underline">
                {t("messages.upgrade_to_premium")}
              </Text>
            </TouchableOpacity>
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
      <Text className="text-yellow-300 font-secondary text-base my-2">
        Score: {Number(user?.score).toFixed(2) || 0} || USD:{" "}
        {Number(user?.usdBalance).toFixed(5) || 0}
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
          playSound(require("@/assets/sounds/click.mp3"), 0.01);
        }}
        containerStyles="w-[200px]"
        textStyles={"font-pbold text-white"}
        isLoading={false}
      />

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
            className="bg-gray-200 rounded-2xl w-[90%] p-2 items-center shadow-2xl"
          >
            <View className="bg-white rounded-2xl w-[90%] p-6 ">
              <Text className="text-gray-600 text-2xl text-center mb-6">
                {t("comfirmation.confirm_upgrade", {
                  amount: ` ${usdEquivalent} ${currency}`,
                })}
              </Text>

              <Text style={{ fontSize: 18 }} className="my-4">
                {t("inventory.select_currency")}
              </Text>
              <Picker
                selectedValue={currency}
                onValueChange={(itemValue) => setCurrency(itemValue)}
                style={{ marginVertical: 20 }}
              >
                <Picker.Item label="🇳🇬 Naira (NGN)" value="NGN" />
                <Picker.Item label="🇺🇸 Dollar (USD)" value="USD" />
                <Picker.Item label="🇬🇭 Cedi (GHS)" value="GHS" />
                <Picker.Item label="🇰🇪 Shilling (KES)" value="KES" />
                <Picker.Item label="🇬🇧 Pound Sterling (GBP)" value="GBP" />
                <Picker.Item label="🇪🇺 Euro (EUR)" value="EUR" />
                <Picker.Item label="🇿🇦 Rand (ZAR)" value="ZAR" />
                <Picker.Item label="🇹🇿 Shilling (TZS)" value="TZS" />
                <Picker.Item label="🇺🇬 Shilling (UGX)" value="UGX" />
                <Picker.Item label="🇲🇼 Kwacha (MWK)" value="MWK" />
                <Picker.Item label="🇷🇼 Franc (RWF)" value="RWF" />
                <Picker.Item label="🇨🇲 CFA Franc (XAF)" value="XAF" />
                <Picker.Item label="🇨🇮 CFA Franc (XOF)" value="XOF" />
                <Picker.Item label="🇲🇦 Dirham (MAD)" value="MAD" />
                <Picker.Item label="🇿🇲 Kwacha (ZMW)" value="ZMW" />
                <Picker.Item label="🇨🇱 Peso (CLP)" value="CLP" />
                <Picker.Item label="🇨🇴 Peso (COP)" value="COP" />
                <Picker.Item label="🇪🇬 Pound (EGP)" value="EGP" />
                <Picker.Item label="🇬🇳 Franc (GNF)" value="GNF" />
              </Picker>

              <View>
                {!usdEquivalent || exchangeLoading ? (
                  <Text style={{ marginBottom: 10 }}>Loading...</Text>
                ) : (
                  <>
                    <CustomButton
                      title={`Pay ${usdEquivalent} ${currency}`}
                      handlePress={() => setShowFlutterwave(true)}
                      containerStyles="w-full"
                      textStyles={"font-pbold text-white"}
                      isLoading={exchangeLoading}
                    />
                  </>
                )}
              </View>
            </View>
            <View className="w-full items-end mt-4">
              <TouchableOpacity
                className="p-3 bg-gray-300 rounded"
                onPress={closeModal}
              >
                <Text className="text-black font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </BlurView>
      </Modal>

      <FlutterwaveModal
        visible={showFlutterwave}
        onRequestClose={() => setShowFlutterwave(false)}
        email={user.email}
        name={user.fullName}
        amount={usdEquivalent}
        txRef={txRef}
        currency={currency}
        publicKey="FLWPUBK-9bdd51ca22a021ad9d40dd455be36bc8-X"
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />

      <Modal transparent visible={showUpgradeModale} animationType="fade">
        <BlurView
          intensity={50}
          tint="dark"
          className="flex-1 items-center justify-center"
        >
          <View className="bg-black/40 rounded-2xl w-[100%] h-[100%] p-2 items-center shadow-2xl">
            <View className="w-full items-end my-20">
              <TouchableOpacity
                className="bg-[#D5B85A] rounded-full items-center justify-center w-14 h-14"
                onPress={() => setShowUpgradeModale(false)}
              >
                <Image source={icons.close} className="w-8 h-8" />
              </TouchableOpacity>
            </View>
            <Image
              source={images.upgrade}
              style={{
                width: width * 0.5,
                height: width * 0.5,
              }}
              resizeMode="contain"
            />

            <Text className="text-white text-xl text-center mb-6">
              {t("messages.upgrade_message")}
            </Text>

            <View className="flex-row justify-center items-center">
              <TouchableOpacity
                className="bg-buttonColor flex-row rounded-xl items-center justify-center p-4 m-2"
                onPress={() => openModal()}
              >
                <Text className="text-white text-lg">
                  {t("buttons.upgrade")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
};

export default Profile;
