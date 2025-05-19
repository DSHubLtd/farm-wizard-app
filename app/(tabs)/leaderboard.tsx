import { View, Text, Image, ScrollView, Dimensions } from "react-native";
import { avatars, icons, images } from "@/constants";
import BackgroundImage from "@/components/BackgroundImage";
import { router } from "expo-router";
import HeaderNavigation from "@/components/HeaderNavigation";

const { height } = Dimensions.get("window");

const players = [
  {
    name: "wizard 1",
    score: "99999999",
    avatar: avatars.africanFmale,
  },
  {
    name: "wizard 2",
    score: "99999999",
    avatar: avatars.asianFmale,
  },
  {
    name: "wizard 3",
    score: "99999999",
    avatar: avatars.africanMale,
  },
  {
    name: "wizard 4",
    score: "99999999",
    avatar: avatars.africanMale,
  },
  {
    name: "wizard 5",
    score: "99999999",
    avatar: avatars.africanMale,
  },
  {
    name: "wizard 6",
    score: "99999999",
    avatar: avatars.africanMale,
  },
  {
    name: "wizard 7",
    score: "99999999",
    avatar: avatars.africanMale,
  },
  {
    name: "wizard 8",
    score: "99999999",
    avatar: avatars.africanMale,
  },
  {
    name: "wizard 9",
    score: "99999999",
    avatar: avatars.africanMale,
  },
];

export default function Leaderboard() {
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
        <View
          className="bg-[#AC9B44] rounded-t-[40px] rounded-b-[80px] px-6 pb-10 py-8 my-8 flex-row justify-between items-end w-full"
          style={{
            borderBottomLeftRadius: 180,
            borderBottomRightRadius: 180,
            height: 180,
            transform: [{ scaleY: 1.2 }],
          }}
        >
          {players.slice(0, 3).map((player, i) => (
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
              <Image
                source={player.avatar}
                className="w-16 h-16 rounded-full border-4 border-yellow-400"
              />
              <Text className="text-white text-sm font-semibold">
                {player.name}
              </Text>
              <Text className="text-white text-xs">{player.score}</Text>
            </View>
          ))}
          {/* </View> */}
        </View>

        {/* Scrollable List */}
        <ScrollView
          className="min-h-[100vh]"
          style={{ height: height * 0.4 }}
          // contentContainerStyle={{ paddingBottom: 90 }}
        >
          {players.slice(3).map((player, index) => (
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
                <Text className="text-white">{player.name}</Text>
              </View>
              <Text className="text-yellow-300 font-semibold">
                {player.score}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
