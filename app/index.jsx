import { useCallback, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { BackHandler, Dimensions, Platform, ScrollView, Text, ToastAndroid, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, router, useFocusEffect } from "expo-router";

import CustomButton from "../components/CustomButton";

import { images } from "../constants";
import { useLoginContext } from "../context/LoginProvider";
import BackgroundImage from "../components/BackgroundImage";
import { useTranslation } from "react-i18next";
import TermsContent from "../components/TermsContent";
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
  const { t } = useTranslation();

  return (
    <SafeAreaView className="bg-primary h-full" edges={['left', 'right', 'bottom']} style={{ flex: 1 }}>
      {/* Background Image */}
      <BackgroundImage source={images.background} />

      <View className="w-full flex justify-center items-center min-h-[95vh] px-4">

        <View className="my-20 ">
          <Text className="text-3xl text-white font-primary text-center">
            {t("settings.terms_and_condition")}
          </Text>
        </View>
        <View style={{ flex: 1, width: '100%', marginBottom: 16, borderRadius: 12, overflow: 'hidden' }}>
          <TermsContent />
        </View>

        <CustomButton
          title={t("buttons.agree_continue")}
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
