import { useEffect } from "react";
import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
  AdEventType,
} from "react-native-google-mobile-ads";

interface Props {
  onRewardEarned?: (reward: { amount: number; type: string }) => void;
  onClose?: () => void;
  adUnitId?: string;
}

const RewardedAdComponent = ({
  onRewardEarned,
  onClose,
  adUnitId = TestIds.REWARDED,
}: Props) => {
  useEffect(() => {
    const rewarded = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    const onAdLoaded = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => rewarded.show()
    );

    const onAdClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () =>
      onClose?.()
    );

    const onUserEarnedReward = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => onRewardEarned?.(reward)
    );

    rewarded.load();

    return () => {
      onAdLoaded();
      onAdClosed();
      onUserEarnedReward();
    };
  }, []);

  return null;
};

export default RewardedAdComponent;
