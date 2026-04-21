import Sidebar from "../components/Sidebar";
import { Outlet } from "@tanstack/react-router";

const Dashboard = () => {
  return (
    <div className="relative h-screen overflow-hidden bg-linear-to-br from-[#F9FAFB] via-[#F3F4F6] to-[#EEF2FF]">
      <div className="pointer-events-none absolute left-[120px] top-[-90px] h-72 w-72 rounded-full bg-[#EEF2FF] blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-100px] right-[-80px] h-72 w-72 rounded-full bg-[#DDD6FE] blur-3xl" />
      <Sidebar />

      <div className="relative ml-[96px] h-screen overflow-y-auto p-4 md:p-7">
        <div className="min-h-full rounded-3xl border border-[#E5E7EB] bg-[#FFFFFF]/95 p-5 shadow-[0_20px_45px_rgba(17,24,39,0.1)] backdrop-blur-sm md:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] pb-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#111827] md:text-3xl">
                StudySync Dashboard
              </h1>
              <p className="mt-1 text-sm text-[#6B7280]">
                Explore communities, collaborate in groups, and stay productive.
              </p>
            </div>
            <div className="rounded-full border border-[#C7D2FE] bg-[#EEF2FF] px-3 py-1 text-xs font-semibold text-[#4F46E5]">
              Student Collaboration
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF]/95 p-3 shadow-sm md:p-4">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;