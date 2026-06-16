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
import { icons, images } from "@/constants";
import { getUserPlantLevels } from "@/services/user";
import { BlurView } from "expo-blur";
import { HomeIcon } from "lucide-react-native";
import { usePlantGrowth as seedInventory } from "@/constants/plants";
import { router } from "expo-router";
import uuid from "react-native-uuid";
import { useLoginContext } from "@/context/LoginProvider";
import { getUserPIventory } from "@/services/userInventory";
import checkCurrency from "@/utils/checkCurrency";
import { useTranslation } from "react-i18next";
import { API_BASE } from "@/config/client";
import analytics from "@react-native-firebase/analytics";
import BannerAdComponent from "@/utils/BannerAdComponent";

type Inventory = {
  name: string;
  diplayName: string;
  icon: any;
  iconLg: any;
  bg: string;
};

const Inventory = () => {
  const { user } = useLoginContext();
  if (!user) {
    router.replace("/");
  }
  const isPremiumUser = user?.isPremium === true;
  const { t } = useTranslation();
  const inventory = {
    items: [
      {
        name: "Fertilizer",
        diplayName: t("inventory.fertilizer"),
        icon: images.fertilizer,
        iconLg: images.fertilizerLg,
        level: 3,
        progress: 0.65,
        count: 1,
      },
      {
        name: "Pesticide",
        diplayName: t("inventory.pesticide"),
        icon: images.pesticied,
        iconLg: images.pesticiedLg,
        level: 2,
        progress: 0.4,
        count: 1,
      },
      {
        name: "Water",
        diplayName: t("inventory.water"),
        icon: images.kettle,
        iconLg: images.kettleLg,
        level: 1,
        progress: 0.2,
        count: 1,
      },
    ],
  };

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
  const [purchaseAmountPerItem, setPurchaseAmountPerItem] = useState(0.01);
  const [totalAmount, setTotalAmount] = useState(
    purchaseQty * purchaseAmountPerItem
  );
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [currency, setCurrency] = useState("USD");
  const [usdEquivalent, setUsdEquivalent] = useState<string | null>(null);
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [inAppPurchaseModal, setInAppPurchaseModal] = useState(false);

  const txRef = `tx-${uuid.v4().split("-")[0]}`;
  /* const purchaseDetails =
    selectedItem?.name + "-" + purchaseQty + "-" + totalAmount;*/
  const purchaseDetails =
    selectedItem?.name + "-" + purchaseQty + "-" + usdEquivalent;

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
    const logEvent = async () => {
      await analytics().logEvent("screen_view", {
        screen_name: "Inventory",
        screen_class: "Inventory",
      });
    };
    logEvent();
    fetchUserInventotyData();
    fetchUserPlantLevel();
  }, []);

  const seedData = seedInventory();

  const handleAmount = (type: string) => {
    setPurchaseQty((prevQty) => {
      let newQty = prevQty;

      if (type === "add") {
        newQty = Math.min(prevQty + 1, 1000);
      } else if (type === "sub") {
        newQty = Math.max(prevQty - 1, 1);
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
    setPurchaseAmountPerItem(0.01);
    setTotalAmount(0.01);
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

  // Inventory items are bought with earned Wizpoints only.
  const handleBuyItem = () => {
    setModalVisible(false);
    setInAppPurchaseModal(true);
  };

  const convertWizpointToUsd = (userBalance: number) => {
    return (Number(userBalance * 0.01) / 1000).toFixed(8);
  };

  const handleInAppPurchase = async () => {
    const transaction_id = txRef;

    const token = await AsyncStorage.getItem("token");
    if (token !== null) {
      try {
        const res = await fetch(
          `${API_BASE}/api/v1/payment/in-app-purchase/verify-purchase/${transaction_id}/${purchaseDetails}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `JWT ${token}`,
            },
          }
        );
        const json = await res.json();

        if (json.success) {
          setInAppPurchaseModal(false);
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
    }
  };

  if (invloading)
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <>
      <View className="flex-1 bg-green-200 pt-12 px-4">
        {/* Background */}
        <BackgroundImage
          source={images.background}
          style={{ width: "100%", height: "100%", position: "absolute" }}
        />

        <Text className="text-white text-2xl font-primary text-center my-3">
          {t("menu.inventory")}
        </Text>

        <View className="flex-row gap-2 items-center justify-end my-2">
          <Text className="text-white text-lg font-semibold">
            {(user?.score).toFixed(2)}
          </Text>
          <View className="bg-yellow-500 p-1 rounded-full">
            <HomeIcon size={16} color={"#fff"} />
          </View>
        </View>

        {/* Tab Buttons */}
        <View className="flex-row mb-4">
          {renderTabButton("Items", "items")}
          {renderTabButton("Seeds", "seeds")}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <View className="bg-[#78693952] p-3 rounded-xl">
            <InventoryGrid
              data={activeTab === "items" ? inventory.items : seedData}
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
                  <View className="bg-white rounded-2xl p-8 flex justify-center items-center">
                    <Text className="text-[#80784A] font-smibold text-center mb-6">
                      {t("inventory.select_quantity")}
                    </Text>
                    <Image
                      source={selectedItem?.iconLg}
                      // source={
                      //   activeTab === "items"
                      //     ? selectedItem?.icon
                      //     : selectedItem?.iconLg
                      // }
                      className="w-40 h-40"
                    />
                    <Text className="text-base text-[#78693985] font-bold text-center">
                      {selectedItem?.diplayName}
                    </Text>

                    <View className="flex-row items-center my-2 gap-8">
                      <TouchableOpacity onPress={() => handleAmount("sub")}>
                        <View className="w-12 h-12 rounded-full bg-buttonColor justify-center items-center">
                          <Image
                            source={icons.leftChevron}
                            className="w-8 h-8"
                            resizeMode="contain"
                          />
                        </View>
                      </TouchableOpacity>
                      <Text className="text-[#80784A] text-lg font-semibold">
                        X {purchaseQty}
                      </Text>
                      <TouchableOpacity onPress={() => handleAmount("add")}>
                        <View className="w-12 h-12 rounded-full bg-buttonColor justify-center items-center">
                          <Image
                            source={icons.rightChevron}
                            className="w-8 h-8"
                            resizeMode="contain"
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                    <View className="flex-row gap-2">
                      <View className="bg-yellow-500 p-1 rounded-full">
                        <HomeIcon size={18} color={"#fff"} />
                      </View>
                      <Text className="text-[#80784A] text-2xl font-bold">
                        {totalAmount.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </Animated.View>
              <CustomButton
                title="Get"
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
                  <Image
                    source={images.fewCoinsMessage}
                    className="w-40 h-40"
                  />
                  <Text className="text-base text-white font-bold text-center">
                    The magic’s eager, but your coins are few! Let’s visit the
                    shop and fill that pouch.
                  </Text>
                </View>
              </TouchableWithoutFeedback>

              <CustomButton
                title="Get more coins "
                handlePress={() => console.log("get more coins")}
                containerStyles="w-[200px]"
                textStyles={"font-pbold text-white"}
                isLoading={false}
              />
            </BlurView>
          </TouchableWithoutFeedback>
        </Modal>

        {/* in app purchase modal  */}
        <Modal transparent visible={inAppPurchaseModal} animationType="fade">
          <TouchableWithoutFeedback
            onPress={() => setInAppPurchaseModal(false)}
          >
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
                    {/* {`Confirm payment of ${usdEquivalent} ${currency} in respect of ${purchaseQty} qty of ${selectedItem?.diplayName} Using your Wizpoint`} */}
                    {`Confirm getting of ${purchaseQty} qty of ${selectedItem?.diplayName} Using your Wizpoint`}
                  </Text>
                  <Text style={{ fontSize: 16 }} className="my-4">
                    Note! 1000 WizPoints = 0.01 USD
                  </Text>
                  <Text style={{ fontSize: 14 }} className="">
                    your Wiz balance is {user.score} wiz ={" "}
                    {convertWizpointToUsd(user.score)} USD
                  </Text>
                </View>
              </TouchableWithoutFeedback>
              {!usdEquivalent || exchangeLoading ? (
                <Text style={{ marginBottom: 10 }}>Loading...</Text>
              ) : (
                <>
                  {Number(usdEquivalent) >=
                  Number(convertWizpointToUsd(user.score)) ? (
                    <Text
                      className="text-red-400 text-xl font-bold"
                      style={{ marginBottom: 10 }}
                    >
                      In Sufficient Balance
                    </Text>
                  ) : (
                    <CustomButton
                      title={`Pay ${usdEquivalent} ${currency}`}
                      handlePress={handleInAppPurchase}
                      containerStyles="w-[100%]"
                      textStyles={"font-pbold text-white"}
                      isLoading={exchangeLoading}
                    />
                  )}
                </>
              )}
            </BlurView>
          </TouchableWithoutFeedback>
        </Modal>

      </View>
      {!isPremiumUser && <BannerAdComponent />}
    </>
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
    // case "Apple":
    //   return userInventory.fertilizerQty;
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
              <Text className="text-white text-right text-xs font-semibold">
                x{getItemsQty(item.name, userInventory)}
              </Text>
              <View className="items-center">
                <Image
                  source={item.icon}
                  className="w-20 h-20"
                  resizeMode="contain"
                />
                <Text
                  numberOfLines={1}
                  className="text-[#56411A] font-primary text-lg text-center mt-1"
                >
                  {item.diplayName}
                </Text>
              </View>

              {/* Actions */}
              <View className="flex-row justify-end mt-2">
                <TouchableOpacity
                  className="px-4 py-2 bg-[#8C6722] rounded-lg"
                  onPress={() => onOpenModal?.(item)}
                >
                  <Image
                    source={icons.cart}
                    className="w-6 h-6"
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {row.length < 2 && <View className="flex-1 mx-1" />}
          {/* filler for alignment */}
        </View>
      ))}
    </View>
  );
};

export default Inventory;
