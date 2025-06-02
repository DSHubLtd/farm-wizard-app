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
import WebView from "react-native-webview";
import { API_BASE } from "@/config/client";
// import TermsModal from "../components/TermsModal";
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
        <View style={{ flex: 1, backgroundColor: '#fff', width: '100%', height: '100%' }}>
          <WebView
            source={{ uri: `${API_BASE}/terms-and-conditions/T&C.html` }}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            contentMode="mobile"
            scalesPageToFit={Platform.OS === 'android'}
            injectedJavaScript={`
          const style = document.createElement('style');
          style.innerHTML = \`
            * {
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              user-select: none;
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
              font-size: 30px;
              line-height: 1.6;
              padding: 16px;
              background-color: #ffffff;
              color: #333333;
            }
          \`;
          document.head.appendChild(style);
          document.body.style.backgroundColor = 'transparent';
        `}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
            }}
          />
        </View>
        {/* <View style={{ flex: 1, width: '100%', height: '100%' }}>

          <WebView
            source={{ uri: 'https://farm-wizard-api-n68r.onrender.com/terms-and-conditions/T&C.html' }}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            contentMode="mobile"
            scalesPageToFit={false}
            injectedJavaScript={`
              const style = document.createElement('style');
              style.innerHTML = \`
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                  font-size: 12px;
                  padding: 2px;
                  line-height: 1.6;
                  background-color: #fff;
                  color: #000;
                }
              \`;
              document.head.appendChild(style);
            `}
            style={{
              flex: 1,
              marginHorizontal: 16,
              borderWidth: 2,
              borderColor: '#E1CE67',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          />
        </View> */}
        {/* <TermsModal /> */}

        {/* <ScrollView style={{ flex: 1, width: '100%', }}
        // showsVerticalScrollIndicator={false}
        // className="min-h-50"
        >
          <View style={{ paddingVertical: 10, }}> */}
        {/* <Text className="text-lg font-secondary text-gray-50 text-center border-r-4 border-r-[#E1CE67]">
              {t("messages.terms_and_condition_text")}
            </Text> */}

        {/* <WebView
              source={{ uri: 'https://farm-wizard-api-n68r.onrender.com/terms-and-conditions/T&C.html' }}
              style={{ height: height * 0.8 }}
              originWhitelist={['*']}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              // startInLoadingState
              // renderLoading={() => <ActivityIndicator size="large" color="#E1CE67" />}
            />
          </View>
        </ScrollView> */}

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
