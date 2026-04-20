import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { fetchGroups, joinGroup, leaveGroup } from "../api/groupApi";



const GroupsPage = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ["groups"],
        queryFn: fetchGroups,
        refetchOnMount: true,
    });


    const joinMutation = useMutation({
        mutationFn: joinGroup,
        onSuccess: () => {
            queryClient.invalidateQueries(["groups"]);
        },
    });


    const leaveMutation = useMutation({
        mutationFn: leaveGroup,
        onSuccess: () => {
            queryClient.invalidateQueries(["groups"]);
        },
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            <h1>All Groups</h1>

            {data.results.map((group) => {
                const isMember = group.members.some(
                    (m) => m.username === "YOUR_LOGGED_IN_USERNAME"
                );

                return (
                    <div key={group.id} style={{ border: "1px solid gray", margin: 10 }}>
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

                        <p>Members: {group.members.length}</p>

                        {isMember ? (
                            <button onClick={() => leaveMutation.mutate(group.id)}>
                                Leave
                            </button>
                        ) : (
                            <button onClick={() => joinMutation.mutate(group.id)}>
                                Join
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default GroupsPage;