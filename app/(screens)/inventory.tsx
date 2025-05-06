import BackgroundImage from "@/components/BackgroundImage";
import client from "@/config/client";
import { images } from "@/constants";
import { getUserPlantLevels } from "@/services/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";

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
  seeds: [
    {
      name: "Maize",
      icon: images.maize,
      level: 3,
      progress: 0.7,
      count: 1,
    },
    {
      name: "Paw Paw",
      icon: images.pawpaw,
      level: 1,
      progress: 0.2,
      count: 1,
    },
    {
      name: "Apple",
      icon: images.apple,
      level: 2,
      progress: 0.4,
      count: 1,
    },
  ],
};

const Inventory = () => {
  const [loading, setLoading] = useState(true);

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
  return (
    <View className="flex-1 bg-green-200 pt-12 px-4">
      {/* Background */}
      <BackgroundImage
        source={images.background}
        style={{ width: "100vw", height: "100vh", position: "absolute" }}
      />

      <Text className="text-white text-3xl font-secondary text-center my-10">
        Inventory
      </Text>

      <ScrollView className="pb-10 mb-3">
        {/* Items */}
        <Text className="text-white text-center font-semibold text-lg">
          Items
        </Text>
        <View className="bg-[#78693952] p-4 rounded-xl my-3">
          {inventory.items.map((item, index) => (
            <InventoryRow key={index} data={item} />
          ))}
        </View>

        {/* Seeds */}
        <Text className="text-white text-center font-semibold text-lg">
          Seeds
        </Text>
        <View className="bg-[#78693952] p-4 rounded-xl ">
          {inventory.seeds.map((seed, index) => (
            <InventoryRow key={index} data={seed} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const InventoryRow = ({ data }: any) => {
  return (
    <View className="flex-row items-center bg-[#93771B] rounded-2xl my-3">
      <Image
        source={data.icon}
        className="w-10 h-10 mr-3"
        resizeMode="contain"
      />

      <View className="flex-1 m-1">
        <Text className="text-white font-primary">{data.name}</Text>
        <Text className="text-yellow-200 text-xs bg-[#786939] w-10 rounded-md text-center">
          Lvl {data.level}
        </Text>

        {/* Progress Bar */}
        <View className="w-full h-2 bg-white/30 rounded-full mt-1">
          <View
            className="h-2 bg-yellow-400 rounded-full"
            style={{ width: `${data.progress * 100}%` }}
          />
        </View>
      </View>

      {/* Actions */}
      <View className="flex-col items-end p-1 m-2">
        <Text className="text-white mb-1">x{data.count}</Text>
        <View className="flex-row gap-2">
          <TouchableOpacity className="px-2 py-1 bg-[#40672C] rounded-md">
            <Text className="text-white text-xs font-secondary">Upgrade</Text>
          </TouchableOpacity>
          <TouchableOpacity className="px-2 py-1 bg-[#8D6E63] rounded-md">
            <Text className="text-white text-xs font-secondary">Buy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Inventory;
