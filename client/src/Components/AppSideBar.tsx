import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Settings, Users, FolderKanban, ChevronDown, Plus, CheckSquare, LogOut } from "lucide-react";
import { useAppState } from "../Context/AppContext";
import { useAuth } from "../Context/AuthContext";
import { useState } from "react";
import { CreateTaskDialog } from "./CreateTaskDialog";

const cls = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(" ");

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { projects, members, addProject, addTask } = useAppState();
  const { user, logout } = useAuth();
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: CheckSquare, label: "My Tasks", path: "/my-tasks" },
    { icon: Users, label: "Members", path: "/members" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleAddProject = async () => {
    if (!newProjectName.trim()) return;
    await addProject({ name: newProjectName.trim() });
    setNewProjectName("");
    setCreateProjectOpen(false);
  };

  const handleCreateTask = async (data: any) => {
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

  return (
    <aside className="flex h-screen w-[280px] flex-col border-r border-gray-200 bg-white sticky top-0">
      {/* Workspace Header */}
      <div className="flex h-14 items-center gap-3 px-4 border-b border-gray-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white text-sm font-semibold">
          T
        </div>
        <span className="text-sm font-semibold text-gray-900">Taskify</span>
        <ChevronDown className="ml-auto h-4 w-4 text-gray-500" />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-2 py-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link key={item.path} to={item.path}
              className={cls(
                "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                active ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}>
              <item.icon className="h-[18px] w-[18px] stroke-[2]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 my-1 h-px bg-gray-200" />

      {/* New Task Button */}
      <div className="px-3 py-2">
        <button
          onClick={() => setCreateTaskOpen(true)}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Task
        </button>
      </div>

      <div className="mx-3 my-1 h-px bg-gray-200" />

      {/* Projects */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Projects</span>
          <button onClick={() => setCreateProjectOpen(!createProjectOpen)}
            className="rounded p-1 hover:bg-gray-100 transition-colors">
            <Plus className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {createProjectOpen && (
          <div className="px-3 pb-2 flex gap-2">
            <input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddProject()}
              placeholder="Project name..."
              className="flex-1 rounded-lg border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <button onClick={handleAddProject}
              className="rounded-lg bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 transition-colors">
              Add
            </button>
          </div>
        )}

        <div className="flex flex-col gap-0.5 px-2 overflow-y-auto flex-1">
          {projects.map((project) => {
            const active = location.pathname === `/projects/${project.id}`;
            return (
              <Link key={project.id} to={`/projects/${project.id}`}
                className={cls(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                  active ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}>
                <FolderKanban className="h-[18px] w-[18px] stroke-[2]" />
                <span className="truncate">{project.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* User Footer */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
            {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-[10px] text-gray-500 truncate">{user?.role}</p>
          </div>
          <button onClick={() => { logout(); navigate("/login"); }}
            className="rounded p-1 hover:bg-gray-100 transition-colors" title="Sign out">
            <LogOut className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      <CreateTaskDialog
        isOpen={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        onCreate={handleCreateTask}
        projects={projects.map((p) => p.name)}
        members={members.map((m) => m.name)}
      />
    </aside>
  );
};

export default AppSidebar;
