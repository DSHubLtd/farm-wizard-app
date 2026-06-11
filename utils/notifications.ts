import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Local push notifications driven by in-app events and game activity.

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const COME_BACK_ID = "come-back-reminder";
const PAUSED_SESSION_ID = "paused-session-reminder";
const LAST_NOTIFIED_KEY = "last-notified-app-notification";

export const initNotifications = async () => {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Farm Wizard",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      await Notifications.requestPermissionsAsync();
    }
  } catch (e) {
    console.warn("Notification init failed:", e);
  }
};

// Daily nudge if the player hasn't opened the app; rescheduled on every
// app open so it only fires after 24h of inactivity.
export const scheduleComeBackReminder = async () => {
  try {
    await Notifications.cancelScheduledNotificationAsync(COME_BACK_ID).catch(
      () => {}
    );
    await Notifications.scheduleNotificationAsync({
      identifier: COME_BACK_ID,
      content: {
        title: "🌱 Your farm misses you!",
        body: "Come back to Farm Wizard — your crops are waiting to grow and earn you points.",
      },
      trigger: { seconds: 24 * 60 * 60 },
    });
  } catch (e) {
    console.warn("Failed to schedule come-back reminder:", e);
  }
};

// Reminder when the player pauses and exits mid-session.
export const schedulePausedSessionReminder = async (plantName?: string) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(
      PAUSED_SESSION_ID
    ).catch(() => {});
    await Notifications.scheduleNotificationAsync({
      identifier: PAUSED_SESSION_ID,
      content: {
        title: "⏸️ Your session is paused",
        body: plantName
          ? `Your ${plantName} is waiting — come back and finish growing it!`
          : "Your plant is waiting — come back and finish the session!",
      },
      trigger: { seconds: 2 * 60 * 60 },
    });
  } catch (e) {
    console.warn("Failed to schedule paused-session reminder:", e);
  }
};

export const cancelPausedSessionReminder = async () => {
  try {
    await Notifications.cancelScheduledNotificationAsync(PAUSED_SESSION_ID);
  } catch (e) {
    // nothing scheduled — fine
  }
};

// Fired right after a completed session.
export const notifySessionComplete = async (points?: number) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🎉 Session complete!",
        body:
          points !== undefined
            ? `Great harvest! You earned ${points} points. Play again to grow your balance.`
            : "Great harvest! Play again to grow your balance.",
      },
      trigger: null, // immediate
    });
  } catch (e) {
    console.warn("Failed to send session-complete notification:", e);
  }
};

// Mirror new in-app notifications (from the bell menu) as push notifications.
// Only notifies for notifications newer than the last one already shown.
export const notifyNewAppNotifications = async (notifications: any[]) => {
  try {
    if (!Array.isArray(notifications) || notifications.length === 0) return;
    const latest = notifications[0];
    const id = String(latest._id || latest.id || latest.createdAt || "");
    if (!id) return;

    const lastSeen = await AsyncStorage.getItem(LAST_NOTIFIED_KEY);
    await AsyncStorage.setItem(LAST_NOTIFIED_KEY, id);

    // First run: just record the marker, don't replay old notifications.
    if (lastSeen === null || lastSeen === id) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Farm Wizard",
        body: latest.message || "You have a new notification.",
      },
      trigger: null,
    });
  } catch (e) {
    console.warn("Failed to mirror app notification:", e);
  }
};
