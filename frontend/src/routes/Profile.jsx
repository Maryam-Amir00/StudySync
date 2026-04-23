import { useAuth } from "../context/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { fetchGroups } from "../api/groupApi";
import { fetchPosts } from "../api/postApi";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,  Sector
} from "recharts";
import { 
  Users, BookOpen, PenTool, TrendingUp, 
  Calendar, Clock, ShieldCheck, LogOut 
} from "lucide-react";

const Profile = () => {
  const { user, logout } = useAuth();
  const [activePieIndex, setActivePieIndex] = useState(0);
  const [isPieAnimating, setIsPieAnimating] = useState(true);

  const onPieEnter = useCallback((_, index) => {
    setActivePieIndex(index);
    setIsPieAnimating(false);
  }, []);

  const renderActiveShape = useCallback((props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 12}
          outerRadius={outerRadius + 14}
          fill={fill}
          opacity={0.3}
        />
      </g>
    );
  }, []);

  const handleLogout = () => {
    logout();
  };

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: () => fetchGroups(),
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => fetchPosts(),
  });

  if (!user || groupsLoading || postsLoading)
    return (
      <div className="flex items-center justify-center min-h-[100vh] bg-[#FDFDFF]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );

  const currentUsername = (user.username || "").toLowerCase().trim();
  const allGroups = groupsData?.results || [];
  const allPosts = postsData?.results || [];

  const joinedGroups = allGroups.filter(
    (group) =>
      Array.isArray(group.members) &&
      group.members.some(
        (m) => (m?.username || "").toLowerCase().trim() === currentUsername
      )
  );

  const ownedGroups = allGroups.filter(
    (group) => (group?.admin || "").toLowerCase().trim() === currentUsername
  );

  const myPosts = allPosts.filter(
    (post) => (post.author || "").toLowerCase().trim() === currentUsername
  );

  const activities = [
    ...myPosts.map(p => ({
      type: "post",
      title: p.title,
      time: p.created_at,
      group: allGroups.find(g => g.id === p.group)?.name || "Unknown Group"
    })),
    ...ownedGroups.map(g => ({
      type: "group_created",
      title: g.name,
      time: g.created_at
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

  const postsPerGroup = joinedGroups.map(group => ({
    name: group.name,
    value: myPosts.filter(p => p.group === group.id).length
  })).filter(item => item.value > 0);

  const COLORS = ["#4F46E5", "#818CF8", "#C7D2FE", "#6366F1", "#4338CA"];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8FAFC] p-4 lg:p-8">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ 
            x: [0, 150, 0], 
            y: [0, 100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/4 -left-1/4 w-[80%] h-[80%] bg-indigo-500/10 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{ 
            x: [0, -120, 0], 
            y: [0, 150, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-1/4 -right-1/4 w-[70%] h-[70%] bg-purple-500/10 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [0.8, 1, 0.8],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-400/5 rounded-full blur-[160px]"
        />
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='0.5'/%3E%3C/g%3E%3C/svg%3E")` }} 
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-7xl space-y-10"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <motion.div variants={itemVariants} className="flex items-center gap-8">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-500" />
              <div className="relative h-24 w-24 rounded-[1.8rem] bg-white/80 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-white/60 flex items-center justify-center text-4xl font-black text-indigo-600">
                {(user.username || "U").slice(0, 1).toUpperCase()}
              </div>
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-emerald-500 border-4 border-white shadow-lg" 
              />
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                {user.username}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold text-xs">@{user.username.toLowerCase()}</span>
              </div>
            </div>
          </motion.div>

          <motion.button
            variants={itemVariants}
            onClick={handleLogout}
            whileHover={{ scale: 1.02, backgroundColor: '#FFF1F2' }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-rose-100 text-rose-500 font-bold text-sm shadow-[0_4px_12px_rgba(244,63,94,0.08)] hover:text-rose-600 transition-all"
          >
            <LogOut size={18} />
            End Session
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "Communities", value: joinedGroups.length, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50/50", border: "border-indigo-100/50" },
            { label: "Administered", value: ownedGroups.length, icon: ShieldCheck, color: "text-purple-600", bg: "bg-purple-50/50", border: "border-purple-100/50" },
            { label: "Publications", value: myPosts.length, icon: PenTool, color: "text-emerald-600", bg: "bg-emerald-50/50", border: "border-emerald-100/50" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.02)] border ${stat.border} relative overflow-hidden group`}
            >
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              
              <div className="flex items-center justify-between mb-6">
                <div className={`${stat.bg} p-4 rounded-[1.4rem] border border-white/80`}>
                  <stat.icon className={stat.color} size={28} />
                </div>
                <div className="h-10 w-10 rounded-full border border-slate-100 flex items-center justify-center">
                   <TrendingUp size={16} className="text-slate-300" />
                </div>
              </div>
              <p className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <motion.div
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-3xl rounded-[3rem] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.02)] border border-white/60 flex flex-col h-[520px] group relative overflow-hidden"
          >
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-700" />
            
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                  <motion.div 
                    animate={{ 
                      y: [0, -4, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg shadow-indigo-500/20"
                  >
                    <TrendingUp size={22} className="text-white" />
                  </motion.div>
                  Analytics
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-16">Post Distribution</p>
              </div>
            </div>
            
            <div className="flex-1 min-h-0 relative z-10">
              {postsPerGroup.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activePieIndex}
                      activeShape={renderActiveShape}
                      data={postsPerGroup}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                      onMouseEnter={onPieEnter}
                      animationBegin={200}
                      animationDuration={800}
                      isAnimationActive={isPieAnimating}
                    >
                      {postsPerGroup.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                          className="hover:opacity-90 transition-opacity cursor-pointer"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '24px', 
                        border: '1px solid rgba(255,255,255,0.6)', 
                        boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                        backdropFilter: 'blur(20px)',
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        padding: '12px 20px'
                      }}
                      itemStyle={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#1e293b' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                    <BookOpen size={48} className="opacity-20" />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest opacity-40">No Insights Yet</p>
                </div>
              )}
            </div>
            
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 justify-center">
              {postsPerGroup.map((entry, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.4,
                    delay: 0.3 + index * 0.08,
                    ease: "easeOut"
                  }}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border transition-all duration-500 cursor-pointer ${
                    activePieIndex === index 
                    ? 'bg-white border-slate-200 scale-110 shadow-md shadow-indigo-500/5' 
                    : 'border-transparent'
                  }`}
                  onMouseEnter={() => {
                    setActivePieIndex(index);
                    setIsPieAnimating(false);
                  }}
                >
                  <div 
                    className="h-2.5 w-2.5 rounded-full shadow-sm" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                  />
                  <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${
                    activePieIndex === index ? 'text-indigo-600' : 'text-slate-500'
                  }`}>
                    {entry.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-3xl rounded-[3rem] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.02)] border border-white/60 h-[520px] flex flex-col relative overflow-hidden group"
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors duration-700" />
            
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/20">
                    <Clock size={22} className="text-white" />
                  </div>
                  Timeline
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pl-16">Your Recent Journey</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-0 pr-4 custom-scrollbar relative z-10">
              {activities.length > 0 ? (
                activities.map((activity, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-8 group/item relative pb-10 last:pb-0"
                  >
                    {i !== activities.length - 1 && (
                      <div className="absolute top-14 left-7 w-[2px] h-full bg-gradient-to-b from-slate-200 via-slate-100 to-transparent" />
                    )}

                    <div className="relative z-20">
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl transition-all duration-500 group-hover/item:rotate-12 group-hover/item:scale-110 ${
                        activity.type === 'post' 
                        ? 'bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600' 
                        : 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600'
                      }`}>
                        {activity.type === 'post' ? <PenTool size={24} /> : <ShieldCheck size={24} />}
                      </div>
                    </div>

                    <div className="flex-1 pt-2 space-y-3">
                      <div className="bg-slate-50/50 hover:bg-white border border-slate-100/50 hover:border-indigo-100 p-5 rounded-[2rem] transition-all duration-300 group-hover/item:shadow-lg group-hover/item:shadow-indigo-500/5 group-hover/item:-translate-y-1">
                        <p className="text-base font-bold text-slate-800 group-hover/item:text-indigo-600 transition-colors leading-tight mb-3">
                          {activity.type === 'post' ? `Shared "${activity.title}"` : `Launched "${activity.title}"`}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white shadow-sm border border-slate-100">
                            <Calendar size={12} className="text-slate-400" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                              {new Date(activity.time).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          
                          {activity.group && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50/50 border border-indigo-100/30">
                              <Users size={12} className="text-indigo-400" />
                              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                                {activity.group}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-slate-200 blur-2xl opacity-20 animate-pulse" />
                    <div className="relative p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                      <Clock size={64} className="opacity-10" />
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-300">Timeline Empty</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Start your journey today</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;