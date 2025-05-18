import { useCallback, useRef, useState } from "react";
import { View, Image, BackHandler, ToastAndroid, Platform, TouchableOpacity, Modal, Text, Dimensions } from "react-native";
import { icons, images } from "../../constants";
import { router, useFocusEffect } from "expo-router";
import HeaderNavigation from "@/components/HeaderNavigation";
import { CustomButton } from "../../components";
import { useLoginContext } from "../../context/LoginProvider";
import { BlurView } from "expo-blur";
import RewardedAdComponent from '../../utils/RewardedAdComponent';
import { useAvatarArray } from "../../hooks/useAvatarArray";
import { useTranslation } from "react-i18next";
const { width } = Dimensions.get("window");


export default Home = () => {
  const { user } = useLoginContext();
  if (!user) {
    router.replace('/');
  }
  const isPremiumUser = user?.isPremium === true;
  // const isPremiumUser = ['pro', 'vip'].includes(user?.subscriptionLevel);
  // const isPremiumUser = new Date(user?.premiumUntil) > new Date();
  // const [showAd, setShowAd] = useState(true);
  const [showAd, setShowAd] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
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
  const openModal = () => {
    setModalVisible(true);
    // Animated.timing(fadeAnim, {
    //   toValue: 1,
    //   duration: 300,
    //   useNativeDriver: true,
    // }).start();
  };
  const { t } = useTranslation();
  return (
    <View className="flex-1 relative bg-green-200 items-center justify-start">

      {/* Background Image */}
      <Image
        source={images.background1}
        className="absolute w-full h-full"
        resizeMode="cover"
        blurRadius={0.5}
      />

      {/* {!isPremiumUser && <AdBanner />} */}

      {/* Top Buttons */}
      <HeaderNavigation
        onLeftPress={() => router.push("/(screens)/settings")}
        onRightPress={() => router.push("/(screens)/inventory")}
        leftIcon={useAvatarArray(user.avatar || 0)}
        rightIcon={icons.bell}
        showLeftButton={true}
        showRightButton={true}
      />

      <View className="w-full px-5 flex-row justify-between items-center mt-10">
        <TouchableOpacity></TouchableOpacity>
        <TouchableOpacity
          className="w-10 h-10 bg-white/30 rounded-full items-center justify-center"
          onPress={openModal}
        >
          <Image source={images.adsBadge} className="w-20 h-20" />
        </TouchableOpacity>
      </View>

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

      {showAd && !isPremiumUser &&
        <RewardedAdComponent
          onRewardEarned={(reward) => {
            console.log('User earned:', reward);
            setShowAd(false);
            // Unlock feature or give coins here
          }}
          onClose={() => {
            console.log('Ad closed');
          }}
        />
      }

      <Modal transparent visible={modalVisible} animationType="fade">
        <BlurView
          intensity={50}
          tint="dark"
          className="flex-1 items-center justify-center"
        >
          <View
            className="bg-black/40 rounded-2xl w-[100%] h-[100%] p-2 items-center shadow-2xl"
          >
            <View className="w-full items-end my-20">
              <TouchableOpacity
                className="bg-yellow-300 rounded-full items-center justify-center w-20 h-20"
                onPress={() => setModalVisible(false)}
              >
                <Image source={icons.close} className="w-10 h-10" />
              </TouchableOpacity>
            </View>
            <Image
              source={images.adsBadge}
              style={{
                width: width * 0.5,
                height: width * 0.5,
              }}
              resizeMode="contain"
            />

            <Text className="text-white text-xl text-center mb-6">
              {t("messages.watch_ads")}
            </Text>

            <View className="flex-row justify-center items-center">
              <TouchableOpacity
                className="bg-buttonColor flex-row rounded-xl items-center justify-center p-4 m-2"
                onPress={() => setShowAd(true)}
              >
                <Image source={icons.play} className="w-10 h-10 mr-2" />
                <Text className="text-white text-lg">Watch Ads</Text>
              </TouchableOpacity>
            </View>

          </View>
        </BlurView>
      </Modal>

    </View>
  );
};

