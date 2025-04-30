import { useState } from "react";
import { Link, router } from "expo-router";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";

import { icons, images } from "../../constants";
import { useLoginContext } from "@/context/LoginProvider";
import BackgroundImage from "@/components/BackgroundImage";
import { CustomButton, FormField } from "@/components";
import HeaderNavigation from "@/components/HeaderNavigation";

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
      <Text className="text-white text-3xl font-primary font-bold">
        EDIT PROFILE
      </Text>
      <View className="w-full flex justify-center h-full px-4">
        <View className="flex flex-row justify-center">
          <Image
            source={icons.profile}
            resizeMode="contain"
            // className="w-[200px] h-[200px]"
          />
        </View>

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
            otherStyles="mt-2"
          />

          <FormField
            title="Email"
            placeholder="Email"
            value={form.email}
            handleChangeText={(e: any) => setForm({ ...form, email: e })}
            otherStyles="mt-2"
            keyboardType="email-address"
          />

          <FormField
            title="Password"
            placeholder="password"
            value={form.password}
            handleChangeText={(e: any) => setForm({ ...form, password: e })}
            otherStyles="mt-2"
          />
          <FormField
            title="Confirm Password"
            placeholder="c password"
            value={form.cpassword}
            handleChangeText={(e: any) => setForm({ ...form, cpassword: e })}
            otherStyles="mt-2"
          />
          <CustomButton
            title="Save"
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
