import React from "react";
import BackgroundImage from "@/components/BackgroundImage";
import { images } from "@/constants";
import { View, Text, Image, Dimensions } from "react-native";
import { CustomButton } from "../../components";
import { useLocalSearchParams, useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const SessionStarted = () => {
  const { name } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View className="flex-1 bg-green-200 items-center justify-start pt-20">
      {/* Background */}
      <BackgroundImage
        blurRadius={2}
        source={images.bgRainfall}
        style={{
          width: "100%",
          height: "100vh",
          position: "absolute",
        }}
      />

      {/* Title */}
      <Text className="text-white text-3xl font-primary my-10">
        SESSION STARTED
      </Text>

      <View className="items-center my-8 rounded-3xl p-6">
        <Image
          source={images.sessionStarted}
          style={{
            width: width * 0.5,
            height: width * 0.5,
          }}
          resizeMode="contain"
        />

        <Text
          className="text-center text-xl px-2"
          style={{
            color: "#fff",
            textAlign: "center",
            paddingHorizontal: 10,
          }}
        >
          Welcome back, Wizard! The fields await your touch — sprouts are
          stirring, and magic hums through the soil. Let’s grow something
          wonderful today!
        </Text>
      </View>

      <CustomButton
        title="OK"
        handlePress={() =>
          router.replace({
            pathname: "/(screens)/plantScreen",
            params: { name: name },
          })
        }
        containerStyles="w-[200px] mb-1"
        textStyles={"font-pbold text-white"}
        isLoading={false}
      />
    </View>
  );
};

export default SessionStarted;
