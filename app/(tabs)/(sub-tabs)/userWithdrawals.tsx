import { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
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

  if (loading && withdrawals.length === 0)
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );

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

      <Text className="text-white text-2xl font-primary text-center mb-1">
        My Takeout Requests
      </Text>
      <Text className="text-white/60 text-xs text-center mb-3">
        Tap a pending request to view its details
      </Text>

      {withdrawals.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-3">📭</Text>
          <Text className="text-white/80 text-center font-psemibold text-base">
            No takeout requests yet
          </Text>
          <Text className="text-white/60 text-center text-sm mt-1">
            Your claim requests will appear here once you make one.
          </Text>
        </View>
      ) : (
        <View className="flex-1 px-4">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {withdrawals.map((withdrawal, index) => {
              const pending = withdrawal.status === "Request";
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.85}
                  onPress={() => openWithdrawal(withdrawal)}
                  className="bg-black/30 rounded-2xl p-4 mb-3"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-3">
                      <Text className="text-white font-pbold text-lg">
                        {withdrawal.amount.toFixed(2)}{" "}
                        <Text className="text-white/70 text-sm font-pregular">
                          WZP
                        </Text>
                      </Text>
                      <Text className="text-white/70 text-xs mt-1">
                        {formatDate(withdrawal.createdAt)}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="text-white/50 text-xs mt-0.5"
                      >
                        Ref: {withdrawal.reference}
                      </Text>
                    </View>
                    <View
                      className={`px-3 py-1 rounded-full ${
                        pending ? "bg-amber-500" : "bg-green-600"
                      }`}
                    >
                      <Text className="text-white text-xs font-pbold">
                        {pending ? "Pending" : "Completed"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            {hasMore ? (
              <TouchableOpacity
                className="bg-buttonColor rounded-xl py-3 mt-1"
                onPress={handleLoadMore}
                disabled={loading}
              >
                <Text className="text-white text-center font-pbold">
                  {loading ? "Loading…" : "Load more"}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text className="text-white/50 text-center text-xs mt-2">
                No more requests to load.
              </Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
