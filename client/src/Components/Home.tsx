import { useState } from "react";
import KanbanBoard from "./KanbanBoard";
import { CheckCircle, Clock, ListTodo, AlertTriangle } from "lucide-react";
import { useAppState, type UITask } from "../Context/AppContext";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { EditTaskDialog } from "./EditTaskDialog";

const AnalyticsCard = ({ tasks }: { tasks: UITask[] }) => {
  const cards = [
    { title: "Total Tasks", value: tasks.length, icon: <ListTodo className="h-5 w-5 text-blue-600 dark:text-blue-400" />, bg: "bg-blue-100 dark:bg-blue-900/40" },
    { title: "In Progress", value: tasks.filter((t) => t.status === "In Progress").length, icon: <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />, bg: "bg-yellow-100 dark:bg-yellow-900/40" },
    { title: "Completed", value: tasks.filter((t) => t.status === "Done").length, icon: <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />, bg: "bg-green-100 dark:bg-green-900/40" },
    { title: "High Priority", value: tasks.filter((t) => t.priority === "High").length, icon: <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />, bg: "bg-red-100 dark:bg-red-900/40" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
      {cards.map((card) => (
        <div key={card.title} className="flex items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm transition-colors">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>{card.icon}</div>
          <div>
            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{card.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Export for Project.tsx
export { AnalyticsCard };

const Home = () => {
  const { tasks, members, projects, addTask, updateTask, deleteTask, moveTask, isLoading } = useAppState();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<UITask | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 text-sm">Loading tasks...</div>
      </div>
    );
  }

  const handleCreate = async (data: any) => {
    const project = projects.find((p) => p.name === data.project);
    const member = members.find((m) => m.name === data.assignee);
    await addTask({
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      projectId: project?.id || projects[0]?.id || "",
      assigneeId: member?.id || null,
      dueDate: data.dueDate || null,
    });
  };

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
    <div>
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setCreateOpen(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          + New Task
        </button>
      </div>

      <AnalyticsCard tasks={tasks} />

      <KanbanBoard
        tasks={tasks}
        onMoveTask={moveTask}
        onTaskClick={(t) => setEditTask(t)}
      />

      <CreateTaskDialog
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
        projects={projects.map((p) => p.name)}
        members={members.map((m) => m.name)}
      />

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

export default Home;
