import { useEffect } from "react";
import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
  AdEventType,
} from "react-native-google-mobile-ads";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

const STORAGE_KEY = "REWARDED_AD_VIEW_COUNT";

interface Props {
  onRewardEarned?: (reward: { amount: number; type: string }) => void;
  onClose?: () => void;
  adUnitId?: string;
}

const RewardedAdComponent = ({
  onRewardEarned,
  onClose,
  adUnitId = TestIds.REWARDED,
}: // adUnitId = "ca-app-pub-4516568539037938/1775609882",
Props) => {
  useEffect(() => {
    const now = Date.now();
    const rewarded = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubscribeLoaded = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => rewarded.show()
    );

    const unsubscribeClosed = rewarded.addAdEventListener(
      AdEventType.CLOSED,
      () => onClose?.()
    );

    const unsubscribeReward = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      async (reward) => {
        onRewardEarned?.(reward);

        let stored = await AsyncStorage.getItem(STORAGE_KEY);
        let data = stored ? JSON.parse(stored) : { timestamp: now, count: 0 };

        const expired = now - data.timestamp >= 24 * 60 * 60 * 1000;

        if (expired) {
          data = { timestamp: now, count: 0 };
          // await scheduleAdResetNotification();
        }

        data.count += 1;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    );

    rewarded.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeReward();
    };
  }, []);

  return null;
};
/*
const scheduleAdResetNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🎁 Ad rewards are available!",
      body: "You can now watch ads again for rewards.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 24 * 60 * 60,
    },
  });
};*/

export default RewardedAdComponent;
