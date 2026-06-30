import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { OvertimeService } from "../services/overtime";
import { ProjectsService } from "../services/projects";
import { TasksService } from "../services/tasks";

export default function NotificationDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    loadDetails();
  }, [params.type, params.id]);

  const loadDetails = async () => {
    try {
      let data = null;

      switch (params.type) {
        case "overtime":
          data = await loadOvertimeDetails(params.id);
          break;
        case "project":
          data = await loadProjectDetails(params.id);
          break;
        case "task":
          data = await loadTaskDetails(params.id);
          break;
        default:
          data = { type: "general", message: "General notification" };
      }

      setDetails(data);
    } catch (error) {
      console.error("Error loading details:", error);
      Alert.alert("Error", "Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  const loadOvertimeDetails = async (id) => {
    const overtimeData = await OvertimeService.getUserOvertime();
    const overtime = overtimeData.find((ot) => ot.id === id);

    return {
      type: "overtime",
      title: "Overtime Request Details",
      data: overtime,
    };
  };

  const loadProjectDetails = async (id) => {
    const projectsData = await ProjectsService.getUserProjects();
    const project = projectsData.find((p) => p.id === id);

    return {
      type: "project",
      title: "Project Details",
      data: project,
    };
  };

  const loadTaskDetails = async (id) => {
    const tasksData = await TasksService.getUserTasks();
    const task = tasksData.find((t) => t.id === id);

    return {
      type: "task",
      title: "Task Details",
      data: task,
    };
  };

  const renderOvertimeDetails = (overtime) => (
    <View style={styles.detailsContainer}>
      <DetailItem
        label="Date"
        value={new Date(overtime.overtime_date).toLocaleDateString()}
      />
      <DetailItem label="Hours" value={`${overtime.total_hours} hours`} />
      <DetailItem label="Status" value={overtime.status} />
      <DetailItem label="Tasks Performed" value={overtime.tasks_performed} />
      {overtime.notes && <DetailItem label="Notes" value={overtime.notes} />}
      {overtime.projects?.name && (
        <DetailItem label="Project" value={overtime.projects.name} />
      )}
    </View>
  );

  const renderProjectDetails = (project) => (
    <View style={styles.detailsContainer}>
      <DetailItem label="Project Name" value={project.name} />
      <DetailItem label="Status" value={project.status} />
      <DetailItem label="Priority" value={project.priority} />
      {project.description && (
        <DetailItem label="Description" value={project.description} />
      )}
      {project.requirements && (
        <DetailItem label="Requirements" value={project.requirements} />
      )}
      {project.deadline && (
        <DetailItem
          label="Deadline"
          value={new Date(project.deadline).toLocaleDateString()}
        />
      )}
    </View>
  );

  const renderTaskDetails = (task) => (
    <View style={styles.detailsContainer}>
      <DetailItem label="Description" value={task.task_description} />
      <DetailItem label="Status" value={task.status} />
      <DetailItem
        label="Date"
        value={new Date(task.date).toLocaleDateString()}
      />
      {task.hours_spent && (
        <DetailItem label="Hours Spent" value={`${task.hours_spent} hours`} />
      )}
      {task.notes && <DetailItem label="Notes" value={task.notes} />}
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      );
    }

    if (!details) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#9ca3af" />
          <Text style={styles.emptyText}>Details not found</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.content}>
        <View style={styles.headerCard}>
          <Ionicons name="information-circle" size={32} color="#2563eb" />
          <Text style={styles.headerTitle}>{details.title}</Text>
        </View>

        {details.type === "overtime" && renderOvertimeDetails(details.data)}
        {details.type === "project" && renderProjectDetails(details.data)}
        {details.type === "task" && renderTaskDetails(details.data)}
        {details.type === "general" && (
          <View style={styles.detailsContainer}>
            <Text style={styles.generalText}>{details.message}</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  return <View style={styles.container}>{renderContent()}</View>;
}

const DetailItem = ({ label, value }) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#6b7280",
    marginTop: 16,
  },
  headerCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginLeft: 12,
  },
  detailsContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: "#6b7280",
    flex: 2,
    textAlign: "right",
  },
  generalText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
});
