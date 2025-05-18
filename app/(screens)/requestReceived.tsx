import React from "react";
import BackgroundImage from "@/components/BackgroundImage";
import { images } from "@/constants";
import { View, Text, Image, Dimensions } from "react-native";
import { CustomButton } from "../../components";
import { router, useLocalSearchParams } from "expo-router";
import CountdownTimer from "@/utils/CountdownTimer";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");

const RequestReceived = () => {
  const { createdAt, amount, reference } = useLocalSearchParams();

  const { t } = useTranslation();
  return (
    <View className="flex-1 bg-green-200 items-center justify-start pt-20">
      {/* Background */}
      <BackgroundImage
        blurRadius={1}
        source={images.bgRainfall}
        style={{
          width: "100%",
          height: "100vh",
          position: "absolute",
        }}
      />

      <View className="items-center justify-center my-10">
        <Text className="text-white text-3xl font-primary">
          Request Received &
        </Text>
        <Text className="text-white text-3xl font-primary">
          {" "}
          Under Processing
        </Text>

        <View className="items-center my-8 rounded-3xl p-2">
          <Text
            className="text-center text-xl px-2"
            style={{
              color: "#fff",
              textAlign: "center",
              paddingHorizontal: 10,
            }}
          >
            {t("messages.reques_recieved")}
            Amount: {amount} & referece: {reference}
          </Text>
          <Image
            source={images.requestPending}
            style={{
              width: width * 0.5,
              height: width * 0.5,
            }}
            resizeMode="contain"
          />
        </View>

        <Text className="text-white text-lg font-primary my-2">
          Time remaining
        </Text>

        <CountdownTimer startDate={createdAt} />

        <CustomButton
          title="OK"
          handlePress={() => router.replace("/(tabs)/home")}
          containerStyles="w-[200px] my-2"
          textStyles={"font-pbold text-white"}
          isLoading={false}
        />
      </View>
    </View>
  );
};

export default RequestReceived;
