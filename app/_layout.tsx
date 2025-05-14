import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import mobileAds from "react-native-google-mobile-ads";
import LoginProvider from "@/context/LoginProvider";
import CutomSplashScreen from "@/components/CutomSplashScreen";
import "../global.css";

// Keep the native splash until we're ready
// SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "BubblegumSans-Regular": require("../assets/fonts/BubblegumSans-Regular.ttf"),
    "NunitoSans-Regular": require("../assets/fonts/NunitoSans-Regular.ttf"),
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });
  const [isAppReady, setAppReady] = useState(false);

  useEffect(() => {
    // Initialize once at app startup
    mobileAds()
      .initialize()
      .then(() => console.log("AdMob initialized"));

    if (error) throw error;

    if (fontsLoaded) {
      setTimeout(() => {
        setAppReady(true);
        // SplashScreen.hideAsync();
      }, 1000);
    }
  }, [fontsLoaded, error]);

  if (!isAppReady) {
    return <CutomSplashScreen />;
  }

  return (
    <LoginProvider>
      <StatusBar style="light" hidden />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "white" },
          animation: "slide_from_right",
          header: () => null,
          navigationBarHidden: true,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(screens)" />
      </Stack>
      {/* <StatusBar backgroundColor="#161622" style="light" /> */}
    </LoginProvider>
  );
};

export default RootLayout;
