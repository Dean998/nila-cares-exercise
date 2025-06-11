import { notifications } from "@mantine/notifications";

export const successNotification = (message: string) =>
  notifications.show({
    title: "Success",
    color: "green",
    message,
    autoClose: 2000, // Auto-close after 2 seconds
  });

export const errorNotification = (message: string) =>
  notifications.show({
    title: "Error",
    color: "red",
    message,
    autoClose: 3000, // Auto-close after 3 seconds for errors
  });
