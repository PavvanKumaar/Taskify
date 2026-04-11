import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2, Crown, User, ChevronDown, X } from 'lucide-react';
import AppSidebar from '../Components/AppSideBar';
import { useAppState } from '../Context/AppContext';
import { useAuth } from '../Context/AuthContext';
import type { ApiProjectMember } from '../api/projects';

const Members = () => {
  const { user } = useAuth();
  const {
    projects,
    projectMembers,
    fetchProjectMembers,
    addProjectMember,
    removeProjectMember,
    isProjectAdmin,
    isLoading,
  } = useAppState();

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    searchParams.get('project') || projects[0]?.id || ''
  );
  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState<'admin' | 'member'>('member');
  const [addOpen, setAddOpen] = useState(false);
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState<string | null>(null);

  // Set default selected project once projects load
  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Fetch members whenever selected project changes
  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectMembers(selectedProjectId);
      setSearchParams({ project: selectedProjectId });
    }
  }, [selectedProjectId, fetchProjectMembers, setSearchParams]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const members: ApiProjectMember[] = projectMembers[selectedProjectId] || [];
  const amAdmin = isProjectAdmin(selectedProjectId);

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const handleAdd = async () => {
    if (!addEmail.trim()) return;
    setAddError('');
    setAddLoading(true);
    try {
      await addProjectMember(selectedProjectId, addEmail.trim(), addRole);
      setAddEmail('');
      setAddOpen(false);
    } catch (e: any) {
      setAddError(e.message || 'Failed to add member');
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemove = async (userId: string) => {
    setRemoveLoading(userId);
    try {
      await removeProjectMember(selectedProjectId, userId);
    } catch (e: any) {
      alert(e.message || 'Failed to remove member');
    } finally {
      setRemoveLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors">
      <AppSidebar />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto w-full max-w-3xl">

          {/* Header */}
          <header className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Project Members
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Manage who has access to each project
              </p>
            </div>

            {amAdmin && (
              <button
                onClick={() => { setAddOpen(true); setAddError(''); }}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Add Member
              </button>
            )}
          </header>

          {/* Project selector */}
          {projects.length > 1 && (
            <div className="mb-5 flex items-center gap-2 flex-wrap">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    p.id === selectedProjectId
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}

          {projects.length === 0 && !isLoading && (
            <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center text-gray-500 dark:text-gray-400">
              You have no projects yet. Create one from the sidebar.
            </div>
          )}

          {selectedProject && (
            <>
              {/* Add member panel */}
              <AnimatePresence>
                {addOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                        Add member to <span className="italic">{selectedProject.name}</span>
                      </p>
                      <button onClick={() => setAddOpen(false)}>
                        <X className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <input
                        type="email"
                        placeholder="user@email.com"
                        value={addEmail}
                        onChange={(e) => setAddEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        className="flex-1 min-w-[200px] rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
                        autoFocus
                      />
                      <div className="relative">
                        <select
                          value={addRole}
                          onChange={(e) => setAddRole(e.target.value as 'admin' | 'member')}
                          className="appearance-none rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 pr-8 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                      <button
                        onClick={handleAdd}
                        disabled={addLoading || !addEmail.trim()}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {addLoading ? 'Adding…' : 'Add'}
                      </button>
                    </div>
                    {addError && (
                      <p className="mt-2 text-xs text-red-600 dark:text-red-400">{addError}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Members list */}
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-5 py-3">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {selectedProject.name}
                  </p>
                  <span className="rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                    {members.length} {members.length === 1 ? 'member' : 'members'}
                  </span>
                </div>

                {members.length === 0 ? (
                  <div className="px-6 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                    No members loaded yet.
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {members.map((member) => {
                      const isMe = member.id === user?.id;
                      const isOnlyAdmin =
                        member.projectRole === 'admin' &&
                        members.filter((m) => m.projectRole === 'admin').length === 1;

                      return (
                        <motion.div
                          key={member.id}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18 }}
                          className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-700 px-5 py-4 last:border-0"
                        >
                          {/* Avatar */}
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shrink-0">
                            {getInitials(member.name)}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {member.name}
                              </p>
                              {isMe && (
                                <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {member.email}
                            </p>
                          </div>

                          {/* Project role badge */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {member.projectRole === 'admin' ? (
                              <Crown className="h-3.5 w-3.5 text-yellow-500" />
                            ) : (
                              <User className="h-3.5 w-3.5 text-gray-400" />
                            )}
                            <span className={`text-xs font-medium capitalize ${
                              member.projectRole === 'admin'
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {member.projectRole}
                            </span>
                          </div>

                          {/* Remove button — admins only, can't remove last admin */}
                          {amAdmin && !isOnlyAdmin && (
                            <button
                              onClick={() => handleRemove(member.id)}
                              disabled={removeLoading === member.id}
                              className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-40 transition-colors"
                              title="Remove from project"
                            >
                              {removeLoading === member.id ? (
                                <span className="text-xs">…</span>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Members;
