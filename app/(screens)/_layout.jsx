import { Stack } from "expo-router";

export default function ScreenLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="farmScreen" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="home" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="claimScreen" />
      <Stack.Screen name="selectSeed" />
    </Stack>
  );
}
