//usage
// const { playSpray, playFertilizer, playWater, playDry, playRain, playGrowth } =
//   usePreloadedSounds();
// useEffect(() => {
//   if (!currentSeason) return;

//   const play = async () => {
//     try {
//       if (currentSeason === "normal") {
//         playDry();
//       }
//     } catch (e) {
//       console.warn("Failed to play spray sound:", e);
//     }
//   };

//   play();
// }, [currentSeason, playDry]);
import { useEffect, useRef } from "react";
import { Audio } from "expo-av";

export function usePreloadedSounds() {
  const spraySound = useRef(null);
  const fertilizerSound = useRef(null);
  const waterSound = useRef(null);
  const drySound = useRef(null);
  const rainSound = useRef(null);
  const growthSound = useRef(null);

  useEffect(() => {
    const loadSounds = async () => {
      try {
        const [pesticide, fertilizer, water, dry, rain, growth] =
          await Promise.all([
            Audio.Sound.createAsync(require("@/assets/sounds/pesticide.mp3")),
            Audio.Sound.createAsync(require("@/assets/sounds/fertilizer.mp3")),
            Audio.Sound.createAsync(require("@/assets/sounds/water.mp3")),
            Audio.Sound.createAsync(require("@/assets/sounds/dry.mp3"), {
              volume: 0.8,
              isLooping: true,
            }),
            Audio.Sound.createAsync(require("@/assets/sounds/rain.mp3")),
            Audio.Sound.createAsync(
              require("@/assets/sounds/growth-level-reach.mp3")
            ),
            /*Audio.Sound.createAsync({
              uri: "https://orangefreesounds.com/wp-content/uploads/2023/09/Bug-zapper-sound-effect.mp3",
            }),*/
          ]);

        spraySound.current = pesticide.sound;
        fertilizerSound.current = fertilizer.sound;
        waterSound.current = water.sound;
        drySound.current = dry.sound;
        rainSound.current = rain.sound;
        growthSound.current = growth.sound;
      } catch (error) {
        console.warn("Error loading sounds:", error);
      }
    };

    loadSounds();

    return () => {
      spraySound.current?.unloadAsync();
      fertilizerSound.current?.unloadAsync();
      waterSound.current?.unloadAsync();
      drySound.current?.unloadAsync();
      rainSound.current?.unloadAsync();
      growthSound.current?.unloadAsync();
    };
  }, []);

  return {
    playSpray: () => spraySound.current?.replayAsync(),
    playFertilizer: () => fertilizerSound.current?.replayAsync(),
    playWater: () => waterSound.current?.replayAsync(),
    playDry: () => drySound.current?.replayAsync(),
    playRain: () => rainSound.current?.replayAsync(),
    playGrowth: () => growthSound.current?.replayAsync(),
  };
}
