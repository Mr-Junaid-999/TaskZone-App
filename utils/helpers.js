import { OVERTIME_STATUS, PROJECT_STATUS, TASK_STATUS } from "./constants";

export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getStatusColor = (status, type = "project") => {
  const statusMap = {
    [PROJECT_STATUS.COMPLETED]: "success",
    [PROJECT_STATUS.IN_PROGRESS]: "warning",
    [PROJECT_STATUS.PENDING]: "gray",
    [TASK_STATUS.COMPLETED]: "success",
    [TASK_STATUS.IN_PROGRESS]: "warning",
    [TASK_STATUS.PENDING]: "gray",
    [OVERTIME_STATUS.APPROVED]: "success",
    [OVERTIME_STATUS.PENDING]: "warning",
    [OVERTIME_STATUS.REJECTED]: "danger",
  };

  return statusMap[status] || "gray";
};

export const calculateOvertimeTotal = (overtimeRequests) => {
  const approvedRequests = overtimeRequests.filter(
    (req) => req.status === OVERTIME_STATUS.APPROVED
  );
  return approvedRequests.reduce(
    (total, req) => total + parseFloat(req.total_hours || 0),
    0
  );
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
