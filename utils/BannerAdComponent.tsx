import React, { useState } from "react";
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
  // Collapse the banner slot until an ad actually fills it, so screens
  // never show an empty strip when AdMob has no ad to serve.
  const [loaded, setLoaded] = useState(false);

  return (
    <View style={loaded ? [styles.container, style] : styles.hidden}>
      <BannerAd
        // unitId={adUnitId}
        // size={size}
        unitId={"ca-app-pub-4516568539037938/3383596217"}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => setLoaded(true)}
        onAdFailedToLoad={(error) => {
          setLoaded(false);
          console.warn("Banner ad failed to load:", error?.message || error);
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
  hidden: {
    height: 0,
    overflow: "hidden",
  },
});

export default BannerAdComponent;
// <BannerAdComponent style={{ marginBottom: 16 }} />
// adUnitId = TestIds.BANNER,
//   size = BannerAdSize.ADAPTIVE_BANNER,
