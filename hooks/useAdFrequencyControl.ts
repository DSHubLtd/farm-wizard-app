// usage
// import React from "react";
// import InterstitialAdComponent from "./components/InterstitialAdComponent";
// import { useAdFrequencyControl } from "./hooks/useAdFrequencyControl";

// export default function SomeScreen() {
//   const { canShowAd, markAdShown } = useAdFrequencyControl(15); // 15-minute cooldown

//   return (
//     <>
//       {canShowAd && (
//         <InterstitialAdComponent
//           onClose={() => {
//         markAdShown(); // prevent re-showing too soon
//       }}
//     />
//   )}
{
  /* Your screen content */
}
// </>
//   );
// }

import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "lastAdShownAt";

export function useAdFrequencyControl(intervalMinutes: number = 10) {
  const [canShowAd, setCanShowAd] = useState(false);

  useEffect(() => {
    checkAdPermission();
  }, []);

  const checkAdPermission = async () => {
    try {
      const lastShown = await AsyncStorage.getItem(STORAGE_KEY);
      const now = Date.now();

      if (
        !lastShown ||
        now - parseInt(lastShown) > intervalMinutes * 60 * 1000
      ) {
        setCanShowAd(true);
      }
    } catch (err) {
      console.warn("Failed to check ad permission:", err);
      setCanShowAd(true); // fail-safe: allow ad
    }
  };

  const markAdShown = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, Date.now().toString());
      setCanShowAd(false);
    } catch (err) {
      console.warn("Failed to mark ad as shown:", err);
    }
  };

  return { canShowAd, markAdShown };
}
