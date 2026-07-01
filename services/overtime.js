// services/overtime.js
import { NotificationTriggers } from "./notificationTriggers";
import { supabase } from "./supabase";

let user_id;

export const OvertimeService = {
  async getuserid() {
    try {
      const { data: authUser, error: authError } =
        await supabase.auth.getUser();

      if (authError) {
        throw new Error("Authentication failed");
      }

      if (!authUser?.user?.email) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("email", authUser.user.email);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error("Employee not found");
      }

      user_id = data[0].id;

      const { data: managerCheck, error: managerError } = await supabase
        .from("departments")
        .select("manager_id")
        .eq("manager_id", data[0].id)
        .single();

      if (managerError && managerError.code !== "PGRST116") {
        throw managerError;
      }

      return {
        isManager: !!managerCheck,
      };
    } catch (error) {
      console.error("Error in getuserid:", error);
      throw error;
    }
  },

  async submitOvertime(overtimeData) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Current user ka data get karein
      const { data: currentUser } = await supabase
        .from("employees")
        .select("*")
        .eq("id", user_id)
        .single();

      // Prepare data for insertion - handle NULL project_id properly
      const submitData = {
        employee_id: user_id,
        overtime_date: overtimeData.overtime_date,
        total_hours: parseFloat(overtimeData.total_hours),
        tasks_performed: overtimeData.tasks_performed,
        status: "pending",
        notes: overtimeData.notes || null,
      };

      // Only add project_id if it exists and is not empty
      if (overtimeData.project_id && overtimeData.project_id.trim() !== "") {
        submitData.project_id = overtimeData.project_id;
      } else {
        submitData.project_id = null; // Explicitly set to NULL
      }

      const { data, error } = await supabase
        .from("overtime_requests")
        .insert([submitData])
        .select();

      if (error) {
        console.error("Supabase insertion error:", error);
        throw error;
      }

      // NOTIFICATION TRIGGER ADD KAREIN
      if (data && data[0]) {
        await NotificationTriggers.onOvertimeSubmitted(data[0], currentUser);
      }

      return data;
    } catch (error) {
      console.error("Error submitting overtime:", error);
      throw error;
    }
  },

  async getUserOvertime() {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("No user found");

    // Check if user is manager
    const { data: managerCheck } = await supabase
      .from("departments")
      .select("manager_id")
      .eq("manager_id", user_id)
      .single();

    const isManager = !!managerCheck;

    let query;
    if (isManager) {
      query = supabase
        .from("overtime_requests")
        .select(
          `
        *,
        projects(name),
        employees!overtime_requests_approved_by_fkey(name, email)
      `,
        )
        .order("overtime_date", { ascending: false });
    }
    // If not manager, only show user's overtime requests
    if (!isManager) {
      query = supabase
        .from("overtime_requests")
        .select(
          `
        *,
        projects(name),
        employees!overtime_requests_approved_by_fkey(name, email)
      `,
        )
        .order("overtime_date", { ascending: false })
        .eq("employee_id", user_id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async getPendingOvertimeRequests() {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("No user found");

    const { data, error } = await supabase
      .from("overtime_requests")
      .select(
        `
        *,
        projects(name),
        employees!overtime_requests_employee_id_fkey(name, department, email),
        approved_by_employee:employees!overtime_requests_approved_by_fkey(name)
      `,
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateOvertimeStatus(requestId, status, notes = "") {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser) throw new Error("No user found");

      // Current user (manager) ka data get karein
      const { data: currentUser } = await supabase
        .from("employees")
        .select("*")
        .eq("email", authUser.user.email)
        .single();

      const { data, error } = await supabase
        .from("overtime_requests")
        .update({
          status,
          approved_by: currentUser.id,
          approved_at: new Date().toISOString(),
          notes,
        })
        .eq("id", requestId).select(`
          *,
          employees!overtime_requests_employee_id_fkey (name)
        `);

      if (error) throw error;

      // NOTIFICATION TRIGGER ADD KAREIN
      if (data && data[0]) {
        await NotificationTriggers.onOvertimeStatusChanged(
          data[0],
          status,
          currentUser,
        );
      }

      return data;
    } catch (error) {
      console.error("Error updating overtime status:", error);
      throw error;
    }
  },

  async getMonthlyOvertimeReport(month, year) {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("No user found");

    const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
    const endDate = `${year}-${month.toString().padStart(2, "0")}-31`;

    // Check if user is manager
    const { data: managerCheck } = await supabase
      .from("departments")
      .select("manager_id")
      .eq("manager_id", user_id)
      .single();

    const isManager = !!managerCheck;

    let query = supabase
      .from("overtime_requests")
      .select("*")
      .eq("status", "approved")
      .gte("overtime_date", startDate)
      .lte("overtime_date", endDate);

    // If not manager, only show user's overtime
    if (!isManager) {
      query = query.eq("employee_id", user_id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async updateOvertimeRequest(requestId, updates) {
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser) throw new Error("No user found");

    const { data: currentUser } = await supabase
      .from("employees")
      .select("*")
      .eq("email", authUser.user.email)
      .single();
    // Verify the request belongs to the current user and is pending
    const { data: existingRequest, error: fetchError } = await supabase
      .from("overtime_requests")
      .select("*")
      .eq("id", requestId)
      .eq("status", "pending")
      .single();

    if (fetchError || !existingRequest) {
      throw new Error("Overtime request not found or cannot be edited");
    }

    const { data, error } = await supabase
      .from("overtime_requests")
      .update({
        ...updates,
        approved_by: currentUser.id, // Reset approved_by if the request is edited
      })
      .eq("id", requestId)
      .select();

    // NOTIFICATION TRIGGER ADD KAREIN
    if (data && data[0]) {
      await NotificationTriggers.onOvertimeStatusChanged(
        data[0],
        updates.status,
        currentUser,
      );
    }

    if (error) throw error;
    return data;
  },

  async deleteOvertimeRequest(requestId) {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("No user found");
    // Verify the request belongs to the current user and is pending
    const { data: existingRequest, error: fetchError } = await supabase
      .from("overtime_requests")
      .select("*")
      .eq("id", requestId)
      .eq("employee_id", user_id)
      .eq("status", "pending")
      .single();

    if (fetchError || !existingRequest) {
      throw new Error("Overtime request not found or cannot be deleted..");
    }

    const { error } = await supabase
      .from("overtime_requests")
      .delete()
      .eq("id", requestId);

    if (error) throw error;
    return { success: true };
  },

  // NEW: Approve/Reject overtime with notification (Manager ke liye)
  async approveRejectOvertime(requestId, action, notes = "") {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Check if user is manager
      const { data: managerCheck } = await supabase
        .from("departments")
        .select("manager_id")
        .eq("manager_id", user_id)
        .single();

      if (!managerCheck) {
        throw new Error("Only managers can approve/reject overtime requests");
      }

      // Current user (manager) ka data get karein
      const { data: currentUser } = await supabase
        .from("employees")
        .select("*")
        .eq("id", user_id)
        .single();

      const status = action === "approve" ? "approved" : "rejected";

      const { data, error } = await supabase
        .from("overtime_requests")
        .update({
          status: status,
          approved_by: user_id,
          approved_at: new Date().toISOString(),
          notes: notes,
        })
        .eq("id", requestId).select(`
          *,
          employees!overtime_requests_employee_id_fkey (name)
        `);

      if (error) throw error;

      // NOTIFICATION TRIGGER ADD KAREIN
      if (data && data[0]) {
        await NotificationTriggers.onOvertimeStatusChanged(
          data[0],
          status,
          currentUser,
        );
      }

      return data;
    } catch (error) {
      console.error("Error in approve/reject overtime:", error);
      throw error;
    }
  },
};
