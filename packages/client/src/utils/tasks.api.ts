import { apiClient } from "./api-client";

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: "todo" | "in_progress" | "done";
  priority?: "low" | "medium" | "high";
}

export const tasksApi = {
  getByProjectId: (projectId: number): Promise<Task[]> => {
    return apiClient.get<Task[]>(`/projects/${projectId}/tasks`);
  },

  create: (projectId: number, data: CreateTaskData): Promise<Task> => {
    return apiClient.post<Task>(`/projects/${projectId}/tasks`, data);
  },

  update: (
    projectId: number,
    taskId: number,
    data: UpdateTaskData
  ): Promise<Task> => {
    // Use PATCH for partial updates, PUT for complete updates
    // If only status/priority are being updated, use PATCH
    // If title or description are included, use PUT for complete update
    const method =
      data.title !== undefined || data.description !== undefined
        ? "put"
        : "patch";

    return apiClient[method]<Task>(
      `/projects/${projectId}/tasks/${taskId}`,
      data
    );
  },

  delete: (projectId: number, taskId: number): Promise<void> => {
    return apiClient.delete<void>(`/projects/${projectId}/tasks/${taskId}`);
  },
};
