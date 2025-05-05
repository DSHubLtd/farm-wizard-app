import React, { useState } from "react";
import BackgroundImage from "@/components/BackgroundImage";
import { images } from "@/constants";
import { View, Text, Image, Dimensions, Alert } from "react-native";
import { CustomButton } from "../../components";
import { router, useLocalSearchParams } from "expo-router";
import { plantGrowth } from "@/constants/plants";
import { updatePlantLevels } from "@/services/user";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const Harvest = () => {
  const [isSubmitting, setSubmitting] = useState(false);
  const { name, userLevel } = useLocalSearchParams();
  const plant = plantGrowth.filter((plant) => plant.name === name)[0];
  let level = parseInt(userLevel as string) + 1;

  const updateLevel = async () => {
    if (!plant || !level) {
      Alert.alert("Error", "Some error occurs");
      return;
    }

    if (level > 4) {
      Alert.alert("Warning!!!", "Your level can't be greater than 4");
      return;
    }
    setSubmitting(true);
    const token = await AsyncStorage.getItem("token");
    if (token !== null) {
      try {
        const result = await updatePlantLevels(token, plant.name, level);

        if (result.data.success === false) {
          Alert.alert("Error", result.data.message);
          return;
        }

        Alert.alert("Success", "Level updated successfully");
        setTimeout(() => {
          router.replace({
            pathname: "/(screens)/plantScreen",
            params: { name },
          });
        }, 2000);
      } catch (error: any) {
        Alert.alert("Error", error.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <View className="flex-1 bg-green-200 items-center justify-start pt-20">
      {/* Background */}
      <BackgroundImage
        source={images.background}
        style={{ width: "100%", height: "100vh", position: "absolute" }}
      />

      {/* Title */}
      <Text className="text-white text-3xl font-primary my-6">
        Session Completed
      </Text>

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
        <View
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
            style={{
              color: "#DFC666",
              fontSize: 18,
              fontWeight: "600",
              marginBottom: 10,
            }}
          >
            Congratulations!!!!
          </Text>
          <Image
            source={images.sessionComplete}
            style={{
              width: width * 0.5,
              height: width * 0.5,
              marginBottom: 10,
            }}
            resizeMode="contain"
          />

          <Text
            style={{
              color: "#7B6C32",
              textAlign: "center",
              paddingHorizontal: 10,
            }}
          >
            Great work today! Your farm flourished under your care — take a
            well-earned rest and return soon to keep the magic growing.
          </Text>
        </View>

        {/* Right Nav */}
      </View>

      <CustomButton
        title="Harvest"
        handlePress={updateLevel}
        containerStyles="w-[200px] mb-1"
        textStyles={"font-pbold text-white"}
        isLoading={isSubmitting}
      />
    </View>
  );
};

export default Harvest;
