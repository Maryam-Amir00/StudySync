import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
    fetchGroups,
    joinGroup,
    leaveGroup,
    updateGroup,
} from "../api/groupApi";
import { useAuth } from "../context/AuthContext";

const GroupsPage = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { user } = useAuth();

    // 🔹 FETCH GROUPS
    const { data, isLoading, error } = useQuery({
        queryKey: ["groups"],
        queryFn: fetchGroups,
        refetchOnMount: true,
    });

    // 🔹 JOIN
    const joinMutation = useMutation({
        mutationFn: joinGroup,
        onSuccess: () => queryClient.invalidateQueries(["groups"]),
    });

    // 🔹 LEAVE
    const leaveMutation = useMutation({
        mutationFn: leaveGroup,
        onSuccess: () => queryClient.invalidateQueries(["groups"]),
    });

    // 🔹 UPDATE (ONLY HERE ✅)
    const updateMutation = useMutation({
        mutationFn: updateGroup,
        onSuccess: () => {
            alert("Group updated ✅");
            queryClient.invalidateQueries(["groups"]);
        },
        onError: (err) => {
            console.log("UPDATE ERROR:", err.response?.data || err);
        },
    });

    // 🔹 EDIT HANDLER (NO HOOKS HERE ✅)
    const handleEdit = (group) => {
        const newName = prompt("Enter new group name", group.name);
        const newDesc = prompt("Enter new description", group.description);

        if (!newName || !newDesc) return;

        updateMutation.mutate({
            id: group.id,
            data: {
                name: newName,
                description: newDesc,
            },
        });
    };

    // 🔹 STATES
    if (isLoading) return <div className="text-[#6B7280]">Loading groups...</div>;
    if (error) return <div className="text-[#EF4444]">Error loading groups</div>;
    if (!user) return <div className="text-[#6B7280]">Loading user...</div>;

    // 🔹 USERNAME
    const rawUsername =
        user?.username ||
        user?.user?.username ||
        user?.data?.username ||
        "";

    const currentUsername = rawUsername.toLowerCase().trim();

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-[#111827]">All Groups</h1>
                <span className="rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-3 py-1 text-xs font-semibold text-[#8B5CF6]">
                    Discover communities
                </span>
            </div>

            {data?.results?.length === 0 && <p className="text-[#6B7280]">No groups found</p>}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {data?.results?.map((group) => {
                if (!group) return null;

                const members = Array.isArray(group.members)
                    ? group.members
                    : [];

                const isMember = members.some(
                    (m) =>
                        (m?.username || "").toLowerCase().trim() === currentUsername
                );

                const isAdmin =
                    (group?.admin || "").toLowerCase().trim() === currentUsername;

                return (
                    <article
                        key={group.id}
                        onClick={() =>
                            navigate({
                                to: "/groups/$groupId",
                                params: { groupId: group.id },
                            })
                        }
                        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-5 shadow-[0_10px_28px_rgba(17,24,39,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(79,70,229,0.16)]"
                    >
                        <div className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-[#EEF2FF] via-[#4F46E5] to-[#8B5CF6] opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
                        <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-[#EEF2FF] blur-2xl transition-all duration-300 group-hover:bg-[#DDD6FE]" />

                        <h3
                            className="cursor-pointer text-[#111827] font-semibold text-lg transition-colors duration-300 group-hover:text-[#4F46E5]"
                            onClick={() =>
                                navigate({
                                    to: "/groups/$groupId",
                                    params: { groupId: group.id },
                                })
                            }
                        >
                            {group.name}
                        </h3>

                        <p className="mt-2 text-sm text-[#374151] line-clamp-3">
                            {group.description || "No description provided."}
                        </p>

                        <div className="mt-4 space-y-1.5 text-xs text-[#6B7280]">
                            <p className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                                Creator: {group.admin || "N/A"}
                            </p>
                            <p>Created: {group.created_at ? new Date(group.created_at).toLocaleDateString() : "N/A"}</p>
                            <p>Members: {members.length}</p>
                        </div>

                        {!isMember && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    joinMutation.mutate(group.id);
                                }}
                                className="mt-5 rounded-xl bg-[#4F46E5] px-4 py-2 font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4338CA]"
                            >
                                Join
                            </button>
                        )}

                        {isMember && (
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        leaveMutation.mutate(group.id);
                                    }}
                                    className="mt-5 rounded-xl bg-[#EF4444] px-4 py-2 font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#DC2626]"
                                >
                                    Leave
                                </button>

                                {isAdmin && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(group);
                                        }}
                                        className="mt-5 rounded-xl bg-[#4F46E5] px-4 py-2 font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4338CA]"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                        )}
                    </article>
                );
            })}
            </div>
        </div>
    );
};

export default GroupsPage;