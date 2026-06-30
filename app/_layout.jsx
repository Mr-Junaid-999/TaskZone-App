// TASKZONE/app/_layout.jsx
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function RootLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    setupPushNotifications();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);

        // Jab user login kare to real-time notifications setup karein
        if (session?.user) {
          setupRealtimeNotifications(session.user.id);
        } else {
          // Jab user logout kare to real-time connection band karein
          supabase.removeAllChannels();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
      supabase.removeAllChannels();
    };
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);

    if (user) {
      setupRealtimeNotifications(user.id);
    }
  };

  // Push notifications setup
  const setupPushNotifications = async () => {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push notification permission!");
        return;
      }

      // Notification handler set karein
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    } catch (error) {
      console.error("Error setting up push notifications:", error);
    }
  };

  // Real-time notifications setup
  const setupRealtimeNotifications = (userId) => {
    console.log("Setting up real-time notifications for user:", userId);

    // Pehle existing channels remove karein
    supabase.removeAllChannels();

    const subscription = supabase
      .channel("notifications-" + userId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`, // Sirf current user ki notifications
        },
        async (payload) => {
          console.log("New notification received:", payload.new);

          // Local notification show karein
          await Notifications.scheduleNotificationAsync({
            content: {
              title: payload.new.title,
              body: payload.new.message,
              data: {
                type: payload.new.type,
                entityType: payload.new.related_entity_type,
                entityId: payload.new.related_entity_id,
              },
              sound: "default",
            },
            trigger: null, // Immediately
          });

          // Yahan aap additional handling kar sakte hain
          // Jaise ke notification count update karna, etc.
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Notification updated:", payload.new);
          // Yahan aap handle kar sakte hain agar notification update hua ho
        }
      )
      .subscribe((status) => {
        console.log("Real-time subscription status:", status);
      });

    return subscription;
  };

  if (loading) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
