import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";

import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";

import { useLoginContext } from "@/context/LoginProvider";
import { signInUser } from "../../services/auth";
import BackgroundImage from "../../components/BackgroundImage";
import { useTranslation } from "react-i18next";


const SignIn = () => {
  const { setUser, setIsLogged } = useLoginContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleGetStarted = async () => {
    // if (form.email === "" || form.password === "") {
    //   Alert.alert("Error", "Please fill in all fields");
    //   return;
    // }
    setSubmitting(true);

    try {

      const result = await signInUser('testaccount@gmail.com', '123456');
      // const result = await signInUser(form.email.toLowerCase(), form.password);
      if (result !== undefined) {
        // if (result?.data.success === false) {
        //   Alert.alert("Error", result?.data.message)
        //   return;
        // }
        setUser(result.data.data.user);

        setIsLogged(true);

        // Alert.alert("Success", "User signed in successfully");
        router.replace("/(tabs)/home");
      } else {
        // Alert.alert("Error", "Server Down, please try again later")
      }
    } catch (error) {
      // Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };
  const submit = async () => {
    if (form.email === "" || form.password === "") {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setSubmitting(true);

    try {

      const result = await signInUser(form.email.toLowerCase(), form.password);
      if (result !== undefined) {
        if (result?.data.success === false) {
          Alert.alert("Error", result?.data.message)
          return;
        }
        setUser(result.data.data.user);

        setIsLogged(true);

        Alert.alert("Success", "User signed in successfully");
        router.replace("/(tabs)/home");
      } else {
        Alert.alert("Error", "Server Down, please try again later")
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };
  const { t } = useTranslation();

  return (
    <SafeAreaView className="bg-primary h-full">
      <BackgroundImage source={images.background} />
      <ScrollView>
        <View
          className="w-full flex justify-center h-full px-4 my-6"
          style={{
            minHeight: Dimensions.get("window").height - 100,
          }}
        >
          <View className="flex flex-row justify-center mb-20">
            <Image
              source={images.logoLg}
              resizeMode="contain"
              className="w-[200px] h-[200px]"
            />
          </View>

          {/* <Text className="text-2xl font-semibold text-white mt-10 font-psemibold">
            Log in to Farm Wizard
          </Text> */}

          {/* <FormField
            title={t("email")}
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />

          <FormField
            title={t("password")}
            placeholder="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
          /> */}

          <CustomButton
            title={'Get Started'}
            // title={t("buttons.sign_in")}
            // handlePress={submit}
            handlePress={handleGetStarted}
            containerStyles="w-full"
            isLoading={isSubmitting}
          />

          {/* <View className="flex justify-end pt-5 flex-row gap-2">

            <Link href="/forgot-password" className="text-lg text-gray-100 font-secondary">
              Forget password?
            </Link>
          </View>

          <View className="flex justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Don't have an account?
            </Text>
            <Link
              href="/sign-up"
              className="text-lg font-secondary text-secondary"
            >
              Sign Up
            </Link>
          </View> */}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
