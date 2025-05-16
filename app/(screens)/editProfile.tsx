import { useState } from "react";
import { Link, router } from "expo-router";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";
import { useTranslation } from "react-i18next";

import { icons, images } from "../../constants";
import { useLoginContext } from "@/context/LoginProvider";
import BackgroundImage from "@/components/BackgroundImage";
import { CustomButton, FormField } from "@/components";
import HeaderNavigation from "@/components/HeaderNavigation";
import LanguageSwitching from "@/components/LanguageSwitching";

const EditProfile = () => {
  const { setUser, setIsLogged } = useLoginContext();

  const [isSubmitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    cpassword: "",
  });
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-start bg-green-200">
      <BackgroundImage source={images.background} style={{}} />
      {/* Back Button */}
      <HeaderNavigation
        onLeftPress={() => router.push("/(screens)/settings")}
        onRightPress={() => null}
        leftIcon={icons.back}
        rightIcon={icons.settings}
        showLeftButton={true}
        showRightButton={false}
      />

      {/* Title */}
      <Text className="text-white text-2xl font-primary font-bold">
        {t("edit_profile")}
      </Text>
      <View className="w-full flex justify-center h-full px-4">
        <View className="flex flex-row justify-center">
          <Image
            source={icons.profile}
            resizeMode="contain"
            // className="w-[200px] h-[200px]"
          />
        </View>

        <LanguageSwitching />

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ height: 200 }}
          //   className="max-h-10 p-2 border-r-4 border-r-[#E1CE67] mb-3"
        >
          <FormField
            title="Full Name"
            placeholder="Full name"
            value={form.fullName}
            handleChangeText={(e: any) => setForm({ ...form, fullName: e })}
            otherStyles="mt-1"
          />

          <FormField
            title="Email"
            placeholder="Email"
            value={form.email}
            handleChangeText={(e: any) => setForm({ ...form, email: e })}
            otherStyles="mt-1"
            keyboardType="email-address"
          />

          <FormField
            title="Password"
            placeholder="password"
            value={form.password}
            handleChangeText={(e: any) => setForm({ ...form, password: e })}
            otherStyles="mt-1"
          />
          <FormField
            title="Confirm Password"
            placeholder="c password"
            value={form.cpassword}
            handleChangeText={(e: any) => setForm({ ...form, cpassword: e })}
            otherStyles="mt-1"
          />
          <CustomButton
            title={t("save")}
            handlePress={() => console.log("save")}
            containerStyles="w-full"
            textStyles={"font-pbold text-white"}
            isLoading={isSubmitting}
          />
        </ScrollView>
      </View>
    </View>
  );
};

export default EditProfile;
