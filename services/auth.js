import { supabase } from "./supabase";

export const AuthService = {
  async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error("Error getting current user:", error);
      throw error;
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  },

  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  },

  // Alternative single method in AuthService
  async changePasswordWithVerification(currentPassword, newPassword) {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user || !user.email) {
        throw new Error("User not found");
      }

      // Step 1: Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error("Current password is incorrect");
      }

      // Step 2: Update to new password
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      return { data, error: null };
    } catch (error) {
      console.error("Error changing password:", error);
      return { data: null, error };
    }
  },
};
