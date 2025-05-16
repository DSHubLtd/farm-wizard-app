// usage
// <BannerAdComponent style={{ marginBottom: 16 }} />

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

const BannerAdComponent = ({
  adUnitId = TestIds.BANNER,
  size = BannerAdSize.ADAPTIVE_BANNER,
  style = {},
}: Props) => {
  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={adUnitId}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
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
