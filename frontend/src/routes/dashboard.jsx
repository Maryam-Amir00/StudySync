import Sidebar from "../components/Sidebar";
import { Outlet } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#F9FAFB]">
      <Sidebar />

      <main className="relative ml-20 h-screen overflow-y-auto bg-white custom-scrollbar">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mx-auto flex min-h-full flex-col"
        >
          {/* � Clean Minimalist Header */}
          <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/80 px-8 py-6 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h1 className="text-xl font-bold tracking-tight text-gray-900">
                  Dashboard
                </h1>
                <p className="text-xs font-medium text-gray-500">
                  Welcome back, <span className="text-indigo-600">@{user?.username || 'scholar'}</span>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden flex-col items-end sm:flex">
                   <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</span>
                   <div className="flex items-center gap-1.5">
                     <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                     <span className="text-[10px] font-medium text-gray-600">Live</span>
                   </div>
                </div>
                <div className="h-8 w-px bg-gray-100" />
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700">
                   <svg className="h-3.5 w-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                   </svg>
                   Student Hub
                </div>
              </div>
            </div>
          </header>

          {/* 🧩 Content Area */}
          <div className="flex-1 px-8 py-8">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;