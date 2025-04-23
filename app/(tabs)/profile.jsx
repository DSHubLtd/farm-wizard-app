import { View, Text, Image, TouchableOpacity } from "react-native";
import { icons, images } from "../../constants";
import { router } from "expo-router";

const Profile = () => {

    return (
        <View className="flex-1 relative bg-green-200 items-center justify-start">

            {/* Background Image */}
            <Image
                source={images.background1}
                className="absolute w-full h-full"
                resizeMode="cover"
            // blurRadius={1}
            />

            {/* Top Buttons */}
            <View className="w-full px-5 mt-12 flex-row justify-between items-center">
                <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center"
                    onPress={() => router.push("/(screens)/settings")}>

                    <Image
                        source={icons.profile}
                        className="w-15 h-15"
                        tintColor="white"
                        resizeMode="contain"
                    />
                </TouchableOpacity>

                <TouchableOpacity className="w-12 h-12 rounded-full items-center justify-center shadow-md">
                    <Image
                        source={icons.bell}
                        className="w-15 h-15"
                        tintColor="white"
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            </View>

            {/* Wizard Image */}
            <View className="flex flex-row justify-center">
                <Image
                    source={images.logo}
                    resizeMode="contain"
                    className="w-[250px] h-[250px] mt-56"
                />
            </View>

            {/* Title */}
            {/* <Text className="text-white text-3xl font-extrabold mt-4 tracking-wider text-center">
        Farm{"\n"}Wizard
      </Text> */}

            {/* Play Button */}
            <TouchableOpacity className="mt-5 px-10 py-3 bg-yellow-400 rounded-md shadow-md border border-white/50">
                <Text className="text-white font-semibold text-base">Play</Text>
            </TouchableOpacity>


            {/* <View className="absolute bottom-20 w-full  justify-center ">
        <View className="flex justify-end items-center">
          <TouchableOpacity className="w-14 h-14 bg-white/30 rounded-full items-center justify-center shadow-md">
            <Image
              source={images.hat}
              className="w-16 h-16 tint-white"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <View className="flex justify-end items-end mr-2">

          <TouchableOpacity className="w-14 h-14 bg-white/30 rounded-full items-center justify-center shadow-md my-10">
            <Image
              source={images.stats}
              className="w-6 h-6 tint-white"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

      </View> */}

        </View>
    );
};

export default Profile;
