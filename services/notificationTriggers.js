import { EmployeesService } from "./employees"; // YEH CHANGE KAREIN
import { NotificationService } from "./notifications";
import { PushNotificationService } from "./pushNotifications";

export const NotificationTriggers = {
  // New project create hone par
  onProjectCreated: async (project, createdBy) => {
    const notification = {
      user_id: project.assigned_to,
      title: "New Project Assigned",
      message: `You have been assigned to project: ${project.name}`,
      type: "info",
      related_entity_type: "project",
      related_entity_id: project.id,
    };

    await NotificationService.createNotification(notification);
    await PushNotificationService.showLocalNotification(
      "New Project",
      `You have been assigned to: ${project.name}`
    );
  },

  // Task complete hone par
  onTaskCompleted: async (task, completedBy) => {
    // Sab managers ko notification bhejein
    const managers = await EmployeesService.getManagers(); // YEH CHANGE KAREIN

    for (const manager of managers) {
      const notification = {
        user_id: manager.id,
        title: "Task Completed",
        message: `${completedBy.name} has completed task: ${task.task_description}`,
        type: "success",
        related_entity_type: "task",
        related_entity_id: task.id,
      };

      await NotificationService.createNotification(notification);
    }
  },

  // Overtime submit hone par
  onOvertimeSubmitted: async (overtime, submittedBy) => {
    // Sab managers ko notification
    const managers = await EmployeesService.getManagers(); // YEH CHANGE KAREIN
    console.log("managers", managers);
    for (const manager of managers) {
      console.log("manager id : ", manager.id);
      const notification = {
        user_id: manager.id,
        title: "Overtime Request",
        message: `${submittedBy.name} has submitted an overtime request for ${overtime.total_hours} hours`,
        type: "warning",
        related_entity_type: "overtime",
        related_entity_id: overtime.id,
      };

      await NotificationService.createNotification(notification);

      // Push notification bhi bhejein
      await PushNotificationService.showLocalNotification(
        "Overtime Request",
        `${submittedBy.name} submitted ${overtime.total_hours} hours overtime`
      );
    }
  },

  // Overtime approve/reject hone par
  onOvertimeStatusChanged: async (overtime, status, approvedBy) => {
    const notification = {
      user_id: overtime.employee_id,
      title: "Overtime Request Updated",
      message: `Your overtime request has been ${status} by ${approvedBy.name}`,
      type: status === "approved" ? "success" : "error",
      related_entity_type: "overtime",
      related_entity_id: overtime.id,
    };

    await NotificationService.createNotification(notification);
    await PushNotificationService.showLocalNotification(
      "Overtime Status",
      `Your overtime request has been ${status}`
    );
  },

  // New employee add hone par
  onEmployeeAdded: async (newEmployee, addedBy) => {
    // HR team ko notification
    const hrTeam = await EmployeesService.getHRTeam(); // YEH CHANGE KAREIN

    for (const hr of hrTeam) {
      const notification = {
        user_id: hr.id,
        title: "New Employee Added",
        message: `${newEmployee.name} has been added to ${newEmployee.department} department as ${newEmployee.position}`,
        type: "info",
        related_entity_type: "employee",
        related_entity_id: newEmployee.id,
      };

      await NotificationService.createNotification(notification);
    }
  },

  // Project deadline approaching
  onProjectDeadlineApproaching: async (project, daysLeft) => {
    const notification = {
      user_id: project.assigned_to,
      title: "Project Deadline Approaching",
      message: `Project "${project.name}" deadline is in ${daysLeft} days`,
      type: "warning",
      related_entity_type: "project",
      related_entity_id: project.id,
    };

    await NotificationService.createNotification(notification);
    await PushNotificationService.showLocalNotification(
      "Deadline Alert",
      `Project "${project.name}" due in ${daysLeft} days`
    );
  },
};
