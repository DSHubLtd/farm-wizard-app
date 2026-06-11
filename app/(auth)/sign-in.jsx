import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";

import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";

import { useLoginContext } from "@/context/LoginProvider";
import { signInUser, signUpUser } from "../../services/auth";
import BackgroundImage from "../../components/BackgroundImage";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import uuid from "react-native-uuid";

// Stored so the same device always signs back into the same guest account
const ANON_CREDENTIALS_KEY = "anonymous-credentials";


const SignIn = () => {
  const { setUser, setIsLogged } = useLoginContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [isAnonSubmitting, setAnonSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // Creates (once per device) and signs into a guest account whose details
  // are generated from device data — no form filling required.
  const submitAnonymous = async () => {
    setAnonSubmitting(true);
    try {
      let creds = null;
      const stored = await AsyncStorage.getItem(ANON_CREDENTIALS_KEY);
      if (stored) creds = JSON.parse(stored);

      if (!creds) {
        const deviceId = uuid.v4().replace(/-/g, "").slice(0, 10);
        const deviceName = (Constants.deviceName || "Wizard")
          .replace(/[^a-zA-Z0-9 ]/g, "")
          .trim()
          .slice(0, 18);
        creds = {
          fullName: `${deviceName || "Wizard"} ${deviceId.slice(0, 4)}`,
          email: `guest-${deviceId}@farmwizard.app`.toLowerCase(),
          password: String(uuid.v4()),
        };
        const reg = await signUpUser(
          creds.fullName,
          creds.email,
          creds.password,
          "english",
          "ng",
          Math.floor(Math.random() * 4) + 1
        );
        if (!reg || reg.status !== 200 || reg.data?.success === false) {
          Alert.alert(
            "Error",
            reg?.data?.message ||
              "Could not create a guest account, please try again."
          );
          return;
        }
        await AsyncStorage.setItem(ANON_CREDENTIALS_KEY, JSON.stringify(creds));
      }

      const result = await signInUser(creds.email, creds.password);
      if (result === undefined) {
        Alert.alert("Error", "Server Down, please try again later");
        return;
      }
      if (result?.data?.success === false) {
        // Stored guest account no longer valid (e.g. deleted server-side):
        // clear it so the next tap creates a fresh one.
        await AsyncStorage.removeItem(ANON_CREDENTIALS_KEY);
        Alert.alert(
          "Error",
          "Guest session expired, please tap Continue as Guest again."
        );
        return;
      }
      setUser(result.data.data.user);
      setIsLogged(true);
      router.replace("/(tabs)/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setAnonSubmitting(false);
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

        //Alert.alert("Success", "User signed in successfully");
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
          <View className="flex flex-row justify-center mb-2">
            <Image
              source={images.logoLg}
              resizeMode="contain"
              className="w-[200px] h-[200px]"
            />
          </View>

          {/* <Text className="text-2xl font-semibold text-white mt-10 font-psemibold">
            Log in to Farm Wizard
          </Text> */}

          <FormField
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
          />

          <CustomButton
            title={t("buttons.sign_in")}
            handlePress={submit}
            containerStyles="w-full"
            isLoading={isSubmitting}
          />

          <CustomButton
            title="👤 Continue as Guest"
            handlePress={submitAnonymous}
            containerStyles="w-full"
            textStyles="text-[18px]"
            isLoading={isAnonSubmitting}
          />

          <View className="flex justify-end pt-5 flex-row gap-2">

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
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
