import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import BackgroundImage from "@/components/BackgroundImage";
import HeaderNavigation from "@/components/HeaderNavigation";
import { icons, images } from "@/constants";
import { useLoginContext } from "@/context/LoginProvider";
import { getDailyChallenge } from "@/services/rewardsApi";

type Row = {
  userId: string;
  fullName: string;
  bestScore: number;
  position: number;
};

const DailyChallenge = () => {
  const { user } = useLoginContext();
  const [crop, setCrop] = useState<string>("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getDailyChallenge();
      if (data?.success) {
        setCrop(data.crop || "");
        setRows(data.leaderboard || []);
        setFailed(false);
      } else {
        setFailed(true);
      }
    } catch (e) {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

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
      <Text className="text-white text-2xl font-primary text-center">
        Daily Challenge
      </Text>
      {!!crop && (
        <Text className="text-yellow-300 font-secondary font-bold text-center mb-1 capitalize">
          Today's crop: {crop}
        </Text>
      )}
      <Text className="text-white/70 text-xs text-center mb-2 px-6">
        Play today's crop to post your best score. Resets every day.
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" className="mt-10" />
      ) : failed ? (
        <Text className="text-white/70 text-center mt-10 px-6">
          Couldn't load the daily leaderboard. Please try again later.
        </Text>
      ) : (
        <ScrollView
          className="px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {rows.length === 0 ? (
            <Text className="text-white/70 text-center mt-8">
              No scores yet today — be the first!
            </Text>
          ) : (
            rows.map((r) => {
              const isMe = String(r.userId) === String(user?._id);
              return (
                <View
                  key={r.userId}
                  className={`flex-row items-center justify-between rounded-xl px-4 py-3 mb-2 ${
                    isMe ? "bg-[#E0C145B8]" : "bg-black/30"
                  }`}
                >
                  <View className="flex-row items-center flex-1">
                    <Text className="text-white font-pbold w-8">
                      {r.position}
                    </Text>
                    <Text
                      numberOfLines={1}
                      className="text-white font-psemibold flex-1"
                    >
                      {r.fullName}
                      {isMe ? " (you)" : ""}
                    </Text>
                  </View>
                  <Text className="text-white font-pbold">
                    {Number(r.bestScore).toFixed(0)}
                  </Text>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default DailyChallenge;
