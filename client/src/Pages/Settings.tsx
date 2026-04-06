import AppSidebar from "../Components/AppSideBar";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors">
      <AppSidebar />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto w-full max-w-3xl">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors">Settings</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">Manage your account settings</p>
          </header>

          <div className="space-y-4">
            {/* Profile Card */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 transition-colors">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Profile</h2>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                  {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                  <span className="inline-flex mt-1 rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-gray-800 p-6 transition-colors">
              <h2 className="text-sm font-semibold text-red-600 dark:text-red-500 mb-4">Danger Zone</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Sign out</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">You will be redirected to the login page.</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
