import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  if (!user) return <p className="text-[#6B7280]">Loading user...</p>;

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-[#111827] tracking-tight">My Profile</h2>

      <div className="bg-white/90 backdrop-blur-sm border border-[#E5E7EB] rounded-xl shadow-sm p-5 space-y-2">
        <p className="text-[#374151]"><strong className="text-[#111827]">Username:</strong> {user.username}</p>
        <p className="text-[#374151]"><strong className="text-[#111827]">Email:</strong> {user.email}</p>
      </div>
    </div>
  );
};

export default Profile;