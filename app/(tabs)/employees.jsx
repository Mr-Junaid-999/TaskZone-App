import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import EmployeeCard from "../../components/EmployeeCard";
import { supabase } from "../../services/supabase";

export default function EmployeesScreen() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchQuery, selectedDepartment]);

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;

      setEmployees(data || []);
    } catch (error) {
      console.error("Error loading employees:", error);
      Alert.alert("Error", "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEmployees();
    setRefreshing(false);
  };

  const filterEmployees = () => {
    let filtered = employees;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (employee) =>
          employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.department
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          employee.position?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by department
    if (selectedDepartment !== "all") {
      filtered = filtered.filter(
        (employee) => employee.department === selectedDepartment
      );
    }

    setFilteredEmployees(filtered);
  };

  const getDepartments = () => {
    const departments = [
      ...new Set(employees.map((emp) => emp.department).filter(Boolean)),
    ];
    return ["all", ...departments];
  };

  const getEmployeeStats = () => {
    const total = employees.length;
    const departments = [
      ...new Set(employees.map((emp) => emp.department).filter(Boolean)),
    ];

    return {
      total,
      departments: departments.length,
      managers: employees.filter((emp) =>
        emp.position?.toLowerCase().includes("manager")
      ).length,
    };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading employees...</Text>
      </View>
    );
  }

  const stats = getEmployeeStats();
  const departments = getDepartments();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <Text style={styles.title}>Employees</Text>

          {/* Employee Stats */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Team Overview</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#2563eb" }]}>
                  {stats.total}
                </Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#10b981" }]}>
                  {stats.departments}
                </Text>
                <Text style={styles.statLabel}>Departments</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#f59e0b" }]}>
                  {stats.managers}
                </Text>
                <Text style={styles.statLabel}>Managers</Text>
              </View>
            </View>
          </View>

          {/* Search and Filter */}
          <View style={styles.filterCard}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search employees by name, email, or position..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.departmentScroll}
            >
              <View style={styles.departmentContainer}>
                {departments.map((dept) => (
                  <TouchableOpacity
                    key={dept}
                    style={[
                      styles.departmentButton,
                      selectedDepartment === dept &&
                        styles.departmentButtonActive,
                    ]}
                    onPress={() => setSelectedDepartment(dept)}
                  >
                    <Text
                      style={[
                        styles.departmentButtonText,
                        selectedDepartment === dept &&
                          styles.departmentButtonTextActive,
                      ]}
                    >
                      {dept === "all" ? "All" : dept}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.resultsText}>
              Showing {filteredEmployees.length} of {employees.length} employees
            </Text>
          </View>

          {/* Employees List */}
          <View style={styles.employeesSection}>
            <Text style={styles.sectionTitle}>
              {selectedDepartment === "all"
                ? "All Employees"
                : selectedDepartment}
            </Text>

            {filteredEmployees.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? "No employees found matching your search"
                    : "No employees found"}
                </Text>
              </View>
            ) : (
              filteredEmployees.map((employee) => (
                <EmployeeCard key={employee.id} employee={employee} />
              ))
            )}
          </View>
        </View>
      </ScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 24,
  },
  statsCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
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
  statsTitle: {
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
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  filterCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
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
  searchInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  departmentScroll: {
    marginBottom: 8,
  },
  departmentContainer: {
    flexDirection: "row",
    gap: 8,
  },
  departmentButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
  },
  departmentButtonActive: {
    backgroundColor: "#2563eb",
  },
  departmentButtonText: {
    color: "#374151",
    fontWeight: "500",
  },
  departmentButtonTextActive: {
    color: "white",
  },
  resultsText: {
    fontSize: 14,
    color: "#6b7280",
  },
  employeesSection: {
    marginBottom: 16,
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
  addButton: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  addButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  modalHeader: {
    backgroundColor: "#2563eb",
    padding: 16,
  },
  modalHeaderContent: {
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
    fontSize: 18,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  optionsScroll: {
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#e5e7eb",
  },
  optionButtonActive: {
    backgroundColor: "#2563eb",
  },
  optionButtonText: {
    color: "#374151",
    fontSize: 14,
  },
  optionButtonTextActive: {
    color: "white",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  guidelinesContainer: {
    marginTop: 24,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  guidelinesText: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
    lineHeight: 16,
  },
});
