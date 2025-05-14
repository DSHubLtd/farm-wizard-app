import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Image, BackHandler, ToastAndroid, Platform } from "react-native";
import { icons, images } from "../../constants";
import { router, useFocusEffect } from "expo-router";
import HeaderNavigation from "@/components/HeaderNavigation";
import { CustomButton } from "../../components";
import BackgroundImage from "../../components/BackgroundImage";
import { useLoginContext } from "../../context/LoginProvider";
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import InterstitialAdComponent from '../../utils/InterstitialAdComponent';


export default Home = () => {

  const { user } = useLoginContext();
  if (!user) {
    router.replace('/');
  }

  const isPremiumUser = user?.isPremium === true;
  // const isPremiumUser = ['pro', 'vip'].includes(user?.subscriptionLevel);
  // const isPremiumUser = new Date(user?.premiumUntil) > new Date();
  // const [showAd, setShowAd] = useState(true);
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
    <View className="flex-1 relative bg-green-200 items-center justify-start">

      {/* Background Image */}
      <Image
        source={images.background1}
        className="absolute w-full h-full"
        resizeMode="cover"
        blurRadius={0.5}
      />

      {/* {showAd && (
        <InterstitialAdComponent
          onClose={() => {
            setShowAd(false); // Hide the component after ad closes
            console.log('Ad finished!');
          }}
        />
      )} */}

      {/* {!isPremiumUser && <AdBanner />} */}

      {/* Top Buttons */}
      <HeaderNavigation
        onLeftPress={() => router.push("/(screens)/settings")}
        onRightPress={() => router.push("/(screens)/inventory")}
        leftIcon={icons.profile}
        rightIcon={icons.bell}
        showLeftButton={true}
        showRightButton={true}
      />

      <View className="flex-1 justify-center items-center">
        {/* Wizard Image */}
        <Image
          source={images.logo}
          resizeMode="contain"
          className="w-[250px] h-[250px]"
        />

        {/* Play Button */}

        <CustomButton
          title="Play"
          handlePress={() => router.push('/(screens)/selectSeed')}
          containerStyles="w-[200px]"
          textStyles={"font-pbold text-white"}
          isLoading={false}
        />
      </View>

      {!isPremiumUser &&
        <BannerAd
          unitId={TestIds.BANNER}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdFailedToLoad={(error) => console.error(error)}
        />
      }

    </View>
  );
};

