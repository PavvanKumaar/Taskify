import { api } from './client';

export interface ApiProject {
  id: string;
  name: string;
  workspaceId: string;
  imageUrl: string;
  createdAt: string;
}

export interface ApiProjectMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'admin' | 'member';
  projectRole: 'admin' | 'member';
}

export const projectsApi = {
  list: () => api.get<ApiProject[]>('/projects'),
  get: (id: string) => api.get<ApiProject>(`/projects/${id}`),
  create: (payload: { name: string; workspaceId: string; imageUrl?: string }) =>
    api.post<ApiProject>('/projects', payload),
  update: (id: string, payload: Partial<{ name: string; imageUrl: string }>) =>
    api.put<ApiProject>(`/projects/${id}`, payload),
  delete: (id: string) => api.delete<void>(`/projects/${id}`),

  // Member management
  listMembers: (projectId: string) =>
    api.get<ApiProjectMember[]>(`/projects/${projectId}/members`),
  addMember: (projectId: string, email: string, role: 'admin' | 'member' = 'member') =>
    api.post<{ message: string }>(`/projects/${projectId}/members`, { email, role }),
  removeMember: (projectId: string, userId: string) =>
    api.delete<void>(`/projects/${projectId}/members/${userId}`),
};
