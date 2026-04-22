import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const Profile = () => {
  const { user, logout } = useAuth();

  if (!user) return (
    <div className="flex items-center justify-center min-h-100">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]"></div>
    </div>
  );

  const container = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-8 pb-10"
    >
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#4F46E5] to-[#8B5CF6] p-8 text-white shadow-lg">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-3xl font-bold shadow-xl">
            {(user.username || "U").slice(0, 2).toUpperCase()}
          </div>
          <div className="text-center md:text-left space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{user.username}</h1>
            <p className="text-white/80 font-medium">{user.email}</p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm border border-white/10">
                Active Student
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm border border-white/10">
                StudySync Pro
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Details */}
        <motion.div variants={item} className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#111827] mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account Information
            </h3>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-[#F3F4F6]">
                <span className="text-sm font-medium text-[#6B7280]">Full Name</span>
                <span className="text-sm font-semibold text-[#111827]">{user.first_name || "Not provided"} {user.last_name || ""}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-[#F3F4F6]">
                <span className="text-sm font-medium text-[#6B7280]">Username</span>
                <span className="text-sm font-semibold text-[#111827]">{user.username}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-[#F3F4F6]">
                <span className="text-sm font-medium text-[#6B7280]">Email Address</span>
                <span className="text-sm font-semibold text-[#111827]">{user.email}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3">
                <span className="text-sm font-medium text-[#6B7280]">Joined Date</span>
                <span className="text-sm font-semibold text-[#111827]">April 2026</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-6 text-center border-dashed">
            <p className="text-sm text-[#6B7280]">More account settings coming soon...</p>
          </div>
        </motion.div>

        {/* Sidebar/Actions */}
        <motion.div variants={item} className="space-y-6">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#111827] mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-medium text-[#374151] transition-all hover:bg-[#F9FAFB] hover:border-[#4F46E5] group">
                <svg className="w-5 h-5 text-[#6B7280] group-hover:text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-[#EF4444] transition-all hover:bg-[#FEE2E2]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-linear-to-br from-[#111827] to-[#374151] p-6 text-white shadow-lg">
            <h4 className="font-bold mb-2">StudySync Tip</h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Active participation in study groups increases retention by up to 40%. Join a new group today!
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;