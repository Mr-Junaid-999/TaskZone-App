//pushNotifications.js
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

// Notification handler setup
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const PushNotificationService = {
  // Permission mangain
  registerForPushNotifications: async () => {
    if (!Device.isDevice) {
      console.log("Must use physical device for Push Notifications");
      return null;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Push token:", token);

    // Token ko apne server ya database mein save karen
    return token;
  },

  // Local notification show karen
  showLocalNotification: async (title, body, data = {}) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: "default",
      },
      trigger: null, // Immediately
    });
  },
};
