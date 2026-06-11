// Rewarded-ad limiting is disabled: users may watch as many rewarded ads
// as AdMob will serve. The functions are kept so existing call sites
// (home, settings, harvest) keep working; restore the date-based logic
// from git history if a daily cap is ever wanted again.

export const getRemainingAdViews = async (_limit = 3): Promise<number> => {
  return Number.POSITIVE_INFINITY;
};

export const canShowRewardedAd = async (_limit = 3): Promise<boolean> => {
  return true;
};
