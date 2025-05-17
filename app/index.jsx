import { useCallback, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { BackHandler, Dimensions, Platform, ScrollView, Text, ToastAndroid, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, router, useFocusEffect } from "expo-router";

import CustomButton from "../components/CustomButton";

import { images } from "../constants";
import { useLoginContext } from "../context/LoginProvider";
import BackgroundImage from "../components/BackgroundImage";
const { height } = Dimensions.get("window");

export default function Index() {

  const { loading, isLogged } = useLoginContext();

  if (!loading && isLogged) return <Redirect href={"/(tabs)/home"} />;

  const [backPressedOnce, setBackPressedOnce] = useState(false);
  const timeoutRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return;

      const onBackPress = () => {
        if (backPressedOnce) {
          BackHandler.exitApp();
          return true;
        }

        setBackPressedOnce(true);
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);

        timeoutRef.current = setTimeout(() => {
          setBackPressedOnce(false);
        }, 2000);

        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        backHandler.remove();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, [backPressedOnce])
  )

  return (
    <SafeAreaView className="bg-primary h-full" edges={['left', 'right', 'bottom']} style={{ flex: 1 }}>
      {/* Background Image */}
      <BackgroundImage source={images.background} />

      <View className="w-full flex justify-center items-center min-h-[95vh] px-4">

        <View className="my-20 ">
          <Text className="text-3xl text-white font-primary text-center">
            TERM AND CONDITION
          </Text>
        </View>

        <ScrollView
          // showsVerticalScrollIndicator={false}
          style={{ height: height * 0.1 }}
          className="min-h-50">
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
          containerStyles="w-full"
          textStyles={"font-pbold text-white"}
          isLoading={loading}
        />
      </View>

      <StatusBar backgroundColor="#161622" style="light" />

    </SafeAreaView >
  );
}
