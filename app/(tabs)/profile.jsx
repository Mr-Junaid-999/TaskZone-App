import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthService } from "../../services/auth";
import { OvertimeService } from "../../services/overtime";
import { ProjectsService } from "../../services/projects";
import { supabase } from "../../services/supabase";
import { TasksService } from "../../services/tasks";

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedTasks: 0,
    overtimeHours: 0,
    pendingOvertime: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Settings states
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    overtimeUpdates: false,
    projectUpdates: true,
    deadlineAlerts: true,
  });

  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [privacyModal, setPrivacyModal] = useState(false);
  const [notificationModal, setNotificationModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "team", // 'public', 'team', 'private'
    showEmail: true,
    showPhone: false,
    activityStatus: true,
  });
  const router = useRouter();

  useEffect(() => {
    loadProfileData();
    loadUserSettings();
  }, []);

  const loadProfileData = async () => {
    try {
      const userData = await AuthService.getCurrentUser();
      setUser(userData);

      // Load user profile from employees table
      const { data: profileData, error } = await supabase
        .from("employees")
        .select("*")
        .eq("email", userData.email)
        .single();

      if (!error && profileData) {
        setUserProfile(profileData);
      }

      // Load stats
      const [projectsData, tasksData, overtimeData] = await Promise.all([
        ProjectsService.getUserProjects(),
        TasksService.getUserTasks(),
        OvertimeService.getUserOvertime(),
      ]);

      const approvedOvertime = overtimeData.filter(
        (ot) => ot.status === "approved"
      );
      const totalOvertimeHours = approvedOvertime.reduce(
        (sum, ot) => sum + parseFloat(ot.total_hours),
        0
      );

      setStats({
        totalProjects: projectsData.length,
        completedTasks: tasksData.filter((t) => t.status === "completed")
          .length,
        overtimeHours: totalOvertimeHours,
        pendingOvertime: overtimeData.filter((ot) => ot.status === "pending")
          .length,
      });
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserSettings = async () => {
    try {
      // For now, using default values
      console.log("Loading user settings...");
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AuthService.signOut();
            router.replace("/(auth)/login");
          } catch (error) {
            console.error("Error logging out:", error);
            Alert.alert("Error", "Failed to logout");
          }
        },
      },
    ]);
  };

  // Notification Settings Handlers
  const handleNotificationToggle = async (setting) => {
    const updatedSettings = {
      ...notificationSettings,
      [setting]: !notificationSettings[setting],
    };

    setNotificationSettings(updatedSettings);
    Alert.alert("Success", "Notification settings updated");
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    try {
      const { error } = await AuthService.changePasswordWithVerification(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (error) {
        Alert.alert("Error", error.message || "Failed to change password");
        return;
      }

      Alert.alert("Success", "Password changed successfully");
      setChangePasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      Alert.alert("Error", "Failed to change password");
    }
  };
  // Privacy Settings Handler
  const handlePrivacyChange = async (setting, value) => {
    const updatedSettings = {
      ...privacySettings,
      [setting]: value,
    };

    setPrivacySettings(updatedSettings);
  };

  const savePrivacySettings = async () => {
    try {
      Alert.alert("Success", "Privacy settings updated");
      setPrivacyModal(false);
    } catch (error) {
      console.error("Error saving privacy settings:", error);
      Alert.alert("Error", "Failed to save privacy settings");
    }
  };

  const saveNotificationSettings = async () => {
    try {
      Alert.alert("Success", "Notification settings updated");
      setNotificationModal(false);
    } catch (error) {
      console.error("Error saving notification settings:", error);
      Alert.alert("Error", "Failed to save notification settings");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }
  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userProfile?.name
                  ? userProfile.name.charAt(0).toUpperCase()
                  : "U"}
              </Text>
            </View>
            <Text style={styles.userName}>{userProfile?.name || "User"}</Text>
            <Text style={styles.userPosition}>
              {userProfile?.position || "Employee"}
            </Text>
            <Text style={styles.userDepartment}>
              {userProfile?.department || "No Department"}
            </Text>
          </View>

          <View style={styles.profileDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{user?.email}</Text>
            </View>
            {userProfile?.phone && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>{userProfile.phone}</Text>
              </View>
            )}
            {userProfile?.join_date && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Join Date</Text>
                <Text style={styles.detailValue}>
                  {new Date(userProfile.join_date).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Performance Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Performance Summary</Text>

          <View style={styles.statsList}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Projects</Text>
              <Text style={[styles.statValue, { color: "#2563eb" }]}>
                {stats.totalProjects}
              </Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Completed Tasks</Text>
              <Text style={[styles.statValue, { color: "#10b981" }]}>
                {stats.completedTasks}
              </Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Overtime Hours</Text>
              <Text style={[styles.statValue, { color: "#f59e0b" }]}>
                {stats.overtimeHours}
              </Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Pending Overtime</Text>
              <Text style={[styles.statValue, { color: "#ef4444" }]}>
                {stats.pendingOvertime}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Options */}
        <View style={styles.settingsCard}>
          <Text style={styles.cardTitle}>Settings</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setNotificationModal(true)}
          >
            <Text style={styles.settingText}>Notification Preferences</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setChangePasswordModal(true)}
          >
            <Text style={styles.settingText}>Change Password</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setPrivacyModal(true)}
          >
            <Text style={styles.settingText}>Privacy Settings</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>TaskZone v1.0.0</Text>
      </View>

      {/* Notification Settings Modal */}
      <Modal
        visible={notificationModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { maxHeight: "80%" }]}>
            <Text style={styles.modalTitle}>Notification Preferences</Text>

            <ScrollView style={styles.modalScrollView}>
              <View style={styles.settingGroup}>
                <Text style={styles.groupTitle}>General Notifications</Text>

                <View style={styles.notificationToggle}>
                  <Text style={styles.notificationLabel}>
                    Email Notifications
                  </Text>
                  <Switch
                    value={notificationSettings.emailNotifications}
                    onValueChange={() =>
                      handleNotificationToggle("emailNotifications")
                    }
                  />
                </View>

                <View style={styles.notificationToggle}>
                  <Text style={styles.notificationLabel}>
                    Push Notifications
                  </Text>
                  <Switch
                    value={notificationSettings.pushNotifications}
                    onValueChange={() =>
                      handleNotificationToggle("pushNotifications")
                    }
                  />
                </View>
              </View>

              <View style={styles.settingGroup}>
                <Text style={styles.groupTitle}>Task Notifications</Text>

                <View style={styles.notificationToggle}>
                  <Text style={styles.notificationLabel}>Task Reminders</Text>
                  <Switch
                    value={notificationSettings.taskReminders}
                    onValueChange={() =>
                      handleNotificationToggle("taskReminders")
                    }
                  />
                </View>

                <View style={styles.notificationToggle}>
                  <Text style={styles.notificationLabel}>Deadline Alerts</Text>
                  <Switch
                    value={notificationSettings.deadlineAlerts}
                    onValueChange={() =>
                      handleNotificationToggle("deadlineAlerts")
                    }
                  />
                </View>
              </View>

              <View style={styles.settingGroup}>
                <Text style={styles.groupTitle}>Update Notifications</Text>

                <View style={styles.notificationToggle}>
                  <Text style={styles.notificationLabel}>Overtime Updates</Text>
                  <Switch
                    value={notificationSettings.overtimeUpdates}
                    onValueChange={() =>
                      handleNotificationToggle("overtimeUpdates")
                    }
                  />
                </View>

                <View style={styles.notificationToggle}>
                  <Text style={styles.notificationLabel}>Project Updates</Text>
                  <Switch
                    value={notificationSettings.projectUpdates}
                    onValueChange={() =>
                      handleNotificationToggle("projectUpdates")
                    }
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setNotificationModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveNotificationSettings}
              >
                <Text style={styles.saveButtonText}>Save Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={changePasswordModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Current Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={passwordData.currentPassword}
              onChangeText={(text) =>
                setPasswordData({ ...passwordData, currentPassword: text })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={passwordData.newPassword}
              onChangeText={(text) =>
                setPasswordData({ ...passwordData, newPassword: text })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={passwordData.confirmPassword}
              onChangeText={(text) =>
                setPasswordData({ ...passwordData, confirmPassword: text })
              }
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setChangePasswordModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleChangePassword}
              >
                <Text style={styles.saveButtonText}>Change Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Privacy Settings Modal */}
      <Modal visible={privacyModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Privacy Settings</Text>

            <View style={styles.privacySetting}>
              <Text style={styles.privacyLabel}>Profile Visibility</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() =>
                    handlePrivacyChange("profileVisibility", "public")
                  }
                >
                  <View
                    style={[
                      styles.radioCircle,
                      privacySettings.profileVisibility === "public" &&
                        styles.radioCircleSelected,
                    ]}
                  >
                    {privacySettings.profileVisibility === "public" && (
                      <View style={styles.radioInnerCircle} />
                    )}
                  </View>
                  <Text style={styles.radioLabel}>Public</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() =>
                    handlePrivacyChange("profileVisibility", "team")
                  }
                >
                  <View
                    style={[
                      styles.radioCircle,
                      privacySettings.profileVisibility === "team" &&
                        styles.radioCircleSelected,
                    ]}
                  >
                    {privacySettings.profileVisibility === "team" && (
                      <View style={styles.radioInnerCircle} />
                    )}
                  </View>
                  <Text style={styles.radioLabel}>Team Only</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() =>
                    handlePrivacyChange("profileVisibility", "private")
                  }
                >
                  <View
                    style={[
                      styles.radioCircle,
                      privacySettings.profileVisibility === "private" &&
                        styles.radioCircleSelected,
                    ]}
                  >
                    {privacySettings.profileVisibility === "private" && (
                      <View style={styles.radioInnerCircle} />
                    )}
                  </View>
                  <Text style={styles.radioLabel}>Private</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.privacyToggle}>
              <Text style={styles.privacyLabel}>Show Email Address</Text>
              <Switch
                value={privacySettings.showEmail}
                onValueChange={(value) =>
                  handlePrivacyChange("showEmail", value)
                }
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={privacySettings.showEmail ? "#2563eb" : "#f4f3f4"}
              />
            </View>

            <View style={styles.privacyToggle}>
              <Text style={styles.privacyLabel}>Show Phone Number</Text>
              <Switch
                value={privacySettings.showPhone}
                onValueChange={(value) =>
                  handlePrivacyChange("showPhone", value)
                }
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={privacySettings.showPhone ? "#2563eb" : "#f4f3f4"}
              />
            </View>

            <View style={styles.privacyToggle}>
              <Text style={styles.privacyLabel}>Show Activity Status</Text>
              <Switch
                value={privacySettings.activityStatus}
                onValueChange={(value) =>
                  handlePrivacyChange("activityStatus", value)
                }
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={
                  privacySettings.activityStatus ? "#2563eb" : "#f4f3f4"
                }
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setPrivacyModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={savePrivacySettings}
              >
                <Text style={styles.saveButtonText}>Save Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    padding: 16,
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
  profileCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: "#2563eb",
    borderRadius: 40,
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  userPosition: {
    fontSize: 18,
    color: "#6b7280",
    marginBottom: 4,
  },
  userDepartment: {
    color: "#2563eb",
    fontWeight: "500",
    fontSize: 16,
  },
  profileDetails: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    color: "#6b7280",
    fontSize: 14,
  },
  detailValue: {
    color: "#1f2937",
    fontWeight: "500",
    fontSize: 14,
  },
  statsCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  statsList: {
    gap: 12,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    color: "#6b7280",
    fontSize: 16,
  },
  statValue: {
    fontWeight: "bold",
    fontSize: 18,
  },
  overtimeHighlight: {
    backgroundColor: "#dbeafe",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  overtimeTotal: {
    color: "#2563eb",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
  overtimeStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  overtimeStatItem: {
    alignItems: "center",
    flex: 1,
  },
  overtimeStatNumber: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  overtimeStatLabel: {
    color: "#6b7280",
    fontSize: 12,
    textAlign: "center",
  },
  settingsCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  settingText: {
    color: "#374151",
    fontSize: 16,
  },
  settingArrow: {
    color: "#2563eb",
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  logoutButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 18,
  },
  versionText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14,
    marginTop: 8,
  },

  // Add these new styles for modals and settings
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#1f2937",
  },
  input: {
    color: "black",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  saveButton: {
    backgroundColor: "#2563eb",
  },
  cancelButtonText: {
    color: "#374151",
    textAlign: "center",
    fontWeight: "600",
  },
  saveButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
  privacySetting: {
    marginBottom: 20,
  },
  privacyToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
  },
  privacyLabel: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
  },
  radioGroup: {
    marginTop: 8,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioCircleSelected: {
    borderColor: "#2563eb",
  },
  radioInnerCircle: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#2563eb",
  },
  radioLabel: {
    fontSize: 16,
    color: "#374151",
  },

  // Add new styles for notification modal
  modalScrollView: {
    maxHeight: 400,
  },
  settingGroup: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#374151",
  },
  notificationToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  notificationLabel: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
  },

  // ... rest of the styles remain the same
});
