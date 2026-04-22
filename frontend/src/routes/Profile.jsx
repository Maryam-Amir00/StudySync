import { useAuth } from "../context/useAuth";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchGroups } from "../api/groupApi";

const Profile = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const { data: groupsData } = useQuery({
    queryKey: ["groups"],
    queryFn: fetchGroups,
  });

  if (!user)
    return (
      <div className="flex items-center justify-center min-h-[100vh] bg-[#FDFDFF]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );

  const currentUsername = (user.username || "").toLowerCase().trim();

  const joinedGroupsCount =
    groupsData?.results?.filter(
      (group) =>
        Array.isArray(group.members) &&
        group.members.some(
          (m) =>
            (m?.username || "").toLowerCase().trim() === currentUsername
        )
    ).length || 0;

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.5, 
        ease: [0.16, 1, 0.3, 1] 
      },
    },
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden rounded-[3rem] bg-[#FDFDFF] px-4">
      {/* 🌌 Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-indigo-500/5 to-transparent rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ rotate: [360, 0], scale: [1.1, 1, 1.1] }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tr from-purple-500/5 to-transparent rounded-full blur-[100px]"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-lg space-y-12"
      >
        {/* 👤 Profile Section */}
        <div className="flex flex-col items-center text-center space-y-6">
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            className="relative group cursor-pointer"
          >
            <div className="absolute -inset-2 bg-indigo-500/5 rounded-[2.8rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />

            <div className="relative h-32 w-32 rounded-[2.5rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center justify-center text-4xl font-black text-slate-800 transition-all duration-500 group-hover:shadow-indigo-500/10">
              {(user.username || "U").slice(0, 1).toUpperCase()}
            </div>

            {/* Active Dot */}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-2xl bg-emerald-500 border-4 border-[#FDFDFF] shadow-lg"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              {user.username}
            </h1>
            <p className="text-sm text-slate-400">@{user.username}</p>
          </motion.div>
        </div>

        {/* 📊 Stats Card */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5 }}
          className="bg-white/50 backdrop-blur-3xl rounded-[2.5rem] border border-white/60 p-10 shadow-[0_40px_80px_rgba(0,0,0,0.03)]"
        >
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <motion.p
                whileHover={{ scale: 1.1, color: "#4F46E5" }}
                className="text-4xl font-black text-slate-900"
              >
                {joinedGroupsCount}
              </motion.p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Communities Joined
              </p>
            </div>

            <div className="w-full border-t border-slate-100 pt-6 flex justify-between text-sm">
              <span className="text-slate-400">Digital ID</span>
              <span className="font-semibold text-slate-700">
                @{user.username}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 🔥 TERMINATE SESSION BUTTON */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            className="relative group overflow-hidden rounded-2xl px-8 py-3 font-semibold text-sm tracking-wide text-white bg-gradient-to-r from-rose-500 to-pink-500 shadow-lg transition-all duration-300"
          >
            {/* Glow Effect */}
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 blur-xl bg-rose-400/40"></span>

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
              Terminate Session
            </span>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;