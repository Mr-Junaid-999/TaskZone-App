import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import OvertimeForm from "../../components/OvertimeForm";
import { OvertimeService } from "../../services/overtime";
import { ProjectsService } from "../../services/projects";

export default function OvertimeScreen() {
  const [overtimeRequests, setOvertimeRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingOvertime, setEditingOvertime] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { isManager } = await OvertimeService.getuserid();
      setIsManager(isManager);

      const [overtimeData, projectsData] = await Promise.all([
        OvertimeService.getUserOvertime(),
        ProjectsService.getUserProjects(),
      ]);
      setOvertimeRequests(overtimeData);
      setProjects(projectsData);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load overtime data");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSubmitOvertime = async (overtimeData) => {
    setSubmitting(true);
    try {
      await OvertimeService.getuserid();
      await OvertimeService.submitOvertime(overtimeData);
      setShowModal(false);
      await loadData();
      Alert.alert("Success", "Overtime request submitted successfully!");
    } catch (error) {
      console.error("Error submitting overtime:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to submit overtime request",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Edit overtime request
  const handleEditOvertime = (request) => {
    if (request.status !== "pending") {
      Alert.alert(
        "Cannot Edit",
        "Only pending overtime requests can be edited. Please contact your manager for approved/rejected requests.",
      );
      return;
    }

    setEditingOvertime({
      id: request.id,
      project_id: request.project_id || "",
      overtime_date: request.overtime_date,
      total_hours: request.total_hours.toString(),
      tasks_performed: request.tasks_performed,
      notes: request.notes || "",
      status: request.status,
    });
    setShowEditModal(true);
  };

  const handleUpdateOvertime = async (overtimeData) => {
    setSubmitting(true);
    try {
      await OvertimeService.updateOvertimeRequest(
        editingOvertime.id,
        overtimeData,
      );
      setShowEditModal(false);
      setEditingOvertime(null);
      await loadData();
      Alert.alert("Success", "Overtime request updated successfully!");
    } catch (error) {
      console.error("Error updating overtime:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to update overtime request",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Delete overtime request
  const handleDeleteOvertime = (request) => {
    if (request.status !== "pending") {
      Alert.alert(
        "Cannot Delete",
        "Only pending overtime requests can be deleted. Please contact your manager for approved/rejected requests.",
      );
      return;
    }

    Alert.alert(
      "Delete Overtime Request",
      "Are you sure you want to delete this overtime request? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await OvertimeService.deleteOvertimeRequest(request.id);
              await loadData();
              Alert.alert("Success", "Overtime request deleted successfully!");
            } catch (error) {
              console.error("Error deleting overtime:", error);
              Alert.alert("Error", "Failed to delete overtime request");
            }
          },
        },
      ],
    );
  };

  // View overtime details
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    // You can implement a detailed view modal here
    Alert.alert(
      "Overtime Details",
      `Project: ${request.projects?.name || "General Overtime"}\n\n` +
        `Date: ${new Date(request.overtime_date).toLocaleDateString()}\n` +
        `Hours: ${request.total_hours}\n` +
        `Status: ${request.status.toUpperCase()}\n\n` +
        `Tasks Performed:\n${request.tasks_performed}\n\n` +
        `${request.notes ? `Notes:\n${request.notes}\n\n` : ""}` +
        `${
          request.approved_by ? `Approved by: ${request.employees?.name}\n` : ""
        }` +
        `${
          request.approved_at
            ? `Approved on: ${new Date(
                request.approved_at,
              ).toLocaleDateString()}`
            : ""
        }`,
      [{ text: "OK" }],
    );
  };

  const getOvertimeByStatus = (status) => {
    return overtimeRequests.filter((request) => request.status === status);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "#10b981";
      case "rejected":
        return "#ef4444";
      case "pending":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case "approved":
        return "#dcfce7";
      case "rejected":
        return "#fef2f2";
      case "pending":
        return "#fffbeb";
      default:
        return "#f3f4f6";
    }
  };

  const getTotalApprovedHours = () => {
    const approved = getOvertimeByStatus("approved");
    return approved.reduce(
      (sum, ot) => sum + parseFloat(ot.total_hours || 0),
      0,
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading overtime data...</Text>
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
            <Text style={styles.title}>Overtime Tracking</Text>
            {isManager && (
              <Pressable
                style={styles.submitButton}
                onPress={() => setShowModal(true)}
              >
                <Text style={styles.submitButtonText}>Submit Overtime</Text>
              </Pressable>
            )}
          </View>

          {/* Overtime Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Overtime Summary</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#2563eb" }]}>
                  {overtimeRequests.length}
                </Text>
                <Text style={styles.statLabel}>Total Requests</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#10b981" }]}>
                  {getOvertimeByStatus("approved").length}
                </Text>
                <Text style={styles.statLabel}>Approved</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#f59e0b" }]}>
                  {getOvertimeByStatus("pending").length}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#ef4444" }]}>
                  {getOvertimeByStatus("rejected").length}
                </Text>
                <Text style={styles.statLabel}>Rejected</Text>
              </View>
            </View>
            <View style={styles.totalHoursContainer}>
              <Text style={styles.totalHoursText}>
                Total Approved Hours: {getTotalApprovedHours()}
              </Text>
            </View>
          </View>

          {/* Overtime Requests */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Overtime Requests</Text>
            {overtimeRequests.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  No overtime requests submitted yet
                </Text>
                <Text style={styles.emptySubtext}>
                  Click Submit Overtime to create your first request
                </Text>
              </View>
            ) : (
              overtimeRequests.map((request) => (
                <View key={request.id} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <View style={styles.projectInfo}>
                      <Text style={styles.projectName}>
                        {request.projects?.name || "General Overtime"}
                      </Text>
                      <Text style={styles.dateText}>
                        {new Date(request.overtime_date).toLocaleDateString()}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: getStatusBackgroundColor(
                            request.status,
                          ),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(request.status) },
                        ]}
                      >
                        {request.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.tasksText}>
                    {request.tasks_performed}
                  </Text>

                  <View style={styles.requestFooter}>
                    <Text style={styles.hoursText}>
                      {request.total_hours} hours
                    </Text>
                    <Text style={styles.createdText}>
                      Submitted:{" "}
                      {new Date(request.created_at).toLocaleDateString()}
                    </Text>
                  </View>

                  {request.notes && (
                    <View style={styles.notesContainer}>
                      <Text style={styles.notesLabel}>Notes:</Text>
                      <Text style={styles.notesText}>{request.notes}</Text>
                    </View>
                  )}

                  {request.approved_by && request.status === "approved" && (
                    <View style={styles.approvedContainer}>
                      <Text style={styles.approvedByText}>
                        Approved by: {request.employees?.name}
                      </Text>
                      <Text style={styles.approvedAtText}>
                        on {new Date(request.approved_at).toLocaleDateString()}
                      </Text>
                    </View>
                  )}

                  {/* Action Buttons */}
                  {request.status === "pending" && (
                    <View style={styles.actionButtons}>
                      <Pressable
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => handleEditOvertime(request)}
                      >
                        <Text style={styles.editButtonText}>Edit</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteOvertime(request)}
                      >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </Pressable>
                    </View>
                  )}

                  {/* View Details Button for all statuses */}
                  <Pressable
                    style={styles.viewDetailsButton}
                    onPress={() => handleViewDetails(request)}
                  >
                    <Text style={styles.viewDetailsText}>View Details</Text>
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Submit Overtime Modal */}
      <OvertimeForm
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitOvertime}
        isManager={isManager}
        loading={submitting}
      />

      {/* Edit Overtime Modal */}
      <OvertimeForm
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingOvertime(null);
        }}
        onSubmit={handleUpdateOvertime}
        loading={submitting}
        initialData={editingOvertime}
        isEdit={true}
        isManager={isManager}
      />
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
  submitButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  summaryCard: {
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
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  totalHoursContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  totalHoursText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#2563eb",
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
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
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
    fontWeight: "500",
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 14,
  },
  requestCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  projectInfo: {
    flex: 1,
    marginRight: 12,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: "#6b7280",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  tasksText: {
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 12,
  },
  requestFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  hoursText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
  },
  createdText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  notesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    marginBottom: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 18,
  },
  approvedContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginBottom: 8,
  },
  approvedByText: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "500",
  },
  approvedAtText: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: "#fbbf24",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
  },
  editButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  viewDetailsButton: {
    paddingVertical: 8,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 8,
  },
  viewDetailsText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "500",
  },
});
