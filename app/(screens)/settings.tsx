import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { BlurView } from "expo-blur";
import { icons, images } from "../../constants";
import BackgroundImage from "@/components/BackgroundImage";
import { router } from "expo-router";
import HeaderNavigation from "@/components/HeaderNavigation";

const settingsOptions = [
  {
    label: "Get special rewards",
    icon: icons.settings,
    link: "special-reward",
  },
  { label: "Edit Profile", icon: icons.settings, link: "profile" },
  { label: "Privacy Policy", icon: icons.settings, link: "privacy" },
  { label: "Terms and Condition", icon: icons.settings, link: "terms" },
  { label: "Contact Us", icon: icons.settings, link: "contact-us" },
  { label: "Tutorial", icon: icons.settings, link: "tutorial" },
  {
    label: "Delete Account",
    icon: icons.settings,
    danger: true,
    link: "delete-account",
  },
];
const handleItemClick = (itemLink: string) => {
  if (itemLink === "profile") {
    router.push(`/${itemLink}`);
  }
};
const Settings = () => {
  return (
    <View className="flex-1 items-center justify-start bg-green-200">
      {/* Background */}
      <BackgroundImage
        source={images.background}
        style={{ width: "100%", height: "100%", position: "absolute" }}
      />

      {/* Back Button */}
      <HeaderNavigation
        onLeftPress={() => router.push("/(tabs)/home")}
        onRightPress={() => null}
        leftIcon={icons.back}
        rightIcon={icons.settings}
        showLeftButton={true}
        showRightButton={false}
      />

      {/* Title */}
      <Text className="text-white text-3xl font-bold">Settings</Text>

      {/* Glass Panel */}
      <BlurView
        // intensity={60}
        intensity={0}
        tint="default"
        className="px-5 py-2 w-[95%] rounded-2xl bg-white/10"
      >
        <ScrollView className="max-h-[80vh]">
          {settingsOptions.map((item, index) => (
            <TouchableOpacity
              key={index}
              className={`flex-row items-center justify-between m-30 p-8 border-b border-white/80 ${
                index === settingsOptions.length - 1 ? "border-b-0" : ""
              }`}
              onPress={() => handleItemClick(item.link)}
            >
              <View className="flex-row items-center space-x-2">
                {item.icon && (
                  <Image
                    source={item.icon}
                    className="w-8 h-7 mr-3"
                    resizeMode="contain"
                  />
                )}
                <Text
                  className={`text-white mb-1 ${
                    item.danger ? "text-red-400" : ""
                  }`}
                >
                  {item.label}
                </Text>
              </View>
              <Image
                source={icons.rightChevron}
                className="w-8 h-4"
                resizeMode="contain"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BlurView>
    </View>
  );
};

export default Settings;
