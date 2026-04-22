import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { fetchGroups } from "../api/groupApi";
import { useNavigate } from "@tanstack/react-router";

const MyGroups = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["groups"],
    queryFn: fetchGroups,
  });

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

  const GroupCard = ({ group }) => (
    <article
      onClick={() =>
        navigate({
          to: "/groups/$groupId",
          params: { groupId: group.id },
        })
      }
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-5 shadow-[0_10px_28px_rgba(17,24,39,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(79,70,229,0.16)] cursor-pointer"
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-[#EEF2FF] via-[#4F46E5] to-[#8B5CF6] opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
      
      <h3 className="text-[#111827] font-semibold text-lg transition-colors duration-300 group-hover:text-[#4F46E5]">
        {group.name}
      </h3>

      <p className="mt-2 text-sm text-[#374151] line-clamp-2 flex-1">
        {group.description || "No description provided."}
      </p>

      <div className="mt-4 flex items-center justify-between text-xs text-[#6B7280]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#10B981]" />
          <span>{group.members?.length || 0} members</span>
        </div>
        <span>{group.created_at ? new Date(group.created_at).toLocaleDateString() : ""}</span>
      </div>
    </article>
  );

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
            You haven't created any groups yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {createdGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
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
            You haven't joined any groups yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {joinedGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MyGroups;