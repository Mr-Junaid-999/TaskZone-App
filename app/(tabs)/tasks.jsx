import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../components/Button";
import Input from "../../components/Input";
import TaskItem from "../../components/TaskItem";
import { EmployeesService } from "../../services/employees";
import { ProjectsService } from "../../services/projects";
import { TasksService } from "../../services/tasks";

export default function TasksScreen() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [newTask, setNewTask] = useState({
    task_description: "",
    project_id: "",
    employee_id: "", // NEW FIELD
    hours_spent: "",
    notes: "",
    status: "pending",
  });

  const [editingTask, setEditingTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const handleUpdateTask = async () => {
    if (!editingTask.task_description.trim()) {
      Alert.alert("Error", "Please enter task description");
      return;
    }

    try {
      await TasksService.updateTask(editingTask.id, {
        task_description: editingTask.task_description,
        hours_spent: editingTask.hours_spent,
        notes: editingTask.notes,
        status: editingTask.status,
      });

      setShowEditModal(false);
      setEditingTask(null);
      await loadData();
      Alert.alert("Success", "Task updated successfully");
    } catch (error) {
      console.error("Error updating task:", error);
      Alert.alert("Error", "Failed to update task");
    }
  };

  const deleteTask = async (taskId) => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await TasksService.deleteTask(taskId);
              setShowEditModal(false);
              setEditingTask(null);
              await loadData(); // Refresh the list
              Alert.alert("Success", "Task deleted successfully");
            } catch (error) {
              console.error("Error deleting task:", error);
              Alert.alert("Error", "Failed to delete task");
            }
          },
        },
      ]
    );
  };

  // Modal kholne par projects load karo
  const handleOpenModal = async () => {
    setShowModal(true);
    await loading();
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await TasksService.getuserid();
      const [tasksData, projectsData] = await Promise.all([
        TasksService.getUserTasks(),
        ProjectsService.getUserProjects(),
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load tasks");
    } finally {
      setLoading(false);
    }

    try {
      const employeesData = await EmployeesService.getAllEmployees();
      setEmployees(employeesData);
    } catch (error) {
      console.error("Error loading employees:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddTask = async () => {
    if (!newTask.task_description.trim()) {
      Alert.alert("Error", "Please enter task description");
      return;
    }

    try {
      await TasksService.createTask(newTask);
      setShowModal(false);
      setNewTask({
        task_description: "",
        project_id: "",
        hours_spent: "",
        notes: "",
        status: "pending",
      });
      await loadData();
      Alert.alert("Success", "Task added successfully");
    } catch (error) {
      console.error("Error adding task:", error);
      Alert.alert("Error", "Failed to add task");
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
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
            <Text style={styles.title}>My Tasks</Text>
            <Button
              title="Add Task"
              onPress={() => setShowModal(true) && handleOpenModal}
              variant="primary"
            />
          </View>

          {/* Today's Tasks */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today&apos;s Tasks</Text>
            {getTasksByStatus("pending").length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No pending tasks for today</Text>
              </View>
            ) : (
              getTasksByStatus("pending").map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onPress={() => handleEditTask(task)}
                />
              ))
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>In Progress</Text>
            {getTasksByStatus("in progress").length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No pending tasks for today</Text>
              </View>
            ) : (
              getTasksByStatus("in progress").map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onPress={() => handleEditTask(task)}
                />
              ))
            )}
          </View>

          {/* Completed Tasks */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed Tasks</Text>
            {getTasksByStatus("completed").length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No completed tasks</Text>
              </View>
            ) : (
              getTasksByStatus("completed").map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onPress={() => handleEditTask(task)}
                />
              ))
            )}
          </View>

          {/* Task Statistics */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Task Summary</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#2563eb" }]}>
                  {tasks.length}
                </Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#f59e0b" }]}>
                  {getTasksByStatus("pending").length}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#10b981" }]}>
                  {getTasksByStatus("completed").length}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#9ca3af" }]}>
                  {getTasksByStatus("in progress").length}
                </Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add Task Modal */}
      {/* <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Input
              label="Task Description"
              value={newTask.task_description}
              onChangeText={(text) =>
                setNewTask({ ...newTask, task_description: text })
              }
              placeholder="Enter task description"
              multiline
              numberOfLines={3}
            />

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Project</Text>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={newTask.project_id}
                  onChangeText={(text) =>
                    setNewTask({ ...newTask, project_id: text })
                  }
                  placeholder="Select project (optional)"
                />
              </View>
            </View>

            <Input
              label="Hours Spent"
              value={newTask.hours_spent}
              onChangeText={(text) =>
                setNewTask({ ...newTask, hours_spent: text })
              }
              placeholder="Enter hours spent"
              keyboardType="numeric"
            />

            <Input
              label="Notes"
              value={newTask.notes}
              onChangeText={(text) => setNewTask({ ...newTask, notes: text })}
              placeholder="Additional notes (optional)"
              multiline
              numberOfLines={3}
            />

            <Button
              title="Add Task"
              onPress={handleAddTask}
              variant="primary"
            />
          </ScrollView>
        </View>
      </Modal> */}
      {/* <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Input
              label="Task Description *"
              value={newTask.task_description}
              onChangeText={(text) =>
                setNewTask({ ...newTask, task_description: text })
              }
              placeholder="Enter task description"
              multiline
              numberOfLines={3}
            />

            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Select Project</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowProjectDropdown(!showProjectDropdown)}
              >
                <Text
                  style={
                    newTask.project_id
                      ? styles.dropdownTextSelected
                      : styles.dropdownTextPlaceholder
                  }
                >
                  {newTask.project_id
                    ? projects.find((p) => p.id === newTask.project_id)?.name
                    : "Select a project (optional)"}
                </Text>
                <Ionicons
                  name={showProjectDropdown ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>

              
              {showProjectDropdown && (
                <View style={styles.dropdownOptions}>
                  <ScrollView
                    style={styles.dropdownScroll}
                    nestedScrollEnabled={true}
                  >
                    
                    <TouchableOpacity
                      style={styles.dropdownOption}
                      onPress={() => {
                        setNewTask({ ...newTask, project_id: "" });
                        setShowProjectDropdown(false);
                      }}
                    >
                      <Text
                        style={
                          !newTask.project_id
                            ? styles.optionTextSelected
                            : styles.optionText
                        }
                      >
                        No Project
                      </Text>
                    </TouchableOpacity>

                    
                    {projects.map((project) => (
                      <TouchableOpacity
                        key={project.id}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setNewTask({ ...newTask, project_id: project.id });
                          setShowProjectDropdown(false);
                        }}
                      >
                        <Text
                          style={
                            newTask.project_id === project.id
                              ? styles.optionTextSelected
                              : styles.optionText
                          }
                        >
                          {project.name}
                        </Text>
                        <View style={styles.projectInfo}>
                          <Text style={styles.projectStatus}>
                            {project.status} • {project.priority}
                          </Text>
                          {project.deadline && (
                            <Text style={styles.projectDeadline}>
                              Due:{" "}
                              {new Date(project.deadline).toLocaleDateString()}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <Input
              label="Hours Spent"
              value={newTask.hours_spent}
              onChangeText={(text) =>
                setNewTask({ ...newTask, hours_spent: text })
              }
              placeholder="Enter hours spent"
              keyboardType="numeric"
            />

            <Input
              label="Notes"
              value={newTask.notes}
              onChangeText={(text) => setNewTask({ ...newTask, notes: text })}
              placeholder="Additional notes (optional)"
              multiline
              numberOfLines={3}
            />

            <Button
              title="Add Task"
              onPress={handleAddTask}
              variant="primary"
            />
          </ScrollView>
        </View>
      </Modal> */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Input
              label="Task Description *"
              value={newTask.task_description}
              onChangeText={(text) =>
                setNewTask({ ...newTask, task_description: text })
              }
              placeholder="Enter task description"
              multiline
              numberOfLines={3}
            />

            {/* Project Dropdown */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Select Project</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowProjectDropdown(!showProjectDropdown)}
              >
                <Text
                  style={
                    newTask.project_id
                      ? styles.dropdownTextSelected
                      : styles.dropdownTextPlaceholder
                  }
                >
                  {newTask.project_id
                    ? projects.find((p) => p.id === newTask.project_id)?.name
                    : "Select a project (optional)"}
                </Text>
                <Ionicons
                  name={showProjectDropdown ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>

              {/* Project Dropdown Options */}
              {showProjectDropdown && (
                <View style={styles.dropdownOptions}>
                  <ScrollView
                    style={styles.dropdownScroll}
                    nestedScrollEnabled={true}
                  >
                    {/* No Project Option */}
                    <TouchableOpacity
                      style={styles.dropdownOption}
                      onPress={() => {
                        setNewTask({ ...newTask, project_id: "" });
                        setShowProjectDropdown(false);
                      }}
                    >
                      <Text
                        style={
                          !newTask.project_id
                            ? styles.optionTextSelected
                            : styles.optionText
                        }
                      >
                        No Project
                      </Text>
                    </TouchableOpacity>

                    {/* Project List */}
                    {projects.map((project) => (
                      <TouchableOpacity
                        key={project.id}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setNewTask({ ...newTask, project_id: project.id });
                          setShowProjectDropdown(false);
                        }}
                      >
                        <Text
                          style={
                            newTask.project_id === project.id
                              ? styles.optionTextSelected
                              : styles.optionText
                          }
                        >
                          {project.name}
                        </Text>
                        <View style={styles.projectInfo}>
                          <Text style={styles.projectStatus}>
                            {project.status} • {project.priority}
                          </Text>
                          {project.deadline && (
                            <Text style={styles.projectDeadline}>
                              Due:{" "}
                              {new Date(project.deadline).toLocaleDateString()}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Employee Dropdown - NEW */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Assign to Employee *</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
              >
                <Text
                  style={
                    newTask.employee_id
                      ? styles.dropdownTextSelected
                      : styles.dropdownTextPlaceholder
                  }
                >
                  {newTask.employee_id
                    ? employees.find((e) => e.id === newTask.employee_id)?.name
                    : "Select an employee"}
                </Text>
                <Ionicons
                  name={showEmployeeDropdown ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>

              {/* Employee Dropdown Options */}
              {showEmployeeDropdown && (
                <View style={styles.dropdownOptions}>
                  <ScrollView
                    style={styles.dropdownScroll}
                    nestedScrollEnabled={true}
                  >
                    {/* Employee List */}
                    {employees.map((employee) => (
                      <TouchableOpacity
                        key={employee.id}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setNewTask({ ...newTask, employee_id: employee.id });
                          setShowEmployeeDropdown(false);
                        }}
                      >
                        <Text
                          style={
                            newTask.employee_id === employee.id
                              ? styles.optionTextSelected
                              : styles.optionText
                          }
                        >
                          {employee.name}
                        </Text>
                        <View style={styles.employeeInfo}>
                          <Text style={styles.employeeDepartment}>
                            {employee.department} • {employee.position}
                          </Text>
                          <Text style={styles.employeeEmail}>
                            {employee.email}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <Input
              label="Hours Spent"
              value={newTask.hours_spent}
              onChangeText={(text) =>
                setNewTask({ ...newTask, hours_spent: text })
              }
              placeholder="Enter hours spent"
              keyboardType="numeric"
            />

            <Input
              label="Notes"
              value={newTask.notes}
              onChangeText={(text) => setNewTask({ ...newTask, notes: text })}
              placeholder="Additional notes (optional)"
              multiline
              numberOfLines={3}
            />

            <Button
              title="Add Task"
              onPress={handleAddTask}
              variant="primary"
            />
          </ScrollView>
        </View>
      </Modal>
      {/* Edit Task Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Task</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {editingTask && (
              <>
                <Input
                  label="Task Description *"
                  value={editingTask.task_description}
                  onChangeText={(text) =>
                    setEditingTask({ ...editingTask, task_description: text })
                  }
                  placeholder="Enter task description"
                  multiline
                  numberOfLines={3}
                />

                {/* Status Selection */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Status</Text>
                  <View style={styles.statusOptions}>
                    {["pending", "in progress", "completed"].map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusOption,
                          editingTask.status === status &&
                            styles.statusOptionSelected,
                        ]}
                        onPress={() =>
                          setEditingTask({ ...editingTask, status })
                        }
                      >
                        <Text
                          style={[
                            styles.statusOptionText,
                            editingTask.status === status &&
                              styles.statusOptionTextSelected,
                          ]}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <Input
                  label="Hours Spent"
                  value={editingTask.hours_spent?.toString()}
                  onChangeText={(text) =>
                    setEditingTask({ ...editingTask, hours_spent: text })
                  }
                  placeholder="Enter hours spent"
                  keyboardType="numeric"
                />

                <Input
                  label="Notes"
                  value={editingTask.notes}
                  onChangeText={(text) =>
                    setEditingTask({ ...editingTask, notes: text })
                  }
                  placeholder="Additional notes"
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.editActions}>
                  <Button
                    title="Update Task"
                    onPress={handleUpdateTask}
                    variant="primary"
                  />
                  <Button
                    title="Delete Task"
                    onPress={() => deleteTask(editingTask.id)}
                    variant="danger"
                    style={styles.deleteButton}
                  />
                </View>
              </>
            )}
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
    shadowOffset: {
      width: 0,
      height: 1,
    },
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
    shadowOffset: {
      width: 0,
      height: 1,
    },
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
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  employeeInfo: {
    marginTop: 4,
  },
  employeeDepartment: {
    fontSize: 12,
    color: "#6b7280",
  },
  employeeEmail: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  cancelText: {
    color: "#2563eb",
    fontSize: 18,
  },
  modalContent: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  textInputContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
  },
  textInput: {
    padding: 16,
    fontSize: 16,
  },

  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "white",
  },
  dropdownTextSelected: {
    fontSize: 16,
    color: "#1f2937",
  },
  dropdownTextPlaceholder: {
    fontSize: 16,
    color: "#9ca3af",
  },
  dropdownOptions: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  optionText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  optionTextSelected: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "600",
  },
  projectInfo: {
    marginTop: 4,
  },
  projectStatus: {
    fontSize: 12,
    color: "#6b7280",
  },
  projectDeadline: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 2,
  },
  statusOptions: {
    flexDirection: "row",
    gap: 8,
  },
  statusOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
  },
  statusOptionSelected: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  statusOptionTextSelected: {
    color: "#ffffff",
  },
  editActions: {
    gap: 12,
  },
  deleteButton: {
    marginTop: 8,
  },
});
