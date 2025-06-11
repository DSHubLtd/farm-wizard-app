import React from "react";
import { View, StyleSheet } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

interface Props {
  adUnitId?: string;
  size?: BannerAdSize;
  style?: object;
}

const BannerAdComponent = ({ style = {} }: Props) => {
  return (
    <View
    //style={[styles.container, style]}
    >
      <BannerAd
        // unitId={adUnitId}
        // size={size}
        unitId={"ca-app-pub-4516568539037938/3383596217"}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={(error) => console.error(error)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default BannerAdComponent;
// <BannerAdComponent style={{ marginBottom: 16 }} />
// adUnitId = TestIds.BANNER,
//   size = BannerAdSize.ADAPTIVE_BANNER,
