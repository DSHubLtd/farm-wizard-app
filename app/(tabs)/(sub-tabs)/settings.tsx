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
import { icons, images } from "../../../constants";
import BackgroundImage from "@/components/BackgroundImage";
import { router } from "expo-router";
import HeaderNavigation from "@/components/HeaderNavigation";
import WebViewModal from "@/components/WebViewModal";
import RewardModal from "@/components/RewardModal";
import { signOut } from "../../../services/auth";
import { useLoginContext } from "@/context/LoginProvider";
import { useTranslation } from "react-i18next";
import ConfirmModal from "@/components/ConfirmDialog";
import { deleteUser } from "@/services/user";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Settings = () => {
  const { user, setUser, setIsLogged } = useLoginContext();
  if (!user) {
    router.replace("/");
  }
  const [isSubmitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [rewalVisible, setRewardVisible] = useState(false);
  const [url, setUrl] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const [confirmModal, setConfirmModal] = useState(false);

  const openWebView = (url: string) => {
    setUrl(url);
    setModalVisible(true);
  };

  const handleDeleteUser = async () => {
    const token = await AsyncStorage.getItem("token");
    if (token !== null) {
      try {
        setSubmitting(true);
        const result = await deleteUser(token, user.email);
        if (!result) {
          Alert.alert("Error", "Error while deleting user");
          return;
        }
        Alert.alert("Success", "User deleted successfully");
        setIsLogged(false);
      } catch (error: any) {
        Alert.alert("Error", error.message);
      } finally {
        setSubmitting(false);
        router.replace("/");
      }
    }
  };
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

  const handleItemClick = (itemLink: string, url: string) => {
    if (itemLink === "editProfile") {
      router.push(`/(tabs)/(sub-tabs)/${itemLink}`);
    }
    if (itemLink === "inventory") {
      router.push(`/(screens)/inventory`);
    }
    if (itemLink === "specialReward") {
      setRewardVisible(true);
    }
    if (
      itemLink === "privacy" ||
      itemLink === "terms" ||
      itemLink === "contact-us" ||
      itemLink === "tutorial"
    ) {
      openWebView(url);
    }
    if (itemLink === "logout") {
      logOut();
    }
    if (itemLink === "delete-account") {
      setConfirmModal(true);
    }
  };

  const { t } = useTranslation();

  const settingsOptions = [
    {
      label: t("settings.special_reward"),
      icon: icons.reward,
      link: "specialReward",
      url: "www.google.com",
    },
    {
      label: t("edit_profile"),
      icon: icons.editProfile,
      link: "editProfile",
      url: "",
    },
    {
      label: t("menu.inventory"),
      icon: icons.plus,
      link: "inventory",
      url: "",
    },
    {
      label: t("settings.privacy_policy"),
      icon: icons.privacy,
      link: "privacy",
      url: "www.google.com",
    },
    {
      label: t("settings.terms_and_condition"),
      icon: icons.termsNcondition,
      link: "terms",
      url: "www.google.com",
    },
    {
      label: t("settings.contact_us"),
      icon: icons.contact,
      link: "contact-us",
      url: "www.google.com",
    },
    {
      label: t("settings.tutorial"),
      icon: icons.tutorial,
      link: "tutorial",
      url: "https://youtu.be/E0Hmnixke2g?si=pXvbfDqh3Gxquv2y",
    },
    {
      label: t("settings.logout"),
      icon: icons.logout,
      link: "logout",
      url: "",
    },
    {
      label: t("settings.delete_account"),
      icon: icons.del,
      danger: true,
      link: "delete-account",
      url: "",
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
        <ScrollView className="max-h-[70vh]">
          {settingsOptions.map((item, index) => (
            <TouchableOpacity
              key={index}
              className={`flex-row items-center justify-between m-30 p-8 border-b border-white/80 ${
                index === settingsOptions.length - 1 ? "border-b-0" : ""
              }`}
              onPress={() => handleItemClick(item.link, item.url)}
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

      <RewardModal
        visible={rewalVisible}
        onClose={() => setRewardVisible(false)}
      />
      <WebViewModal
        visible={modalVisible}
        url={url}
        onClose={() => setModalVisible(false)}
      />

      <ConfirmModal
        visible={confirmModal}
        message={t("comfirmation.delete_account")}
        confirmTitle={t("comfirmation.title")}
        confirmBtnText={t("buttons.ok")}
        cancelBtnText={t("buttons.cancel")}
        onConfirm={() => {
          handleDeleteUser();
          setConfirmModal(false);
        }}
        onCancel={() => {
          setConfirmModal(false);
        }}
      />
    </View>
  );
};

export default Settings;
