import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  Modal,
  Alert,
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
import { useAvatarArray } from "@/hooks/useAvatarArray";

const chartData = {
  Daily: [250, 180, 300, 120, 260, 190, 230, 210, 150, 200, 170, 240],
  Weekly: [400, 350, 280, 460, 300, 370, 420],
  Monthly: [600, 720, 530, 650, 700, 630, 710, 580],
};

const tabs = ["Daily", "Weekly", "Monthly"] as const;
type TabType = (typeof tabs)[number];

const Profile = () => {
  const { user, setUser } = useLoginContext();
  if (!user) {
    router.replace("/");
  }
  const isPremiumUser = user?.isPremium === true;

  const [activeTab, setActiveTab] = useState<TabType>("Daily");
  const [animatedValues, setAnimatedValues] = useState<Animated.Value[]>([]);
  const [chartData, setChartData] = useState<{ [key in TabType]?: number[] }>(
    {}
  );
  const [chartLabels, setChartLabels] = useState<{
    [key in TabType]?: string[];
  }>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [showFlutterwave, setShowFlutterwave] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [usdEquivalent, setUsdEquivalent] = useState<string | null>(null);
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const txRef = `tx-${uuid.v4().split("-")[0]}`;
  const upgradeAmount = 4.99;

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

  const openModal = () => {
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
        `https://farm-wizard-api.onrender.com/api/v1/payment/flutterwave/verify-upgrade-payment/${transaction_id}`
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
          source={useAvatarArray(user.avatar || 0)}
          resizeMode="contain"
          // className="w-[50%] aspect-square max-w-[200px] "
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
            <TouchableOpacity onPress={() => openModal()}>
              <Text className="text-center text-buttonColor underline">
                Upgrade To premium
              </Text>
            </TouchableOpacity>
            {/* <CustomButton
              title="Upgrade To premium "
              handlePress={openModal}
              containerStyles="w-[200px]"
              textStyles={"font-pbold text-white"}
              isLoading={false}
            /> */}
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
            </View>
            {/* <CustomButton
            title="Premium Member!"
            handlePress={() =>
              Alert.alert("Congratulations", "Your account is premium member")
            }
            containerStyles="w-[200px]"
            textStyles={"font-pbold text-white"}
            isLoading={false}
          /> */}
          </>
        )}
      </View>
      <Text className="text-yellow-300 font-secondary text-base my-2">
        {user?.score || 0}
      </Text>

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
                Your account is currently not upgraded, Pay sum of {currency}{" "}
                {usdEquivalent} to upgrade
              </Text>

              <Text style={{ fontSize: 18 }} className="my-4">
                Select Currency To Continue
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
        publicKey="FLWPUBK_TEST-125e2223c946bd139ec43a273bf1f0f3-X"
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </View>
  );
};

export default Profile;
