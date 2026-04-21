import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { fetchGroups } from "../api/groupApi";

const MyGroups = () => {
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["groups"],
    queryFn: fetchGroups,
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Something went wrong...</p>;
  if (!user) return <p>Loading user...</p>;

  const groupsArray = Array.isArray(data)
    ? data
    : data?.results || [];

  // 👑 Admin / Created groups
  const createdGroups = groupsArray.filter(
    (group) => group.admin === user.username
  );

  // 👥 Joined groups (excluding admin ones)
  const joinedGroups = groupsArray.filter(
    (group) =>
      group.members?.some(
        (m) => m.username === user.username
      ) &&
      group.admin !== user.username
  );

  return (
    <div>
      <h2>My Groups</h2>

      {/* 👑 Created */}
      <h3>Your Groups</h3>
      {createdGroups.length === 0 ? (
        <p>No groups created by you</p>
      ) : (
        createdGroups.map((group) => (
          <div key={group.id}>
            <p>{group.name}</p>
          </div>
        ))
      )}

      <hr style={{ margin: "20px 0" }} />

      {/* 👥 Joined */}
      <h3>Joined Groups</h3>
      {joinedGroups.length === 0 ? (
        <p>You have not joined any groups</p>
      ) : (
        joinedGroups.map((group) => (
          <div key={group.id}>
            <p>{group.name}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default MyGroups;