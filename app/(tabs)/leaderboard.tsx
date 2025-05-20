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

const { height } = Dimensions.get("window");

const players = [
  {
    fullName: "wizard 1",
    score: "99999999",
    avatar: avatars.africanFmale,
  },
  {
    fullName: "wizard 2",
    score: "99999999",
    avatar: avatars.asianFmale,
  },
  {
    fullName: "wizard 3",
    score: "99999999",
    avatar: avatars.africanMale,
  },
  {
    fullName: "wizard 4",
    score: "99999999",
    avatar: avatars.africanMale,
  },
  {
    fullName: "wizard 5",
    score: "99999999",
    avatar: avatars.africanMale,
  },
  {
    fullName: "wizard 6",
    score: "99999999",
    avatar: avatars.africanMale,
  },
  {
    fullName: "wizard 7",
    score: "99999999",
    avatar: avatars.africanMale,
  },
  {
    fullName: "wizard 8",
    score: "99999999",
    avatar: avatars.africanMale,
  },
  {
    fullName: "wizard 9",
    score: "99999999",
    avatar: avatars.africanMale,
  },
];

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
        {/* <View
          className="bg-[#AC9B44] rounded-t-[40px] rounded-b-[80px] px-6 pb-10 py-8 my-8 flex-row justify-between items-end w-full"
          style={{
            borderBottomLeftRadius: 180,
            borderBottomRightRadius: 180,
            height: 180,
            transform: [{ scaleY: 1.2 }],
          }}
        >
          {topUsers.slice(0, 3).map((player, i) => (
            <View
              key={i}
              // className={`items-center ${i === 1 ? "scale-110" : "opacity-80"}`}
              style={{
                transform: [{ scale: i === 1 ? 1.8 : 1 }],
                opacity: i === 1 ? 1 : 0.8,
                // marginRight: i === 1 ? 1 : 26,
                // marginLeft: i === 2 ? 1 : 1,
                marginBottom: 20,
              }}
            >
              
              {player.position === 1 && (
                <View>
                  <Image
                    source={player.avatar}
                    className="w-16 h-16 rounded-full border-4 border-yellow-400"
                  />
                  
                </View>
              )}
              {player.position === 2 && (
                <View className="d-flex flex-column justify-content-center align-items-center text-center">
                  <Image
                    source={player.avatar}
                    className="w-16 h-16 rounded-full border-4 border-yellow-400"
                  />
                 
                </View>
              )}
              {player.position === 3 && (
                <View>
                  <Image
                    source={player.avatar}
                    className="w-16 h-16 rounded-full border-4 border-yellow-400"
                  />
                </View>
              )}

              <Text className="text-white text-sm font-semibold">
                {player.fullName}
              </Text>
              <Text className="text-white text-xs">{player.score}</Text>
            </View>
          ))}
        </View> */}

        <View className="w-full relative items-center">
          {/* Background with tapered middle */}
          <View
            className="bg-yellow-400/90 w-full rounded-t-[40px] pb-8 pt-6 flex-row justify-between items-end px-4"
            style={{
              borderBottomLeftRadius: 80,
              borderBottomRightRadius: 80,
              height: 180,
              transform: [{ scaleY: 0.9 }],
            }}
          >
            {/* Wizard 2 */}
            <View className="items-center w-1/4 -mt-4">
              {topUsers.find((p) => p.position === 2) && (
                <>
                  <Image
                    source={
                      topUsers.find((p) => p.position === 2)?.avatar ||
                      avatars.africanMale
                    }
                    className="w-20 h-20 rounded-full border-4 border-green-600"
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
                    source={
                      topUsers.find((p) => p.position === 1)?.avatar ||
                      avatars.africanMale
                    }
                    className="w-28 h-28 rounded-full border-4 border-green-800"
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
                    source={
                      topUsers.find((p) => p.position === 3)?.avatar ||
                      avatars.africanMale
                    }
                    className="w-20 h-20 rounded-full border-4 border-green-600"
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
              className="flex-row items-center justify-between border-t border-b border-white rounded-none mx-4 px-4 py-4 mb-2"
            >
              <View className="flex-row items-center space-x-3">
                <Text className="text-white font-bold">{index + 4}</Text>
                <Image
                  source={player.avatar}
                  className="w-10 h-10 rounded-full"
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
        {!hasMore && (
          <Text className="my-1 text-white text-center">
            No more users to load.
          </Text>
        )}
      </View>
    </View>
  );
}
