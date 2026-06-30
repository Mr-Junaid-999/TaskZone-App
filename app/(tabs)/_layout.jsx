//TaskZone/app/(tabs)/_layout.jsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import Header from "../../components/Header";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#6b7280",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        // DEFAULT HEADER HIDE KAREIN
        header: ({ route, options }) => {
          const title =
            options.headerTitle ||
            options.title ||
            route.name.charAt(0).toUpperCase() + route.name.slice(1);

          return <Header title={title} showBackButton={false} />;
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
          // HEADER TITLE SET KAREIN
          headerTitle: "Dashboard",
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: "Projects",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "folder" : "folder-outline"}
              size={size}
              color={color}
            />
          ),
          headerTitle: "Projects",
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "list" : "list-outline"}
              size={size}
              color={color}
            />
          ),
          headerTitle: "Tasks",
        }}
      />
      <Tabs.Screen
        name="overtime"
        options={{
          title: "Overtime",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "time" : "time-outline"}
              size={size}
              color={color}
            />
          ),
          headerTitle: "Overtime",
        }}
      />
      <Tabs.Screen
        name="employees"
        options={{
          title: "Employees",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={size}
              color={color}
            />
          ),
          headerTitle: "Employees",
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "notifications" : "notifications-outline"}
              size={size}
              color={color}
            />
          ),
          headerTitle: "Notifications",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
          headerTitle: "Profile",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
});
