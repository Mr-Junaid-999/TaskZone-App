//taskZone/(tabs)/projects.jsx
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../components/Button";
import Input from "../../components/Input";
import ProjectCard from "../../components/ProjectCard";
import { EmployeesService } from "../../services/employees";
import { ProjectsService } from "../../services/projects";

export default function ProjectsScreen() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isManager, setIsManager] = useState(false);

  // New project form state
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    requirements: "",
    assigned_to: "",
    deadline: "",
    status: "pending",
    priority: "medium",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { isManager } = await ProjectsService.getuserid();
      setIsManager(isManager);

      const [projectsData, employeesData] = await Promise.all([
        ProjectsService.getUserProjects(),
        EmployeesService.getAllEmployees(),
      ]);

      setProjects(projectsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const resetForm = () => {
    setProjectForm({
      name: "",
      description: "",
      requirements: "",
      assigned_to: "",
      deadline: "",
      status: "pending",
      priority: "medium",
    });
    setEditingProject(null);
  };

  const handleAddProject = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditProject = (project) => {
    setProjectForm({
      name: project.name,
      description: project.description || "",
      requirements: project.requirements || "",
      deadline: project.deadline || "",
      status: project.status,
      priority: project.priority,
    });
    setEditingProject(project);
    setShowModal(true);
  };

  const handleSubmitProject = async () => {
    if (!projectForm.name.trim()) {
      Alert.alert("Error", "Please enter project name");
      return;
    }

    try {
      if (editingProject) {
        // Update existing project
        await ProjectsService.updateProject(editingProject.id, projectForm);
        Alert.alert("Success", "Project updated successfully");
      } else {
        // Create new project

        await ProjectsService.getuserid();
        await ProjectsService.createProject(projectForm);
        Alert.alert("Success", "Project created successfully");
      }

      setShowModal(false);
      resetForm();
      await loadData();
    } catch (error) {
      console.error("Error saving project:", error);
      Alert.alert("Error", "Failed to save project");
    }
  };

  const handleDeleteProject = (project) => {
    Alert.alert(
      "Delete Project",
      `Are you sure you want to delete "${project.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await ProjectsService.deleteProject(project.id);
              Alert.alert("Success", "Project deleted successfully");
              await loadData();
            } catch (error) {
              console.error("Error deleting project:", error);
              Alert.alert("Error", "Failed to delete project");
            }
          },
        },
      ],
    );
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      await ProjectsService.updateProjectStatus(projectId, newStatus);
      await loadData();
    } catch (error) {
      console.error("Error updating status:", error);
      Alert.alert("Error", "Failed to update status");
    }
  };

  const getProjectsByStatus = (status) => {
    return projects.filter((project) => project.status === status);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>All Projects</Text>
            {isManager && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddProject}
              >
                <Text style={styles.addButtonText}>+ Add Project</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* In Progress Projects */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              In Progress ({getProjectsByStatus("in progress").length})
            </Text>
            {getProjectsByStatus("in progress").length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No projects in progress</Text>
              </View>
            ) : (
              getProjectsByStatus("in progress").map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isManager={isManager}
                  onPress={() => handleEditProject(project)}
                  onDelete={() => handleDeleteProject(project)}
                  onStatusChange={(newStatus) =>
                    handleStatusChange(project.id, newStatus)
                  }
                  showActions={true}
                />
              ))
            )}
          </View>

          {/* Pending Projects */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Pending ({getProjectsByStatus("pending").length})
            </Text>
            {getProjectsByStatus("pending").length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No pending projects</Text>
              </View>
            ) : (
              getProjectsByStatus("pending").map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isManager={isManager}
                  onPress={() => handleEditProject(project)}
                  onDelete={() => handleDeleteProject(project)}
                  onStatusChange={(newStatus) =>
                    handleStatusChange(project.id, newStatus)
                  }
                  showActions={true}
                />
              ))
            )}
          </View>

          {/* Completed Projects */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Completed ({getProjectsByStatus("completed").length})
            </Text>
            {getProjectsByStatus("completed").length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No completed projects</Text>
              </View>
            ) : (
              getProjectsByStatus("completed").map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  // onPress={() => handleEditProject(project)}
                  // onDelete={() => handleDeleteProject(project)}
                  onStatusChange={(newStatus) =>
                    handleStatusChange(project.id, newStatus)
                  }
                  showActions={true}
                />
              ))
            )}
          </View>

          {/* Project Statistics */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Project Summary</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#2563eb" }]}>
                  {projects.length}
                </Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#f59e0b" }]}>
                  {getProjectsByStatus("in progress").length}
                </Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#10b981" }]}>
                  {getProjectsByStatus("completed").length}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#9ca3af" }]}>
                  {getProjectsByStatus("pending").length}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add/Edit Project Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowModal(false);
          resetForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingProject ? "Edit Project" : "Add New Project"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Input
              label="Project Name *"
              value={projectForm.name}
              onChangeText={(text) =>
                setProjectForm({ ...projectForm, name: text })
              }
              placeholder="Enter project name"
            />

            <Input
              label="Description"
              value={projectForm.description}
              onChangeText={(text) =>
                setProjectForm({ ...projectForm, description: text })
              }
              placeholder="Enter project description"
              multiline
              numberOfLines={3}
            />

            <Input
              label="Requirements"
              value={projectForm.requirements}
              onChangeText={(text) =>
                setProjectForm({ ...projectForm, requirements: text })
              }
              placeholder="Enter project requirements"
              multiline
              numberOfLines={3}
            />

            {/* Assign To Dropdown */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Assign To</Text>
              <View style={styles.dropdownContainer}>
                <TextInput
                  style={styles.dropdownInput}
                  value={
                    employees.find((emp) => emp.id === projectForm.assigned_to)
                      ?.name || ""
                  }
                  placeholder="Select employee (optional)"
                  editable={false}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.employeeScroll}
                >
                  <View style={styles.employeeButtons}>
                    <TouchableOpacity
                      style={[
                        styles.employeeButton,
                        !projectForm.assigned_to && styles.employeeButtonActive,
                      ]}
                      onPress={() =>
                        setProjectForm({ ...projectForm, assigned_to: "" })
                      }
                    >
                      <Text
                        style={[
                          styles.employeeButtonText,
                          !projectForm.assigned_to &&
                            styles.employeeButtonTextActive,
                        ]}
                      >
                        Unassigned
                      </Text>
                    </TouchableOpacity>
                    {employees.map((employee) => (
                      <TouchableOpacity
                        key={employee.id}
                        style={[
                          styles.employeeButton,
                          projectForm.assigned_to === employee.id &&
                            styles.employeeButtonActive,
                        ]}
                        onPress={() =>
                          setProjectForm({
                            ...projectForm,
                            assigned_to: employee.id,
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.employeeButtonText,
                            projectForm.assigned_to === employee.id &&
                              styles.employeeButtonTextActive,
                          ]}
                        >
                          {employee.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            <Input
              label="Deadline"
              value={projectForm.deadline}
              onChangeText={(text) =>
                setProjectForm({ ...projectForm, deadline: text })
              }
              placeholder="YYYY-MM-DD"
            />

            {/* Status Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.statusContainer}>
                {["pending", "in progress", "completed", "cancelled"].map(
                  (status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusButton,
                        projectForm.status === status &&
                          styles.statusButtonActive,
                      ]}
                      onPress={() => setProjectForm({ ...projectForm, status })}
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          projectForm.status === status &&
                            styles.statusButtonTextActive,
                        ]}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>
            </View>

            {/* Priority Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.priorityContainer}>
                {["low", "medium", "high"].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityButton,
                      projectForm.priority === priority &&
                        styles.priorityButtonActive,
                      priority === "high" && styles.priorityHigh,
                      priority === "medium" && styles.priorityMedium,
                      priority === "low" && styles.priorityLow,
                    ]}
                    onPress={() => setProjectForm({ ...projectForm, priority })}
                  >
                    <Text
                      style={[
                        styles.priorityButtonText,
                        projectForm.priority === priority &&
                          styles.priorityButtonTextActive,
                      ]}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Button
              title={editingProject ? "Update Project" : "Create Project"}
              onPress={handleSubmitProject}
              variant="primary"
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollView: {
    flex: 1,
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  addButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  quickActions: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    color: "#374151",
    fontWeight: "500",
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 16,
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  modalHeader: {
    backgroundColor: "#2563eb",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  cancelText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
  },
  dropdownInput: {
    padding: 12,
    fontSize: 16,
    color: "#374151",
  },
  employeeScroll: {
    maxHeight: 60,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  employeeButtons: {
    flexDirection: "row",
    padding: 8,
    gap: 8,
  },
  employeeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#e5e7eb",
  },
  employeeButtonActive: {
    backgroundColor: "#2563eb",
  },
  employeeButtonText: {
    fontSize: 12,
    color: "#374151",
  },
  employeeButtonTextActive: {
    color: "white",
  },
  statusContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#e5e7eb",
  },
  statusButtonActive: {
    backgroundColor: "#2563eb",
  },
  statusButtonText: {
    fontSize: 14,
    color: "#374151",
  },
  statusButtonTextActive: {
    color: "white",
  },
  priorityContainer: {
    flexDirection: "row",
    gap: 8,
  },
  priorityButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#e5e7eb",
  },
  priorityButtonActive: {
    opacity: 1,
  },
  priorityHigh: {
    backgroundColor: "#fef2f2",
  },
  priorityMedium: {
    backgroundColor: "#fffbeb",
  },
  priorityLow: {
    backgroundColor: "#f0fdf4",
  },
  priorityButtonText: {
    fontSize: 14,
    color: "#374151",
  },
  priorityButtonTextActive: {
    fontWeight: "600",
  },
});
