import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ProjectsService } from "../services/projects";
import Button from "./Button";
import Input from "./Input";

export default function OvertimeForm({
  visible,
  onClose,
  onSubmit,
  loading = false,
  initialData = null,
  isEdit = false,
  isManager,
}) {
  const [formData, setFormData] = useState({
    project_id: "",
    overtime_date: new Date().toISOString().split("T")[0],
    total_hours: "",
    tasks_performed: "",
    notes: "",
  });
  const [projects, setProjects] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (visible) {
      loadProjects();
      if (isEdit && initialData) {
        setFormData(initialData);
      } else {
        resetForm();
      }
    }
  }, [visible, isEdit, initialData]);

  const loadProjects = async () => {
    try {
      const projectsData = await ProjectsService.getUserProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      project_id: "",
      overtime_date: new Date().toISOString().split("T")[0],
      total_hours: "",
      tasks_performed: "",
      notes: "",
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.total_hours || parseFloat(formData.total_hours) <= 0) {
      newErrors.total_hours = "Please enter valid hours";
    }

    if (!formData.tasks_performed.trim()) {
      newErrors.tasks_performed = "Please describe tasks performed";
    }

    if (!formData.overtime_date) {
      newErrors.overtime_date = "Please select date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {isEdit ? "Edit Overtime Request" : "Submit Overtime"}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          {/* Project Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Project </Text>
            <View style={styles.projectContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.projectScrollView}
              >
                <View style={styles.projectButtons}>
                  <TouchableOpacity
                    style={[
                      styles.projectButton,
                      !formData.project_id && styles.projectButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, project_id: "" })}
                  >
                    <Text
                      style={[
                        styles.projectButtonText,
                        !formData.project_id && styles.projectButtonTextActive,
                      ]}
                    >
                      No Project
                    </Text>
                  </TouchableOpacity>

                  {projects.map((project) => (
                    <TouchableOpacity
                      key={project.id}
                      style={[
                        styles.projectButton,
                        formData.project_id === project.id &&
                          styles.projectButtonActive,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, project_id: project.id })
                      }
                    >
                      <Text
                        style={[
                          styles.projectButtonText,
                          formData.project_id === project.id &&
                            styles.projectButtonTextActive,
                        ]}
                      >
                        {project.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          {/* Date Input */}
          <Input
            label="Overtime Date"
            value={formData.overtime_date}
            onChangeText={(text) =>
              setFormData({ ...formData, overtime_date: text })
            }
            placeholder="YYYY-MM-DD"
            error={errors.overtime_date}
          />

          {/* Hours Input */}
          <Input
            label="Total Hours *"
            value={formData.total_hours}
            onChangeText={(text) =>
              setFormData({ ...formData, total_hours: text })
            }
            placeholder="Enter total hours worked"
            keyboardType="numeric"
            error={errors.total_hours}
            required
          />

          {/* Tasks Performed */}
          <Input
            label="Tasks Performed *"
            value={formData.tasks_performed}
            onChangeText={(text) =>
              setFormData({ ...formData, tasks_performed: text })
            }
            placeholder="Describe the tasks you worked on during overtime..."
            multiline
            numberOfLines={4}
            error={errors.tasks_performed}
            required
          />

          {/* Status Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Status</Text>
            {isManager && (
              <View style={styles.statusOptions}>
                {["rejected", "pending", "approved"].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      formData.status === status && styles.statusOptionSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, status: status })}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        formData.status === status &&
                          styles.statusOptionTextSelected,
                      ]}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {!isManager && (
              <View style={styles.statusOptions}>
                {["pending", "approved", "rejected"].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      status === "pending" && styles.statusOptionSelected,
                      status !== "pending" && styles.statusOptionDisabled,
                    ]}
                    onPress={() => {
                      // Only allow pending
                      if (status === "pending") {
                        setFormData({ ...formData, status: status });
                      }
                    }}
                    disabled={status !== "pending"}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        status === "pending" && styles.statusOptionTextSelected,
                        status !== "pending" && styles.statusOptionTextDisabled,
                      ]}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Notes */}
          <Input
            label="Additional Notes (Optional)"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholder="Any additional information..."
            multiline
            numberOfLines={3}
          />

          {/* Selected Project Info */}
          {formData.project_id && (
            <View style={styles.projectInfo}>
              <Text style={styles.projectInfoTitle}>Selected Project:</Text>
              <Text style={styles.projectInfoText}>
                {projects.find((p) => p.id === formData.project_id)?.name}
              </Text>
              {projects.find((p) => p.id === formData.project_id)
                ?.requirements && (
                <Text style={styles.projectInfoSubtext}>
                  Requirements:{" "}
                  {
                    projects.find((p) => p.id === formData.project_id)
                      ?.requirements
                  }
                </Text>
              )}
            </View>
          )}

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <Button
              title={
                loading
                  ? "Processing..."
                  : isEdit
                    ? "Update Overtime Request"
                    : "Submit Overtime Request"
              }
              onPress={handleSubmit}
              variant="primary"
              loading={loading}
              disabled={loading}
            />
          </View>

          {/* Form Guidelines */}
          <View style={styles.guidelines}>
            <Text style={styles.guidelinesTitle}>
              📋 Overtime Submission Guidelines:
            </Text>
            <Text style={styles.guidelinesText}>
              • Provide detailed description of tasks performed
            </Text>
            <Text style={styles.guidelinesText}>
              • Ensure hours are accurately recorded
            </Text>
            <Text style={styles.guidelinesText}>
              • Select relevant project if applicable
            </Text>
            <Text style={styles.guidelinesText}>
              • Manager approval required for overtime compensation
            </Text>
            {isEdit && (
              <Text style={styles.editNote}>
                Note: Only pending requests can be edited
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1d4ed8",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  cancelButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  projectContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  projectScrollView: {
    flexGrow: 0,
  },
  projectButtons: {
    flexDirection: "row",
    padding: 8,
    gap: 8,
  },
  projectButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  projectButtonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#1d4ed8",
  },
  projectButtonText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  projectButtonTextActive: {
    color: "#ffffff",
  },
  projectInfo: {
    backgroundColor: "#dbeafe",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
  },
  projectInfoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e40af",
    marginBottom: 4,
  },
  projectInfoText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  projectInfoSubtext: {
    fontSize: 12,
    color: "#6b7280",
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  guidelines: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  guidelinesText: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
    lineHeight: 16,
  },
  editNote: {
    fontSize: 12,
    color: "#f59e0b",
    fontWeight: "500",
    marginTop: 8,
    fontStyle: "italic",
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
});
