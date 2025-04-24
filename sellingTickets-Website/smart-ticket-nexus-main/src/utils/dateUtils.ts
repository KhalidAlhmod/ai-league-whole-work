
import { format, parseISO, isValid } from "date-fns";

export const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A";
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return "Invalid date";
    return format(date, "MMM d, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

export const formatDateTime = (dateString: string): string => {
  if (!dateString) return "N/A";
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return "Invalid date";
    return format(date, "MMM d, yyyy h:mm a");
  } catch (error) {
    console.error("Error formatting date time:", error);
    return "Invalid date";
  }
};

export const formatShortDate = (dateString: string): string => {
  if (!dateString) return "N/A";
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return "Invalid";
    return format(date, "MM/dd/yy");
  } catch (error) {
    console.error("Error formatting short date:", error);
    return "Invalid";
  }
};

export const formatShortDateTime = (dateString: string): string => {
  if (!dateString) return "N/A";
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return "Invalid";
    return format(date, "MM/dd/yy h:mm a");
  } catch (error) {
    console.error("Error formatting short date time:", error);
    return "Invalid";
  }
};

export const formatTimeOnly = (dateString: string): string => {
  if (!dateString) return "N/A";
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return "Invalid";
    return format(date, "h:mm a");
  } catch (error) {
    console.error("Error formatting time only:", error);
    return "Invalid";
  }
};
