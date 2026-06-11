import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Dimensions, Alert, Image, Pressable, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { icons, images } from "../../constants";
import { CustomButton, FormField } from "../../components";
import { signUpUser } from "@/services/auth";
import BackgroundImage from "../../components/BackgroundImage";
import SelectField, { CustomSelectField } from "../../components/SelectField";
import { validateForm } from "../../utils/validateForm";
import { useCountryData } from "../../hooks/useCountryData";
import { useLanguageData } from "../../hooks/useLanguageData";
import { avatarsArr } from "../../hooks/useAvatarArray";
import { useTranslation } from "react-i18next";
import { languageMap } from "@/utils/languageMap";

const screenHeight = Dimensions.get("window").height;
const LANGUAGE_KEY = "user-language";

const SignUp = () => {
  const [isSubmitting, setSubmitting] = useState(false);
  // Sensible defaults so the form can be submitted quickly; user can change them.
  const [selectedLanguage, setSelectedLanguage] = useState('english')
  const [selectedCountry, setSelectedCountry] = useState('ng')
  const [form, setForm] = useState({
    email: "",
    password: "",
    cpassword: ""
  });
  const [errors, setErrors] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(1);

  const { countries, loading: countryLoading } = useCountryData();
  const { languages, loading: langLoading } = useLanguageData();

  function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const submit = async () => {
    // if (form.fullName === "" || form.email === "" || form.password === "") {
    //   Alert.alert("Error", "Please fill in all fields");
    //   return;
    // }

    const { isValid, errors: validationErrors } = validateForm({
      ...form,
      selectedLanguage,
      selectedCountry,
    });

    if (isValid) {
      // console.log("Submitting ✅", { ...form, selectedLanguage, selectedCountry });
      setSubmitting(true);
      try {
        const result = await signUpUser(form.fullName, (form.email).toLowerCase(), form.password, selectedLanguage, selectedCountry, selectedIndex);
        if (result.status !== 200 || result.data.success === false) {
          Alert.alert("Error", result.data.message)
          return;
        }
        Alert.alert("Success", result.data.message);
        // setUser(result.data.user);
        // setIsLogged(true);
        setTimeout(() => {
          router.replace("/sign-in");
        }, 2000);
        await changeLanguage(capitalizeFirstLetter(selectedLanguage))

      } catch (error) {
        Alert.alert("Error occured", error.message);
      } finally {
        setSubmitting(false);
      }
    } else {
      setErrors(validationErrors); // display errors in UI
    }

  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + avatarsArr.length) % avatarsArr.length);
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % avatarsArr.length);
  };


  const filteredLanguages = languages.filter(lang =>
    Object.keys(languageMap).some(
      key => key.toLowerCase() === lang.label.toLowerCase()
    )
  );
  const { t, i18n } = useTranslation();

  const changeLanguage = async (langName) => {
    const code = languageMap[langName].code;

    if (code) {
      await AsyncStorage.setItem(LANGUAGE_KEY, code); // persist
      await i18n.changeLanguage(code);
      setSelectedLanguage(langName);
    }
  };
  return (
    <SafeAreaView className="bg-primary h-full flex justify-center items-center">
      <BackgroundImage source={images.background} />
      {/* <View className="flex justify-center items-center my-3">
        <Image
          source={images.logo}
          resizeMode="contain"
          className="w-[100px] h-[100px]"
        />
        <Text className="text-lg font-semibold text-white font-psemibold">
          Sign Up to Farm Wizard
        </Text>
      </View> */}
      <Text className="text-white text-3xl font-primary mb-2">CREATE ACCOUNT</Text>

      {/* Avatar Selector */}
      <View className="flex-row items-center gap-5 mb-6 p-2">
        <Image source={avatarsArr[(selectedIndex - 1 + avatarsArr.length) % avatarsArr.length]} className="w-14 h-14 opacity-50" />
        <Pressable
          onPress={handlePrev}
        >
          <Image
            source={icons.leftChevron}
            className="w-18 h-14"
            resizeMode="contain"
          />
        </Pressable>
        <View className="bg-white/20 border-2 border-secondary rounded-3xl p-4 items-center justify-center shadow-lg">
          <Image source={avatarsArr[selectedIndex]} className="w-28 h-28" resizeMode="contain" />
        </View>
        <Pressable
          onPress={handleNext}
        >
          <Image
            source={icons.rightChevron}
            className="w-18 h-14"
            resizeMode="contain"
          />
        </Pressable>
        <Image source={avatarsArr[(selectedIndex + 1) % avatarsArr.length]} className="w-14 h-14 opacity-50" />
      </View>

      <KeyboardAwareScrollView
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        // className="px-4 py-6"
        style={{ maxHeight: screenHeight * 0.6 }}
      >
        <View className="border-r-4 border-r-[#E1CE67] p-4">

          <FormField
            title={t("fullname")}
            value={form.fullName}
            placeholder="e.g. John Doe"
            handleChangeText={(e) => setForm({ ...form, fullName: e })}
            otherStyles="mt-2"
          />
          {errors.fullName && <Text className="text-red-400 text-sm mt-1">{errors.fullName}</Text>}

          <FormField
            title={t("email")}
            value={form.email}
            placeholder="e.g. yourname@gmail.com"
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-2"
            keyboardType="email-address"
          />
          {errors.email && <Text className="text-red-400 text-sm mt-1">{errors.email}</Text>}

          <FormField
            title={t("password")}
            placeholder="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-2"
          />
          {errors.password && <Text className="text-red-400 text-sm mt-1">{errors.password}</Text>}

          <FormField
            title={t("confirm_password")}
            placeholder="Confirm Password"
            value={form.cpassword}
            handleChangeText={(e) => setForm({ ...form, cpassword: e })}
            otherStyles="mt-2"
          />
          {errors.cpassword && <Text className="text-red-400 text-sm mt-1">{errors.cpassword}</Text>}

          <CustomSelectField
            title={t("select_country")}
            selectedValue={selectedCountry}
            options={countries}
            handleValueChange={setSelectedCountry}
            otherStyles="mt-2"
          />
          {errors.country && <Text className="text-red-400 text-sm mt-1">{errors.country}</Text>}

          <CustomSelectField
            title={t("select_language")}
            selectedValue={selectedLanguage}
            options={filteredLanguages}
            handleValueChange={setSelectedLanguage}
            otherStyles="mt-2"
          />
          {errors.language && <Text className="text-red-400 text-sm mt-1">{errors.language}</Text>}

        </View>
      </KeyboardAwareScrollView>
      <CustomButton
        title={t("buttons.sign_up")}
        handlePress={submit}
        containerStyles="w-full"
        isLoading={isSubmitting}
      />

      <View className="flex justify-center pt-5 flex-row gap-2">
        <Text className="text-lg text-gray-100 font-pregular">
          Have an account already?
        </Text>
        <Link
          href="/sign-in"
          className="text-lg font-secondary text-secondary"
        >
          Sign In
        </Link>
      </View>
    </SafeAreaView>
  );
};

export default SignUp;
