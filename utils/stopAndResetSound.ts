import { Audio } from "expo-av";

export const stopAndResetSound = async (sound: Audio.Sound | null) => {
  if (!sound) return;
  const status = await sound.getStatusAsync();
  if (status.isLoaded && status.isPlaying) {
    await sound.stopAsync();
  }

  await sound.setPositionAsync(0);
};
