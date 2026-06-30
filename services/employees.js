// //TaskZone/services/employees.js
// import { supabase } from "./supabase";

// export const EmployeesService = {
//   async getAllEmployees() {
//     const { data, error } = await supabase
//       .from("employees")
//       .select("*")
//       .eq("is_active", true)
//       .order("name", { ascending: true });

//     if (error) throw error;
//     return data;
//   },

//   async addEmployee(employeeData) {
//     const { data, error } = await supabase
//       .from("employees")
//       .insert([employeeData])
//       .select();

//     if (error) throw error;
//     return data;
//   },

//   async updateEmployee(employeeId, updates) {
//     const { data, error } = await supabase
//       .from("employees")
//       .update(updates)
//       .eq("id", employeeId)
//       .select();

//     if (error) throw error;
//     return data;
//   },

//   async deleteEmployee(employeeId) {
//     const { error } = await supabase
//       .from("employees")
//       .delete()
//       .eq("id", employeeId);

//     if (error) throw error;
//   },
// };
//TaskZone/services/employees.js
import { supabase } from "./supabase";

export const EmployeesService = {
  async getAllEmployees() {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) throw error;
    return data;
  },

  async addEmployee(employeeData) {
    const { data, error } = await supabase
      .from("employees")
      .insert([employeeData])
      .select();

    if (error) throw error;
    return data;
  },

  async updateEmployee(employeeId, updates) {
    const { data, error } = await supabase
      .from("employees")
      .update(updates)
      .eq("id", employeeId)
      .select();

    if (error) throw error;
    return data;
  },

  async deleteEmployee(employeeId) {
    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", employeeId);

    if (error) throw error;
  },

  // NEW FUNCTIONS ADD KAREIN
  async getManagers() {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .or(
          "position.ilike.%manager%,position.ilike.%lead%,position.ilike.%head%"
        )
        .eq("is_active", true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching managers:", error);
      return [];
    }
  },

  async getDepartmentManagers(department) {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("department", department)
        .or("position.ilike.%manager%,position.ilike.%lead%")
        .eq("is_active", true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching department managers:", error);
      return [];
    }
  },

  async getHRTeam() {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .or("department.ilike.%HR%,department.ilike.%human%resource%")
        .eq("is_active", true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching HR team:", error);
      return [];
    }
  },
};
