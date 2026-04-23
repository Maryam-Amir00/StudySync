import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/useAuth";
import { fetchGroups, joinGroup, leaveGroup, updateGroup } from "../api/groupApi";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useSearch } from "../context/SearchContext";
import { motion as _motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { createPortal } from "react-dom";

const MyGroups = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const searchContext = useSearch();
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const searchQuery = searchContext?.searchQuery ?? "";

  // 🔹 DEBOUNCE SEARCH
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["groups", debouncedSearch],
    queryFn: () => fetchGroups(debouncedSearch),
  });

  const joinMutation = useMutation({
    mutationFn: joinGroup,
    onMutate: async (groupId) => {
      await queryClient.cancelQueries({ queryKey: ["groups"] });
      const previousGroups = queryClient.getQueryData(["groups"]);

      queryClient.setQueryData(["groups"], (old) => {
        if (!old || !old.results) return old;
        return {
          ...old,
          results: old.results.map((group) => {
            if (group.id === groupId) {
              return {
                ...group,
                members: [...(group.members || []), { username: user?.username }],
              };
            }
            return group;
          }),
        };
      });

      return { previousGroups };
    },
    onError: (err, groupId, context) => {
      queryClient.setQueryData(["groups"], context.previousGroups);
      toast.error("Failed to join group");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onSuccess: () => {
      toast.success("Joined group successfully");
    },
  });

  const leaveMutation = useMutation({
    mutationFn: leaveGroup,
    onMutate: async (groupId) => {
      await queryClient.cancelQueries({ queryKey: ["groups"] });
      const previousGroups = queryClient.getQueryData(["groups"]);

      queryClient.setQueryData(["groups"], (old) => {
        if (!old || !old.results) return old;
        const currentUsername = (user?.username || "").toLowerCase().trim();
        return {
          ...old,
          results: old.results.map((group) => {
            if (group.id === groupId) {
              return {
                ...group,
                members: (group.members || []).filter(
                  (m) => (m?.username || "").toLowerCase().trim() !== currentUsername
                ),
              };
            }
            return group;
          }),
        };
      });

      return { previousGroups };
    },
    onError: (err, groupId, context) => {
      queryClient.setQueryData(["groups"], context.previousGroups);
      toast.error("Failed to leave group");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onSuccess: () => {
      toast.success("Left group");
    },
  });

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

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-100">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]"></div>
    </div>
  );
  if (isError) return <div className="text-[#EF4444] p-4 text-center bg-red-50 rounded-xl border border-red-100">Something went wrong while loading your groups.</div>;
  if (!user) return <div className="text-[#6B7280] text-center p-10">Loading user profile...</div>;

  const groupsArray = Array.isArray(data)
    ? data
    : data?.results || [];

  const rawUsername = user?.username || "";
  const currentUsername = rawUsername.toLowerCase().trim();

  // 👑 Admin / Created groups
  const createdGroups = groupsArray.filter(
    (group) => (group.admin || "").toLowerCase().trim() === currentUsername
  );

  // 👥 Joined groups (excluding admin ones)
  const joinedGroups = groupsArray.filter(
    (group) =>
      group.members?.some(
        (m) => (m.username || "").toLowerCase().trim() === currentUsername
      ) &&
      (group.admin || "").toLowerCase().trim() !== currentUsername
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.05,
        ease: "easeOut"
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20, scale: 0.94 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] // Premium out-expo ease
      }
    }
  };

  const GroupCard = ({ group }) => {
    if (!group) return null;

    const members = Array.isArray(group.members) ? group.members : [];
    const isMember = members.some((m) => (m?.username || "").toLowerCase().trim() === currentUsername);
    const isAdmin = (group?.admin || "").toLowerCase().trim() === currentUsername;

    return (
      <_motion.article
        variants={item}
        whileHover={{ 
          y: -8,
          scale: 1.015,
          boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.12)",
          transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
        }}
        whileTap={{ scale: 0.98 }}
        onClick={() =>
          navigate({
            to: "/groups/$groupId",
            params: { groupId: group.id },
          })
        }
        className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm cursor-pointer"
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
            {group.created_at ? new Date(group.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}
          </div>
        </div>

        <div className="mt-6">
          {!isMember ? (
            <_motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation();
                joinMutation.mutate(group.id);
              }}
              className="w-full rounded-lg bg-indigo-600 py-2 text-xs font-bold text-white transition-all hover:bg-indigo-700"
            >
              Join Group
            </_motion.button>
          ) : (
            <div className="flex w-full gap-2">
              <_motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                  leaveMutation.mutate(group.id);
                }}
                className="flex-1 rounded-lg border border-red-100 bg-red-50 py-2 text-[10px] font-bold text-red-600 transition-all hover:bg-red-100"
              >
                Leave
              </_motion.button>

              {isAdmin && (
                <_motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(group);
                  }}
                  className="flex-1 rounded-lg bg-gray-900 py-2 text-[10px] font-bold text-white transition-all hover:bg-gray-800"
                >
                  Edit
                </_motion.button>
              )}
            </div>
          )}
        </div>
      </_motion.article>
    );
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-[#111827] tracking-tight">My Groups</h2>
        <span className="rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-3 py-1 text-xs font-semibold text-[#8B5CF6]">
          {createdGroups.length + joinedGroups.length} total
        </span>
      </div>

      {/* 👑 Created */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#4F46E5] uppercase tracking-wider">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
          </svg>
          Managed by You
        </div>
        {createdGroups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] p-8 text-center text-[#6B7280]">
            You haven&apos;t created any groups yet.
          </div>
        ) : (
          <_motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {createdGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </_motion.div>
        )}
      </section>

      {/* 👥 Joined */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#6B7280] uppercase tracking-wider">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Joined Communities
        </div>
        {joinedGroups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] p-8 text-center text-[#6B7280]">
            You haven&apos;t joined any groups yet.
          </div>
        ) : (
          <_motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {joinedGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </_motion.div>
        )}
      </section>

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

export default MyGroups;