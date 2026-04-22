import Sidebar from "../components/Sidebar";
import { Outlet } from "@tanstack/react-router";
import { motion as _motion } from "framer-motion";
import { SearchProvider, useSearch } from "../context/SearchContext";

const DashboardContent = () => {
  const { searchQuery, setSearchQuery } = useSearch();

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#F9FAFB]">
      <Sidebar />

      <main className="relative ml-20 h-screen overflow-y-auto bg-white custom-scrollbar">
        <_motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mx-auto flex min-h-full flex-col"
        >
          <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-slate-50/80 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-4xl items-center justify-center">
              <div className="relative w-full">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search your workspace..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 shadow-[0_6px_16px_rgba(15,23,42,0.06)] transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:shadow-[0_10px_22px_rgba(15,23,42,0.08)] focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>
          </header>

          {/* 🧩 Content Area */}
          <div className="flex-1 px-8 py-8">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </div>
        </_motion.div>
      </main>
    </div>
  );
};

const Dashboard = () => {
  return (
    <SearchProvider>
      <DashboardContent />
    </SearchProvider>
  );
};

export default Dashboard;