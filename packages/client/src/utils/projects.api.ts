import { apiClient } from "./api-client";

export interface Project {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
}

export const projectsApi = {
  getAll: (): Promise<Project[]> => {
    return apiClient.get<Project[]>("/projects");
  },

  getById: (id: number): Promise<Project> => {
    return apiClient.get<Project>(`/projects/${id}`);
  },

  create: (data: CreateProjectData): Promise<Project> => {
    return apiClient.post<Project>("/projects", data);
  },

  update: (id: number, data: UpdateProjectData): Promise<Project> => {
    return apiClient.patch<Project>(`/projects/${id}`, data);
  },

  delete: (id: number): Promise<void> => {
    return apiClient.delete<void>(`/projects/${id}`);
  },
};
