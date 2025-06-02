import { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import { avatars, icons, images } from "@/constants";
import BackgroundImage from "@/components/BackgroundImage";
import { router, useFocusEffect } from "expo-router";
import HeaderNavigation from "@/components/HeaderNavigation";
import axios from "axios";
import { API_BASE } from "@/config/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatDate } from "@/utils/formatDate";

const { height, width } = Dimensions.get("window");

export default function UserWithdrawals() {
  interface Withdrawal {
    userId: User;
    createdAt: string;
    status: string;
    destination: string;
    withdrawType: string;
    provider: string;
    amount: number;
    reference: string;
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

  useFocusEffect(
    useCallback(() => {
      let isMounted = true; // Track if component is still mounted
      const fetchWithdrawals = async (pageNumber: number) => {
        const token = await AsyncStorage.getItem("token");

        if (token !== null) {
          try {
            setLoading(true);
            setWithdrawals([]);
            setHasMore(true);
            setPage(1);
            setError(null);
            const response = await axios.get(
              `${API_BASE}/api/v1/withdrawal/user-withdrwals`,
              {
                headers: {
                  Authorization: `JWT ${token}`,
                  "Content-Type": "application/json",
                },

                params: { page: pageNumber, limit: 50 },
              }
            );
            const withdrawals = response.data;
            // console.log("user withdrawals userWithdrawals ", withdrawals);

            // Check if there are more users to load
            if (withdrawals.length < 100) {
              setHasMore(false);
            }

            if (isMounted) {
              setWithdrawals((prevUsers: any) => [
                ...prevUsers,
                ...withdrawals,
              ]);
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
        }
      };

      fetchWithdrawals(page);

      return () => {
        isMounted = false; // Cleanup on unmount
      };
    }, [page])
  );

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setLoading(true);
      setPage((prevPage: any) => prevPage + 1);
    }
  };

  const openWithdrawal = (withdrawal: Withdrawal) => {
    if (withdrawal.status === "Request") {
      router.push({
        pathname: "/(tabs)/(sub-tabs)/requestReceived",
        params: {
          createdAt: withdrawal.createdAt,
          amount: withdrawal.amount,
          reference: withdrawal.reference,
        },
      });
    } else {
      Alert.alert(
        "Info",
        "Withdrawal Processed successfully, If you have any inquery please contact us"
      );
    }
  };

  if (loading && withdrawals.length === 0) return <Text>Loading...</Text>;

  return (
    <View className="flex-1 bg-green-200">
      <BackgroundImage
        source={images.background}
        style={{ width: "100%", height: "100%", position: "absolute" }}
      />

      <HeaderNavigation
        onLeftPress={() => router.push("/(tabs)/(sub-tabs)/claimScreen")}
        onRightPress={() => null}
        leftIcon={icons.back}
        rightIcon={icons.settings}
        showLeftButton={true}
        showRightButton={false}
      />

      <Text className="text-white text-xl font-primary font-bold text-center mb-6">
        {/* {t("settings.settings")} */}
        USER WITHDRAWALS REQUEST LIST
      </Text>

      {withdrawals.length === 0 ? (
        <Text className="text-gray-400 text-center font-semibold">
          You don't have any withdrawal history
        </Text>
      ) : (
        <View className="m-2">
          {/* Scrollable List */}
          <ScrollView style={{ height: height * 0.69 }}>
            {/* Heading */}
            <View className="mx-4 px-4 py-2">
              <View className="flex-row justify-between mt-2">
                <Text className="text-gray-400 font-semibold">#</Text>
                <Text className="text-gray-400 font-semibold">Date</Text>
                <Text className="text-gray-400 font-semibold">Amount</Text>
                <Text className="text-gray-400 font-semibold">Reference</Text>
                {/* <Text className="text-gray-400 font-semibold">Destination</Text>
              <Text className="text-gray-400 font-semibold">Type</Text>
              <Text className="text-gray-400 font-semibold">Provider</Text>
               */}
              </View>
            </View>
            {withdrawals.map((withdrawal, index) => (
              <TouchableOpacity
                key={index}
                className={`flex-row items-center justify-between border-b border-white rounded-none mx-4 px-4 py-2 mb-2
                
                ${withdrawal.status === "Request" ? "bg-red-500" : ""} `}
                onPress={() => openWithdrawal(withdrawal)}
              >
                <View className="flex-row justify-center items-center gap-x-6">
                  <Text className="text-white font-bold">{index + 1}</Text>

                  <Text className="text-white font-bold ml-6">
                    {formatDate(withdrawal.createdAt)}
                  </Text>
                </View>
                <Text className="text-yellow-300 font-semibold">
                  {withdrawal.amount.toFixed(2)}
                </Text>
                <Text className={`text-yellow-300 font-semibold`}>
                  {withdrawal.reference}
                </Text>
                {/* <Text className="text-yellow-300 font-semibold">
                {withdrawal.destination}
              </Text>
              <Text className="text-yellow-300 font-semibold">
                {withdrawal.withdrawType}
              </Text>
              <Text className="text-yellow-300 font-semibold">
                {withdrawal.provider}
              </Text>
              */}
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
          {!hasMore && (
            <Text className="my-1 text-white text-center">
              No more details to load.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
