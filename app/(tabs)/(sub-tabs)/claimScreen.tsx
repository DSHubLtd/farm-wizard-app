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
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { icons, images } from "@/constants";
import BackgroundImage from "@/components/BackgroundImage";
import HeaderNavigation from "@/components/HeaderNavigation";
import { router } from "expo-router";
import { CustomButton, FormField } from "@/components";
import { submitWithdrwal } from "@/services/withdrawal";
import AsyncStorage from "@react-native-async-storage/async-storage";
const { height } = Dimensions.get("window");
import uuid from "react-native-uuid";
import { useLoginContext } from "@/context/LoginProvider";
import { useTranslation } from "react-i18next";
import { submitConversion } from "@/services/user";
import CountryPhoneInput from "@/components/CountryPhoneInput";

const tabs = ["Token"] as const;

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
      name: "Bybit",
      icon: icons.bybit,
      bg: "bg-gray-500",
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
  const { user, setUser } = useLoginContext();
  if (!user) {
    router.replace("/");
  }
  const isAdmin = user?.userType === "admin";
  const [activeTab, setActiveTab] = useState<keyof typeof providers>("Token");
  const [selectedProvider, setSelectedProvider] = useState<Provider>();
  const [modalVisible, setModalVisible] = useState(false);
  const [conversionModal, setConversionModal] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    amount: user.usdBalance,
    phoneNo: "",
    data: "",
    network: "TON",
  });
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const handleTabChange = (tab: "Token" | "Airtime" | "Data bundle") => {
    setActiveTab(tab);
    setForm({ ...form, phoneNo: "" });
  };

  const openModal = (provider: Provider) => {
    setSelectedProvider(provider);
    setModalVisible(true);
    setForm({ ...form, phoneNo: "" });
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

  const openCoversionModal = () => {
    setConversionModal(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setForm({ ...form, amount: amount.toString() });
  };
  const handleNetworkSelect = (network: string) => {
    setSelectedNetwork(network);
    setForm({ ...form, phoneNo: "" });
  };

  const submitWithdrawal = async () => {
    const usdConversion = (Number(user?.score * 0.0001) / 1000).toFixed(8);

    if (Number(usdConversion) < 0.005) {
      Alert.alert(
        t("messages.warning"),
        `You don't have enough WZP point to perform this operation`
      );
      return;
    }
    // if (Number(user.usdBalance) < 0.005) {
    //   Alert.alert(t("messages.warning"), t("messages.withdrawal_warning"));
    //   return;
    // }

    const type = activeTab;
    const reference = `withdraw-${uuid.v4().split("-")[0]}`;
    const provider = selectedNetwork ? selectedNetwork : selectedProvider?.name;
    if (
      (type === "Token" || type === "Data bundle" || type === "Airtime") &&
      !form.phoneNo
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    /*if (type === "Airtime" && !form.amount) {
      Alert.alert("Error", "Please enter amount");
      return;
    }
    if (type === "Data bundle" && !form.amount) {
      Alert.alert("Error", "Please enter data balance");
      return;
    }*/
    if (!provider) {
      Alert.alert("Error", "Please select provider");
      return;
    }

    setSubmitting(true);
    const token = await AsyncStorage.getItem("token");
    if (token !== null) {
      try {
        const result = await submitWithdrwal(
          // Number(form.amount),
          Number(user?.score),
          form.phoneNo,
          provider,
          type,
          reference,
          form.network,
          token
        );
        if (result.status !== 200 || result.data.success === false) {
          Alert.alert(t("messages.warning"), result.data.message);
          // console.log("withdrawal", result.data.withdrawal);
          setTimeout(() => {
            router.push({
              pathname: "/(tabs)/(sub-tabs)/requestReceived",
              params: {
                createdAt: result.data.withdrawal.createdAt,
                amount: result.data.withdrawal.amount,
                reference: result.data.withdrawal.reference,
              },
            });
          }, 2000);
          return;
        }

        Alert.alert("Success", result.data.message);
        setTimeout(() => {
          router.replace("/(screens)/transactionSuccess");
        }, 2000);
        setUser(result.data.data.userDetails);
      } catch (error: any) {
        Alert.alert("Error occured", error.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleSubmitConvertion = async () => {
    if (user.score <= 0) {
      Alert.alert(t("messages.warning"), t("messages.convert_warning"));
      return;
    }

    setSubmitting(true);
    const token = await AsyncStorage.getItem("token");
    if (token !== null) {
      try {
        const result = await submitConversion(token, Number(user.score));
        // console.log("result ", result.data.userDetails);
        if (result.status !== 200) {
          Alert.alert("Warning!", result.data.message);
          return;
        }

        Alert.alert("Success", result.data.message);
        setTimeout(() => {
          router.replace("/(screens)/transactionSuccess");
        }, 2000);
        setUser(result.data.userDetails);
      } catch (error: any) {
        Alert.alert("Error occured", error.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleWithdrawalHistory = () => {
    if (isAdmin || user.email === "dinisoft.dev@gmail.com") {
      router.push("/(tabs)/(sub-tabs)/withdrawalRequest");
    } else {
      router.push("/(tabs)/(sub-tabs)/userWithdrawals");
    }
  };
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-green-200 items-center justify-start relative">
      <BackgroundImage
        source={images.background}
        style={{ width: "100%", height: "100%", position: "absolute" }}
      />

      {/* Header */}
      <HeaderNavigation
        onLeftPress={() => router.push("/(tabs)/profile")}
        onRightPress={() => handleWithdrawalHistory()}
        leftIcon={icons.back}
        rightIcon={images.requestPending}
        showLeftButton={true}
        showRightButton={true}
      />
      <Text className="text-white text-2xl font-primary">
        {t("menu.claim")}
      </Text>

      {/* Balance Box */}
      <TouchableOpacity
        className="bg-black/20 opacity-90 flex flex-row justify-center items-center p-2 rounded-lg"
        // onPress={openCoversionModal}
      >
        <View className="px-6 py-2 bg-[#E0C145B8] rounded-xl">
          <Text className="text-white text-lg text-center p-4">
            {Number(user?.score).toFixed(2)}
          </Text>
          {/* <Text className="text-white text-sm text-center">
            USD: {Number(user.usdBalance).toFixed(5)}
          </Text>
          <Text className="text-white/80 text-xs text-center">
            1000 WizPoints = 0.0001 USD
          </Text>
          <Text className="text-white/80 text-xs text-center">
            Press To Convert Coins To USD
          </Text>
          <Text className="text-white/80 text-xs text-center">
            ({t("messages.withdrawal_eligiblity")} = 0.005 USD)
          </Text> */}
        </View>
      </TouchableOpacity>

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
        {t("messages.choose_provider")}
      </Text>

      {/* Provider Buttons */}
      {activeTab === "Token" && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"} // or 'position'
          style={{ flex: 1 }}
        >
          <ScrollView className="w-[95%]" style={{ height: "auto" }}>
            <View className="flex-row justify-around gap-x-6 my-2 bg-black/10 opacity-1 p-2 rounded-lg">
              {providers[activeTab].map((provider, index) => (
                <View
                  className={`bg-black/20 opacity-90 p-4 mt-1 mb-2 rounded-lg ${
                    selectedProvider?.name === provider.name
                      ? "border border-white"
                      : ""
                  }`}
                  key={index}
                >
                  <TouchableOpacity
                    key={index}
                    // onPress={() => openModal(provider)}
                    onPress={() => setSelectedProvider(provider)}
                    className={`flex-col justify-between items-center p-4 rounded-xl ${
                      provider.bg
                    }
                ${
                  selectedProvider?.name === provider.name
                    ? "border border-white"
                    : ""
                }`}
                  >
                    {/* <Text className="text-white font-semibold text-base">
                      {provider.name}
                    </Text> */}
                    <Image
                      source={provider.icon}
                      className="w-6 h-6 tint-white"
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <Text className="text-sm text-[#F2DE9F] font-bold mb-2 text-center">
              Enter wallet address address and select network type to receive
              your reward
              {/* {t("comfirmation.token_address", {
                amount: ` ${user.usdBalance} `,
              })}{" "} */}
            </Text>
            <FormField
              type="text"
              placeholder={t("destination_wallet_addres")}
              title={t("destination_wallet_addres")}
              value={form.phoneNo}
              handleChangeText={(e: any) => setForm({ ...form, phoneNo: e })}
              otherStyles="my-2 "
            />

            <FormField
              type="text"
              placeholder={t("netword_details")}
              title={t("netword_details")}
              value={form.network}
              handleChangeText={(e: any) => setForm({ ...form, network: e })}
              otherStyles=""
            />

            <CustomButton
              title={"Ready to claim"}
              // title={t("buttons.submit")}
              handlePress={submitWithdrawal}
              containerStyles="w-full"
              textStyles={"font-pbold text-white"}
              isLoading={isSubmitting}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {(activeTab === "Airtime" || activeTab === "Data bundle") &&
        (user?.country === "ng" ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"} // or 'position'
            style={{ flex: 1 }}
          >
            <ScrollView
              className="min-h-50 p-2"
              style={{ height: height * 0.5 }}
            >
              <View className="flex-row justify-around gap-4 my-6 ">
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
                title="Ebter Phone number"
                value={form.phoneNo}
                handleChangeText={(e: any) => setForm({ ...form, phoneNo: e })}
                otherStyles="my-4"
              />
              {/* <Text className="text-white text-base font-primary text-center m-2">
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
                handleChangeText={(e: any) => setForm({ ...form, amount: e })}
                otherStyles=""
              /> */}
              <CustomButton
                title="Ready to claim "
                handlePress={submitWithdrawal}
                containerStyles="w-full"
                textStyles={"font-pbold text-white"}
                isLoading={isSubmitting}
              />
              {/* <Text className="text-md font-secondary text-white my-2">
                {t("messages.available")}
              </Text> */}
            </ScrollView>
          </KeyboardAvoidingView>
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"} // or 'position'
            style={{ flex: 1 }}
          >
            <ScrollView
              className="min-h-50 p-6 my-6"
              style={{ height: height * 0.5 }}
            >
              {/* <FormField
                type="text"
                placeholder="Enter phone number"
                title=""
                value={form.phoneNo}
                handleChangeText={(e: any) => setForm({ ...form, phoneNo: e })}
                otherStyles=""
              /> */}

              <CountryPhoneInput
                defaultCountryCode={user?.country || "ng"}
                onChangePhone={(number) =>
                  setForm({ ...form, phoneNo: number })
                }
              />

              {/* <FormField
                type="text"
                placeholder="Enter amount"
                title=""
                value={form.amount}
                handleChangeText={(e: any) => setForm({ ...form, amount: e })}
                otherStyles=""
              /> */}
              <CustomButton
                title="Ready to claim "
                handlePress={submitWithdrawal}
                containerStyles="w-full"
                textStyles={"font-pbold text-white"}
                isLoading={isSubmitting}
              />
              {/* <Text className="text-md font-secondary text-white my-2">
                {t("messages.available")}
              </Text> */}
            </ScrollView>
          </KeyboardAvoidingView>
          // <Text className="text-white text-base font-primary my-40 ">
          //   {t("messages.unavailable")}
          // </Text>
        ))}

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
            className="bg-[#80784A] rounded-2xl w-[80%] p-6 items-center shadow-2xl"
          >
            <Image source={selectedProvider?.icon} className="w-12 h-12 mb-4" />
            <Text className="text-xl font-bold mb-2 text-center text-white">
              {selectedProvider?.name}
            </Text>
            <Text className="text-gray-200 text-center mb-6">
              {t("messages.confirm_claim")} {selectedProvider?.name}?
            </Text>
            <Text className="text-xl text-white font-bold mb-2 text-center">
              {t("comfirmation.token_address", {
                // amount: ` ${user.usdBalance} `,
                WZP: ` ${user?.score} `,
              })}{" "}
            </Text>
            <FormField
              type="text"
              placeholder={t("destination_wallet_addres")}
              title={t("destination_wallet_addres")}
              value={form.phoneNo}
              handleChangeText={(e: any) => setForm({ ...form, phoneNo: e })}
              otherStyles="my-2"
            />

            <FormField
              type="text"
              placeholder={t("netword_details")}
              title={t("netword_details")}
              value={form.network}
              handleChangeText={(e: any) => setForm({ ...form, network: e })}
              otherStyles=""
            />

            <View className="flex-row space-x-4">
              <CustomButton
                title={t("buttons.submit")}
                handlePress={submitWithdrawal}
                containerStyles="w-[200px]"
                textStyles={"font-pbold text-white"}
                isLoading={isSubmitting}
              />
            </View>
            <View className="w-full items-end mt-4">
              <TouchableOpacity
                className="p-3 bg-gray-300 rounded"
                onPress={closeModal}
              >
                <Text className="text-black font-semibold">
                  {t("buttons.cancel")}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </BlurView>
      </Modal>

      <Modal transparent visible={conversionModal} animationType="fade">
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
            className="bg-black-200 rounded-2xl w-[80%] p-6 items-center shadow-2xl"
          >
            <Text className="text-xl text-white font-bold mb-2 text-center">
              {t("comfirmation.convert_to_usd")}
            </Text>
            <Text className="text-xl text-white font-bold mb-2 text-center">
              {user.score.toFixed(2)}
            </Text>

            {/* <FormField
              type="text"
              placeholder="Enter Toekn"
              title="Wiz Points"
              value={token}
              handleChangeText={(e: any) => setToken(e)}
              otherStyles=""
            /> */}

            <View className="flex-row space-x-4">
              <CustomButton
                title={t("buttons.click_to_confirm")}
                handlePress={handleSubmitConvertion}
                containerStyles="w-[200px]"
                textStyles={"font-pbold text-white"}
                isLoading={isSubmitting}
              />
            </View>
            <View className="w-full items-end mt-4">
              <TouchableOpacity
                className="p-3 bg-gray-300 rounded"
                onPress={() => setConversionModal(false)}
              >
                <Text className="text-black font-semibold">
                  {t("buttons.cancel")}
                </Text>
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
