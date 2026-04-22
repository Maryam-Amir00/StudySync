import { Link, useRouterState } from "@tanstack/react-router";
import logo from "../assets/logo.png";

const Sidebar = () => {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const isActive = (path) => pathname === path;
  const iconItemClass = (path) =>
    `group relative inline-flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-200 ${isActive(path)
      ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5] shadow-[0_10px_24px_rgba(79,70,229,0.22)] scale-105"
      : "border-transparent text-[#6B7280] hover:border-[#E5E7EB] hover:bg-[#EEF2FF] hover:text-[#4338CA] hover:scale-105"
    }`;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[96px] border-r border-[#E5E7EB] bg-linear-to-b from-[#F9FAFB] via-[#F8FAFC] to-[#F3F4F6] p-3">
      <div className="flex h-full rounded-3xl border border-[#E5E7EB] bg-[#FFFFFF]/95 p-2 shadow-[0_14px_30px_rgba(17,24,39,0.08)] backdrop-blur-sm">
        <div className="flex w-full flex-col rounded-2xl bg-[#FFFFFF]">
          <div className="mb-2 flex items-center justify-center pt-2">
            <div className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#EEF2FF] shadow-sm">
              <img src={logo} alt="StudySync logo" className="h-8 w-8 object-contain" />
            </div>
          </div>

          <div className="h-px w-full bg-[#E5E7EB]" />

          <div className="flex flex-col items-center justify-start gap-2 pt-3">
            <Link
              to="/dashboard"
              title="Dashboard"
              className={iconItemClass("/dashboard")}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 10.5 12 3l9 7.5" />
                <path d="M5 9.5V20h14V9.5" />
                <path d="M9.5 20v-6h5v6" />
              </svg>
              <span className="pointer-events-none absolute left-14 z-20 hidden rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] px-2 py-1 text-xs font-medium text-[#374151] shadow-md group-hover:block">
                Dashboard
              </span>
            </Link>

            <Link
              to="/dashboard/profile"
              title="Profile"
              className={iconItemClass("/dashboard/profile")}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="pointer-events-none absolute left-14 z-20 hidden rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] px-2 py-1 text-xs font-medium text-[#374151] shadow-md group-hover:block">
                Profile
              </span>
            </Link>

            <Link
              to="/dashboard/my-groups"
              title="Joined Groups"
              className={iconItemClass("/dashboard/my-groups")}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="9" cy="7" r="3" />
                <circle cx="17" cy="7" r="3" />
                <path d="M2 21v-1a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v1" />
                <path d="M14 16h4a4 4 0 0 1 4 4v1" />
              </svg>
              <span className="pointer-events-none absolute left-14 z-20 hidden rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] px-2 py-1 text-xs font-medium text-[#374151] shadow-md group-hover:block">
                Joined Groups
              </span>
            </Link>

            <Link
              to="/dashboard/my-posts"
              title="My Posts"
              className={iconItemClass("/dashboard/my-posts")}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span className="pointer-events-none absolute left-14 z-20 hidden rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] px-2 py-1 text-xs font-medium text-[#374151] shadow-md group-hover:block">
                My Posts
              </span>
            </Link>

            <Link
              to="/dashboard/create-group"
              title="Create Group"
              className={iconItemClass("/dashboard/create-group")}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="pointer-events-none absolute left-14 z-20 hidden rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] px-2 py-1 text-xs font-medium text-[#374151] shadow-md group-hover:block">
                Create Group
              </span>
            </Link>
          </div>

          <div className="mt-auto flex flex-col items-center gap-2 pb-3">

            <div className="h-px w-10 bg-[#E5E7EB]" />

            <button
              onClick={() => {
                localStorage.removeItem("access");
                window.location.href = "/";
              }}
              className="group relative inline-flex h-12 w-12 items-center justify-center rounded-xl border border-transparent text-[#EF4444] transition-all duration-200 hover:border-[#FECACA] hover:bg-[#FEF2F2] hover:scale-105"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>


              <span className="pointer-events-none absolute left-14 z-20 hidden rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] px-2 py-1 text-xs font-medium text-[#374151] shadow-md group-hover:block">
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;