import { useState } from "react";
import AppSidebar from "../Components/AppSideBar";
import KanbanBoard from "../Components/KanbanBoard";
import { useAppState } from "../Context/AppContext";
import { useAuth } from "../Context/AuthContext";
import { EditTaskDialog } from "../Components/EditTaskDialog";
import type { UITask } from "../Context/AppContext";

const MyTasksPage = () => {
  const { user } = useAuth();
  const { tasks, members, projects, updateTask, deleteTask, moveTask, isLoading } = useAppState();
  const [editTask, setEditTask] = useState<UITask | null>(null);

  // Find current user's member entry by email
  const currentMember = members.find((m) => m.email === user?.email);
  const myTasks = currentMember
    ? tasks.filter((t) => t.assigneeId === currentMember.id)
    : [];

  const handleSave = async (data: any) => {
    if (!editTask) return;
    const project = projects.find((p) => p.name === data.project);
    const member = members.find((m) => m.name === data.assignee);
    await updateTask(editTask.id, {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      projectId: project?.id || editTask.projectId,
      assigneeId: member?.id || null,
      dueDate: data.dueDate || null,
    });
    setEditTask(null);
  };

  const handleDelete = async () => {
    if (!editTask) return;
    await deleteTask(editTask.id);
    setEditTask(null);
  };

  const taskToDialogData = (task: UITask) => ({
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    project: projects.find((p) => p.id === task.projectId)?.name || "",
    assignee: task.assignee?.name || "Unassigned",
    dueDate: task.dueDate || "",
  });

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors">
      <AppSidebar />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto w-full max-w-7xl">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors">My Tasks</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 transition-colors">Tasks assigned to you across all projects.</p>
          </header>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 transition-colors">
            {isLoading ? (
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">Loading tasks...</div>
            ) : (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing tasks assigned to{" "}
                  <span className="font-semibold">{user?.name || "you"}</span>.
                  {myTasks.length === 0 && !currentMember && (
                    <span className="ml-2 text-gray-400 dark:text-gray-500">(No matching member found — make sure your account email matches a workspace member)</span>
                  )}
                </p>
                <div className="mt-6">
                  {myTasks.length === 0 ? (
                    <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-12">No tasks assigned to you yet.</div>
                  ) : (
                    <KanbanBoard
                      tasks={myTasks}
                      onMoveTask={moveTask}
                      onTaskClick={(t) => setEditTask(t)}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <EditTaskDialog
        isOpen={!!editTask}
        onClose={() => setEditTask(null)}
        onSave={handleSave}
        onDelete={handleDelete}
        task={editTask ? taskToDialogData(editTask) : null}
        projects={projects.map((p) => p.name)}
        members={members.map((m) => m.name)}
      />
    </div>
  );
};

export default MyTasksPage;
