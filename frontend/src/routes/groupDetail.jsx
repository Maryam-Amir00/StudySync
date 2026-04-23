import { fetchGroup } from "../api/groupApi";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useParams, useNavigate } from "@tanstack/react-router";
import { toast } from "react-hot-toast";
import { motion as _motion, AnimatePresence } from "framer-motion";
import {
  fetchPosts,
  createPost,
  deletePost,
  updatePost,
} from "../api/postApi";
import {
  fetchComments,
  createComment,
  deleteComment,
  updateComment,
} from "../api/commentApi";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/useAuth";

const GroupDetail = () => {
  const { groupId } = useParams({ from: "/groups/$groupId" });
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showPostComposer, setShowPostComposer] = useState(false);

  const [selectedPostId, setSelectedPostId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const [editingPost, setEditingPost] = useState(null);
  const [editPostTitle, setEditPostTitle] = useState("");
  const [editPostContent, setEditPostContent] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const commentsEndRef = useRef(null);

  // 🔥 GROUP INFO
  const { data: groupData } = useQuery({
    queryKey: ["group", groupId],
    queryFn: () => fetchGroup(groupId),
  });
  const currentUsername = (user?.username || "").toLowerCase().trim();
  const isMember = Array.isArray(groupData?.members)
    ? groupData.members.some(
        (member) => (member?.username || "").toLowerCase().trim() === currentUsername
      )
    : false;

  // 🔥 POSTS
  const { data: postsData, isLoading } = useQuery({
    queryKey: ["posts", groupId],
    queryFn: () => fetchPosts(groupId),
  });
  const posts = postsData?.results || [];
  
  const filteredPosts = posts.filter(post => {
    const query = searchQuery.toLowerCase();
    return (
      (post?.title || "").toLowerCase().includes(query) || 
      (post?.content || "").toLowerCase().includes(query) ||
      (post?.author || "").toLowerCase().includes(query)
    );
  });

  const selectedPost = posts.find((post) => post.id === selectedPostId);

  // 🔥 COMMENTS
  const { data: commentsData } = useQuery({
    queryKey: ["comments", selectedPostId],
    queryFn: () => fetchComments(selectedPostId),
    enabled: !!selectedPostId,
  });

  // 🔥 AUTO-SCROLL TO BOTTOM
  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedPostId) {
      scrollToBottom();
    }
  }, [commentsData, selectedPostId]);

  // 🔥 MUTATIONS (Success/Error handling)
  const createMutation = useMutation({
    mutationFn: createPost,
    onMutate: async (newPost) => {
      await queryClient.cancelQueries({ queryKey: ["posts", groupId] });
      const previousPosts = queryClient.getQueryData(["posts", groupId]);

      queryClient.setQueryData(["posts", groupId], (old) => {
        const results = old?.results || [];
        return {
          ...old,
          results: [
            {
              ...newPost,
              id: Date.now(),
              author: user?.username,
              created_at: new Date().toISOString(),
              isOptimistic: true,
            },
            ...results,
          ],
        };
      });

      return { previousPosts };
    },
    onError: (err, newPost, context) => {
      queryClient.setQueryData(["posts", groupId], context.previousPosts);
      const msg = err.response?.data?.detail || err.response?.data?.title || "Failed to create post";
      toast.error(msg);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", groupId] });
    },
    onSuccess: () => {
      toast.success("Post created");
      setTitle("");
      setContent("");
      setShowPostComposer(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["posts", groupId] });
      const previousPosts = queryClient.getQueryData(["posts", groupId]);

      queryClient.setQueryData(["posts", groupId], (old) => ({
        ...old,
        results: (old?.results || []).filter((p) => p.id !== postId),
      }));

      return { previousPosts };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(["posts", groupId], context.previousPosts);
      toast.error("Error deleting post");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", groupId] });
    },
    onSuccess: () => {
      toast.success("Post deleted");
      setSelectedPostId(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updatePost,
    onMutate: async (updatedPost) => {
      await queryClient.cancelQueries({ queryKey: ["posts", groupId] });
      const previousPosts = queryClient.getQueryData(["posts", groupId]);

      queryClient.setQueryData(["posts", groupId], (old) => ({
        ...old,
        results: (old?.results || []).map((p) =>
          p.id === updatedPost.id ? { ...p, ...updatedPost.data } : p
        ),
      }));

      return { previousPosts };
    },
    onError: (err, updatedPost, context) => {
      queryClient.setQueryData(["posts", groupId], context.previousPosts);
      toast.error("Error updating post");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", groupId] });
    },
    onSuccess: () => {
      toast.success("Post updated");
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: createComment,
    onMutate: async (newComment) => {
      const { postId } = newComment;
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      const previousComments = queryClient.getQueryData(["comments", postId]);

      queryClient.setQueryData(["comments", postId], (old) => {
        const results = Array.isArray(old) ? old : (old?.results || []);
        const commentObj = {
          id: Date.now(),
          content: newComment.content,
          author: user?.username,
          created_at: new Date().toISOString(),
          isOptimistic: true,
        };
        return Array.isArray(old) 
          ? [commentObj, ...old] 
          : { ...old, results: [commentObj, ...results] };
      });

      return { previousComments, postId };
    },
    onError: (err, newComment, context) => {
      queryClient.setQueryData(["comments", context.postId], context.previousComments);
      const msg = err.response?.data?.detail || err.response?.data?.content || "Comment failed";
      toast.error(msg);
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
      queryClient.invalidateQueries({ queryKey: ["posts", groupId] });
    },
    onSuccess: () => {
      toast.success("Comment added");
      setCommentText("");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onMutate: async ({ postId, commentId }) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      const previousComments = queryClient.getQueryData(["comments", postId]);

      queryClient.setQueryData(["comments", postId], (old) => {
        if (Array.isArray(old)) {
          return old.filter((c) => c.id !== commentId);
        }
        return {
          ...old,
          results: (old?.results || []).filter((c) => c.id !== commentId),
        };
      });

      return { previousComments, postId };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["comments", context.postId], context.previousComments);
      toast.error("Error deleting comment");
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
      queryClient.invalidateQueries({ queryKey: ["posts", groupId] });
    },
    onSuccess: () => {
      toast.success("Comment deleted");
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: updateComment,
    onMutate: async (updatedComment) => {
      const { postId, commentId } = updatedComment;
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      const previousComments = queryClient.getQueryData(["comments", postId]);

      queryClient.setQueryData(["comments", postId], (old) => {
        if (Array.isArray(old)) {
          return old.map((c) =>
            c.id === commentId ? { ...c, content: updatedComment.content } : c
          );
        }
        return {
          ...old,
          results: (old?.results || []).map((c) =>
            c.id === commentId ? { ...c, content: updatedComment.content } : c
          ),
        };
      });

      return { previousComments, postId };
    },
    onError: (err, updatedComment, context) => {
      queryClient.setQueryData(["comments", context.postId], context.previousComments);
      toast.error("Error updating comment");
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
    },
    onSuccess: () => {
      toast.success("Comment updated");
    },
  });

  const openCommentEditor = (comment) => {
    setEditingComment(comment);
    setEditingCommentText(comment?.content || "");
  };

  const closeCommentEditor = () => {
    setEditingComment(null);
    setEditingCommentText("");
  };

  const saveEditedComment = () => {
    if (!editingComment || !selectedPost) return;
    const trimmedText = editingCommentText.trim();
    if (!trimmedText) {
      toast.error("Comment cannot be empty");
      return;
    }

    updateCommentMutation.mutate(
      { postId: selectedPost.id, commentId: editingComment.id, content: trimmedText },
      { onSuccess: () => closeCommentEditor() }
    );
  };

  if (isLoading) return (
    <div className="flex h-full items-center justify-center min-h-100">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]"></div>
    </div>
  );

  return (
    <div className="relative flex min-h-screen flex-col bg-[#F8FAFC] p-4 md:p-8">
      {/* 🌌 Subtle Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/5 blur-[100px]" />
        <div className="absolute top-1/2 right-0 h-64 w-64 -translate-y-1/2 rounded-full bg-purple-500/5 blur-[80px]" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col gap-8">
        {/* 🔹 PREMIUM MINIMAL HEADER */}
        <_motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/70 p-8 shadow-[0_20px_40px_rgba(0,0,0,0.02)] backdrop-blur-2xl"
        >
          {/* Decorative Background Element */}
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-indigo-500/5 blur-3xl" />

          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-1 items-start gap-6">
              <button
                onClick={() => navigate({ to: "/dashboard" })}
                className="group flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:scale-110 hover:border-indigo-100 hover:bg-indigo-50"
              >
                <svg className="h-5 w-5 text-slate-400 transition-colors group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>

              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-black tracking-tight text-slate-900">
                    {groupData?.name || "Community"}
                  </h1>
                  {isMember && (
                    <span className="rounded-full bg-indigo-50/50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-100/50">
                      Member
                    </span>
                  )}
                </div>
                
                {groupData?.description && (
                  <p className="max-w-3xl text-base font-medium leading-relaxed text-slate-500/90">
                    {groupData.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Admin</span>
                      <span className="text-xs font-black text-slate-700">{groupData?.admin || "Admin"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Community</span>
                      <span className="text-xs font-black text-slate-700">{groupData?.members?.length || 0} Members</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Established</span>
                      <span className="text-xs font-black text-slate-700">
                        {groupData?.created_at ? new Date(groupData.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          <div className="flex shrink-0 items-center gap-4">
            <_motion.button
              whileHover={isMember ? { scale: 1.05, y: -2 } : {}}
              whileTap={isMember ? { scale: 0.95 } : {}}
              onClick={() => isMember && setShowPostComposer((prev) => !prev)}
              className={`group relative flex h-14 items-center gap-3 overflow-hidden rounded-2xl px-8 text-sm font-black transition-all duration-500 ${
                !isMember
                  ? "bg-slate-100 text-slate-400 cursor-help"
                  : showPostComposer
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20"
                    : "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700"
              }`}
            >
              {!isMember && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-100 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-4 text-center">
                    Join community to post
                  </span>
                </div>
              )}
              <div className="relative z-10 flex items-center gap-3">
                <svg 
                  className={`h-5 w-5 transition-transform duration-500 ease-[0.16,1,0.3,1] ${showPostComposer ? "rotate-45" : ""}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>{showPostComposer ? "Discard" : "Create Post"}</span>
              </div>
              
              {/* Subtle Glow Effect */}
              {isMember && !showPostComposer && (
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
              )}
            </_motion.button>
          </div>
          </div>
        </_motion.header>

        <div className="flex min-h-0 flex-1 gap-6">
          <section className="flex flex-1 flex-col gap-4 overflow-hidden">
            <AnimatePresence initial={false}>
              {showPostComposer && (
                <_motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ 
                    opacity: 1, 
                    height: "auto",
                    marginBottom: 24
                  }}
                  exit={{ 
                    opacity: 0, 
                    height: 0,
                    marginBottom: 0
                  }}
                  transition={{ 
                    duration: 0.5, 
                    ease: [0.16, 1, 0.3, 1] 
                  }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4 rounded-3xl border border-indigo-100 bg-white p-6 shadow-[0_15px_35px_rgba(79,70,229,0.05)]">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                      <h3 className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em]">New Publication</h3>
                    </div>
                    <input
                      placeholder="Give your post a compelling title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-4 text-sm font-bold text-slate-900 transition-all placeholder:text-slate-400 hover:bg-slate-50 focus:border-indigo-500/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5"
                    />
                    <textarea
                      placeholder="Share your thoughts or research with the community..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full min-h-40 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-4 text-sm font-medium text-slate-700 transition-all placeholder:text-slate-400 hover:bg-slate-50 focus:border-indigo-500/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5"
                    />
                    <div className="flex justify-end pt-2">
                      <_motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (!title.trim() || !content.trim()) return toast.error("Title and content required");
                          createMutation.mutate({ title, content, group: Number(groupId) });
                        }}
                        disabled={!title.trim() || !content.trim() || createMutation.isPending}
                        className="flex h-12 items-center gap-2 rounded-2xl bg-indigo-600 px-8 text-xs font-black text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {createMutation.isPending ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                        Publish Post
                      </_motion.button>
                    </div>
                  </div>
                </_motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col min-h-0 flex-1 space-y-4">
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search posts by title, content or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {filteredPosts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E5E7EB] py-20 text-center">
                    <div className="mb-4 rounded-full bg-[#F3F4F6] p-4 text-[#6B7280]">
                      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-[#111827]">No posts found</h3>
                    <p className="text-sm text-[#6B7280]">Try searching for something else or create a new post.</p>
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <_motion.div
                      key={post.id}
                      layoutId={`post-${post.id}`}
                      onClick={() => setSelectedPostId(selectedPostId === post.id ? null : post.id)}
                      className={`group relative cursor-pointer rounded-2xl border p-5 transition-all duration-300 ${
                        selectedPostId === post.id
                          ? "border-[#4F46E5] bg-[#EEF2FF]/40 shadow-lg"
                          : "border-[#E5E7EB] bg-white hover:-translate-y-1 hover:border-[#C7D2FE] hover:shadow-xl"
                      }`}
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-[#4F46E5] to-[#8B5CF6] text-[10px] font-bold text-white uppercase shadow-sm">
                            {(post.author || "U").slice(0, 2)}
                          </div>
                          <span className="text-xs font-bold text-[#111827]">{post.author}</span>
                          <span className="h-1 w-1 rounded-full bg-[#E5E7EB]" />
                          <span className="text-xs text-[#6B7280]">
                            {post.created_at ? new Date(post.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : "Just now"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[#6B7280]">
                          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.827-1.213L3 20l1.391-3.951A9.03 9.03 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {post.comment_count || 0}
                          </div>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-[#111827] transition-colors group-hover:text-[#4F46E5]">
                        {post.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#4B5563]">{post.content}</p>
                      
                      {selectedPostId === post.id && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className="rounded-full bg-[#4F46E5] p-1 text-white shadow-lg">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </_motion.div>
                  ))
                )}
              </div>
            </div>
          </section>

          <AnimatePresence>
            {selectedPost && (
              <>
                <_motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => {
                    setSelectedPostId(null);
                    setEditingPost(null);
                  }}
                  className="fixed inset-0 z-55 bg-[#111827]/10 backdrop-blur-[2px]"
                />
                
                <_motion.section
                  initial={{ x: "100%", opacity: 0.5 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "100%", opacity: 0.5 }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="fixed right-0 top-0 z-60 flex h-screen w-full max-w-xl flex-col overflow-hidden bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)]"
                >
                  <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#E5E7EB] bg-white/80 px-6 py-4 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#4F46E5] shadow-sm">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#111827]">Post Discussion</h4>
                        <p className="text-[10px] font-medium uppercase tracking-widest text-[#6B7280]">View Details & Comments</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPostId(null);
                        setEditingPost(null);
                      }}
                      className="group rounded-full p-2 text-[#6B7280] transition-all hover:bg-[#F3F4F6] hover:text-[#111827]"
                    >
                      <svg className="h-6 w-6 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="shrink-0 border-b border-[#E5E7EB] bg-slate-50/30 px-6 py-8">
                    <div className="space-y-6 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 flex items-center justify-center rounded-2xl bg-linear-to-br from-[#4F46E5] to-[#8B5CF6] text-sm font-bold text-white shadow-lg shadow-[#4F46E5]/20">
                            {(selectedPost.author || "U").slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#111827]">{selectedPost.author}</span>
                            <span className="text-xs text-[#6B7280]">
                              {selectedPost.created_at ? new Date(selectedPost.created_at).toLocaleString(undefined, { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                              }) : "Just now"}
                            </span>
                          </div>
                        </div>
                        {selectedPost.author === user?.username && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditPostTitle(selectedPost.title);
                                setEditPostContent(selectedPost.content);
                                setEditingPost(selectedPost);
                              }}
                              className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-[#4F46E5] transition-all hover:bg-indigo-100 hover:scale-105 active:scale-95"
                              title="Edit post"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                toast((t) => (
                                  <div className="flex flex-col gap-3 p-1">
                                    <p className="text-sm font-bold text-gray-900">Delete this post permanently?</p>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => {
                                          deleteMutation.mutate(selectedPost.id);
                                          toast.dismiss(t.id);
                                        }}
                                        className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors"
                                      >
                                        Delete
                                      </button>
                                      <button
                                        onClick={() => toast.dismiss(t.id)}
                                        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ), {
                                  duration: 5000,
                                  position: 'top-center',
                                  style: {
                                    borderRadius: '16px',
                                    border: '1px solid #FEE2E2',
                                    padding: '12px',
                                  }
                                });
                              }}
                              className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#EF4444] transition-all hover:bg-red-100 hover:scale-105 active:scale-95"
                              title="Delete post"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                          <h3 className="text-2xl font-extrabold tracking-tight text-[#111827] leading-tight sm:text-3xl">{selectedPost.title}</h3>
                          <p className="whitespace-pre-wrap text-base leading-relaxed text-[#374151]">{selectedPost.content}</p>
                      </div>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <h5 className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">Discussion</h5>
                        <div className="h-px flex-1 bg-linear-to-r from-[#E5E7EB] to-transparent" />
                        <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-[10px] font-bold text-[#4F46E5]">
                          {commentsData?.results?.length || 0} Comments
                        </span>
                      </div>

                      <div className="space-y-6 pb-4">
                        {[...(commentsData?.results || [])].reverse().map((c) => (
                          <div key={c.id} className="group/comment flex gap-4">
                            <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-2xl bg-[#F3F4F6] text-xs font-bold text-[#6B7280] shadow-sm transition-colors group-hover/comment:bg-[#EEF2FF] group-hover/comment:text-[#4F46E5]">
                              {(c.author || "U").slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-[#111827]">{c.author}</span>
                                  <span className="h-1 w-1 rounded-full bg-[#E5E7EB]" />
                                  <span className="text-[10px] font-medium text-[#9CA3AF]">Just now</span>
                                </div>
                                {c.author === user?.username && (
                                  <div className="flex gap-3 opacity-0 transition-opacity group-hover/comment:opacity-100">
                                    <button
                                      onClick={() => openCommentEditor(c)}
                                      className="text-[10px] font-bold text-[#4F46E5] hover:text-[#4338CA]"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => {
                                        toast((t) => (
                                          <div className="flex flex-col gap-3 p-1">
                                            <p className="text-sm font-bold text-gray-900">Delete this comment?</p>
                                            <div className="flex gap-2">
                                              <button
                                                onClick={() => {
                                                  deleteCommentMutation.mutate({ postId: selectedPost.id, commentId: c.id });
                                                  toast.dismiss(t.id);
                                                }}
                                                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors"
                                              >
                                                Delete
                                              </button>
                                              <button
                                                onClick={() => toast.dismiss(t.id)}
                                                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                          </div>
                                        ), {
                                          duration: 4000,
                                          position: 'top-center',
                                          style: {
                                            borderRadius: '16px',
                                            border: '1px solid #FEE2E2',
                                            padding: '12px',
                                          }
                                        });
                                      }}
                                      className="text-[10px] font-bold text-[#EF4444] hover:text-[#DC2626]"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                              <div className="rounded-2xl rounded-tl-none bg-[#F9FAFB] p-4 text-sm leading-relaxed text-[#374151] shadow-xs transition-colors group-hover/comment:bg-[#F3F4F6]">
                                {c.content}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={commentsEndRef} />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#E5E7EB] bg-white px-6 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                    <div className={`flex items-center gap-2 rounded-2xl p-1.5 ring-1 transition-all ${
                      !isMember 
                      ? 'bg-slate-50 ring-slate-200' 
                      : 'bg-[#F9FAFB] ring-[#E5E7EB] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#4F46E5]/30 focus-within:shadow-lg'
                    }`}>
                      <textarea
                        rows={1}
                        disabled={!isMember}
                        placeholder={isMember ? `Reply to ${selectedPost.author}...` : "Join community to participate in discussion"}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none disabled:cursor-not-allowed"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (commentText.trim() && isMember) {
                              createCommentMutation.mutate({ postId: selectedPost.id, content: commentText });
                            }
                          }
                        }}
                      />
                      <div className="pb-1">
                        <button
                          disabled={!commentText.trim() || createCommentMutation.isPending || !isMember}
                          onClick={() => isMember && createCommentMutation.mutate({ postId: selectedPost.id, content: commentText })}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4F46E5] text-white shadow-md transition-all hover:bg-[#4338CA] hover:scale-105 active:scale-95 disabled:opacity-30 disabled:scale-100 disabled:bg-slate-400"
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </_motion.section>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {editingComment && (
            <>
              <_motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeCommentEditor}
                className="fixed inset-0 z-9998 bg-black/30 backdrop-blur-[2px]"
              />
              <_motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                className="fixed left-1/2 top-1/2 z-9999 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-2xl"
              >
                <div className="mb-3">
                  <h3 className="text-base font-bold text-[#111827]">Edit Comment</h3>
                </div>
                <textarea
                  rows={4}
                  value={editingCommentText}
                  onChange={(e) => setEditingCommentText(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#EEF2FF]"
                />
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={closeCommentEditor}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEditedComment}
                    disabled={updateCommentMutation.isPending}
                    className="rounded-xl bg-[#4F46E5] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {updateCommentMutation.isPending ? "Updating..." : "Update"}
                  </button>
                </div>
              </_motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {editingPost && (
            <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
              <_motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditingPost(null)}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              />
              <_motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-[#E5E7EB] bg-white p-8 shadow-2xl"
              >
                <div className="mb-6">
                  <h3 className="text-xl font-black text-[#111827]">Edit Your Post</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">Update your discussion details</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#4F46E5]">Post Title</label>
                    <input
                      value={editPostTitle}
                      onChange={(e) => setEditPostTitle(e.target.value)}
                      className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm font-bold text-[#111827] focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#EEF2FF]"
                      placeholder="Enter post title..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#4F46E5]">Content</label>
                    <textarea
                      value={editPostContent}
                      onChange={(e) => setEditPostContent(e.target.value)}
                      rows={10}
                      className="w-full resize-none rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#374151] focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#EEF2FF]"
                      placeholder="Share your thoughts..."
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    onClick={() => setEditingPost(null)}
                    className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest text-[#6B7280] transition-colors hover:bg-gray-50 hover:text-[#111827]"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={updateMutation.isPending}
                    onClick={() => {
                      if (editPostTitle.trim() && editPostContent.trim()) {
                        updateMutation.mutate(
                          { id: editingPost.id, data: { title: editPostTitle.trim(), content: editPostContent.trim(), group: Number(groupId) } },
                          { onSuccess: () => setEditingPost(null) }
                        );
                      }
                    }}
                    className="rounded-2xl bg-[#4F46E5] px-8 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-200/50 transition-all hover:bg-[#4338CA] hover:shadow-xl active:scale-95 disabled:opacity-50"
                  >
                    {updateMutation.isPending ? "Saving Changes..." : "Save Changes"}
                  </button>
                </div>
              </_motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default GroupDetail;
