import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CustomButton } from "@/components";
import BackgroundImage from "@/components/BackgroundImage";
import FlutterwaveModal from "@/components/FlutterwaveModal";
import { icons, images } from "@/constants";
import { getUserPlantLevels } from "@/services/user";
import { BlurView } from "expo-blur";
import { HomeIcon } from "lucide-react-native";
import { Picker } from "@react-native-picker/picker";
import { plantGrowth as seedInventory } from "@/constants/plants";
import { router } from "expo-router";
import uuid from "react-native-uuid";
import { useLoginContext } from "@/context/LoginProvider";
import { getUserPIventory } from "@/services/userInventory";
import checkCurrency from "@/utils/checkCurrency";

type Inventory = {
  name: string;
  icon: any;
  iconLg: any;
  bg: string;
};
const inventory = {
  items: [
    {
      name: "Fertilizer",
      icon: images.fertilizer,
      level: 3,
      progress: 0.65,
      count: 1,
    },
    {
      name: "Pesticide",
      icon: images.pesticied,
      level: 2,
      progress: 0.4,
      count: 1,
    },
    {
      name: "Water",
      icon: images.kettle,
      level: 1,
      progress: 0.2,
      count: 1,
    },
  ],
};

const Inventory = () => {
  const { user } = useLoginContext();
  if (!user) {
    router.replace("/");
  }
  const [userInventory, setUserInventory] = useState({
    fertilizerQty: 0,
    pesticideQty: 0,
    waterQty: 0,
  });
  const [activeTab, setActiveTab] = useState<"items" | "seeds">("items");
  const [loading, setLoading] = useState(true);
  const [invloading, setInvLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Inventory>();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState(false);
  const [purchaseQty, setPurchaseQty] = useState(1);
  const [purchaseAmountPerItem, setPurchaseAmountPerItem] = useState(0.5);
  const [totalAmount, setTotalAmount] = useState(
    purchaseQty * purchaseAmountPerItem
  );
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [showFlutterwave, setShowFlutterwave] = useState(false);
  const [showConfirmModal, setConfirmShowModal] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [usdEquivalent, setUsdEquivalent] = useState<string | null>(null);
  const [exchangeLoading, setExchangeLoading] = useState(false);

  const txRef = `tx-${uuid.v4().split("-")[0]}`;
  const purchaseDetails =
    selectedItem?.name + "-" + purchaseQty + "-" + totalAmount;

  const renderTabButton = (label: string, value: "items" | "seeds") => (
    <TouchableOpacity
      onPress={() => setActiveTab(value)}
      className={`flex-1 p-2 rounded-md mx-1 ${
        activeTab === value ? "bg-[#9F8851]" : "bg-[#564B27]"
      }`}
    >
      <Text className="text-white text-center font-primary">{label}</Text>
    </TouchableOpacity>
  );

  const fetchUserPlantLevel = async () => {
    setLoading(true);

    const token = await AsyncStorage.getItem("token");
    if (token !== null) {
      const res = await getUserPlantLevels(token);

      if (res.data.success) {
        // console.log("Response ", res.data);
      } else {
        console.log("REsponse");
      }
      setLoading(false);
    } else {
      console.log("no token");
      setLoading(false);
    }
  };

  const fetchUserInventotyData = async () => {
    setInvLoading(true);
    const token = await AsyncStorage.getItem("token");
    if (token !== null) {
      const res = await getUserPIventory(token);
      const { pesticideItems, fertilizerItems, waterItems } = res;

      if (res) {
        setUserInventory({
          fertilizerQty: fertilizerItems?.quantity || 0,
          pesticideQty: pesticideItems?.quantity || 0,
          waterQty: waterItems?.quantity || 0,
        });
      } else {
        setUserInventory({
          fertilizerQty: 0,
          pesticideQty: 0,
          waterQty: 0,
        });
      }
      setInvLoading(false);
    } else {
      console.log("no token");
      setInvLoading(false);
    }
  };

  useEffect(() => {
    if (totalAmount) {
      (async () => {
        setExchangeLoading(true);
        const result = await checkCurrency(currency, totalAmount);
        setUsdEquivalent(result.toFixed(2));
        setExchangeLoading(false);
      })();
    }
  }, [currency, totalAmount]);

  useEffect(() => {
    fetchUserInventotyData();
    fetchUserPlantLevel();
  }, []);
  if (invloading)
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );

  const handleAmount = (type: string) => {
    setPurchaseQty((prevQty) => {
      let newQty = prevQty;

      if (type === "add") {
        newQty = Math.min(prevQty + 1, 50);
      } else if (type === "sub") {
        newQty = Math.max(prevQty - 1, 0);
      } else {
        return prevQty; // No update for invalid type
      }

      setTotalAmount(purchaseAmountPerItem * newQty);
      return newQty;
    });
    // setPurchaseQty((prev) => Math.min(prev + 1, 10));
    // setPurchaseQty((prev) =>
    //   Math.max(0, Math.min(prev + 1, 10))
    // );
  };

  const openModal = (item: any) => {
    setSelectedItem(item);
    setPurchaseQty(1);
    setPurchaseAmountPerItem(0.5);
    setTotalAmount(0.5);
    // setPurchaseAmountPerItem(item.amount)
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
      setSelectedItem(undefined);
    });
  };

  const handleSuccess = async (data: any) => {
    const { transaction_id } = data;

    try {
      const res = await fetch(
        `https://farm-wizard-api.onrender.com/api/v1/payment/flutterwave/verify-payment/${transaction_id}/${purchaseDetails}`
      );
      const json = await res.json();

      if (json.success) {
        setConfirmShowModal(false);
        Alert.alert(
          "Payment Verified",
          `Transaction Ref: ${json.data.tx_ref} and Transaction Id: ${transaction_id} `
        );
        await fetchUserInventotyData(); // fetch updated inventory
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

  const handleBuyItem = () => {
    setModalVisible(false);
    // setModalMessage(true);
    setConfirmShowModal(true);
  };
  return (
    <View className="flex-1 bg-green-200 pt-12 px-4">
      {/* Background */}
      <BackgroundImage
        source={images.background}
        style={{ width: "100vw", height: "100vh", position: "absolute" }}
      />

      <Text className="text-white text-2xl font-primary font-bold text-center my-8">
        INVENTORY
      </Text>

      <View className="flex-row gap-2 justify-end my-2">
        <Text className="text-white text-lg font-semibold">{user?.score}</Text>
        <View className="bg-yellow-500 p-1 rounded-full">
          <HomeIcon size={16} color={"#fff"} />
        </View>
      </View>

      {/* Tab Buttons */}
      <View className="flex-row mb-4">
        {renderTabButton("Items", "items")}
        {renderTabButton("Seeds", "seeds")}
      </View>

      <ScrollView className="pb-10">
        <View className="bg-[#78693952] p-4 rounded-xl">
          <InventoryGrid
            data={activeTab === "items" ? inventory.items : seedInventory}
            onOpenModal={openModal}
            userInventory={userInventory}
          />
        </View>
      </ScrollView>

      {/* Popup Modal */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <TouchableWithoutFeedback onPress={closeModal}>
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
              className="bg-[#78693985] rounded-3xl w-[80%] p-2 items-center border border-yellow-300"
            >
              <TouchableWithoutFeedback onPress={() => {}}>
                <View className="bg-[#857f6e85] rounded-2xl p-8 flex justify-center items-center">
                  <Text className="text-gray-100 text-center mb-6">
                    Select Quantity
                  </Text>
                  <Image
                    source={
                      activeTab === "items"
                        ? selectedItem?.icon
                        : selectedItem?.iconLg
                    }
                    className="w-40 h-40"
                  />
                  <Text className="text-xs font-bold text-center">
                    {selectedItem?.name}
                  </Text>

                  <View className="flex-row my-1 gap-14">
                    <TouchableOpacity onPress={() => handleAmount("sub")}>
                      <View className="w-14 h-14 rounded-full bg-buttonColor justify-center items-center">
                        <Image
                          source={icons.leftChevron}
                          className="w-18 h-14"
                          resizeMode="contain"
                        />
                      </View>
                    </TouchableOpacity>
                    <Text className="text-white font-semibold">
                      X {purchaseQty}
                    </Text>
                    <TouchableOpacity onPress={() => handleAmount("add")}>
                      <View className="w-14 h-14 rounded-full bg-buttonColor justify-center items-center">
                        <Image
                          source={icons.rightChevron}
                          className="w-18 h-14"
                          resizeMode="contain"
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View className="flex-row gap-2">
                    <View className="bg-yellow-500 p-1 rounded-full">
                      <HomeIcon size={18} color={"#fff"} />
                    </View>
                    <Text className="text-white text-2xl font-semibold">
                      {totalAmount.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Animated.View>
            <CustomButton
              title="Buy"
              handlePress={handleBuyItem}
              containerStyles="w-[150px]"
              textStyles={"font-pbold text-white"}
              isLoading={false}
            />
          </BlurView>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal transparent visible={modalMessage} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setModalMessage(false)}>
          <BlurView
            intensity={50}
            tint="dark"
            className="flex-1 items-center justify-center"
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <View className="bg-[#857f6e85] opacity-2 rounded-lg p-2 flex justify-center items-center">
                <Image source={images.fewCoinsMessage} className="w-40 h-40" />
                <Text className="text-md text-white font-bold text-center">
                  The magic’s eager, but your coins are few! Let’s visit the
                  shop and fill that pouch.
                </Text>
              </View>
            </TouchableWithoutFeedback>

            <CustomButton
              title="Buy more coins "
              handlePress={() => console.log("me")}
              containerStyles="w-[200px]"
              textStyles={"font-pbold text-white"}
              isLoading={false}
            />
          </BlurView>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal transparent visible={showConfirmModal} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setConfirmShowModal(false)}>
          <BlurView
            intensity={50}
            tint="dark"
            className="flex-1 p-4 items-center justify-center"
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <View className="bg-white rounded-2xl w-[90%] p-6 ">
                <Text
                  className="font-secondary font-bold italic"
                  style={{ fontSize: 22 }}
                >
                  {`Confirm payment of ${usdEquivalent} ${currency} in respect of ${purchaseQty} qty of ${selectedItem?.name} `}
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
                  {/* <Picker.Item label="🇲🇺 Rupee (MUR)" value="MUR" />
                  <Picker.Item label="🇲🇾 Ringgit (MYR)" value="MYR" />
                  <Picker.Item label="🇳🇴 Krone (NOK)" value="NOK" />
                  <Picker.Item label="🇳🇿 Dollar (NZD)" value="NZD" />
                  <Picker.Item label="🇵🇱 Zloty (PLN)" value="PLN" />
                  <Picker.Item label="🇷🇺 Rouble (RUB)" value="RUB" />
                  <Picker.Item label="🇸🇦 Riyal (SAR)" value="SAR" />
                  <Picker.Item label="🇸🇪 Krona (SEK)" value="SEK" />
                  <Picker.Item label="🇸🇬 Dollar (SGD)" value="SGD" /> */}
                  <Picker.Item label="🇸🇱 Leone (SLL)" value="SLL" />
                </Picker>
              </View>
            </TouchableWithoutFeedback>
            {!usdEquivalent || exchangeLoading ? (
              <Text style={{ marginBottom: 10 }}>Loading...</Text>
            ) : (
              <>
                <CustomButton
                  title={`Pay ${usdEquivalent} ${currency}`}
                  handlePress={() => setShowFlutterwave(true)}
                  containerStyles="w-[90%]"
                  textStyles={"font-pbold text-white"}
                  isLoading={exchangeLoading}
                />
              </>
            )}
          </BlurView>
        </TouchableWithoutFeedback>
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

const getItemsQty = (item: string, userInventory: any) => {
  switch (item) {
    case "Pesticide":
      return userInventory.pesticideQty;
    case "Fertilizer":
      return userInventory.fertilizerQty;
    case "Water":
      return userInventory.waterQty;
    case "Apple":
      return userInventory.fertilizerQty;
    default:
      return 0;
  }
};
const InventoryGrid = ({ data, onOpenModal, userInventory }: any) => {
  // Group items into rows of 2
  const rows = [];
  for (let i = 0; i < data.length; i += 2) {
    rows.push(data.slice(i, i + 2));
  }

  return (
    <View>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row justify-between my-2">
          {row.map((item: any, index: any) => (
            <View
              key={index}
              className="flex-1 bg-[#9F8851] rounded-xl mx-1 p-3"
            >
              <Text className="text-white text-right">
                x{getItemsQty(item.name, userInventory)}
              </Text>
              <View className="flex-row justify-between">
                <Image
                  source={item.icon}
                  className="w-30 h-30 p-8"
                  resizeMode="contain"
                />
                <View className="mt-6">
                  <Text className="text-[#56411A] font-primary text-2xl">
                    {item.name}
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View className="items-end mt-2">
                <View className="flex-row gap-1">
                  <TouchableOpacity
                    className="px-2 py-1 bg-[#8C6722] rounded-md"
                    onPress={() => onOpenModal?.(item)}
                  >
                    <Image
                      source={icons.cart}
                      className="w-30 h-30"
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
          {/* {row.length < 2 && <View className="flex-1 mx-1" />}{" "} */}
          {row.length < 2 && <Text className="flex-1 mx-1"> </Text>}
          {/* filler for alignment */}
        </View>
      ))}
    </View>
  );
};

export default Inventory;
