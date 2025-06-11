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
  Alert,
  ActivityIndicator,
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
import AsyncStorage from "@react-native-async-storage/async-storage";

const { height, width } = Dimensions.get("window");

export default function WithdrawalRequest() {
  interface Withdrawal {
    _id: string;
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
  const [processedWithdrawals, setProcessedWithdrawals] = useState<
    Withdrawal[]
  >([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Withdrawal>();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchWithdrawals = async (pageNumber: number) => {
    setWithdrawals([]);
    setPage(1);
    try {
      const response = await axios.get(`${API_BASE}/api/v1/withdrawal/all`, {
        params: { page: pageNumber, limit: 100 },
      });
      const withdrawals = response.data;

      if (withdrawals.length < 100) {
        setHasMore(false);
      }

      setWithdrawals((prevUsers: any) => [...prevUsers, ...withdrawals]);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProcessedWithdrawals = async (pageNumber: number) => {
    setProcessedWithdrawals([]);
    setPage(1);
    try {
      const response = await axios.get(
        `${API_BASE}/api/v1/withdrawal/processed`,
        {
          params: { page: pageNumber, limit: 100 },
        }
      );
      const processedWithdrawals = response.data;

      if (processedWithdrawals.length < 100) {
        setHasMore(false);
      }

      setProcessedWithdrawals((prevUsers: any) => [
        ...prevUsers,
        ...processedWithdrawals,
      ]);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true; // Track if component is still mounted

    if (isMounted) {
      fetchWithdrawals(page);
      fetchProcessedWithdrawals(page);
    }

    return () => {
      isMounted = false; // Cleanup on unmount
    };
  }, [page]);

  const refetchWithdrawals = () => {
    setLoading(true);
    fetchWithdrawals(page);
    fetchProcessedWithdrawals(page);
  };

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

  const handleProcessWithdrawal = async () => {
    if (!selectedItem) {
      Alert.alert("Error", "Please select an item and continue");
      return;
    }
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      console.warn("Missing token or plant name. Aborting save.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(
        `${API_BASE}/api/v1/withdrawal/admin-process-withdrawal`,
        {
          method: "POST",
          headers: {
            Authorization: `JWT ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ withdrawId: selectedItem._id }),
        }
      );
      const json = await res.json();
      // console.log("json ", json);
      Alert.alert("Success", "Withdrawl Processed successfully!");
      closeModal();
      refetchWithdrawals();
    } catch (err) {
      console.error("Failed to process withdrawal", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && withdrawals.length === 0)
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
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

      <Text className="text-white text-2xl font-primary font-bold text-center mb-2">
        {/* {t("settings.settings")} */}
        WITHDRAWAL REQUEST
      </Text>

      <View className="m-2">
        {/* Scrollable List */}
        <ScrollView style={{ height: height * 0.5 }}>
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
        <Text className="my-1 text-white text-center">
          Processed Withdrawals
        </Text>
        <ScrollView style={{ height: height * 0.4 }}>
          {processedWithdrawals.map((withdrawal, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row items-center justify-between border-b border-white rounded-none mx-4 px-4 py-2 mb-2"
              onPress={() =>
                Alert.alert("Success", " Already Processed successfull")
              }
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
              handlePress={handleProcessWithdrawal}
              containerStyles="w-[150px]"
              textStyles={"font-pbold text-white"}
              isLoading={isSubmitting}
            />
          </BlurView>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
