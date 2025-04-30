import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, router } from "expo-router";

import CustomButton from "../components/CustomButton";

import { images } from "../constants";
import { useLoginContext } from "../context/LoginProvider";
import BackgroundImage from "../components/BackgroundImage";

export default function Index() {
  const { isLoading, isLogged } = useLoginContext();

  if (!isLoading && isLogged) return <Redirect href={"/(tabs)/home"} />;

  return <Redirect href={"/(tabs)/home"} />;

  return (
    <SafeAreaView className="bg-primary h-full" edges={['left', 'right', 'bottom']} style={{ flex: 1 }}>
      {/* Background Image */}
      <BackgroundImage source={images.background} />
      <ScrollView contentContainerStyle={{ height: "100%" }}>

        <View className="w-full flex justify-center items-center min-h-[85vh] px-4">

          <View className="relative mt-10">
            <Text className="text-3xl text-white font-primary text-center my-20">
              TERM AND CONDITION
            </Text>
          </View>

          <ScrollView
            // showsVerticalScrollIndicator={false}
            style={{ height: 420 }}
            className="max-h-50">
            {/* <Text className="text-xl font-semibold text-gray-50 my-5 text-center border-r-4 border-r-[#E1CE67]"> */}
            <Text className="text-lg font-secondary text-gray-50 text-center border-r-4 border-r-[#E1CE67]">
              By using Farm Wizard, you agree to our Terms and Conditions. This app is designed for fun and educational
              use only. Users are expected to use the app responsibly and not engage in harmful or illegal behavior.
              All game content, including graphics and sounds, is owned by the Farm Wizard team and may not be copied or
              shared without permission. We are committed to protecting your privacy and will not collect personal information
              without your consent. These terms may be updated as the app grows, and continued use means you accept any changes.
              For questions, contact us at support@farmwizard.com.
              By using Farm Wizard, you agree to our Terms and Conditions. This app is designed for fun and educational
              use only. Users are expected to use the app responsibly and not engage in harmful or illegal behavior.
              All game content, including graphics and sounds, is owned by the Farm Wizard team and may not be copied or
              shared without permission. We are committed to protecting your privacy and will not collect personal information
              without your consent. These terms may be updated as the app grows, and continued use means you accept any changes.
              For questions, contact us at support@farmwizard.com.
            </Text>
          </ScrollView>

          <CustomButton
            title="Agree & Continue "
            handlePress={() => router.push("/sign-in")}
            containerStyles="w-full "
            textStyles={"font-pbold text-white"}
            isLoading={isLoading}
          />
        </View>
      </ScrollView >
      <StatusBar backgroundColor="#161622" style="light" />

    </SafeAreaView >
  );
}
