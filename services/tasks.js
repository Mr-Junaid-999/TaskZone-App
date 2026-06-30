import { supabase } from "./supabase";
let user_id;
export const TasksService = {
  async getUserTasks() {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("No user found");

    // Get tasks
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("employee_id", user_id)
      .order("date", { ascending: false });

    if (error) throw error;

    // Get projects and employees separately
    const { data: projects } = await supabase
      .from("projects")
      .select("id, name");

    const { data: employees } = await supabase
      .from("employees")
      .select("id, name");

    // Combine data manually
    const tasksWithDetails = tasks.map((task) => ({
      ...task,
      projects: projects?.find((proj) => proj.id === task.project_id),
      employees: employees?.find((emp) => emp.id === task.employee_id),
    }));

    return tasksWithDetails;
  },
  async getuserid() {
    const { data: authUser } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("employees")
      .select()
      .eq("email", authUser.user.email);
    user_id = data[0].id;

    if (error) throw error;
  },

  async createTask(taskData) {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("No user found");
    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          ...taskData,
          date: new Date().toISOString().split("T")[0],
        },
      ])
      .select();

    if (error) throw error;
    return data;
  },

  async updateTask(taskId, updates) {
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId)
      .select();

    if (error) throw error;
    return data;
  },

  async getTodayTasks() {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("No user found");

    const today = new Date().toISOString().split("T")[0];

    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("employee_id", user_id)
      .eq("date", today)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Get projects separately
    const { data: projects } = await supabase
      .from("projects")
      .select("id, name");

    // Combine data manually
    const tasksWithProjects = tasks.map((task) => ({
      ...task,
      projects: projects?.find((proj) => proj.id === task.project_id),
    }));

    return tasksWithProjects;
  },
};
