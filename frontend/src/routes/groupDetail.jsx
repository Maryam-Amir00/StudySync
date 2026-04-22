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
    onSuccess: () => {
      toast.success("Post created");
      queryClient.invalidateQueries(["posts", groupId]);
      setTitle("");
      setContent("");
      setShowPostComposer(false);
    },
    onError: (error) => {
      const err = error.response?.data?.detail || error.response?.data?.group || "Post failed";
      toast.error(err);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      toast.success("Post deleted");
      queryClient.invalidateQueries(["posts", groupId]);
      setSelectedPostId(null);
    },
    onError: () => toast.error("Error deleting post"),
  });

  const updateMutation = useMutation({
    mutationFn: updatePost,
    onSuccess: () => {
      toast.success("Post updated");
      queryClient.invalidateQueries(["posts", groupId]);
    },
    onError: () => toast.error("Error updating post"),
  });

  const createCommentMutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      toast.success("Comment added");
      queryClient.invalidateQueries(["comments", selectedPostId]);
      setCommentText("");
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || "Comment failed");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      toast.success("Comment deleted");
      queryClient.invalidateQueries(["comments", selectedPostId]);
    },
    onError: () => toast.error("Error deleting comment"),
  });

  const updateCommentMutation = useMutation({
    mutationFn: updateComment,
    onSuccess: () => {
      toast.success("Comment updated");
      queryClient.invalidateQueries(["comments", selectedPostId]);
    },
    onError: () => toast.error("Error updating comment"),
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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-linear-to-br from-[#F8FAFF] via-[#F3F4F6] to-[#EEF2FF] p-4 md:p-8">
      {/* 🔹 DECORATIVE BACKGROUND ELEMENTS */}
      <div className="pointer-events-none absolute left-[10%] top-[-5%] h-96 w-96 rounded-full bg-[#EEF2FF] blur-3xl opacity-60" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[5%] h-125 w-125 rounded-full bg-[#DDD6FE] blur-3xl opacity-40" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[linear-gradient(#4F46E5_1px,transparent_1px),linear-gradient(90deg,#4F46E5_1px,transparent_1px)] bg-size-[40px_40px]" />

      <div className="relative z-10 flex flex-1 flex-col gap-6">
        {/* 🔹 HEADER: GROUP INFO */}
        <div className="flex flex-col gap-2 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-sm backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-[#111827]">
              {groupData?.name || "Group Posts"}
            </h1>
            <p className="text-sm text-[#6B7280]">
              {groupData?.description || "A space for collaboration and shared learning."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#374151] transition-all hover:bg-[#F9FAFB]"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (!isMember) {
                  toast.error("Join this group to create a post.");
                  return;
                }
                setShowPostComposer((prev) => !prev);
              }}
              className={`rounded-xl px-5 py-2 text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 ${
                !isMember
                  ? "cursor-not-allowed bg-[#9CA3AF]"
                  : showPostComposer
                    ? "bg-[#6B7280] hover:bg-[#4B5563]"
                    : "bg-linear-to-r from-[#4F46E5] to-[#8B5CF6] hover:shadow-lg"
              }`}
              title={isMember ? "Create a post" : "Join this group to post"}
            >
              {isMember ? (showPostComposer ? "Cancel" : "New Post") : "Members Only"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-6">
        {/* 🔹 LEFT COLUMN: POSTS LIST & COMPOSER */}
        <section className="flex flex-1 flex-col gap-4 overflow-hidden">
          <AnimatePresence>
            {showPostComposer && (
              <_motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 rounded-2xl border-2 border-[#4F46E5]/20 bg-[#F9FAFB] p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-2 w-2 rounded-full bg-[#4F46E5]" />
                    <h3 className="text-sm font-bold text-[#4F46E5] uppercase tracking-wider">Draft New Post</h3>
                  </div>
                  <input
                    placeholder="A descriptive title for your post"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-medium text-[#111827] transition-all hover:border-[#4F46E5] focus:border-[#4F46E5] focus:outline-none focus:ring-4 focus:ring-[#EEF2FF]"
                  />
                  <textarea
                    placeholder="What would you like to share with the group?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full min-h-32 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#374151] transition-all hover:border-[#4F46E5] focus:border-[#4F46E5] focus:outline-none focus:ring-4 focus:ring-[#EEF2FF]"
                  />
                  <div className="flex justify-end">
                    <button
                      disabled={createMutation.isPending}
                      onClick={() => {
                        if (!title || !content) return toast.error("Title and content required");
                        createMutation.mutate({ title, content, group: Number(groupId) });
                      }}
                      className="rounded-xl bg-[#4F46E5] px-6 py-2.5 font-bold text-white transition-all hover:bg-[#4338CA] disabled:opacity-50"
                    >
                      {createMutation.isPending ? "Posting..." : "Share Post"}
                    </button>
                  </div>
                </div>
              </_motion.div>
            )}
          </AnimatePresence>

          {/* Posts Feed */}
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E5E7EB] py-20 text-center">
                <div className="mb-4 rounded-full bg-[#F3F4F6] p-4 text-[#6B7280]">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 2v4a2 2 0 002 2h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#111827]">No posts yet</h3>
                <p className="text-sm text-[#6B7280]">Be the first to start the conversation!</p>
              </div>
            ) : (
              posts.map((post) => (
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
                        {post.created_at ? new Date(post.created_at).toLocaleDateString() : "now"}
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
        </section>

        {/* 🔹 RIGHT COLUMN: POST DETAIL & COMMENTS (FIXED OVERLAY) */}
        <AnimatePresence>
          {selectedPost && (
            <>
              {/* Backdrop */}
              <_motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPostId(null)}
                className="fixed inset-0 z-55 bg-[#111827]/10 backdrop-blur-[2px]"
              />
              
              {/* Sidebar */}
              <_motion.section
                initial={{ x: "100%", opacity: 0.5 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0.5 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed right-0 top-0 z-60 flex h-screen w-full max-w-xl flex-col overflow-hidden bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)]"
              >
                {/* Detail Header */}
                <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#F9FAFB] px-6 py-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-[#4F46E5] p-2 text-white shadow-lg shadow-[#4F46E5]/20">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#111827]">Post Discussion</h4>
                      <p className="text-[10px] font-medium uppercase tracking-widest text-[#6B7280]">View Details & Comments</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPostId(null)}
                    className="group rounded-full p-2 text-[#6B7280] transition-all hover:bg-[#F3F4F6] hover:text-[#111827]"
                  >
                    <svg className="h-6 w-6 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-6 py-8 custom-scrollbar">
                  {/* Main Post Card */}
                  <div className="space-y-6 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 flex items-center justify-center rounded-2xl bg-linear-to-br from-[#4F46E5] to-[#8B5CF6] text-sm font-bold text-white shadow-lg shadow-[#4F46E5]/20">
                          {(selectedPost.author || "U").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#111827]">{selectedPost.author}</span>
                          <span className="text-xs text-[#6B7280]">
                            {selectedPost.created_at ? new Date(selectedPost.created_at).toLocaleString() : "Just now"}
                          </span>
                        </div>
                      </div>
                      {selectedPost.author === user?.username && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              toast((t) => (
                                <div className="flex flex-col gap-3 min-w-60">
                                  <p className="text-sm font-bold text-[#111827]">Update Post</p>
                                  <input
                                    id={`edit-post-title-${selectedPost.id}`}
                                    defaultValue={selectedPost.title}
                                    className="rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#EEF2FF]"
                                  />
                                  <textarea
                                    id={`edit-post-content-${selectedPost.id}`}
                                    defaultValue={selectedPost.content}
                                    rows={5}
                                    className="rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#EEF2FF]"
                                  />
                                  <div className="flex justify-end gap-2 pt-2">
                                    <button onClick={() => toast.dismiss(t.id)} className="text-xs font-semibold text-[#6B7280] hover:text-[#111827]">Cancel</button>
                                    <button
                                      onClick={() => {
                                        const tVal = document.getElementById(`edit-post-title-${selectedPost.id}`).value;
                                        const cVal = document.getElementById(`edit-post-content-${selectedPost.id}`).value;
                                        if (tVal && cVal) {
                                          updateMutation.mutate({ id: selectedPost.id, data: { title: tVal, content: cVal, group: Number(groupId) } });
                                          toast.dismiss(t.id);
                                        }
                                      }}
                                      className="rounded-xl bg-[#4F46E5] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#4338CA]"
                                    >
                                      Save Changes
                                    </button>
                                  </div>
                                </div>
                              ), { duration: 6000 });
                            }}
                            className="rounded-xl p-2.5 text-[#4F46E5] transition-all hover:bg-[#EEF2FF]"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              toast((t) => (
                                <div className="flex flex-col gap-3">
                                  <p className="text-sm font-bold text-[#EF4444]">Delete this post?</p>
                                  <p className="text-xs text-[#6B7280]">This action cannot be undone.</p>
                                  <div className="flex justify-end gap-2 pt-2">
                                    <button onClick={() => toast.dismiss(t.id)} className="text-xs font-semibold text-[#6B7280] hover:text-[#111827]">Cancel</button>
                                    <button
                                      onClick={() => {
                                        deleteMutation.mutate(selectedPost.id);
                                        toast.dismiss(t.id);
                                      }}
                                      className="rounded-xl bg-[#EF4444] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#DC2626]"
                                    >
                                      Confirm Delete
                                    </button>
                                  </div>
                                </div>
                              ));
                            }}
                            className="rounded-xl p-2.5 text-[#EF4444] transition-all hover:bg-red-50"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-extrabold tracking-tight text-[#111827] leading-tight">{selectedPost.title}</h3>
                      <p className="whitespace-pre-wrap text-base leading-relaxed text-[#374151]">{selectedPost.content}</p>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <h5 className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">Discussion</h5>
                      <div className="h-px flex-1 bg-linear-to-r from-[#E5E7EB] to-transparent" />
                      <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-[10px] font-bold text-[#4F46E5]">
                        {commentsData?.results?.length || 0} Comments
                      </span>
                    </div>

                    <div className="space-y-6">
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
                                    onClick={() => deleteCommentMutation.mutate({ postId: selectedPost.id, commentId: c.id })}
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

                {/* Comment Input */}
                <div className="border-t border-[#E5E7EB] bg-white p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                  <div className="flex items-center gap-3 rounded-2xl bg-[#F9FAFB] p-2 ring-1 ring-[#E5E7EB] transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-[#4F46E5]/30 focus-within:shadow-lg focus-within:shadow-[#4F46E5]/5">
                    <textarea
                      rows={1}
                      placeholder={`Reply to ${selectedPost.author}...`}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 resize-none bg-transparent px-4 py-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (commentText.trim()) {
                            createCommentMutation.mutate({ postId: selectedPost.id, content: commentText });
                          }
                        }
                      }}
                    />
                    <button
                      disabled={!commentText.trim() || createCommentMutation.isPending}
                      onClick={() => createCommentMutation.mutate({ postId: selectedPost.id, content: commentText })}
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#4F46E5] text-white shadow-lg shadow-[#4F46E5]/20 transition-all hover:bg-[#4338CA] hover:-translate-y-0.5 disabled:opacity-30 disabled:translate-y-0 disabled:shadow-none"
                    >
                      <svg className="h-5 w-5 rotate-90" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </_motion.section>
            </>
          )}
        </AnimatePresence>
      </div>
      {typeof document !== "undefined" &&
        createPortal(
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
    </div>
    </div>
  );
};

export default GroupDetail;