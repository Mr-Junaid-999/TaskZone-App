// services/notifications.js
import { supabase } from "./supabase";
let user_id;
export const NotificationService = {
  async getuserid() {
    const { data: authUser } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("employees")
      .select()
      .eq("email", authUser.user.email);
    user_id = data[0].id;

    if (error) throw error;
  },
  // User ke notifications get karen
  getUserNotifications: async () => {
    // Check if user is manager
    const { data: managerCheck } = await supabase
      .from("departments")
      .select("manager_id")
      .eq("manager_id", user_id)
      .single();

    const isManager = !!managerCheck;
    console.log("User ID:", user_id);
    console.log("Is user a manager?", isManager);

    try {
      if (isManager) {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false });

        console.log("Fetched notificationsss:", data);

        if (error) throw error;
        return data || [];
      } else {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user_id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  },

  // New notification create karen
  createNotification: async (notificationData) => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .insert([notificationData])
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  },

  // Notification ko read mark karen
  markAsRead: async (notificationId) => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  // Sab notifications ko read mark karen
  markAllAsRead: async () => {
    try {
      const user = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.data.user?.id)
        .eq("is_read", false);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },
};
