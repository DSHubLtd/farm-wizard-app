import { useCallback, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { BackHandler, Dimensions, Platform, ScrollView, Text, ToastAndroid, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, router, useFocusEffect } from "expo-router";

import CustomButton from "../components/CustomButton";

import { images } from "../constants";
import { useLoginContext } from "../context/LoginProvider";
import BackgroundImage from "../components/BackgroundImage";
import { useTranslation } from "react-i18next";
import WebView from "react-native-webview";
const { height } = Dimensions.get("window");

export default function Index() {

  const { loading, isLogged } = useLoginContext();

  if (!loading && isLogged) return <Redirect href={"/(tabs)/home"} />;

  const [backPressedOnce, setBackPressedOnce] = useState(false);
  const timeoutRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return;

      const onBackPress = () => {
        if (backPressedOnce) {
          BackHandler.exitApp();
          return true;
        }

        setBackPressedOnce(true);
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);

        timeoutRef.current = setTimeout(() => {
          setBackPressedOnce(false);
        }, 2000);

        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        backHandler.remove();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, [backPressedOnce])
  )
  const { t } = useTranslation();

  return (
    <SafeAreaView className="bg-primary h-full" edges={['left', 'right', 'bottom']} style={{ flex: 1 }}>
      {/* Background Image */}
      <BackgroundImage source={images.background} />

      <View className="w-full flex justify-center items-center min-h-[95vh] px-4">

        <View className="my-20 ">
          <Text className="text-3xl text-white font-primary text-center">
            {t("settings.terms_and_condition")}
          </Text>
        </View>

        <ScrollView style={{ flex: 1, width: '100%', }}
        // showsVerticalScrollIndicator={false}
        // className="min-h-50"
        >
          <View style={{ paddingVertical: 20, }}>
            <Text className="text-lg font-secondary text-gray-50 text-center border-r-4 border-r-[#E1CE67]">
              {/* {t("messages.terms_and_condition_text")} */}
              <Text> Terms and Conditions</Text>
              Last Updated May 27, 2025

              Welcome to Farm Wizard, a mobile app developed by DSHub Ltd. By downloading, installing,
              or using the Farm Wizard app (“the App”), you agree to be bound by these Terms and
              Conditions. If you do not agree, do not use the App.

              1. Acceptance of Terms
              By accessing or using the App, you confirm that you are at least 18 years old (or have the
              permission of a parent or guardian if under 18) and that you understand and accept these Terms
              and our Privacy Policy.

              2. Game Overview
              Farm Wizard is a skill-based mobile farming game that allows users to:
              ● Plant and grow virtual crops
              ● Earn coins or tokens for in-game actions
              ● Redeem rewards based on gameplay performance and milestones

              Please note: Rewards are subject to verification, eligibility, and our internal review process.

              3. Eligibility
              Use of the App is void where prohibited. To be eligible to redeem monetary or non-monetary
              rewards:
              ● You must provide accurate and verifiable user information.

              ● You must not engage in fraudulent or exploitative behavior.
              ● You must reside in a country where our services are legally permitted.

              4. Coins, Rewards & Payouts
              ● Coins earned through gameplay may be exchanged for real-world rewards only as
              specified within the App.
              ● Payout thresholds must be met before redemption is permitted.
              ● All redemptions are subject to verification to prevent fraud or system abuse.
              ● DSHub reserves the right to modify, suspend, or terminate the rewards program at any
              time without prior notice.

              5. Fair Use Policy
              ● Users must play fairly. Use of bots, automation, or exploitation of game bugs is strictly
              prohibited.
              ● Accounts found in violation of this policy may be suspended or permanently banned.
              ● Any attempt to manipulate gameplay mechanics for unfair gain will result in forfeiture of
              rewards.

              6. Data Collection & Privacy
              By using the App, you consent to the collection and use of personal and gameplay data as
              outlined in our Privacy Policy. This includes:
              ● Device information

              ● Gameplay behavior
              ● Payout and identity verification data

              We do not sell your data to third parties. All information is stored securely and handled in
              accordance with the Nigeria Data Protection Act (NDPA) 2023 and applicable global standards.

              7. User Accounts
              ● You are responsible for keeping your account credentials secure.
              ● You must not share, transfer, or sell your account to another individual.
              ● Multiple accounts per user are not permitted and will be flagged as abuse.

              8. Intellectual Property
              All content in the App, including graphics, game logic, characters, and branding, is the
              intellectual property of DSHub Ltd. You may not copy, reproduce, or redistribute any part of the
              App without written permission.

              9. Termination
              DSHub reserves the right to terminate or suspend access to the App and its reward features at
              any time for:
              ● Breach of terms
              ● Fraudulent activity
              ● Abuse of the system
              ● Legal or technical reasons

              10. Disclaimer of Warranties
              Farm Wizard is provided “as is” and “as available.” DSHub makes no warranties regarding:
              ● Continuous availability
              ● Error-free functionality
              ● Guaranteed earnings

              DSHub shall not be liable for losses arising from reliance on the App, delays in payment, or
              technical failures.

              11. Limitation of Liability
              To the maximum extent permitted by law, DSHub shall not be held liable for any indirect,
              incidental, or consequential damages arising from the use or inability to use the App or from any
              dispute related to rewards or payouts.

              12. Modifications
              DSHub may update these Terms at any time. Changes will be communicated via the App or
              email. Continued use of the App constitutes acceptance of the revised terms.

              13. Governing Law
              These Terms and Conditions are governed by the laws of the Federal Republic of Nigeria. Any
              disputes arising shall be resolved in accordance with applicable Nigerian legal procedures.

              14. Contact Us

              If you have questions or concerns about these Terms, you may contact us at:
              📧 dinisoft.dev@gmail.com
              📍 DSHub Ltd, No. 3 Maccido Crescent, Malali GRA, Kaduna, Nigeria

              By clicking “Agree” or continuing to use the App, you confirm that you have read,
              understood, and accepted these Terms and Conditions.
            </Text>

            {/* <WebView
              source={{ uri: 'https://drive.google.com/file/d/16hn7MVwghhZ7n5ocXYxu3TVOZ5GPJOYX/view' }}
              style={{ height: height * 0.8 }}
              originWhitelist={['*']}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            /> */}
          </View>
        </ScrollView>

        <CustomButton
          title={t("buttons.agree_continue")}
          handlePress={() => router.push("/sign-in")}
          containerStyles="w-full"
          textStyles={"font-pbold text-white"}
          isLoading={loading}
        />
      </View>

      <StatusBar backgroundColor="#161622" style="light" />

    </SafeAreaView >
  );
}
