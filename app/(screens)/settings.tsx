import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { BlurView } from "expo-blur";
import { icons, images } from "../../constants";
import BackgroundImage from "@/components/BackgroundImage";
import { router } from "expo-router";
import HeaderNavigation from "@/components/HeaderNavigation";
import { signOut } from "../../services/auth";
import { useLoginContext } from "@/context/LoginProvider";
import { useTranslation } from "react-i18next";

const Settings = () => {
  const [isSubmitting, setSubmitting] = useState(false);
  const { setIsLogged } = useLoginContext();

  const logOut = async () => {
    setSubmitting(true);
    try {
      const result = await signOut();
      if (!result) {
        Alert.alert("Error", "Error while siging out");
        return;
      }
      Alert.alert("Success", "User signout in successfully");
      setIsLogged(false);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
      router.replace("/");
    }
  };

  const handleItemClick = (itemLink: string) => {
    if (itemLink === "editProfile") {
      router.push(`/${itemLink}`);
    }
    if (itemLink === "logout") {
      logOut();
    }
  };

  const { t } = useTranslation();

  const settingsOptions = [
    {
      label: t("settings.special_reward"),
      icon: icons.settings,
      link: "special-reward",
    },
    { label: t("edit_profile"), icon: icons.settings, link: "editProfile" },
    {
      label: t("settings.privacy_policy"),
      icon: icons.settings,
      link: "privacy",
    },
    {
      label: t("settings.terms_and_condition"),
      icon: icons.settings,
      link: "terms",
    },
    {
      label: t("settings.contact_us"),
      icon: icons.settings,
      link: "contact-us",
    },
    {
      label: t("settings.tutorial"),
      icon: icons.settings,
      link: "tutorial",
    },
    {
      label: t("settings.logout"),
      icon: icons.settings,
      link: "logout",
    },
    {
      label: t("settings.delete_account"),
      icon: icons.settings,
      danger: true,
      link: "delete-account",
    },
  ];

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
      <Text className="text-white text-2xl font-primary font-bold">
        {t("settings.settings")}
      </Text>

      {/* Glass Panel */}
      <BlurView
        // intensity={60}
        intensity={0}
        tint="default"
        className="px-5 py-3 w-[95%] rounded-xl bg-white/10"
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
                  className={`text-white font-primary mb-1 ${
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
