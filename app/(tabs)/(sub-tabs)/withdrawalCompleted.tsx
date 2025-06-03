import React, { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";

const { height } = Dimensions.get("window");

// Enable layout animations on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface WithdrawalListProps {
  openModal: (item: any) => void;
}

export default function WithdrawalList({ openModal }: WithdrawalListProps) {
  const [withdrawals, setWithdrawals] = useState<
    { id: number; amount: number; withdrawType: string; createdAt: Date }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all"); // '7d', '30d', 'all'

  const pageSize = 10;

  // Simulate API fetch
  const fetchWithdrawals = async (
    page = 1,
    filter = "all",
    refresh = false
  ) => {
    if (!refresh) setLoading(true);

    setTimeout(() => {
      const fakeAllData = Array.from({ length: 35 }, (_, i) => ({
        id: i + 1,
        amount: (i + 1) * 5,
        withdrawType: i % 2 === 0 ? "Token" : "Fiat",
        createdAt: new Date(Date.now() - i * 86400000), // i days ago
      }));

      // Apply date filter
      let filteredData = fakeAllData;
      if (filter === "7d") {
        filteredData = fakeAllData.filter((item) => {
          const diff =
            (Date.now() - new Date(item.createdAt).getTime()) /
            (1000 * 60 * 60 * 24);
          return diff <= 7;
        });
      } else if (filter === "30d") {
        filteredData = fakeAllData.filter((item) => {
          const diff =
            (Date.now() - new Date(item.createdAt).getTime()) /
            (1000 * 60 * 60 * 24);
          return diff <= 30;
        });
      }

      const paginated = filteredData.slice(0, page * pageSize);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setWithdrawals(
        refresh
          ? paginated
          : [...withdrawals, ...paginated.slice((page - 1) * pageSize)]
      );
      setHasMore(paginated.length < filteredData.length);
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    fetchWithdrawals(1, selectedFilter);
  }, [selectedFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchWithdrawals(1, selectedFilter, true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchWithdrawals(nextPage, selectedFilter);
    }
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: { id: number; amount: number; withdrawType: string; createdAt: Date };
    index: number;
  }) => (
    <TouchableOpacity
      className="flex-row items-center justify-between border-b border-white rounded-none mx-4 px-4 py-2 mb-2"
      onPress={() => openModal(item)}
    >
      <View className="flex-row justify-center items-center gap-x-6">
        <Text className="text-white font-bold">{index + 1}</Text>
        <Text className="text-white font-bold ml-6">{item.amount}</Text>
      </View>
      <Text className="text-yellow-300 font-semibold">{item.withdrawType}</Text>
    </TouchableOpacity>
  );

  const FilterBar = () => (
    <View className="flex-row justify-around bg-black py-2">
      {["all", "7d", "30d"].map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => setSelectedFilter(option)}
        >
          <Text
            className={`font-semibold ${
              selectedFilter === option ? "text-yellow-400" : "text-gray-400"
            }`}
          >
            {option === "all"
              ? "All"
              : option === "7d"
              ? "Last 7 Days"
              : "Last 30 Days"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const Header = () => (
    <View className="bg-black mx-4 px-4 py-2">
      <Text className="text-white font-bold text-lg mb-2">
        Withdrawal History
      </Text>
      <View className="flex-row justify-between">
        <Text className="text-gray-400 font-semibold">#</Text>
        <Text className="text-gray-400 font-semibold">Amount</Text>
        <Text className="text-gray-400 font-semibold">Type</Text>
      </View>
    </View>
  );

  const EmptyComponent = () => (
    <View className="flex-1 justify-center items-center mt-20">
      <Text className="text-gray-400 font-semibold text-center">
        No withdrawals for this period
      </Text>
    </View>
  );

  return (
    <View style={{ height: height * 0.75 }}>
      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FFD700" />
          <Text className="text-white mt-2">Loading withdrawals...</Text>
        </View>
      ) : (
        <>
          <FilterBar />
          <FlatList
            data={withdrawals}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            ListHeaderComponent={Header}
            ListEmptyComponent={EmptyComponent}
            stickyHeaderIndices={[0]}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        </>
      )}
    </View>
  );
}
