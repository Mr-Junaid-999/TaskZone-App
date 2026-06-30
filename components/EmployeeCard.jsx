import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function EmployeeCard({ employee, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {employee.name ? employee.name.charAt(0).toUpperCase() : "E"}
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{employee.name}</Text>
          <Text style={styles.position}>{employee.position}</Text>
          <Text style={styles.department}>{employee.department}</Text>
        </View>

        <View style={styles.contact}>
          <Text style={styles.email}>{employee.email}</Text>
          {employee.phone && <Text style={styles.phone}>{employee.phone}</Text>}
        </View>
      </View>

      {employee.join_date && (
        <View style={styles.footer}>
          <Text style={styles.joinDate}>
            Joined: {new Date(employee.join_date).toLocaleDateString()}
          </Text>
          <View style={styles.status}>
            <Text style={styles.statusText}>Active</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#2563eb",
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 18,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  position: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  department: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "500",
  },
  contact: {
    alignItems: "flex-end",
  },
  email: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  phone: {
    fontSize: 12,
    color: "#6b7280",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  joinDate: {
    fontSize: 12,
    color: "#6b7280",
  },
  status: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: "#166534",
    fontWeight: "500",
  },
});
