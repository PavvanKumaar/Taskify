import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import AppSidebar from '../Components/AppSideBar';
import KanbanBoard from '../Components/KanbanBoard';
import { AnalyticsCard } from '../Components/Home';
import { useAppState, type UITask } from '../Context/AppContext';
import { EditTaskDialog } from '../Components/EditTaskDialog';
import { CreateTaskDialog } from '../Components/CreateTaskDialog';

const Project = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    projects, tasks: allTasks,
    projectMembers, fetchProjectMembers,
    updateTask, deleteTask, moveTask, addTask, isLoading,
  } = useAppState();

  const [projectTasks, setProjectTasks] = useState<UITask[]>([]);
  const [editTask, setEditTask] = useState<UITask | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const project = projects.find((p) => p.id === id);
  const members = (id && projectMembers[id]) || [];

  // Fetch project members when project loads
  useEffect(() => {
    if (id) fetchProjectMembers(id);
  }, [id, fetchProjectMembers]);

  // Filter tasks by project
  useEffect(() => {
    setProjectTasks(allTasks.filter((t) => t.projectId === id));
  }, [allTasks, id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
        <AppSidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">Project not found</p>
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
    assignee: task.assignee?.name || 'Unassigned',
    dueDate: task.dueDate || '',
  });

  const memberNames = members.map((m) => m.name);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors">
      <AppSidebar />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto w-full max-w-7xl">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{project.name}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Kanban Board</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Members shortcut */}
              <button
                onClick={() => navigate(`/members?project=${project.id}`)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>{members.length} {members.length === 1 ? 'member' : 'members'}</span>
              </button>
              <button
                onClick={() => setCreateOpen(true)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                + New Task
              </button>
            </div>
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
        members={memberNames}
      />

      <EditTaskDialog
        isOpen={!!editTask}
        onClose={() => setEditTask(null)}
        onSave={handleSave}
        onDelete={handleDelete}
        task={editTask ? taskToDialogData(editTask) : null}
        projects={[project.name]}
        members={memberNames}
      />
    </div>
  );
};

export default Project;
