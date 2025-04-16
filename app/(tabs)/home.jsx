import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, Text, View } from "react-native";

import { icons } from "../../constants";
import { useLoginContext } from "@/context/LoginProvider";
import PlayState from "../../components/PlayState";

const Home = () => {

  const { user } = useLoginContext();


  useEffect(() => {
    if (!user) {
      router.replace("/sign-in");
    }
  }, [])


  return (
    <SafeAreaView className="bg-primary h-[100vh]">
      <View className="flex my-6 px-4 space-y-6">
        <View className="flex justify-between items-start flex-row mb-6">
          <View>
            {/* <Text className="font-pmedium text-sm text-gray-100">
              Welcome Back
            </Text>
            <Text className="text-2xl font-psemibold text-white">
              {user?.fullName}
            </Text> */}
            <Image
              source={icons.profile}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </View>

          <View className="mt-1.5">
            <Image
              src={'https://t4.ftcdn.net/jpg/01/08/24/99/360_F_108249947_UMBLfSCpTWU6AGiUz0F7a524koG3eO0z.jpg'}
              // source={images.logoSmall}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </View>
        </View>

        <PlayState
          title="Farm wizard"
          subtitle="Farm wizard is a game where you can create your own farm and play with your friends. "
        />

      </View>
    </SafeAreaView>
  );
};

export default Home;
