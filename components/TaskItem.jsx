import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TaskItem({ task, onPress }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return { backgroundColor: "#10b981" };
      case "in progress":
        return { backgroundColor: "#f59e0b" };
      case "pending":
        return { backgroundColor: "#9ca3af" };
      default:
        return { backgroundColor: "#9ca3af" };
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Main Content */}
      <View style={styles.mainContent}>
        <Text style={styles.description} numberOfLines={2}>
          {task.task_description}
        </Text>

        {/* Project and Status Row */}
        <View style={styles.metaRow}>
          {task.projects && (
            <Text style={styles.project} numberOfLines={1}>
              {task.projects.name}
            </Text>
          )}
          <View style={[styles.status, getStatusColor(task.status)]}>
            <Text style={styles.statusText}>{task.status}</Text>
          </View>
        </View>

        {/* Hours and Date Row */}
        <View style={styles.detailsRow}>
          {task.hours_spent && (
            <Text style={styles.hours}>{task.hours_spent} hrs</Text>
          )}
          <Text style={styles.date}>
            {new Date(task.date).toLocaleDateString()}
          </Text>
          {task.is_overtime && (
            <View style={styles.overtime}>
              <Text style={styles.overtimeText}>OT</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mainContent: {
    flex: 1,
  },
  description: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 6,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  project: {
    fontSize: 13,
    color: "#3b82f6",
    fontWeight: "500",
    flex: 1,
    marginRight: 8,
  },
  status: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 60,
    alignItems: "center",
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  hours: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  date: {
    fontSize: 12,
    color: "#6b7280",
  },
  overtime: {
    backgroundColor: "#ffedd5",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  overtimeText: {
    color: "#9a3412",
    fontSize: 10,
    fontWeight: "600",
  },
});
