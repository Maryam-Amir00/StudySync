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
    if (isLoading) return <div>Loading groups...</div>;
    if (error) return <div>Error loading groups</div>;
    if (!user) return <div>Loading user...</div>;

    // 🔹 USERNAME
    const rawUsername =
        user?.username ||
        user?.user?.username ||
        user?.data?.username ||
        "";

    const currentUsername = rawUsername.toLowerCase().trim();

    return (
        <div>
            <h1>All Groups</h1>

            {data?.results?.length === 0 && <p>No groups found</p>}

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
                    <div
                        key={group.id}
                        style={{
                            border: "1px solid gray",
                            margin: 10,
                            padding: 10,
                        }}
                    >
                        <h3
                            style={{ cursor: "pointer", color: "blue" }}
                            onClick={() =>
                                navigate({
                                    to: "/groups/$groupId",
                                    params: { groupId: group.id },
                                })
                            }
                        >
                            {group.name}
                        </h3>

                        <p>{group.description}</p>
                        <p>Admin: {group.admin}</p>
                        <p>Members: {members.length}</p>

                        {!isMember && (
                            <button onClick={() => joinMutation.mutate(group.id)}>
                                Join
                            </button>
                        )}

                        {isMember && (
                            <>
                                <button onClick={() => leaveMutation.mutate(group.id)}>
                                    Leave
                                </button>

                                {isAdmin && (
                                    <button onClick={() => handleEdit(group)}>
                                        Edit
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default GroupsPage;