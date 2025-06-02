import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "REWARDED_AD_VIEW_COUNT";

export const getRemainingAdViews = async (limit = 3): Promise<number> => {
  const now = Date.now();
  const stored = await AsyncStorage.getItem(STORAGE_KEY);

  if (!stored) return limit;

  const { timestamp, count } = JSON.parse(stored);
  const expired = now - timestamp >= 24 * 60 * 60 * 1000;

  return expired ? limit : Math.max(0, limit - count);
};

export const canShowRewardedAd = async (limit = 3): Promise<boolean> => {
  const remaining = await getRemainingAdViews(limit);
  return remaining > 0;
};
