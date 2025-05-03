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
        source={images.background}
        style={{ width: "100%", height: "100vh", position: "absolute" }}
      />

      {/* Title */}
      <Text className="text-white text-3xl font-primary my-6">Game Over</Text>

      <View
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
      >
        {/* Seed Name + Icon */}
        <View
          // className="items-center my-10 bg-white rounded-3xl p-6"
          style={{
            alignItems: "center",
            backgroundColor: "white",
            borderRadius: 24,
            padding: 16,
            marginVertical: 10,
            width: "100%",
          }}
        >
          <Text
            // className="text-[#DFC666] text-xl font-primary mb-10"
            style={{
              color: "#DFC666",
              fontSize: 18,
              fontWeight: "600",
              marginBottom: 10,
            }}
          >
            Ooopps!!!
          </Text>
          {/* <Image
            source={images.levelDoc}
            style={{
              width: width * 0.5,
              height: width * 0.5,
              marginBottom: 10,
            }}
            resizeMode="contain"
          /> */}
          <Image
            src="https://media.gettyimages.com/id/1304720889/photo/dead-plant.jpg?s=612x612&w=0&k=20&c=s4YHDM2UcUyGL0QwEzCD-7FmeqiVOIG82fYB4Y3UqL8="
            style={{
              width: width * 0.5,
              height: width * 0.5,
              marginBottom: 10,
            }}
            resizeMode="contain"
          />
          <Text
            //className="text-[#7B6C32] text-center px-2 mb-6"
            style={{
              color: "#7B6C32",
              textAlign: "center",
              paddingHorizontal: 10,
            }}
          >
            Please check the game instructions and try again.
          </Text>
        </View>

        {/* Right Nav */}
      </View>

      <CustomButton
        title="Replay"
        handlePress={() => router.push("/(screens)/selectSeed")}
        containerStyles="w-[200px] mb-1"
        textStyles={"font-pbold text-white"}
        isLoading={false}
      />
    </View>
  );
};

export default GameOver;
