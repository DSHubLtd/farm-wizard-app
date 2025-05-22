import React from "react";
import BackgroundImage from "@/components/BackgroundImage";
import { images } from "@/constants";
import { View, Text, Image, Dimensions } from "react-native";
import { CustomButton } from "../../components";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");

const TransactionSuccess = () => {
  const { t } = useTranslation();

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

      <View className="items-center justify-center my-14">
        {/* Title */}
        <Text className="text-white text-3xl font-primary">
          {t("transaction")}
        </Text>
        <Text className="text-white text-3xl font-primary">
          {t("successful")}
        </Text>

        <View className="items-center my-8 rounded-3xl p-6">
          <Image
            source={images.success}
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
            Congratulations!
          </Text>
        </View>

        <CustomButton
          title={t("buttons.ok")}
          handlePress={() => router.replace("/(tabs)/home")}
          containerStyles="w-[200px] mb-1"
          textStyles={"font-pbold text-white"}
          isLoading={false}
        />
      </View>
    </View>
  );
};

export default TransactionSuccess;
