import React from "react";
import BackgroundImage from "@/components/BackgroundImage";
import { images } from "@/constants";
import { View, Text, Image, Dimensions } from "react-native";
import { CustomButton } from "../../components";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const GameOver = () => {
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
      <Text className="text-white text-3xl font-primary my-4">Game Over</Text>

      {/* <View
        style={{
          width: "85%",
          backgroundColor: "#78693982",
          borderRadius: 20,
          borderColor: "#FCD34D",
          borderWidth: 1,
          padding: 20,
          alignItems: "center",
          marginBottom: 10,
          position: "relative",
        }}
      > */}
      <View
        className="items-center my-8 rounded-3xl p-4"
        // style={{
        //   alignItems: "center",
        //   backgroundColor: "white",
        //   borderRadius: 24,
        //   padding: 16,
        //   marginVertical: 10,
        //   width: "100%",
        // }}
      >
        {/* <Text
            // className="text-[#DFC666] text-xl font-primary mb-10"
            style={{
              color: "#DFC666",
              fontSize: 18,
              fontWeight: "600",
              marginBottom: 10,
            }}
          >
            Ooopps!!!
          </Text> */}
        <Image
          source={images.gameOver}
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
          The magic fades… Your farm rests for now. But with a new dawn, fresh
          hope will grow again. Please check the game instructions and try again
          when you're ready!.
        </Text>
      </View>

      {/* </View> */}

      <CustomButton
        title="TRY AGAIN"
        handlePress={() => router.push("/(screens)/selectSeed")}
        containerStyles="w-[200px]"
        textStyles={"font-pbold text-white"}
        isLoading={false}
      />
    </View>
  );
};

export default GameOver;
