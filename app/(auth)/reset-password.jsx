//TaskZone/app/(auth)/reset-password.jsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    // Check if user came from password reset email
    if (params?.token) {
      // Session automatically handled by Supabase
      console.log("Password reset session detected");
    }
  }, [params]);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Please enter both password fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Success", "Your password has been reset successfully!", [
          {
            text: "OK",
            onPress: () => router.replace("/login"),
          },
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
      >
        <View style={styles.mainContainer}>
          <View style={styles.card}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoEmoji}>🔒</Text>
              </View>
              <Text style={styles.appName}>Reset Password</Text>
              <Text style={styles.appDescription}>
                Create your new password
              </Text>
            </View>

            {/* Instructions */}
            <Text style={styles.welcomeText}>Set New Password</Text>
            <Text style={styles.subtitle}>Enter your new password below</Text>

            {/* New Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>NEW PASSWORD</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter new password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>CONFIRM PASSWORD</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Confirm new password"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              style={[
                styles.resetButton,
                loading && styles.resetButtonDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              <Text style={styles.resetButtonText}>
                {loading ? "RESETTING..." : "RESET PASSWORD"}
              </Text>
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={() => router.replace("/login")}
            >
              <Text style={styles.backToLoginText}>BACK TO LOGIN</Text>
            </TouchableOpacity>
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
    backgroundColor: "#2563eb",
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
    backgroundColor: "#2563eb",
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
    fontSize: 28,
    fontWeight: "900",
    color: "#1e3a8a",
    marginBottom: 6,
  },
  appDescription: {
    fontSize: 16,
    textAlign: "center",
    color: "#4b5563",
    fontWeight: "600",
  },
  welcomeText: {
    fontSize: 24,
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
  resetButton: {
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
  resetButtonDisabled: {
    opacity: 0.7,
  },
  resetButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 18,
  },
  backToLoginButton: {
    paddingVertical: 14,
  },
  backToLoginText: {
    color: "#2563eb",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
