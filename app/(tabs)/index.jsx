import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ProjectCard from "../../components/ProjectCard";
import TaskItem from "../../components/TaskItem";
import { AuthService } from "../../services/auth";
import { OvertimeService } from "../../services/overtime";
import { ProjectsService } from "../../services/projects";
import { TasksService } from "../../services/tasks";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [overtimeRequests, setOvertimeRequests] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingTasks: 0,
    completedTasks: 0,
    overtimeHours: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await AuthService.getCurrentUser();
      setUser(userData);

      const projectsData = await ProjectsService.getUserProjects();
      await TasksService.getuserid();
      const tasksData = await TasksService.getUserTasks();
      await OvertimeService.getuserid();
      const overtimeData = await OvertimeService.getUserOvertime();

      const pendingOvertime =
        await OvertimeService.getPendingOvertimeRequests();
      setProjects(projectsData.slice(0, 3));
      setTasks(tasksData);
      setOvertimeRequests(pendingOvertime);

      // Calculate stats
      const approvedOvertime = overtimeData.filter(
        (ot) => ot.status === "approved"
      );
      const totalOvertimeHours = approvedOvertime.reduce(
        (sum, ot) => sum + parseFloat(ot.total_hours),
        0
      );

      setStats({
        totalProjects: projectsData.length,
        pendingTasks: tasksData.filter((t) => t.status === "pending").length,
        completedTasks: tasksData.filter((t) => t.status === "completed")
          .length,
        overtimeHours: totalOvertimeHours,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>
            Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}!
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Here&apos;s your today&apos;s overview
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#2563eb" }]}>
              <Text style={styles.statIconText}>{stats.totalProjects}</Text>
            </View>
            <Text style={styles.statLabel}>Total Projects</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#f59e0b" }]}>
              <Text style={styles.statIconText}>{stats.pendingTasks}</Text>
            </View>
            <Text style={styles.statLabel}>Pending Tasks</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#10b981" }]}>
              <Text style={styles.statIconText}>{stats.completedTasks}</Text>
            </View>
            <Text style={styles.statLabel}>Completed Today</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#ef4444" }]}>
              <Text style={styles.statIconText}>{stats.overtimeHours}</Text>
            </View>
            <Text style={styles.statLabel}>Overtime Hours</Text>
          </View>
        </View>

        {/* Pending Overtime Requests (for managers) */}
        {overtimeRequests.length > 0 && (
          <View style={styles.overtimeAlert}>
            <Text style={styles.overtimeTitle}>
              ⚠️ Pending Overtime Requests
            </Text>
            <Text style={styles.overtimeMessage}>
              You have {overtimeRequests.length} overtime request(s) waiting for
              approval
            </Text>
            <TouchableOpacity
              style={styles.overtimeButton}
              onPress={() => router.push("/overtime")}
            >
              <Text style={styles.overtimeButtonText}>Review Requests</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Projects */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Projects</Text>
            <TouchableOpacity onPress={() => router.push("/projects")}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {projects.length === 0 ? (
            <Text style={styles.emptyText}>No projects assigned</Text>
          ) : (
            projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onPress={() => router.push(`/projects?projectId=${project.id}`)}
              />
            ))
          )}
        </View>

        {/* Today's Tasks */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today&apos;s Tasks</Text>
            <TouchableOpacity onPress={() => router.push("/tasks")}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {tasks.length === 0 ? (
            <Text style={styles.emptyText}>No tasks for today</Text>
          ) : (
            tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onPress={() => router.push(`/tasks?taskId=${task.id}`)}
              />
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#2563eb" }]}
              onPress={() => router.push("/tasks")}
            >
              <Text style={styles.actionButtonText}>Add Task</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#10b981" }]}
              onPress={() => router.push("/overtime")}
            >
              <Text style={styles.actionButtonText}>Submit Overtime</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  welcomeCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    width: "48%",
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
  statIcon: {
    borderRadius: 25,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statIconText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  overtimeAlert: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fef3c7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  overtimeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 8,
  },
  overtimeMessage: {
    fontSize: 14,
    color: "#92400e",
    marginBottom: 12,
  },
  overtimeButton: {
    backgroundColor: "#f59e0b",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  overtimeButtonText: {
    color: "white",
    fontWeight: "600",
  },
  sectionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 15,
  },
  viewAllText: {
    color: "#2563eb",
    fontWeight: "600",
  },
  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    paddingVertical: 16,
  },
  quickActions: {
    marginTop: 24,
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    width: "48%",
    marginBottom: 12,
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },
});
