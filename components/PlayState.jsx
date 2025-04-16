import { router } from "expo-router";
import { View, Text, Image } from "react-native";

import { images } from "../constants";
import CustomButton from "./CustomButton";

const PlayState = ({ title, subtitle }) => {
    return (
        <View className="flex justify-center items-center px-4">
            <Text className="text-2xl font-pmedium text-gray-100 my-20">{title}</Text>
            <Image
                // source={images.icon}
                src={'https://cdn8.gametop.com/download-free-games/magic-farm/b2.jpg'}
                resizeMode="contain"
                className="w-[270px] h-[216px]"
            />

            <Text className="text-sm text-center font-psemibold text-white mt-6">
                {subtitle}
            </Text>

            <CustomButton
                title="Play"
                handlePress={() => router.push("/farmScreen")}
                containerStyles="w-full my-5"
            />
        </View>
    );
};

export default PlayState;
