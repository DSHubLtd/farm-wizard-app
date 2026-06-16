import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import BackgroundImage from "@/components/BackgroundImage";
import HeaderNavigation from "@/components/HeaderNavigation";
import { icons, images } from "@/constants";
import { useLoginContext } from "@/context/LoginProvider";
import {
  getDailyQuests,
  getAchievements,
  claimQuest,
  creditReward,
  QuestState,
  AchievementState,
} from "@/utils/engagement";

const QuestsAchievements = () => {
  const { user, setUser } = useLoginContext();
  if (!user) {
    router.replace("/");
  }
  const [tab, setTab] = useState<"quests" | "achievements">("quests");
  const [quests, setQuests] = useState<QuestState[]>([]);
  const [achievements, setAchievements] = useState<AchievementState[]>([]);
  const [claiming, setClaiming] = useState<string | null>(null);

  const load = async () => {
    setQuests(await getDailyQuests());
    setAchievements(await getAchievements());
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const onClaim = async (q: QuestState) => {
    if (claiming) return;
    setClaiming(q.id);
    try {
      const updated = await creditReward(q.reward);
      if (updated) {
        setUser(updated);
        await claimQuest(q.id);
        await load();
        Alert.alert("Reward claimed", `🎉 +${q.reward} WizPoints added!`);
      } else {
        Alert.alert(
          "Couldn't claim",
          "Please check your connection and try again."
        );
      }
    } finally {
      setClaiming(null);
    }
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

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

      <Text className="text-white text-2xl font-primary text-center mb-2">
        Rewards
      </Text>

      {/* Tabs */}
      <View className="flex-row mx-4 mb-2 bg-black/20 rounded-xl p-1">
        {(["quests", "achievements"] as const).map((tb) => (
          <TouchableOpacity
            key={tb}
            onPress={() => setTab(tb)}
            className={`flex-1 py-2 rounded-lg ${
              tab === tb ? "bg-[#E0C145B8]" : ""
            }`}
          >
            <Text className="text-white text-center font-psemibold capitalize">
              {tb === "quests" ? "Daily Quests" : `Badges (${unlockedCount})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        className="px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {tab === "quests" && (
          <>
            <Text className="text-white/70 text-xs mb-3 text-center">
              Quests refresh every day. Complete them to earn WizPoints!
            </Text>
            {quests.map((q) => {
              const done = q.progress >= q.target;
              const pct = Math.min(100, (q.progress / q.target) * 100);
              return (
                <View key={q.id} className="bg-black/30 rounded-2xl p-4 mb-3">
                  <Text className="text-white font-psemibold text-base">
                    {q.title}
                  </Text>
                  <View className="h-2 bg-black/30 rounded-full mt-2 overflow-hidden">
                    <View
                      className={`h-2 rounded-full ${
                        done ? "bg-green-400" : "bg-[#E0C145B8]"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </View>
                  <View className="flex-row justify-between items-center mt-2">
                    <Text className="text-white/80 text-xs">
                      {q.progress}/{q.target} · Reward: {q.reward} WZP
                    </Text>
                    {q.claimed ? (
                      <Text className="text-green-400 font-pbold text-xs">
                        ✓ Claimed
                      </Text>
                    ) : done ? (
                      <TouchableOpacity
                        onPress={() => onClaim(q)}
                        disabled={claiming === q.id}
                        className="bg-[#E0C145B8] px-4 py-1.5 rounded-full"
                      >
                        <Text className="text-white font-pbold text-xs">
                          {claiming === q.id ? "Claiming…" : `Claim +${q.reward}`}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <Text className="text-white/50 text-xs">In progress</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </>
        )}

        {tab === "achievements" && (
          <>
            <Text className="text-white/70 text-xs mb-3 text-center">
              Unlock badges as you master your farm.
            </Text>
            {achievements.map((a) => {
              const pct = Math.min(100, (a.progress / a.target) * 100);
              return (
                <View
                  key={a.id}
                  className={`rounded-2xl p-4 mb-3 ${
                    a.unlocked ? "bg-[#E0C145B8]" : "bg-black/30"
                  }`}
                >
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-3">
                      {a.unlocked ? "🏆" : "🔒"}
                    </Text>
                    <View className="flex-1">
                      <Text className="text-white font-pbold text-base">
                        {a.title}
                      </Text>
                      <Text className="text-white/80 text-xs">{a.desc}</Text>
                    </View>
                  </View>
                  {!a.unlocked && (
                    <>
                      <View className="h-1.5 bg-black/30 rounded-full mt-2 overflow-hidden">
                        <View
                          className="h-1.5 rounded-full bg-white"
                          style={{ width: `${pct}%` }}
                        />
                      </View>
                      <Text className="text-white/60 text-xs mt-1">
                        {a.progress}/{a.target}
                      </Text>
                    </>
                  )}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default QuestsAchievements;
