import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";

import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";

import { useLoginContext } from "@/context/LoginProvider";
import BackgroundImage from "../../components/BackgroundImage";
import { forgetPassword } from "../../services/auth";

const ForgotPassword = () => {
    const { setUser, setIsLogged } = useLoginContext();
    const [isSubmitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        email: "",
    });

    const submit = async () => {
        if (form.email === "") {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        setSubmitting(true);

        try {
            const result = await forgetPassword(form.email);
            console.log("result ", result)
            // if (result.data.success === false) {
            //     Alert.alert("Error", result.data.message)
            //     return;
            // }
            // setUser(result);
            // setIsLogged(true);

            // Alert.alert("Success", "User signed in successfully");
            // router.replace("/home");
        } catch (error) {
            Alert.alert("Error", error.message);
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

                    <Text className="text-[18px] text-center font-semibold text-white mt-10 font-secondary">
                        Enter the email associated with your account, and we’ll send you a link to reset your password.
                    </Text>

                    <FormField
                        title="Email"
                        value={form.email}
                        handleChangeText={(e) => setForm({ ...form, email: e })}
                        otherStyles="mt-7"
                        keyboardType="email-address"
                    />

                    <CustomButton
                        title="Submit"
                        handlePress={submit}
                        containerStyles="w-full"
                        isLoading={isSubmitting}
                    />

                    <View className="flex justify-center pt-5 flex-row gap-2">
                        <Text className="text-lg text-gray-100 font-pregular">
                            Don't have an account?
                        </Text>
                        <Link
                            href="/sign-up"
                            className="text-lg font-secondary text-secondary"
                        >
                            Sign up
                        </Link>
                    </View>
                    {/* <View className="flex justify-center pt-5 flex-row gap-2">
                        <Text className="text-lg text-gray-100 font-pregular">
                            Or proceed to
                        </Text>
                        <Link
                            href="/sign-in"
                            className="text-lg font-psemibold text-secondary"
                        >
                            Sign In
                        </Link>
                    </View> */}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ForgotPassword;
