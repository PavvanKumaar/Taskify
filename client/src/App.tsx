import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./Context/AuthContext";
import { AppProvider } from "./Context/AppContext";
import { ThemeProvider } from "./Context/ThemeContext";
import { AnimatePresence, motion } from "framer-motion";
import Index from "./Pages/Index";
import MyTasksPage from "./Pages/MyTasksPage";
import NotFound from "./Pages/NotFound";
import Members from "./Pages/Members";
import Project from "./Pages/Project";
import Settings from "./Pages/Settings";
import Login from "./Pages/Login";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="text-gray-500 dark:text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="h-full"
  >
    {children}
  </motion.div>
);

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <PageWrapper><Login /></PageWrapper>} />
        <Route path="/" element={<ProtectedRoute><PageWrapper><Index /></PageWrapper></ProtectedRoute>} />
        <Route path="/my-tasks" element={<ProtectedRoute><PageWrapper><MyTasksPage /></PageWrapper></ProtectedRoute>} />
        <Route path="/members" element={<ProtectedRoute><PageWrapper><Members /></PageWrapper></ProtectedRoute>} />
        <Route path="/projects/:id" element={<ProtectedRoute><PageWrapper><Project /></PageWrapper></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><PageWrapper><Settings /></PageWrapper></ProtectedRoute>} />
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <div className="min-h-screen text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 transition-colors duration-300">
              <AppRoutes />
            </div>
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
