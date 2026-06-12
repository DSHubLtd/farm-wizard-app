import { Stack } from "expo-router";

export default function ScreenLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="selectSeed" />
      <Stack.Screen name="inventory" />
      <Stack.Screen name="plantScreen" />
      <Stack.Screen name="gameOver" />
      <Stack.Screen name="harvest" />
      <Stack.Screen name="sessionStarted" />
      <Stack.Screen name="transactionSuccess" />
    </Stack>
  );
}
