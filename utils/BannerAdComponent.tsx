import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
import { Cross } from "lucide-react-native";

interface Props {
  adUnitId?: string;
  size?: BannerAdSize;
  style?: object;
}

const LIFEGATE_URL = "https://mobile.dshub.com.ng";

// In-house fallback banner shown whenever AdMob has no ad to serve.
const LifeGateBanner = () => (
  <TouchableOpacity
    style={styles.lifeGate}
    activeOpacity={0.85}
    onPress={() => Linking.openURL(LIFEGATE_URL).catch(() => {})}
  >
    <View style={styles.lifeGateIcon}>
      <Cross size={26} color="#fff" fill="#fff" />
    </View>
    <View style={styles.lifeGateTextWrap}>
      <Text style={styles.lifeGateTitle}>
        Don't wait until it's too late
      </Text>
      <Text style={styles.lifeGateBody}>
        Get LifeGate Mobile to manage your health.
      </Text>
    </View>
  </TouchableOpacity>
);

const BannerAdComponent = ({ style = {} }: Props) => {
  // AdMob banner fills the slot when it loads; while it has no fill we
  // show the LifeGate house banner instead. If AdMob later loads (it
  // refreshes periodically), the house banner is hidden again.
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {failed && !loaded && <LifeGateBanner />}
      <View style={loaded ? undefined : styles.hidden}>
        <BannerAd
          unitId={"ca-app-pub-4516568539037938/3383596217"}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdLoaded={() => {
            setLoaded(true);
            setFailed(false);
          }}
          onAdFailedToLoad={(error) => {
            setLoaded(false);
            setFailed(true);
            console.warn("Banner ad failed to load:", error?.message || error);
          }}
        />
      </View>
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
  lifeGate: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderTopWidth: 2,
    borderTopColor: "#E53935",
    paddingVertical: 8,
    paddingHorizontal: 14,
    width: "100%",
  },
  lifeGateIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E53935",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  lifeGateTextWrap: {
    flex: 1,
  },
  lifeGateTitle: {
    color: "#B71C1C",
    fontWeight: "700",
    fontSize: 14,
  },
  lifeGateBody: {
    color: "#333333",
    fontSize: 12,
    marginTop: 1,
  },
});

export default BannerAdComponent;
