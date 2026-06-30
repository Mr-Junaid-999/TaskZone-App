import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../../components/Header";
import { NotificationService } from "../../services/notifications";

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      await NotificationService.getuserid();
      const notifs = await NotificationService.getUserNotifications();
      setNotifications(notifs);
    } catch (error) {
      console.error("Error loading notifications:", error);
      Alert.alert("Error", "Failed to load notifications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleNotificationPress = async (notification) => {
    // Mark as read
    if (!notification.is_read) {
      try {
        await NotificationService.markAsRead(notification.id);
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n,
          ),
        );
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }

    // Navigate based on notification type
    navigateToDetails(notification);
  };

  const navigateToDetails = (notification) => {
    switch (notification.related_entity_type) {
      case "overtime":
        router.push(
          `/notification-details?type=overtime&id=${notification.related_entity_id}`,
        );
        break;
      case "project":
        router.push(
          `/notification-details?type=project&id=${notification.related_entity_id}`,
        );
        break;
      case "task":
        router.push(
          `/notification-details?type=task&id=${notification.related_entity_id}`,
        );
        break;
      default:
        router.push(`/notification-details?type=general&id=${notification.id}`);
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      Alert.alert("Success", "All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      Alert.alert("Error", "Failed to mark all as read");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "warning":
        return "warning";
      case "error":
        return "close-circle";
      case "info":
      default:
        return "information-circle";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "success":
        return "#10b981";
      case "warning":
        return "#f59e0b";
      case "error":
        return "#ef4444";
      case "info":
      default:
        return "#3b82f6";
    }
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.is_read && styles.unreadNotification,
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.notificationIconContainer}>
          <Ionicons
            name={getNotificationIcon(item.type)}
            size={20}
            color={getNotificationColor(item.type)}
          />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
        {!item.is_read && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Header title="Notifications" showBackButton={true} />
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* <Header
        title="Notifications"
        showBackButton={true}
        rightComponent={
          notifications.some((n) => !n.is_read) && (
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={styles.markAllText}>Mark All Read</Text>
            </TouchableOpacity>
          )
        }
      /> */}

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-off-outline"
              size={64}
              color="#9ca3af"
            />
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>You&apos;re all caught up!</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  listContainer: {
    flexGrow: 1,
    padding: 16,
  },
  notificationItem: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  notificationIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: "#9ca3af",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563eb",
    marginLeft: 8,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
  },
  markAllText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
