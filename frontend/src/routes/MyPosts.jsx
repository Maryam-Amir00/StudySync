import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/useAuth";
import { fetchPosts } from "../api/postApi";
import { useNavigate } from "@tanstack/react-router";
import { motion as _motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSearch } from "../context/SearchContext";

const MyPosts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const searchContext = useSearch();
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const searchQuery = searchContext?.searchQuery ?? "";

  // 🔹 DEBOUNCE SEARCH
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["posts", debouncedSearch],
    queryFn: () => fetchPosts(undefined, debouncedSearch), // Fetch all posts with search
  });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-100">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]"></div>
    </div>
  );

  if (isError) return <div className="text-[#EF4444] p-4 text-center bg-red-50 rounded-xl border border-red-100">Something went wrong while loading your posts.</div>;

  if (!user) return <div className="text-[#6B7280] text-center p-10">Loading user profile...</div>;

  const postsArray = Array.isArray(data)
    ? data
    : data?.results || [];

  const currentUsername = (user?.username || "").toLowerCase().trim();

  // Filter posts where author is current user
  const myPosts = postsArray.filter(
    (post) => (post.author || "").toLowerCase().trim() === currentUsername
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-[#111827] tracking-tight">My Posts</h2>
        <span className="rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-3 py-1 text-xs font-semibold text-[#8B5CF6]">
          {myPosts.length} posts
        </span>
      </div>

      {myPosts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E5E7EB] p-12 text-center text-[#6B7280]">
          <p className="mb-2 font-medium">No posts yet</p>
          <p className="text-xs">Share your thoughts in any of your joined groups!</p>
        </div>
      ) : (
        <_motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4"
        >
          {myPosts.map((post) => (
            <_motion.div
              key={post.id}
              variants={item}
              onClick={() =>
                navigate({
                  to: "/groups/$groupId",
                  params: { groupId: post.group_details?.id || post.group },
                })
              }
              className="group cursor-pointer rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C7D2FE] hover:shadow-[0_12px_24px_rgba(17,24,39,0.10)]"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#EEF2FF] px-2.5 py-1 text-xs font-semibold text-[#4F46E5]">
                    {post.group_details?.name || "Group Post"}
                  </span>
                  <span className="text-xs text-[#6B7280]">
                    {post.created_at ? new Date(post.created_at).toLocaleDateString() : "Just now"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.827-1.213L3 20l1.391-3.951A9.03 9.03 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                   </svg>
                   {post.comment_count || 0}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-[#111827] transition-colors duration-200 group-hover:text-[#4F46E5]">
                {post.title}
              </h3>
              
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#374151]">
                {post.content}
              </p>
              
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#4F46E5] opacity-0 transition-opacity group-hover:opacity-100">
                View in Group
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </_motion.div>
          ))}
        </_motion.div>
      )}
    </div>
  );
};

export default MyPosts;