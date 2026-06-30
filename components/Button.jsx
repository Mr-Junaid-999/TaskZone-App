import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

export default function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  ...props
}) {
  const getVariantStyle = () => {
    switch (variant) {
      case "primary":
        return styles.primary;
      case "secondary":
        return styles.secondary;
      case "success":
        return styles.success;
      case "warning":
        return styles.warning;
      case "danger":
        return styles.danger;
      default:
        return styles.primary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "primary":
      case "success":
      case "warning":
      case "danger":
        return styles.textLight;
      case "secondary":
        return styles.textDark;
      default:
        return styles.textLight;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, getVariantStyle(), disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={[styles.buttonText, getTextStyle()]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  textLight: {
    color: "#ffffff",
  },
  textDark: {
    color: "#1f2937",
  },
  primary: {
    backgroundColor: "#2563eb",
  },
  secondary: {
    backgroundColor: "#e5e7eb",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  success: {
    backgroundColor: "#10b981",
  },
  warning: {
    backgroundColor: "#f59e0b",
  },
  danger: {
    backgroundColor: "#ef4444",
  },
  disabled: {
    opacity: 0.6,
  },
});
