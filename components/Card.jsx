import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function Card({
  children,
  onPress,
  style = {},
  variant = "default",
}) {
  const getVariantStyle = () => {
    switch (variant) {
      case "primary":
        return styles.primary;
      case "success":
        return styles.success;
      case "warning":
        return styles.warning;
      case "danger":
        return styles.danger;
      default:
        return styles.default;
    }
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.card, getVariantStyle(), style]}
      onPress={onPress}
    >
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
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
    borderWidth: 1,
  },
  default: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
  },
  primary: {
    backgroundColor: "#dbeafe",
    borderColor: "#93c5fd",
  },
  success: {
    backgroundColor: "#dcfce7",
    borderColor: "#86efac",
  },
  warning: {
    backgroundColor: "#fef3c7",
    borderColor: "#fcd34d",
  },
  danger: {
    backgroundColor: "#fee2e2",
    borderColor: "#fca5a5",
  },
});
