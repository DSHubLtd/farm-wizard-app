import { useCallback, useEffect, useRef, useState } from "react";
import { View, Image, BackHandler, ToastAndroid, Platform, TouchableOpacity, Modal, Text, Dimensions, ScrollView, TouchableWithoutFeedback } from "react-native";
import { icons, images } from "../../constants";
import { router, useFocusEffect } from "expo-router";
import HeaderNavigation from "@/components/HeaderNavigation";
import RewardModal from "@/components/RewardModal";
import { CustomButton } from "../../components";
import { useLoginContext } from "../../context/LoginProvider";
import { BlurView } from "expo-blur";
import RewardedAdComponent from '../../utils/RewardedAdComponent';
import { useFramedAvatarArray } from "../../hooks/useAvatarArray";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";


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
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showNotifcation, setShowNotification] = useState(false);
  const [backPressedOnce, setBackPressedOnce] = useState(false);
  const timeoutRef = useRef(null);

  const { t } = useTranslation();

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
  const handlsShowNotifcation = () => {
    setShowNotification(!showNotifcation);
  };

  const fetchNotification = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");

    if (token !== null) {
      setLoading(true);
      try {
        const res = await fetch(
          `https://farm-wizard-api.onrender.com/api/v1/notification/all/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `JWT ${token}`,
            },
          }
        );
        const json = await res.json();
        setNotifications(json.notifications);
      } catch (err) {
        console.error("notifcations fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchNotification();
  }, []);
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
        onLeftPress={() => router.push("/(tabs)/(sub-tabs)/settings")}
        onRightPress={handlsShowNotifcation}
        leftIcon={useFramedAvatarArray(user.avatar || 0)}
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
          source={images.logoLg}
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

      <RewardModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      <Modal transparent visible={showNotifcation} animationType="fade">
        <TouchableWithoutFeedback onPress={handlsShowNotifcation}>
          <View style={{ flex: 1 }}>
            <BlurView
              intensity={50}
              tint="dark"
              style={{
                position: 'absolute',
                top: 40, // adjust as needed
                right: 20, // adjust as needed
                width: '80%',
                borderRadius: 20,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  borderRadius: 16,
                  padding: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 5,
                  // maxHeight: '80%',
                }}
              >
                <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
                  {notifications?.map((notification, index) => (
                    <View
                      key={index}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: 12,
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        marginBottom: 8,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: '#fff' }}>{index + 1}. </Text>
                        <Text style={{ color: '#fff' }}>{notification.message} on </Text>
                      </View>
                      <Text style={{ color: '#FCD34D', fontWeight: '600' }}>
                        {(new Date(notification.createdAt)).toString()}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </BlurView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>


    </View>
  );
};

