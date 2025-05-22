import {
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { avatars, icons, images } from "@/constants";
import BackgroundImage from "@/components/BackgroundImage";
import { router } from "expo-router";
import HeaderNavigation from "@/components/HeaderNavigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { useFramedAvatarArray } from "@/hooks/useAvatarArray";

const { height, width } = Dimensions.get("window");

export default function Leaderboard() {
  interface User {
    fullName: string;
    score: string;
    avatar: any;
    position: number;
  }
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Track if component is still mounted
    const fetchTopUsers = async (pageNumber: number) => {
      try {
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
      isMounted = false; // Cleanup on unmount
    };
  }, [page]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setLoading(true);
      setPage((prevPage: any) => prevPage + 1);
    }
  };

  if (loading && topUsers.length === 0) return <Text>Loading...</Text>;
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

      <Text className="text-white text-2xl font-primary font-bold text-center">
        {/* {t("settings.settings")} */}
        LEADERBOARD
      </Text>

      <View className="m-2">
        {/* Top 3 Section */}

        <View className="w-full relative items-center">
          {/* Background with tapered middle */}
          <View
            className="w-full rounded-t-[40px] pb-8 pt-6 flex-row justify-between items-end px-4"
            style={{
              borderBottomLeftRadius: 80,
              borderBottomRightRadius: 80,
              height: 180,
              transform: [{ scaleY: 0.9 }],
            }}
          >
            <Image
              source={images.leaderboard}
              className="absolute w-full h-full rounded-2xl my-2"
              style={{ height: height * 0.24, width: width * 0.96 }}
              resizeMode="cover"
              blurRadius={0.5}
            />
            {/* Wizard 2 */}
            <View className="items-center w-1/4 -mt-4">
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
                  <Text className="text-white text-sm mt-2">
                    {topUsers.find((p) => p.position === 2)?.fullName}
                  </Text>
                  <Text className="text-white text-sm font-bold">
                    {topUsers.find((p) => p.position === 2)?.score}
                  </Text>
                </>
              )}
            </View>

            {/* Wizard 1 (center) */}
            <View className="items-center w-1/3 -mb-8">
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
                  <Text className="text-white text-base mt-2 font-semibold">
                    {topUsers.find((p) => p.position === 1)?.fullName}
                  </Text>
                  <Text className="text-white text-lg font-extrabold">
                    {topUsers.find((p) => p.position === 1)?.score}
                  </Text>
                </>
              )}
            </View>

            {/* Wizard 3 */}
            <View className="items-center w-1/4 -mt-4">
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
                  <Text className="text-white text-sm font-bold">
                    {topUsers.find((p) => p.position === 3)?.score}
                  </Text>
                </>
              )}
            </View>
          </View>
          {/* </ImageBackground> */}
        </View>

        {/* Scrollable List */}
        <ScrollView
          // className="min-h-[80vh]"
          style={{ height: height * 0.48 }}
          // contentContainerStyle={{ paddingBottom: 90 }}
        >
          {topUsers.slice(3).map((player, index) => (
            <View
              key={index}
              className="flex-row items-center justify-between border-t border-yellow-300 rounded-none mx-4 px-4 py-4 mb-2"
            >
              <View className="flex-row items-center gap-x-6">
                <Text className="text-white font-bold">{index + 4}</Text>
                <Image
                  source={
                    useFramedAvatarArray(player.avatar) || avatars.asianMaleF
                  }
                  className="w-12 h-12 rounded-full"
                />
                <Text className="text-white">{player.fullName}</Text>
              </View>
              <Text className="text-yellow-300 font-semibold">
                {player.score}
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
