import React from "react";
import { View, Pressable, Image, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { icons } from "@/constants";
import { router, usePathname } from "expo-router";
import { playSound } from "@/utils/audio";

const ACTIVE = "#2C6C3B";
const ACTIVE_BG = "#FCC200";
const INACTIVE = "#E6F0E0";

const TABS = [
  { key: "profile", label: "Profile", icon: icons.profile, path: "/(tabs)/profile" },
  { key: "home", label: "Home", icon: icons.home, path: "/(tabs)/home" },
  { key: "leaderboard", label: "Ranks", icon: icons.stats, path: "/(tabs)/leaderboard" },
] as const;

export default function CustomBottomTab() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const go = (path: string) => {
    router.push(path as any);
    playSound(require("@/assets/sounds/click.mp3"), 0.05);
  };

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: insets.bottom ? insets.bottom : 8,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          marginHorizontal: 16,
          marginBottom: 8,
          height: 64,
          borderRadius: 28,
          backgroundColor: ACTIVE,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        {TABS.map((tab) => {
          const active = pathname?.endsWith(`/${tab.key}`);
          return (
            <Pressable
              key={tab.key}
              onPress={() => go(tab.path)}
              style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: active ? 16 : 0,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: active ? ACTIVE_BG : "transparent",
                }}
              >
                <Image
                  source={tab.icon}
                  resizeMode="contain"
                  style={{
                    width: 24,
                    height: 24,
                    tintColor: active ? ACTIVE : INACTIVE,
                  }}
                />
                {active && (
                  <Text
                    style={{
                      color: ACTIVE,
                      fontWeight: "700",
                      fontSize: 13,
                      marginLeft: 6,
                    }}
                  >
                    {tab.label}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
