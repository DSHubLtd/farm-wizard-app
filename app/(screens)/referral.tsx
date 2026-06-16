import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Share,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import BackgroundImage from "@/components/BackgroundImage";
import HeaderNavigation from "@/components/HeaderNavigation";
import { CustomButton } from "@/components";
import { icons, images } from "@/constants";
import { useLoginContext } from "@/context/LoginProvider";
import { getReferral, redeemReferral } from "@/services/rewardsApi";

const Referral = () => {
  const { user, setUser } = useLoginContext();
  if (!user) {
    router.replace("/");
  }
  const [code, setCode] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [alreadyReferred, setAlreadyReferred] = useState(false);
  const [rewards, setRewards] = useState({ referrer: 500, referee: 250 });
  const [enteredCode, setEnteredCode] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const data = await getReferral();
      if (data?.success) {
        setCode(data.referralCode);
        setCount(data.referralCount || 0);
        setAlreadyReferred(!!data.alreadyReferred);
        if (data.rewards) setRewards(data.rewards);
      }
    } catch (e) {
      // leave defaults; screen still renders
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const onShare = async () => {
    if (!code) return;
    try {
      await Share.share({
        message: `🌱 Join me on Farm Wizard! Use my referral code ${code} when you sign up and we both earn WizPoints. Grow crops, beat the weather, earn rewards!`,
      });
    } catch (e) {
      // user dismissed share sheet
    }
  };

  const onRedeem = async () => {
    const c = enteredCode.trim().toUpperCase();
    if (!c) {
      Alert.alert("Enter a code", "Please enter a referral code first.");
      return;
    }
    setBusy(true);
    try {
      const res = await redeemReferral(c);
      if (res?.success) {
        if (res.userDetails) setUser(res.userDetails);
        setAlreadyReferred(true);
        setEnteredCode("");
        Alert.alert("Success", res.message || "Referral applied!");
      } else {
        Alert.alert("Couldn't apply", res?.message || "Invalid code.");
      }
    } catch (e: any) {
      Alert.alert(
        "Couldn't apply",
        e?.response?.data?.message || e?.message || "Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

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
      <Text className="text-white text-2xl font-primary text-center mb-3">
        Invite Friends
      </Text>

      <View className="px-4">
        {/* Your code */}
        <View className="bg-black/30 rounded-2xl p-4 mb-4">
          <Text className="text-white/80 text-sm text-center">
            Share your code. When a friend signs up and redeems it, you earn{" "}
            {rewards.referrer} WizPoints.
          </Text>
          <View className="bg-[#E0C145B8] rounded-xl py-3 my-3">
            <Text className="text-white text-3xl font-pbold text-center tracking-widest">
              {code || "…"}
            </Text>
          </View>
          <Text className="text-white/90 text-center text-sm mb-2">
            Friends invited: {count}
          </Text>
          <CustomButton
            title="Share my code"
            handlePress={onShare}
            containerStyles="w-full"
            textStyles="font-pbold text-white"
            isLoading={false}
          />
        </View>

        {/* Redeem a code */}
        <View className="bg-black/30 rounded-2xl p-4">
          <Text className="text-white font-pbold text-base mb-2">
            Have a referral code?
          </Text>
          {alreadyReferred ? (
            <Text className="text-green-400 text-sm">
              ✓ You've already redeemed a referral code.
            </Text>
          ) : (
            <>
              <TextInput
                value={enteredCode}
                onChangeText={setEnteredCode}
                placeholder="Enter friend's code"
                placeholderTextColor="#ffffff"
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={12}
                className="w-full text-white font-psemibold text-base border-2 border-dotted border-secondary rounded-2xl px-4 py-3 mb-1"
              />
              <CustomButton
                title="Redeem"
                handlePress={onRedeem}
                containerStyles="w-full"
                textStyles="font-pbold text-white"
                isLoading={busy}
              />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Referral;
