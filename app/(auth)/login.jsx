//TaskZone/app/(auth)/login.jsx
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../services/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        Alert.alert("Login Error", error.message);
      } else {
        router.replace("/(tabs)");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        resetEmail.trim(),
        {
          redirectTo: "taskzone://reset-password",
        }
      );

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert(
          "Email Sent",
          "Password reset instructions have been sent to your email address."
        );
        setForgotPasswordModal(false);
        setResetEmail("");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to send reset email");
    } finally {
      setResetLoading(false);
    }
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
                <Text style={styles.logoEmoji}>📊</Text>
              </View>
              <Text style={styles.appName}>TaskZone</Text>
              <Text style={styles.appDescription}>
                Employee Management System
              </Text>
            </View>

            {/* Welcome Text */}
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue to your dashboard
            </Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email address"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>PASSWORD</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? "PLEASE WAIT..." : "LOGIN TO DASHBOARD"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupLinkButton}
              onPress={() => router.push("/signup")}
            >
              <Text style={styles.signupLinkText}>
                DON&apos;T HAVE AN ACCOUNT?{" "}
                <Text style={styles.signupLinkBold}>SIGN UP HERE</Text>
              </Text>
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => setForgotPasswordModal(true)}
            >
              <Text style={styles.forgotPasswordText}>
                FORGOT YOUR PASSWORD?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2024 TaskZone - Secure Employee Portal
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Forgot Password Modal */}
      <Modal
        visible={forgotPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setForgotPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <Text style={styles.modalSubtitle}>
              Enter your email address and we'll send you instructions to reset
              your password.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email address"
                placeholderTextColor="#9CA3AF"
                value={resetEmail}
                onChangeText={setResetEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  resetLoading && styles.buttonDisabled,
                ]}
                onPress={() => setForgotPasswordModal(false)}
                disabled={resetLoading}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.resetButton,
                  resetLoading && styles.buttonDisabled,
                ]}
                onPress={handleForgotPassword}
                disabled={resetLoading}
              >
                <Text style={styles.resetButtonText}>
                  {resetLoading ? "SENDING..." : "SEND RESET LINK"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "white",
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
    backgroundColor: "white",
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
    backgroundColor: "#2563eb",
    borderRadius: 50,
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#3b82f6",
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
    color: "black",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    backgroundColor: "white",
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#3b82f6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 18,
  },
  forgotPasswordButton: {
    paddingVertical: 14,
  },
  forgotPasswordText: {
    color: "#2563eb",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
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
  signupLinkButton: {
    paddingVertical: 14,
  },
  signupLinkText: {
    color: "#6b7280",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  signupLinkBold: {
    color: "#7c3aed",
    fontWeight: "bold",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
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
  modalTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingVertical: 16,
    borderRadius: 12,
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#374151",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  resetButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    marginLeft: 8,
    shadowColor: "#3b82f6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  resetButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
