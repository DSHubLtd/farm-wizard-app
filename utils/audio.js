import { Audio } from "expo-av";

export const playSound = async (soundFile, volume = 1.0) => {
  const { sound } = await Audio.Sound.createAsync(soundFile, { volume });

  await sound.playAsync();

  // Clean up after playback finishes
  sound.setOnPlaybackStatusUpdate((status) => {
    if (status.didJustFinish) {
      sound.unloadAsync();
    }
  });
};
