import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";

import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";
import { useLoginContext } from "@/context/LoginProvider";
import { signUpUser } from "@/services/auth";
import BackgroundImage from "../../components/BackgroundImage";
import SelectField from "../../components/SelectField";

const SignUp = () => {
  const { setUser, setIsLogged } = useLoginContext();

  const [isSubmitting, setSubmitting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });


  const submit = async () => {
    if (form.fullName === "" || form.email === "" || form.password === "") {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      const result = await signUpUser(form.fullName, form.email, form.password);
      if (result.status !== 200 || result.data.success === false) {
        Alert.alert("Error", result.data.message)
        return;
      }
      Alert.alert("Success", result.data.message);
      setUser(result);
      setIsLogged(true);
      router.replace("/sign-in");

    } catch (error) {
      Alert.alert("Error occured", error.message);
    } finally {
      setSubmitting(false);
    }
  };

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

          <View className="flex flex-row justify-center">
            <Image
              source={images.logo}
              resizeMode="contain"
              className="w-[200px] h-[200px]"
            />
          </View>
          <Text className="text-2xl font-semibold text-white mt-10 font-psemibold">
            Sign Up to Farm Wizard
          </Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ height: 300 }}
            className="max-h-50 p-2 border-r-4 border-r-[#E1CE67] mb-3">
            <FormField
              title="Full Name"
              value={form.fullName}
              handleChangeText={(e) => setForm({ ...form, fullName: e })}
              otherStyles="mt-10"
            />

            <FormField
              title="Email"
              value={form.email}
              handleChangeText={(e) => setForm({ ...form, email: e })}
              otherStyles="mt-7"
              keyboardType="email-address"
            />

            <FormField
              title="Password"
              value={form.password}
              handleChangeText={(e) => setForm({ ...form, password: e })}
              otherStyles="mt-7"
            />
            <FormField
              title="Confirm Password"
              value={form.password}
              handleChangeText={(e) => setForm({ ...form, password: e })}
              otherStyles="mt-7"
            />

            <SelectField
              title="Select a Language"
              selectedValue={selectedLanguage}
              options={[
                { label: 'English', value: 'english' },
                { label: 'Hausa', value: 'hausa' },
                { label: 'Yoruba', value: 'yoruba' },
              ]}
              handleValueChange={(value) => setSelectedLanguage(value)}
              otherStyles="mt-7"
            />

            <SelectField
              title="Select a Country"
              selectedValue={selectedCountry}
              options={[
                { label: 'Nigeria', value: 'nigeria' },
                { label: 'Egypt', value: 'egypt' },
                { label: 'Ghana', value: 'ghana' },
              ]}
              handleValueChange={(value) => setSelectedCountry(value)}
              otherStyles="mt-5 mb-5"
            />
          </ScrollView>

          <CustomButton
            title="Sign Up"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />

          <View className="flex justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Have an account already?
            </Text>
            <Link
              href="/sign-in"
              className="text-lg font-psemibold text-secondary"
            >
              Sign up
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
