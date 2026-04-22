import { useState } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "react-hot-toast";
import { motion as _motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import {
    fetchGroups,
    joinGroup,
    leaveGroup,
    updateGroup,
} from "../api/groupApi";
import { useAuth } from "../context/useAuth";
import { useSearch } from "../context/SearchContext";

const GroupsPage = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // 🔹 SEARCH FROM CONTEXT OR LOCAL
    const searchContext = useSearch();
    const [localSearch, setLocalSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const searchQuery = searchContext ? searchContext.searchQuery : localSearch;

    // 🔹 DEBOUNCE SEARCH
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // 🔹 FETCH GROUPS
    const { data, isLoading, error } = useQuery({
        queryKey: ["groups", debouncedSearch],
        queryFn: () => fetchGroups(debouncedSearch),
        refetchOnMount: true,
    });

    // 🔹 JOIN
    const joinMutation = useMutation({
        mutationFn: joinGroup,
        onSuccess: () => {
            toast.success("Joined group successfully");
            queryClient.invalidateQueries(["groups"]);
        },
    });

    // 🔹 LEAVE
    const leaveMutation = useMutation({
        mutationFn: leaveGroup,
        onSuccess: () => {
            toast.success("Left group");
            queryClient.invalidateQueries(["groups"]);
        },
    });

    // 🔹 UPDATE
    const updateMutation = useMutation({
        mutationFn: updateGroup,
        onSuccess: () => {
            toast.success("Group updated");
            queryClient.invalidateQueries(["groups"]);
        },
        onError: (err) => {
            console.log("UPDATE ERROR:", err.response?.data || err);
            toast.error("Error updating group");
        },
    });

    const [editingGroup, setEditingGroup] = useState(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");

    const openEditModal = (group) => {
      setEditingGroup(group);
      setEditName(group?.name || "");
      setEditDescription(group?.description || "");
    };

    const closeEditModal = () => {
      setEditingGroup(null);
      setEditName("");
      setEditDescription("");
    };

    const handleSaveEdit = () => {
      const trimmedName = editName.trim();
      const trimmedDescription = editDescription.trim();

      if (!editingGroup) return;
      if (!trimmedName || !trimmedDescription) {
        toast.error("Group name and description are required");
        return;
      }

      updateMutation.mutate(
        {
          id: editingGroup.id,
          data: { name: trimmedName, description: trimmedDescription },
        },
        {
          onSuccess: () => closeEditModal(),
        }
      );
    };

    // 🔹 STATES
    if (isLoading) return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#EEF2FF] border-t-[#4F46E5]" />
        <p className="text-sm font-bold text-[#6B7280] animate-pulse">Syncing communities...</p>
      </div>
    );

    if (error) return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#FEE2E2] bg-[#FEF2F2]/50 p-12 text-center">
        <div className="mb-4 rounded-full bg-[#EF4444] p-3 text-white">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-[#991B1B]">Data Sync Failed</h3>
        <p className="mt-2 text-sm text-[#EF4444]">We couldn&apos;t load the groups. Please check your connection.</p>
      </div>
    );

    const rawUsername = user?.username || "";
    const currentUsername = rawUsername.toLowerCase().trim();

    const container = {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1
        }
      }
    };

    const item = {
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="space-y-0.5">
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">Communities</h1>
                  <p className="text-sm font-medium text-gray-500">Discover and join study groups that match your interests.</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Only show local search if not in dashboard context */}
                    {!searchContext && (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search communities..."
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                className="w-64 rounded-xl border border-gray-200 bg-white px-4 py-2 pl-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                            />
                            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    )}
                    <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5 shadow-sm">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                            {data?.results?.length || 0} Groups
                        </span>
                    </div>
                </div>
            </div>

            {data?.results?.length === 0 && (
               <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-100 rounded-xl">
                 <h3 className="text-lg font-bold text-gray-900">No communities found</h3>
                 <p className="mt-1 text-sm text-gray-500">Be the first to start a conversation!</p>
               </div>
            )}

            <_motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
            {data?.results?.map((group) => {
                if (!group) return null;

                const members = Array.isArray(group.members) ? group.members : [];
                const isMember = members.some((m) => (m?.username || "").toLowerCase().trim() === currentUsername);
                const isAdmin = (group?.admin || "").toLowerCase().trim() === currentUsername;

                return (
                    <_motion.article
                        key={group.id}
                        variants={item}
                        onClick={() => navigate({ to: "/groups/$groupId", params: { groupId: group.id } })}
                        className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white p-6 transition-all duration-200 hover:border-indigo-100 hover:shadow-md cursor-pointer"
                    >
                        <div className="mb-4 flex justify-between items-start">
                          <div className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isMember ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`}>
                            {isMember ? 'Joined' : 'Community'}
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-indigo-600">
                            {group.name}
                        </h3>

                        <p className="mt-2 text-sm leading-relaxed text-gray-500 line-clamp-2 flex-1">
                            {group.description || "No description provided."}
                        </p>

                        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-gray-50 pt-4">
                            <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                {members.length}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {group.created_at ? new Date(group.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : "N/A"}
                            </div>
                        </div>

                        <div className="mt-6">
                          {!isMember ? (
                              <button
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      joinMutation.mutate(group.id);
                                  }}
                                  className="w-full rounded-lg bg-indigo-600 py-2 text-xs font-bold text-white transition-all hover:bg-indigo-700 active:scale-95"
                              >
                                Join Group
                              </button>
                          ) : (
                              <div className="flex w-full gap-2">
                                  <button
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          leaveMutation.mutate(group.id);
                                      }}
                                      className="flex-1 rounded-lg border border-red-100 bg-red-50 py-2 text-[10px] font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95"
                                  >
                                      Leave
                                  </button>

                                  {isAdmin && (
                                      <button
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              openEditModal(group);
                                          }}
                                          className="flex-1 rounded-lg bg-gray-900 py-2 text-[10px] font-bold text-white transition-all hover:bg-gray-800 active:scale-95"
                                      >
                                          Settings
                                      </button>
                                  )}
                              </div>
                          )}
                        </div>
                    </_motion.article>
                );
            })}
            </_motion.div>
            {typeof document !== "undefined" &&
              createPortal(
                <AnimatePresence>
                  {editingGroup && (
                    <>
                      <_motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeEditModal}
                        className="fixed left-0 top-0 z-9998 h-dvh w-dvw bg-black/30 backdrop-blur-[2px]"
                      />
                      <_motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        className="fixed left-1/2 top-1/2 z-9999 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-2xl"
                      >
                        <div className="mb-4 space-y-1">
                          <h3 className="text-base font-bold text-[#111827]">Edit Group</h3>
                          <p className="text-xs text-[#6B7280]">Update community details for everyone.</p>
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#4F46E5]">Group Name</label>
                            <input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="e.g. Advanced Calculus"
                              className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#EEF2FF]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#4F46E5]">Description</label>
                            <textarea
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              placeholder="What is this group about?"
                              rows={3}
                              className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#EEF2FF]"
                            />
                          </div>
                        </div>

                        <div className="mt-5 flex justify-end gap-2">
                          <button
                            onClick={closeEditModal}
                            className="rounded-xl px-4 py-2 text-xs font-bold text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827]"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            disabled={updateMutation.isPending}
                            className="rounded-xl bg-[#4F46E5] px-5 py-2 text-xs font-bold text-white shadow-md shadow-[#4F46E5]/20 transition-all hover:bg-[#4338CA] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {updateMutation.isPending ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      </_motion.div>
                    </>
                  )}
                </AnimatePresence>,
                document.body
              )}
        </div>
    );
};

export default GroupsPage;