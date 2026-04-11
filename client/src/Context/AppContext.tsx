import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { tasksApi, type ApiTask } from '../api/tasks';
import { projectsApi, type ApiProject, type ApiProjectMember } from '../api/projects';
import { membersApi, type ApiMember } from '../api/members';
import { api } from '../api/client';
import { useAuth } from './AuthContext';
import { getSocket, disconnectSocket } from '../hooks/useSocket';

export interface UITask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  projectId: string;
  assigneeId: string | null;
  dueDate: string | null;
  createdAt: string;
  position: number;
  assignee?: { name: string };
}

interface AppState {
  projects: ApiProject[];
  tasks: UITask[];
  members: ApiMember[];
  // Per-project member lists & roles
  projectMembers: Record<string, ApiProjectMember[]>;
  selectedProjectId: string | null;
  isLoading: boolean;
  error: string | null;

  addTask: (task: {
    title: string; description?: string; status: string; priority: string;
    projectId: string; assigneeId?: string | null; dueDate?: string | null;
  }) => Promise<void>;
  updateTask: (id: string, updates: Partial<UITask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: string) => Promise<void>;
  addProject: (project: { name: string; imageUrl?: string }) => Promise<void>;
  setSelectedProjectId: (id: string | null) => void;
  refetchTasks: (projectId?: string) => Promise<void>;

  // Project member management
  fetchProjectMembers: (projectId: string) => Promise<void>;
  addProjectMember: (projectId: string, email: string, role?: 'admin' | 'member') => Promise<void>;
  removeProjectMember: (projectId: string, userId: string) => Promise<void>;
  isProjectAdmin: (projectId: string) => boolean;
}

const AppContext = createContext<AppState | null>(null);

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
};

function enrichTasks(tasks: ApiTask[], members: ApiMember[]): UITask[] {
  return tasks.map((t) => {
    const assignee = t.assigneeId ? members.find((m) => m.id === t.assigneeId) : undefined;
    return { ...t, assignee: assignee ? { name: assignee.name } : undefined };
  });
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [tasks, setTasks] = useState<UITask[]>([]);
  const [members, setMembers] = useState<ApiMember[]>([]);
  const [projectMembers, setProjectMembers] = useState<Record<string, ApiProjectMember[]>>({});
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const [proj, mem, tsk] = await Promise.all([
        projectsApi.list(),   // server now returns only user's projects
        membersApi.list(),
        tasksApi.list(),
      ]);
      setProjects(proj);
      setMembers(mem);
      setTasks(enrichTasks(tsk, mem));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Socket.IO real-time task sync
  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = getSocket(token);

    socket.on('task:created', (newTask: ApiTask) => {
      setTasks((prev) => {
        if (prev.find((t) => t.id === newTask.id)) return prev;
        setMembers((currentMembers) => {
          const assignee = newTask.assigneeId
            ? currentMembers.find((m) => m.id === newTask.assigneeId)
            : undefined;
          const uiTask: UITask = { ...newTask, assignee: assignee ? { name: assignee.name } : undefined };
          setTasks((cur) => cur.find((t) => t.id === newTask.id) ? cur : [...cur, uiTask]);
          return currentMembers;
        });
        return prev;
      });
    });

    socket.on('task:updated', (updatedTask: ApiTask) => {
      setMembers((currentMembers) => {
        const assignee = updatedTask.assigneeId
          ? currentMembers.find((m) => m.id === updatedTask.assigneeId)
          : undefined;
        setTasks((prev) =>
          prev.map((t) =>
            t.id === updatedTask.id
              ? { ...updatedTask, assignee: assignee ? { name: assignee.name } : undefined }
              : t
          )
        );
        return currentMembers;
      });
    });

    socket.on('task:deleted', ({ id }: { id: string }) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    });

    return () => {
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
      disconnectSocket();
    };
  }, [isAuthenticated]);

  const refetchTasks = useCallback(async (projectId?: string) => {
    try {
      const tsk = await tasksApi.list(projectId);
      setTasks(enrichTasks(tsk, members));
    } catch (e: any) { setError(e.message); }
  }, [members]);

  const addTask = useCallback(async (task: {
    title: string; description?: string; status: string; priority: string;
    projectId: string; assigneeId?: string | null; dueDate?: string | null;
  }) => {
    const newTask = await tasksApi.create(task);
    const assignee = newTask.assigneeId ? members.find((m) => m.id === newTask.assigneeId) : undefined;
    setTasks((prev) => {
      if (prev.find((t) => t.id === newTask.id)) return prev;
      return [...prev, { ...newTask, assignee: assignee ? { name: assignee.name } : undefined }];
    });
  }, [members]);

  const updateTask = useCallback(async (id: string, updates: Partial<UITask>) => {
    const updated = await tasksApi.update(id, updates);
    const assignee = updated.assigneeId ? members.find((m) => m.id === updated.assigneeId) : undefined;
    setTasks((prev) =>
      prev.map((t) => t.id === id ? { ...updated, assignee: assignee ? { name: assignee.name } : undefined } : t)
    );
  }, [members]);

  const deleteTask = useCallback(async (id: string) => {
    await tasksApi.delete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const moveTask = useCallback(async (taskId: string, newStatus: string) => {
    await tasksApi.update(taskId, { status: newStatus });
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));
  }, []);

  const addProject = useCallback(async (project: { name: string; imageUrl?: string }) => {
    const workspaces = await api.get<{ id: string }[]>('/workspaces');
    const workspaceId = workspaces[0]?.id;
    if (!workspaceId) throw new Error('No workspace found. Please register first.');
    const newProject = await projectsApi.create({
      name: project.name,
      workspaceId,
      imageUrl: project.imageUrl || '',
    });
    setProjects((prev) => [...prev, newProject]);
    // Auto-load its members (creator is already admin on server)
    const newMembers = await projectsApi.listMembers(newProject.id);
    setProjectMembers((prev) => ({ ...prev, [newProject.id]: newMembers }));
  }, []);

  const fetchProjectMembers = useCallback(async (projectId: string) => {
    const mem = await projectsApi.listMembers(projectId);
    setProjectMembers((prev) => ({ ...prev, [projectId]: mem }));
  }, []);

  const addProjectMember = useCallback(async (
    projectId: string, email: string, role: 'admin' | 'member' = 'member'
  ) => {
    await projectsApi.addMember(projectId, email, role);
    await fetchProjectMembers(projectId);
    // Also refresh global members list so new person appears as assignee option
    const mem = await membersApi.list();
    setMembers(mem);
  }, [fetchProjectMembers]);

  const removeProjectMember = useCallback(async (projectId: string, userId: string) => {
    await projectsApi.removeMember(projectId, userId);
    setProjectMembers((prev) => ({
      ...prev,
      [projectId]: (prev[projectId] || []).filter((m) => m.id !== userId),
    }));
  }, []);

  const isProjectAdmin = useCallback((projectId: string): boolean => {
    if (!user) return false;
    const pm = projectMembers[projectId];
    if (!pm) return false;
    const me = pm.find((m) => m.id === user.id);
    return me?.projectRole === 'admin';
  }, [projectMembers, user]);

  return (
    <AppContext.Provider value={{
      projects, tasks, members, projectMembers,
      selectedProjectId, isLoading, error,
      addTask, updateTask, deleteTask, moveTask, addProject,
      setSelectedProjectId, refetchTasks,
      fetchProjectMembers, addProjectMember, removeProjectMember, isProjectAdmin,
    }}>
      {children}
    </AppContext.Provider>
  );
};
