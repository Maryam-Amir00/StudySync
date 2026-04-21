import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { fetchGroups } from "../api/groupApi";

const MyGroups = () => {
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["groups"],
    queryFn: fetchGroups,
  });

  if (isLoading) return <p className="text-[#6B7280]">Loading...</p>;
  if (isError) return <p className="text-[#EF4444]">Something went wrong...</p>;
  if (!user) return <p className="text-[#6B7280]">Loading user...</p>;

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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#111827] tracking-tight">My Groups</h2>

      {/* 👑 Created */}
      <div className="bg-white/90 backdrop-blur-sm border border-[#E5E7EB] rounded-xl shadow-sm p-5">
      <h3 className="text-lg font-semibold text-[#111827] mb-3">Your Groups</h3>
      {createdGroups.length === 0 ? (
        <p className="text-[#6B7280]">No groups created by you</p>
      ) : (
        createdGroups.map((group) => (
          <div key={group.id} className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 mb-2 last:mb-0">
            <p className="text-[#374151] font-medium">{group.name}</p>
          </div>
        ))
      )}
      </div>

      <hr className="border-[#E5E7EB]" />

      {/* 👥 Joined */}
      <div className="bg-white/90 backdrop-blur-sm border border-[#E5E7EB] rounded-xl shadow-sm p-5">
      <h3 className="text-lg font-semibold text-[#111827] mb-3">Joined Groups</h3>
      {joinedGroups.length === 0 ? (
        <p className="text-[#6B7280]">You have not joined any groups</p>
      ) : (
        joinedGroups.map((group) => (
          <div key={group.id} className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 mb-2 last:mb-0">
            <p className="text-[#374151] font-medium">{group.name}</p>
          </div>
        ))
      )}
      </div>
    </div>
  );
};

export default MyGroups;