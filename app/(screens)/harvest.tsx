import React, { useEffect, useState } from "react";
import BackgroundImage from "@/components/BackgroundImage";
import { images } from "@/constants";
import { View, Text, Image, Dimensions, Alert } from "react-native";
import { CustomButton } from "../../components";
import { router, useLocalSearchParams } from "expo-router";
import { plantGrowth } from "@/constants/plants";
import { updatePlantLevels } from "@/services/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLoginContext } from "@/context/LoginProvider";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");

const Harvest = () => {
  const { user, setUser } = useLoginContext();
  if (!user) {
    router.replace("/");
  }
  const [isSubmitting, setSubmitting] = useState(false);
  const { name, userLevel, score } = useLocalSearchParams();
  const plant = plantGrowth.filter((plant) => plant.name === name)[0];
  let level = parseInt(userLevel as string) + 1;

  const updateLevel = async () => {
    if (!plant || !level || !score) {
      Alert.alert("Error", "Some error occurs");
      return;
    }

    const totalSocre = Number(score) + 500;

    // if (level > 4) {
    //   Alert.alert("Warning!!!", "Your level can't be greater than 4");
    //   return;
    // }
    setSubmitting(true);
    const token = await AsyncStorage.getItem("token");
    if (token !== null) {
      try {
        const result = await updatePlantLevels(
          token,
          plant.name,
          level,
          Number(totalSocre)
        );

        if (result.data.success === false) {
          Alert.alert("Error", result.data.message);
          return;
        }
        // Alert.alert(
        //   "Success",
        //   "Session completed & level upgraded successfully"
        // );
        setUser(result.data.updateUser);
        // setTimeout(() => {
        //   router.replace({
        //     pathname: "/(screens)/profile",
        //     params: { name },
        //   });
        // }, 3000);
      } catch (error: any) {
        Alert.alert("Error", error.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  useEffect(() => {
    updateLevel();
  }, []);
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-green-200 items-center justify-start pt-20">
      {/* Background */}
      <BackgroundImage
        source={images.bgRainfall}
        style={{ width: "100%", height: "100vh", position: "absolute" }}
      />

      {/* Title */}

      <View className="items-center justify-center my-14">
        <Text className="text-white text-3xl font-primary">
          {" "}
          {t("menu.session")}
        </Text>
        <Text className="text-white text-3xl font-primary">
          {t("menu.completed")}
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

        <Text className="text-center text-xl p-4 my-2 text-white">
          {t("game.total_points")}
        </Text>

        <Text className="text-center text-5xl font-bold font-secondary p-4 text-[#FEDA42]">
          {score}
        </Text>
        <Text className="text-center text-xl p-4 my-2 text-white">
          {t("messages.harvest")}
        </Text>

        <View className="flex-row justify-between m-3">
          <CustomButton
            title={t("buttons.keep_going")}
            handlePress={() => router.replace("/(screens)/selectSeed")}
            containerStyles="w-[150px]"
            textStyles={"font-pbold text-white"}
            isLoading={isSubmitting}
          />
          <CustomButton
            title={t("buttons.exit_to_menu")}
            handlePress={() => router.replace("/(tabs)/home")}
            containerStyles="w-[150px]"
            textStyles={"font-pbold text-white"}
            isLoading={isSubmitting}
          />
        </View>

        {/* <CustomButton
          title="Harvest"
          handlePress={updateLevel}
          containerStyles="w-[200px] mb-1"
          textStyles={"font-pbold text-white"}
          isLoading={isSubmitting}
        /> */}
      </View>
    </View>
  );
};

export default Harvest;
