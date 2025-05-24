import {
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { avatars, icons, images } from "@/constants";
import BackgroundImage from "@/components/BackgroundImage";
import { router } from "expo-router";
import HeaderNavigation from "@/components/HeaderNavigation";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useFramedAvatarArray } from "@/hooks/useAvatarArray";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "expo-router";

const { height, width } = Dimensions.get("window");

interface User {
  fullName: string;
  score: string;
  avatar: any;
  position: number;
}
export default function Leaderboard() {
  const { t } = useTranslation();

  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true; // Track if component is still mounted

      const fetchTopUsers = async (pageNumber: number) => {
        try {
          setLoading(true);
          setTopUsers([]);
          setHasMore(true);
          setPage(1);
          setError(null);

          const response = await axios.get(
            `https://farm-wizard-api.onrender.com/api/v1/leaderboard/all`,
            {
              params: { page: pageNumber, limit: 50 },
            }
          );
          const newUsers = response.data;

          // Check if there are more users to load
          if (newUsers.length < 100) {
            setHasMore(false);
          }

          if (isMounted) {
            setTopUsers((prevUsers: any) => [...prevUsers, ...newUsers]);
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

      fetchTopUsers(page);

      return () => {
        isMounted = false; // Cleanup on unfocus
      };
    }, [page])
  );

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setLoading(true);
      setPage((prevPage: any) => prevPage + 1);
    }
  };

  if (loading && topUsers.length === 0)
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  // if (error) return <View>Error fetching users: {error}</View>;

  return (
    <View className="flex-1 bg-green-200">
      <BackgroundImage
        source={images.bgDry}
        style={{ width: "100%", height: "100%", position: "absolute" }}
        blurRadius={0.5}
      />

      <HeaderNavigation
        onLeftPress={() => router.push("/(tabs)/home")}
        onRightPress={() => null}
        leftIcon={icons.back}
        rightIcon={icons.settings}
        showLeftButton={true}
        showRightButton={false}
      />

      <Text className="text-white text-2xl font-primary text-center">
        {t("menu.leaderboard")}
      </Text>

      <Text
        className="text-center text-xl px-2 my-6 font-secondary"
        style={{
          color: "#fff",
          textAlign: "center",
          paddingHorizontal: 10,
        }}
      >
        {t("messages.leaderboard")}
      </Text>

      <View className="m-2">
        {/* Top 3 Section */}

        <View className="w-full relative items-center mb-1">
          {/* Background with tapered middle */}
          <View
            className="w-full rounded-t-[40px] pb-8 pt-3 flex-row justify-between items-end px-10"
            style={{
              borderBottomLeftRadius: 80,
              borderBottomRightRadius: 80,
              height: 180,
              transform: [{ scaleY: 0.9 }],
            }}
          >
            {/* <Image
              source={images.leaderboard}
              className="absolute w-full h-full rounded-2xl my-2"
              style={{ height: height * 0.24, width: width * 0.96 }}
              resizeMode="cover"
              blurRadius={0.5}
            /> */}
            {/* Wizard 2 */}
            <View className="items-center w-1/4 -mb-8">
              {topUsers.find((p) => p.position === 2) && (
                <>
                  <Image
                    source={images.leaderboard2}
                    className="w-16 h-16 absolute -top-10 z-10"
                    resizeMode="contain"
                  />
                  <Image
                    source={
                      useFramedAvatarArray(
                        topUsers.find((p) => p.position === 2)?.avatar
                      ) || avatars.africanMaleF
                    }
                    className="w-20 h-20 rounded-full"
                  />
                  <Text className="text-white text-lg mt-2 font-primary">
                    {topUsers.find((p) => p.position === 2)?.fullName}
                  </Text>
                  <Text className="text-[#FFDF76] text-lg font-primary">
                    {topUsers.find((p) => p.position === 2)?.score} pts
                  </Text>
                </>
              )}
            </View>

            {/* Wizard 1 (center) */}
            <View className="items-center w-1/3 -mt-4">
              {topUsers.find((p) => p.position === 1) && (
                <>
                  <Image
                    source={images.leaderboard1}
                    className="w-18 h-16 absolute -top-10 z-10"
                    resizeMode="contain"
                  />
                  <Image
                    source={
                      useFramedAvatarArray(
                        topUsers.find((p) => p.position === 1)?.avatar
                      ) || avatars.africanMaleF
                    }
                    className="w-28 h-28 rounded-full"
                  />
                  <Text className="text-white text-base mt-2 font-secondary">
                    {topUsers.find((p) => p.position === 1)?.fullName}
                  </Text>
                  <Text className="text-[#FFDF76] text-lg font-primary">
                    {topUsers.find((p) => p.position === 1)?.score} pts
                  </Text>
                </>
              )}
            </View>

            {/* Wizard 3 */}
            <View className="items-center w-1/4 -mb-8">
              {topUsers.find((p) => p.position === 3) && (
                <>
                  <Image
                    source={images.leaderboard3}
                    className="w-16 h-16 absolute -top-10 z-10"
                    resizeMode="contain"
                  />
                  <Image
                    source={
                      useFramedAvatarArray(
                        topUsers.find((p) => p.position === 3)?.avatar
                      ) || avatars.africanMaleF
                    }
                    className="w-20 h-20 rounded-full"
                  />
                  <Text className="text-white text-sm mt-2">
                    {topUsers.find((p) => p.position === 3)?.fullName}
                  </Text>
                  <Text className="text-[#FFDF76] text-lg font-primary">
                    {topUsers.find((p) => p.position === 3)?.score} pts
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Scrollable List */}
        <ScrollView
          // className="min-h-[80vh]"
          style={{ height: height * 0.44 }}
          // contentContainerStyle={{ paddingBottom: 90 }}
        >
          {topUsers.slice(3).map((player, index) => (
            <View
              key={index}
              className="flex-row items-center justify-between border-b border-yellow-300 rounded-none mx-4 px-4 py-2 mb-2"
            >
              <View className="flex-row items-center gap-x-8 font-secondary">
                <Text className="text-white font-secondary">{index + 4}</Text>
                <Image
                  source={
                    useFramedAvatarArray(player.avatar) || avatars.asianMaleF
                  }
                  className="w-16 h-16 rounded-full"
                />
                <Text className="text-white text-lg font-primary">
                  {player.fullName}
                </Text>
              </View>
              <Text className="text-[#FFDF76] text-lg font-primary">
                {player.score} pts
              </Text>
            </View>
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
    </View>
  );
}
