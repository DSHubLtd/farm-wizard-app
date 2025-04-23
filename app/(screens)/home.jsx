import { View, Text, Image, TouchableOpacity } from "react-native";
import { icons, images } from "../../constants";
import { router } from "expo-router";
import HeaderNavigation from "@/components/HeaderNavigation";

const HomeScreen = () => {

    return (
        <View className="flex-1 relative bg-green-200 items-center justify-start">

            {/* Background Image */}
            <Image
                source={images.background1}
                className="absolute w-[100vh] h-full"
                resizeMode="contain"
            // blurRadius={1}
            />

            {/* Top Buttons */}
            <HeaderNavigation
                onLeftPress={() => router.push("/(screens)/settings")}
                onRightPress={() => null}
                leftIcon={icons.profile}
                rightIcon={icons.bell}
                showLeftButton={true}
                showRightButton={true}
            />

            <View className="flex-1 justify-center items-center">
                {/* Wizard Image */}
                <Image
                    source={images.logo}
                    resizeMode="contain"
                    className="w-[250px] h-[250px]"
                />

                {/* Play Button */}
                <TouchableOpacity
                    className="mt-5 px-20 py-3 bg-yellow-400 rounded-md shadow-md border border-white/50"
                    onPress={() => router.push('/(screens)/selectSeed')}>
                    <Text className="text-white font-semibold text-base">Play</Text>
                </TouchableOpacity>
            </View>

            {/* Floating Top Icon (maybe top-left or top-right) */}
            <View className="absolute bottom-40 center">
                <TouchableOpacity className="w-12 h-12 bg-white/50 rounded-full items-center justify-center shadow-md">
                    <Image
                        source={icons.bell}
                        className="w-6 h-6 tint-white"
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            </View>

            {/* Floating Bottom-Right Icon */}
            <View className="absolute bottom-16 right-4">
                <TouchableOpacity className="w-12 h-12 bg-white/50 rounded-full items-center justify-center shadow-md">
                    <Image
                        source={icons.bell}
                        className="w-6 h-6 tint-white"
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            </View>



        </View>
    );
};

export default HomeScreen;
