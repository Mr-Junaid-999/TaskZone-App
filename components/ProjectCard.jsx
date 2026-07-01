//TaskZone/components/ProjectCard.jsx
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export default function ProjectCard({
  project,
  onPress,
  isManager,
  onDelete,
  onStatusChange,
  showActions = false,
}) {
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#10b981";
      case "in progress":
        return "#f59e0b";
      case "cancelled":
        return "#ef4444";
      case "pending":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case "completed":
        return "#dcfce7";
      case "in progress":
        return "#fffbeb";
      case "cancelled":
        return "#fef2f2";
      case "pending":
        return "#f3f4f6";
      default:
        return "#f3f4f6";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const handleStatusPress = () => {
    if (!onStatusChange) return;

    const statusOptions = ["pending", "in progress", "completed", "cancelled"];
    const currentIndex = statusOptions.indexOf(project.status);
    const nextIndex = (currentIndex + 1) % statusOptions.length;
    onStatusChange(statusOptions[nextIndex]);
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: "white",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: getPriorityColor(project.priority),
      }}
      onPress={isManager ? onPress : null}
    >
      {/* Header with actions */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: "#1f2937",
            flex: 1,
            marginRight: 12,
          }}
        >
          {project.name}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {/* Status Badge */}
          <TouchableOpacity
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              backgroundColor: getStatusBackgroundColor(project.status),
            }}
            onPress={handleStatusPress}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: getStatusColor(project.status),
              }}
            >
              {project.status.toUpperCase()}
            </Text>
          </TouchableOpacity>

          {/* Action Buttons */}
          {showActions && isManager && project.status !== "completed" && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              style={{ padding: 4 }}
            >
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Description */}
      {project.description && (
        <Text
          style={{
            color: "#6b7280",
            fontSize: 14,
            marginBottom: 8,
            lineHeight: 20,
          }}
        >
          {project.description}
        </Text>
      )}

      {/* Requirements */}
      {project.requirements && (
        <View
          style={{
            backgroundColor: "#dbeafe",
            padding: 8,
            borderRadius: 6,
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: "#2563eb",
              marginBottom: 4,
            }}
          >
            Requirements:
          </Text>
          <Text style={{ fontSize: 12, color: "#1f2937", lineHeight: 16 }}>
            {project.requirements}
          </Text>
        </View>
      )}

      {/* Footer */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "500",
              color: getPriorityColor(project.priority),
            }}
          >
            {project.priority} priority
          </Text>
        </View>

        {project.deadline && (
          <Text style={{ fontSize: 12, color: "#6b7280" }}>
            Due: {new Date(project.deadline).toLocaleDateString()}
          </Text>
        )}
      </View>

      {/* Created info */}
      {project.projects_created_by_fkey && (
        <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>
          Created by: {project.projects_created_by_fkey.name}
        </Text>
      )}
    </TouchableOpacity>
  );
}
