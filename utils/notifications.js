import { Alert } from "react-native";

export const NotificationService = {
  showSuccess: (message, title = "Success") => {
    Alert.alert(title, message);
  },

  showError: (message, title = "Error") => {
    Alert.alert(title, message);
  },

  showConfirmation: (message, onConfirm, title = "Confirm") => {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: "OK", onPress: onConfirm },
    ]);
  },

  showOptions: (message, options, title = "Options") => {
    Alert.alert(title, message, options);
  },
};
