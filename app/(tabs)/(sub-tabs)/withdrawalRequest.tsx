import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import { avatars, icons, images } from "@/constants";
import BackgroundImage from "@/components/BackgroundImage";
import { router } from "expo-router";
import HeaderNavigation from "@/components/HeaderNavigation";
import axios from "axios";
import { useFramedAvatarArray } from "@/hooks/useAvatarArray";
import { BlurView } from "expo-blur";
import { CustomButton } from "@/components";
import { API_BASE } from "@/config/client";

const { height, width } = Dimensions.get("window");

export default function WithdrawalRequest() {
  interface Withdrawal {
    userId: User;
    createdAt: string;
    status: string;
    destination: string;
    withdrawType: string;
    provider: string;
    amount: number;
  }
  interface User {
    fullName: string;
    score: string;
    avatar: any;
    position: number;
  }
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Withdrawal>();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true; // Track if component is still mounted
    const fetchWithdrawals = async (pageNumber: number) => {
      try {
        const response = await axios.get(`${API_BASE}/api/v1/withdrawal/all`, {
          params: { page: pageNumber, limit: 50 },
        });
        const withdrawals = response.data;

        // Check if there are more users to load
        if (withdrawals.length < 100) {
          setHasMore(false);
        }

        if (isMounted) {
          setWithdrawals((prevUsers: any) => [...prevUsers, ...withdrawals]);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchWithdrawals(page);

    return () => {
      isMounted = false; // Cleanup on unmount
    };
  }, [page]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setLoading(true);
      setPage((prevPage: any) => prevPage + 1);
    }
  };

  const openModal = (item: Withdrawal) => {
    setSelectedItem(item);
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedItem(undefined);
    });
  };

  if (loading && withdrawals.length === 0) return <Text>Loading...</Text>;
  // if (error) return <View>Error fetching users: {error}</View>;

  return (
    <View className="flex-1 bg-green-200">
      <BackgroundImage
        source={images.background}
        style={{ width: "100%", height: "100%", position: "absolute" }}
      />

      <HeaderNavigation
        onLeftPress={() => router.push("/(tabs)/home")}
        onRightPress={() => null}
        leftIcon={icons.back}
        rightIcon={icons.settings}
        showLeftButton={true}
        showRightButton={false}
      />

      <Text className="text-white text-2xl font-primary font-bold text-center mb-6">
        {/* {t("settings.settings")} */}
        WITHDRAWAL REQUEST
      </Text>

      <View className="m-2">
        {/* Scrollable List */}
        <ScrollView style={{ height: height * 0.69 }}>
          {withdrawals.map((withdrawal, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row items-center justify-between border-b border-white rounded-none mx-4 px-4 py-2 mb-2"
              onPress={() => openModal(withdrawal)}
            >
              <View className="flex-row justify-center items-center gap-x-6">
                <Text className="text-white font-bold">{index + 1}</Text>
                <Image
                  source={
                    useFramedAvatarArray(withdrawal?.userId.avatar) ||
                    avatars.africanMaleF
                  }
                  className="w-16 h-16 rounded-full"
                />
                <Text className="text-white font-bold ml-6">
                  {withdrawal.userId.fullName}
                </Text>
              </View>
              <Text className="text-yellow-300 font-semibold">
                {withdrawal.amount}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {hasMore && (
          <TouchableOpacity
            className="btn btn-info"
            onPress={handleLoadMore}
            disabled={loading}
          >
            <Text className="my-1 text-white text-center">
              {loading ? "Loading..." : "Load More"}
            </Text>
          </TouchableOpacity>
        )}
        {/* {!hasMore && (
          <Text className="my-1 text-white text-center">
            No more users to load.
          </Text>
        )} */}
      </View>

      {/* Popup Modal */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <TouchableWithoutFeedback onPress={closeModal}>
          <BlurView
            intensity={50}
            tint="dark"
            className="flex-1 items-center justify-center"
          >
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              }}
              className="bg-[#78693985] rounded-3xl w-[80%] p-2 items-center border border-yellow-300"
            >
              <TouchableWithoutFeedback onPress={() => {}}>
                <View className="bg-[#857f6e85] rounded-2xl p-8 flex justify-center items-center">
                  <Image
                    source={
                      useFramedAvatarArray(selectedItem?.userId.avatar) ||
                      avatars.africanMale
                    }
                    className="w-40 h-40 rounded-full"
                  />

                  <Text className="text-lg text-white font-bold text-center">
                    {selectedItem?.userId.fullName}
                  </Text>

                  <View className="flex-col items-center my-2">
                    <Text className="text-white font-semibold">Amount</Text>
                    <Text className="text-white font-bold">
                      {selectedItem?.amount}
                    </Text>
                  </View>

                  <View className="flex-col items-center my-2">
                    <Text className="text-white font-semibold">
                      Withdrawal Type
                    </Text>
                    <Text className="text-white font-bold">
                      {selectedItem?.withdrawType}
                    </Text>
                  </View>

                  <View className="flex-col items-center my-2">
                    <Text className="text-white font-semibold">Provider</Text>
                    <Text className="text-white font-bold">
                      {selectedItem?.provider}
                    </Text>
                  </View>

                  <View className="flex-col items-center my-2">
                    <Text className="text-white font-semibold">
                      Destination
                    </Text>
                    <Text className="text-white font-bold">
                      {selectedItem?.destination}
                    </Text>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Animated.View>
            <CustomButton
              title="Process Payment"
              handlePress={() => console.log("Hi")}
              containerStyles="w-[150px]"
              textStyles={"font-pbold text-white"}
              isLoading={false}
            />
          </BlurView>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
