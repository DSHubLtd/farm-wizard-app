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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CustomButton } from "@/components";
import BackgroundImage from "@/components/BackgroundImage";
import { icons, images } from "@/constants";
import { getUserPlantLevels } from "@/services/user";
import { BlurView } from "expo-blur";
import { HomeIcon } from "lucide-react-native";
// import { plantGrowth } from "@/constants/plants";
import { plantGrowth as seedInventory } from "@/constants/plants";

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
  const [activeTab, setActiveTab] = useState<"items" | "seeds">("items");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Inventory>();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState(false);
  const [purchaseQty, setPurchaseQty] = useState(1);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    fetchUserPlantLevel();
  }, []);

  const openModal = (item: any) => {
    setSelectedItem(item);
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

  const handleBuyItem = () => {
    console.log("selectedItem ", selectedItem);
    setModalVisible(false);
    setModalMessage(true);
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
        <Text className="text-white text-lg font-semibold">1,677</Text>
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
          />
        </View>
      </ScrollView>

      <View className="justify-center items-end my-4">
        <CustomButton
          title="Buy more coins "
          handlePress={() => console.log("me")}
          containerStyles="w-[200px]"
          textStyles={"font-pbold text-white"}
          isLoading={false}
        />
      </View>

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
                    Select Amount
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
                    <TouchableOpacity
                      onPress={() =>
                        setPurchaseQty((prev) => Math.max(prev - 1, 0))
                      }
                    >
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
                    <TouchableOpacity
                      onPress={() => {
                        setPurchaseQty((prev) => Math.min(prev + 1, 10));
                        // setPurchaseQty((prev) =>
                        //   Math.max(0, Math.min(prev + 1, 10))
                        // );
                      }}
                    >
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
                      103
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
    </View>
  );
};

const InventoryGrid = ({ data, onOpenModal }: any) => {
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
              <Text className="text-white text-right">x{item.count || 1}</Text>
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
