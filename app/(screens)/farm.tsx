import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import BackgroundImage from "@/components/BackgroundImage";
import HeaderNavigation from "@/components/HeaderNavigation";
import { icons, images } from "@/constants";
import { useLoginContext } from "@/context/LoginProvider";
import { getCosmetics, buyCosmetic } from "@/services/rewardsApi";

type Item = {
  id: string;
  type: string;
  name: string;
  price: number;
  emoji?: string;
};

const Farm = () => {
  const { user, setUser } = useLoginContext();
  if (!user) {
    router.replace("/");
  }
  const [decorations, setDecorations] = useState<Item[]>([]);
  const [owned, setOwned] = useState<string[]>([]);
  const [balance, setBalance] = useState<number>(Number(user?.score) || 0);
  const [busy, setBusy] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const load = async () => {
    try {
      const data = await getCosmetics();
      if (data?.success) {
        setDecorations(
          (data.catalog || []).filter((c: Item) => c.type === "decoration")
        );
        setOwned(data.owned || []);
        setBalance(data.balance ?? (Number(user?.score) || 0));
        setFailed(false);
      } else {
        setFailed(true);
      }
    } catch (e) {
      setFailed(true);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const onBuy = async (item: Item) => {
    if (busy) return;
    if (balance < item.price) {
      Alert.alert("Not enough WizPoints", "Keep playing to earn more!");
      return;
    }
    setBusy(item.id);
    try {
      const res = await buyCosmetic(item.id);
      if (res?.success) {
        if (res.userDetails) setUser(res.userDetails);
        await load();
        Alert.alert("Added to your farm", `${item.emoji || ""} ${item.name}`);
      } else {
        Alert.alert("Couldn't buy", res?.message || "Please try again.");
      }
    } catch (e: any) {
      Alert.alert("Couldn't buy", e?.message || "Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const ownedDecorations = decorations.filter((d) => owned.includes(d.id));

  return (
    <SafeAreaView className="flex-1 bg-green-200">
      <BackgroundImage
        source={images.background}
        style={{ width: "100%", height: "100%", position: "absolute" }}
      />
      <HeaderNavigation
        onLeftPress={() => router.back()}
        onRightPress={() => null}
        leftIcon={icons.back}
        rightIcon={icons.settings}
        showLeftButton={true}
        showRightButton={false}
      />
      <Text className="text-white text-2xl font-primary text-center mb-1">
        My Farm
      </Text>
      <Text className="text-yellow-300 font-secondary font-bold text-center mb-2">
        {balance.toLocaleString()} WizPoints
      </Text>

      <ScrollView
        className="px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* The farm canvas */}
        <View className="bg-[#6FAE5E] rounded-2xl p-4 mb-4 min-h-[180px] border-2 border-[#4C7C3F]">
          {ownedDecorations.length === 0 ? (
            <Text className="text-white/80 text-center my-10">
              Your farm is bare. Buy decorations below to bring it to life!
            </Text>
          ) : (
            <View className="flex-row flex-wrap justify-center">
              {ownedDecorations.map((d) => (
                <View key={d.id} className="items-center m-2">
                  <Text style={{ fontSize: 44 }}>{d.emoji || "🌱"}</Text>
                  <Text className="text-white text-xs">{d.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Shop */}
        <Text className="text-white font-pbold text-base mb-2">
          Decoration Shop
        </Text>
        {failed ? (
          <Text className="text-white/70 text-center mt-6">
            Couldn't load the shop. Please check your connection and try again.
          </Text>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {decorations.map((item) => {
              const isOwned = owned.includes(item.id);
              return (
                <View
                  key={item.id}
                  className="bg-black/30 rounded-2xl p-3 mb-3 items-center"
                  style={{ width: "48%" }}
                >
                  <Text style={{ fontSize: 40 }}>{item.emoji || "🌱"}</Text>
                  <Text className="text-white font-psemibold text-sm mt-1">
                    {item.name}
                  </Text>
                  {isOwned ? (
                    <View className="bg-green-600 px-4 py-1.5 rounded-full mt-2">
                      <Text className="text-white text-xs font-pbold">
                        ✓ Owned
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => onBuy(item)}
                      disabled={busy === item.id}
                      className="bg-[#E0C145B8] px-4 py-1.5 rounded-full mt-2"
                    >
                      <Text className="text-white text-xs font-pbold">
                        {busy === item.id
                          ? "…"
                          : `${item.price.toLocaleString()} WZP`}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Farm;
