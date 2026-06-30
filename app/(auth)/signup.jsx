import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../services/supabase";

export default function SignupScreen() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    position: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Common departments for dropdown
  const commonDepartments = [
    "Engineering",
    "Design",
    "Marketing",
    "Sales",
    "HR",
    "Finance",
    "Operations",
    "Support",
    "Management",
  ];

  // Common positions for dropdown
  const commonPositions = [
    "Software Engineer",
    "Senior Software Engineer",
    "Team Lead",
    "Project Manager",
    "Product Manager",
    "UI/UX Designer",
    "Marketing Manager",
    "Sales Executive",
    "HR Manager",
    "Finance Analyst",
    "Operations Manager",
    "Support Specialist",
    "CEO",
    "CTO",
    "CFO",
  ];

  const handleSignup = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (authError) {
        Alert.alert("Signup Error", authError.message);
        return;
      }

      if (authData.user) {
        // Step 2: Create employee record
        const { error: employeeError } = await supabase
          .from("employees")
          .insert([
            {
              id: authData.user.id,
              name: formData.name.trim(),
              email: formData.email.trim().toLowerCase(),
              department: formData.department.trim() || null,
              position: formData.position.trim() || null,
              phone: formData.phone.trim() || null,
              join_date: new Date().toISOString().split("T")[0],
              is_active: true,
            },
          ]);

        if (employeeError) {
          console.error("Employee creation error:", employeeError);
          // Still show success but log the error
        }

        Alert.alert(
          "Check Your Email",
          "Verification link sent to your email. Please confirm to continue.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/login"),
            },
          ],
        );
      }
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Error", "Something went wrong during signup");
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
      >
        <View style={styles.mainContainer}>
          {/* Main Content Card */}
          <View style={styles.card}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoEmoji}>🚀</Text>
              </View>
              <Text style={styles.appName}>TaskZone</Text>
              <Text style={styles.appDescription}>Create Your Account</Text>
            </View>

            {/* Welcome Text */}
            <Text style={styles.welcomeText}>Join Our Team</Text>
            <Text style={styles.subtitle}>
              Create your account to get started
            </Text>

            {/* Personal Information */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>FULL NAME *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                value={formData.name}
                onChangeText={(text) => updateFormData("name", text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>EMAIL ADDRESS *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email address"
                placeholderTextColor="#9CA3AF"
                value={formData.email}
                onChangeText={(text) => updateFormData("email", text)}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Professional Information - Department */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>DEPARTMENT</Text>

              {/* Horizontal Scroll for Common Departments */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.optionsScroll}
              >
                <View style={styles.optionsContainer}>
                  {commonDepartments.map((dept) => (
                    <TouchableOpacity
                      key={dept}
                      style={[
                        styles.optionButton,
                        formData.department === dept &&
                          styles.optionButtonActive,
                      ]}
                      onPress={() => updateFormData("department", dept)}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          formData.department === dept &&
                            styles.optionButtonTextActive,
                        ]}
                      >
                        {dept}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Custom Department Input */}
              <TextInput
                style={styles.textInput}
                placeholder="Select department"
                placeholderTextColor="#9CA3AF"
                value={formData.department}
                onChangeText={(text) => updateFormData("department", text)}
              />
            </View>

            {/* Position Selection */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>POSITION</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.optionsScroll}
              >
                <View style={styles.optionsContainer}>
                  {commonPositions.map((position) => (
                    <TouchableOpacity
                      key={position}
                      style={[
                        styles.optionButton,
                        formData.position === position &&
                          styles.optionButtonActive,
                      ]}
                      onPress={() => updateFormData("position", position)}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          formData.position === position &&
                            styles.optionButtonTextActive,
                        ]}
                      >
                        {position}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <TextInput
                style={styles.textInput}
                placeholder="Select position"
                placeholderTextColor="#9CA3AF"
                value={formData.position}
                onChangeText={(text) => updateFormData("position", text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>PHONE NUMBER</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your phone number"
                placeholderTextColor="#9CA3AF"
                value={formData.phone}
                onChangeText={(text) => updateFormData("phone", text)}
                keyboardType="phone-pad"
              />
            </View>

            {/* Password Section */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>PASSWORD *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Create a password (min. 6 characters)"
                placeholderTextColor="#9CA3AF"
                value={formData.password}
                onChangeText={(text) => updateFormData("password", text)}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>CONFIRM PASSWORD *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Confirm your password"
                placeholderTextColor="#9CA3AF"
                value={formData.confirmPassword}
                onChangeText={(text) => updateFormData("confirmPassword", text)}
                secureTextEntry
              />
            </View>

            {/* Signup Button */}
            <TouchableOpacity
              style={[
                styles.signupButton,
                loading && styles.signupButtonDisabled,
              ]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.signupButtonText}>
                {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <TouchableOpacity
              style={styles.loginLinkButton}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.loginLinkText}>
                ALREADY HAVE AN ACCOUNT?{" "}
                <Text style={styles.loginLinkBold}>LOGIN HERE</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2024 TaskZone - Employee Portal
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor:
      "linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #7c3aed 100%)",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    minHeight: "100%",
    backgroundColor:
      "linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #7c3aed 100%)",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 25,
  },
  logoCircle: {
    backgroundColor: "#7c3aed",
    borderRadius: 50,
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#7c3aed",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  logoEmoji: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  appName: {
    fontSize: 36,
    fontWeight: "900",
    color: "#1e3a8a",
    marginBottom: 6,
  },
  appDescription: {
    fontSize: 18,
    textAlign: "center",
    color: "#4b5563",
    fontWeight: "600",
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 25,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    backgroundColor: "white",
    fontWeight: "500",
    color: "black",
  },
  signupButton: {
    backgroundColor: "#7c3aed",
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#7c3aed",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  signupButtonDisabled: {
    opacity: 0.7,
  },
  signupButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 18,
  },
  loginLinkButton: {
    paddingVertical: 14,
  },
  loginLinkText: {
    color: "#6b7280",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  loginLinkBold: {
    color: "#2563eb",
    fontWeight: "bold",
  },
  footer: {
    marginTop: 18,
  },
  footerText: {
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontWeight: "500",
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
});
