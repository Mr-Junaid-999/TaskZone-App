//TaskZone/components/Header.jsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NotificationService } from "../services/notifications";

export default function Header({
  title,
  showBackButton = false,
  rightComponent,
  style = {},
}) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const notifs = await NotificationService.getUserNotifications();
      setUnreadCount(notifs.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const handleNotificationPress = () => {
    router.push("/notifications");
  };

  return (
    <View style={[styles.header, style]}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        )}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.rightSection}>
        {/* Notification Bell */}
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={handleNotificationPress}
        >
          <Ionicons name="notifications-outline" size={24} color="white" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {rightComponent && (
          <View style={styles.customComponent}>{rightComponent}</View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationButton: {
    position: "relative",
    padding: 8,
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2563eb",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  customComponent: {
    marginLeft: 8,
  },
});
