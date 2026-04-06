import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import AppSidebar from "../Components/AppSideBar";
import KanbanBoard from "../Components/KanbanBoard";
import { AnalyticsCard } from "../Components/Home";
import { useAppState, type UITask } from "../Context/AppContext";
import { EditTaskDialog } from "../Components/EditTaskDialog";
import { CreateTaskDialog } from "../Components/CreateTaskDialog";

const Project = () => {
  const { id } = useParams<{ id: string }>();
  const { projects, members, tasks: allTasks, updateTask, deleteTask, moveTask, addTask, isLoading } = useAppState();
  const [projectTasks, setProjectTasks] = useState<UITask[]>([]);
  const [editTask, setEditTask] = useState<UITask | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const project = projects.find((p) => p.id === id);

  // Filter tasks by project
  useEffect(() => {
    const filtered = allTasks.filter((t) => t.projectId === id);
    setProjectTasks(filtered);
  }, [allTasks, id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex bg-gray-50 items-center justify-center">
        <p className="text-gray-500 text-sm">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <AppSidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Project not found</p>
        </div>
      </div>
    );
  }

  const handleCreate = async (data: any) => {
    const member = members.find((m) => m.name === data.assignee);
    await addTask({
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      projectId: project.id,
      assigneeId: member?.id || null,
      dueDate: data.dueDate || null,
    });
  };

  const handleSave = async (data: any) => {
    if (!editTask) return;
    const member = members.find((m) => m.name === data.assignee);
    await updateTask(editTask.id, {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
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
    project: project.name,
    assignee: task.assignee?.name || "Unassigned",
    dueDate: task.dueDate || "",
  });

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AppSidebar />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto w-full max-w-7xl">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
              <p className="text-sm text-gray-600">Kanban Board</p>
            </div>
            <button
              onClick={() => setCreateOpen(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              + New Task
            </button>
          </header>

          <AnalyticsCard tasks={projectTasks} />
          <KanbanBoard
            tasks={projectTasks}
            onMoveTask={moveTask}
            onTaskClick={(t) => setEditTask(t)}
          />
        </div>
      </main>

      <CreateTaskDialog
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
        projects={[project.name]}
        members={members.map((m) => m.name)}
      />

      <EditTaskDialog
        isOpen={!!editTask}
        onClose={() => setEditTask(null)}
        onSave={handleSave}
        onDelete={handleDelete}
        task={editTask ? taskToDialogData(editTask) : null}
        projects={[project.name]}
        members={members.map((m) => m.name)}
      />
    </div>
  );
};

export default Project;
