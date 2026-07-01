import { NotificationTriggers } from "./notificationTriggers";
import { supabase } from "./supabase";

let user_id;

export const ProjectsService = {
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
      console.log("Manager check result:", !!managerCheck);
      return {
        isManager: !!managerCheck,
      };
    } catch (error) {
      console.error("Error in getuserid:", error);
      throw error;
    }
  },

  async getUserProjects() {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("No user found");

    // First get projects
    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Then get employees separately and combine
    const { data: employees } = await supabase
      .from("employees")
      .select("id, name, department, position, email");

    // Combine data manually
    const projectsWithEmployees = projects.map((project) => ({
      ...project,
      assigned_to_employee: employees?.find(
        (emp) => emp.id === project.assigned_to,
      ),
      created_by_employee: employees?.find(
        (emp) => emp.id === project.created_by,
      ),
    }));

    return projectsWithEmployees;
  },

  async createProject(projectData) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Current user ka data get karein
      const { data: currentUser } = await supabase
        .from("employees")
        .select("*")
        .eq("id", user_id)
        .single();

      const { data, error } = await supabase
        .from("projects")
        .insert([
          {
            ...projectData,
            created_by: user_id,
          },
        ])
        .select();

      if (error) throw error;

      // NOTIFICATION TRIGGER ADD KAREIN
      if (data && data[0]) {
        await NotificationTriggers.onProjectCreated(data[0], currentUser);
      }

      return data;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  },

  async updateProject(projectId, updates) {
    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", projectId)
      .select();

    if (error) throw error;

    return data;
  },

  async getAllProjects() {
    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Get employees separately
    const { data: employees } = await supabase
      .from("employees")
      .select("id, name, department, position, email");

    // Combine data manually
    const projectsWithEmployees = projects.map((project) => ({
      ...project,
      assigned_to_employee: employees?.find(
        (emp) => emp.id === project.assigned_to,
      ),
      created_by_employee: employees?.find(
        (emp) => emp.id === project.created_by,
      ),
    }));

    return projectsWithEmployees;
  },

  async deleteProject(projectId) {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) throw error;
  },

  async getProjectStatistics() {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("No user found");

    // Sab projects ke statistics
    const { data, error } = await supabase.from("projects").select("status");

    if (error) throw error;

    const stats = {
      total: data.length,
      pending: data.filter((p) => p.status === "pending").length,
      in_progress: data.filter((p) => p.status === "in progress").length,
      completed: data.filter((p) => p.status === "completed").length,
      cancelled: data.filter((p) => p.status === "cancelled").length,
    };

    return stats;
  },

  async searchProjects(searchTerm) {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("No user found");

    const { data, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        employees!projects_assigned_to_fkey(name, department, position, email),
        projects_created_by_fkey:employees!projects_created_by_fkey(name, email)
      `,
      )
      .or(
        `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,requirements.ilike.%${searchTerm}%`,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getProjectsByStatus(status) {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("No user found");

    const { data, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        employees!projects_assigned_to_fkey(name, department, position, email),
        projects_created_by_fkey:employees!projects_created_by_fkey(name, email)
      `,
      )
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getProjectsByPriority(priority) {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("No user found");

    const { data, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        employees!projects_assigned_to_fkey(name, department, position, email),
        projects_created_by_fkey:employees!projects_created_by_fkey(name, email)
      `,
      )
      .eq("priority", priority)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },
};
