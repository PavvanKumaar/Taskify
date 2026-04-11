// Task statuses for backend / frontend mapping, from UI style values.
export type TaskStatus = "Backlog" | "Todo" | "In Progress" | "In Review" | "Done";
export type TaskPriority = "Low" | "Medium" | "High";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assigneeId: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  position: number;
  createdBy: string;
}

export interface Project {
  id: string;
  name: string;
  workspaceId: string;
  imageUrl: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: "admin" | "member";
}

export interface User extends Member {
  passwordHash: string;
  createdAt: string;
  workspaceId: string;
}

export interface JwtPayload {
  userId: string;
  role: "admin" | "member";
}

export interface ProjectMember extends Member {
  projectRole: 'admin' | 'member';
}
