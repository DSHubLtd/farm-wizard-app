import { StatusBar } from "expo-status-bar";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, router } from "expo-router";

import CustomButton from "../components/CustomButton";

import { images } from "../constants";
import { useLoginContext } from "../context/LoginProvider";

export default function Index() {
  const { isLoading, isLogged } = useLoginContext();

  if (!isLoading && isLogged) return <Redirect href={"/home"} />;

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View className="w-full flex justify-center items-center min-h-[85vh] px-4">
          {/* <Image
            source={images.logo}
            className="w-[130px] h-[84px]"
            resizeMode="contain"
          />
          <Image
            source={images.cards}
            className="max-w-[380px] w-full h-[298px]"
            resizeMode="contain"
          /> */}

          <View className="relative mt-5">
            {/* <Text className="text-3xl text-white font-bold text-center">
              Discover Endless{"\n"}
              Possibilities with{" "}
              <Text className="text-secondary-200">Farm wizard</Text>
            </Text>

            <Image
              source={images.path}
              className="w-[136px] h-[15px] absolute -bottom-2 -right-8"
              resizeMode="contain"
            /> */}
            <Text className="text-3xl text-white font-bold text-center my-5">
              Terms And Condition
            </Text>

          </View>

          <Text className="text-sm font-pregular text-gray-100 mt-5 text-center">
            Several games offer a wizard experience that includes farming magical materials and building a wizard's tower:

            Aether: Wizard Life: A magical farm sim game that combines action-adventure elements. It allows players to farm materials for spells and customize their wizard tower.
            Ultima Online: This classic MMORPG requires players to farm reagents for spellcasting and offers opportunities for castle and house customization.
            Overlord: While not a pure wizard experience, the original Overlord games offer a unique blend of gameplay elements that align with magical aspirations, including resource management and base building.
            Minecraft Mods: By combining various mods, players can create a gameplay experience that incorporates elements of spell crafting and resource management.

            Several games offer a wizard experience that includes farming magical materials and building a wizard's tower:

            Aether: Wizard Life: A magical farm sim game that combines action-adventure elements. It allows players to farm materials for spells and customize their wizard tower.
            Ultima Online: This classic MMORPG requires players to farm reagents for spellcasting and offers opportunities for castle and house customization.
            Overlord: While not a pure wizard experience, the original Overlord games offer a unique blend of gameplay elements that align with magical aspirations, including resource management and base building.
            Minecraft Mods: By combining various mods, players can create a gameplay experience that incorporates elements of spell crafting and resource management.
          </Text>

          <CustomButton
            title="Agree & Continue "
            handlePress={() => router.push("/sign-in")}
            containerStyles="w-full mt-7"
            textStyles={"font-pbold text-base"}
            isLoading={isLoading}
          />
        </View>
      </ScrollView>
      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  );
}
