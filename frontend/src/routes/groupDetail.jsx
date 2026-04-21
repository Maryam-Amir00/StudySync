import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
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
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const GroupDetail = () => {
  const { groupId } = useParams({ from: "/groups/$groupId" });
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showPostComposer, setShowPostComposer] = useState(false);

  const [selectedPostId, setSelectedPostId] = useState(null);
  const [commentText, setCommentText] = useState("");

  // 🔥 POSTS
  const { data, isLoading } = useQuery({
    queryKey: ["posts", groupId],
    queryFn: () => fetchPosts(groupId),
  });
  const posts = data?.results || [];
  const selectedPost = posts.find((post) => post.id === selectedPostId);

  // 🔥 COMMENTS
  const { data: commentsData } = useQuery({
    queryKey: ["comments", selectedPostId],
    queryFn: () => fetchComments(selectedPostId),
    enabled: !!selectedPostId,
  });

  // 🔥 CREATE POST
  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      alert("Post created 🎉");
      queryClient.invalidateQueries(["posts", groupId]);
      setTitle("");
      setContent("");
    },
    onError: (error) => {
      const err =
        error.response?.data?.detail ||
        error.response?.data?.group ||
        "Post failed ❌";
      alert(err);
    },
  });

  // 🔥 DELETE POST
  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      alert("Post deleted");
      queryClient.invalidateQueries(["posts", groupId]);
      setSelectedPostId(null); // ✅ reset UI
    },
  });

  // 🔥 UPDATE POST
  const updateMutation = useMutation({
    mutationFn: updatePost,
    onSuccess: () => {
      alert("Post updated");
      queryClient.invalidateQueries(["posts", groupId]);
    },
  });

  // 🔥 CREATE COMMENT
  const createCommentMutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      alert("Comment added 💬");
      queryClient.invalidateQueries(["comments", selectedPostId]);
      setCommentText("");

      onError: (error) => {
        console.log("COMMENT ERROR:", error.response?.data);
      
        alert(
          error.response?.data?.post ||
          error.response?.data?.detail ||
          error.response?.data?.content ||
          "Comment failed ❌"
        );
      }
    },
  });

  // 🔥 DELETE COMMENT
  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      alert("Comment deleted");
      queryClient.invalidateQueries(["comments", selectedPostId]);
    },
  });

  // 🔥 UPDATE COMMENT
  const updateCommentMutation = useMutation({
    mutationFn: updateComment,
    onSuccess: () => {
      alert("Comment updated");
      queryClient.invalidateQueries(["comments", selectedPostId]);
    },
  });

  if (isLoading) return <div className="text-[#6B7280]">Loading...</div>;

  return (
    <div className="flex h-[calc(100vh-150px)] min-h-0 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Group Posts</h2>
        <button
          onClick={() => setShowPostComposer((prev) => !prev)}
          className="rounded-xl bg-[#4F46E5] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4338CA] hover:shadow-md"
        >
          {showPostComposer ? "Close Add Post" : "Add Post"}
        </button>
      </div>

      {showPostComposer && (
        <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-sm">
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-[#374151] placeholder:text-[#6B7280] transition-all duration-300 ease-in-out hover:border-[#4F46E5] focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#EEF2FF]"
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-28 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-[#374151] placeholder:text-[#6B7280] transition-all duration-300 ease-in-out hover:border-[#4F46E5] focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#EEF2FF]"
          />
          <button
            onClick={() => {
              if (!title || !content) {
                alert("Title and content required ⚠️");
                return;
              }
              createMutation.mutate({
                title,
                content,
                group: Number(groupId),
              });
            }}
            className="rounded-lg bg-[#4F46E5] px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-[#4338CA]"
          >
            Post
          </button>
        </div>
      )}

      <div
        className={`grid min-h-0 flex-1 items-stretch gap-5 ${
          selectedPost ? "xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]" : "grid-cols-1"
        }`}
      >
        <section className="min-h-0 space-y-4 overflow-y-auto pr-1">
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() =>
                setSelectedPostId(
                  selectedPostId === post.id ? null : post.id
                )
              }
              className={`group cursor-pointer rounded-2xl border p-4 shadow-sm transition-all duration-300 ${
                selectedPostId === post.id
                  ? "border-[#4F46E5] bg-[#EEF2FF]/60 shadow-[0_14px_28px_rgba(79,70,229,0.16)]"
                  : "border-[#E5E7EB] bg-[#FFFFFF] hover:-translate-y-0.5 hover:border-[#C7D2FE] hover:shadow-[0_12px_24px_rgba(17,24,39,0.10)]"
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#EEF2FF] px-2.5 py-1 text-xs font-semibold text-[#4F46E5]">
                  Post
                </span>
                <span className="rounded-full border border-[#E5E7EB] px-2.5 py-1 text-xs font-medium text-[#6B7280]">
                  by {post.author}
                </span>
              </div>
              <h3 className="text-base font-semibold text-[#111827] transition-colors duration-200 group-hover:text-[#4F46E5]">
                {post.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-[#374151]">{post.content}</p>
              <p className="mt-2 text-xs text-[#6B7280]">
                {post.created_at ? new Date(post.created_at).toLocaleString() : "Just now"}
              </p>
            </div>
          ))}
        </section>

        {selectedPost && (
          <section className="fixed right-0 top-0 z-50 h-screen w-full max-w-xl overflow-hidden border-l border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_12px_28px_rgba(17,24,39,0.20)] transition-all duration-300">
            <div className="h-full overflow-y-auto p-5 transition-all duration-300">
              <div className="space-y-4">
                <div className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-5 shadow-sm">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#EEF2FF] px-2.5 py-1 text-xs font-semibold text-[#4F46E5]">
                      Post Detail
                    </span>
                    <span className="text-xs text-[#6B7280]">
                      {selectedPost.created_at
                        ? new Date(selectedPost.created_at).toLocaleString()
                        : "Just now"}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-[#111827]">{selectedPost.title}</h3>
                  <p className="mt-2 text-sm font-medium text-[#6B7280]">by {selectedPost.author}</p>
                  <p className="mt-3 whitespace-pre-wrap leading-relaxed text-[#374151]">
                    {selectedPost.content}
                  </p>

                  {selectedPost.author === user?.username && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const t = prompt("Edit title", selectedPost.title);
                          const c = prompt("Edit content", selectedPost.content);
                          if (t && c) {
                            updateMutation.mutate({
                              id: selectedPost.id,
                              data: {
                                title: t,
                                content: c,
                                group: Number(groupId),
                              },
                            });
                          }
                        }}
                        className="rounded-lg bg-[#4F46E5] px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-[#4338CA]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const confirmDelete = window.confirm("Delete this post?");
                          if (confirmDelete) {
                            deleteMutation.mutate(selectedPost.id);
                          }
                        }}
                        className="rounded-lg bg-[#EF4444] px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-[#DC2626]"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                  <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                    <h4 className="font-semibold text-[#111827]">Comments</h4>
                    <span className="rounded-full bg-[#EEF2FF] px-2.5 py-1 text-xs font-semibold text-[#4F46E5]">
                      {commentsData?.results?.length || 0}
                    </span>
                  </div>

                  <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                    {commentsData?.results?.map((c) => (
                      <div key={c.id} className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-3">
                        <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-xs font-bold uppercase text-[#4F46E5]">
                          {(c.author || "U").slice(0, 2)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-[#111827]">{c.author}</p>
                            <span className="text-xs text-[#6B7280]">now</span>
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-[#374151]">{c.content}</p>

                          {c.author === user?.username && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const text = prompt("Edit comment", c.content);
                                  if (text) {
                                    updateCommentMutation.mutate({
                                      postId: selectedPost.id,
                                      commentId: c.id,
                                      content: text,
                                    });
                                  }
                                }}
                                className="rounded-md bg-[#4F46E5] px-2.5 py-1 text-xs font-medium text-white transition-colors duration-200 hover:bg-[#4338CA]"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteCommentMutation.mutate({
                                    postId: selectedPost.id,
                                    commentId: c.id,
                                  });
                                }}
                                className="rounded-md bg-[#EF4444] px-2.5 py-1 text-xs font-medium text-white transition-colors duration-200 hover:bg-[#DC2626]"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="sticky bottom-0 flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-2">
                    <input
                      placeholder={`Send a message in "${selectedPost.title}"`}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full border-0 bg-transparent px-2 py-1 text-sm text-[#374151] placeholder:text-[#6B7280] focus:outline-none focus:ring-0"
                    />
                    <button
                      onClick={() => {
                        if (!commentText) {
                          alert("Comment cannot be empty ⚠️");
                          return;
                        }
                        createCommentMutation.mutate({
                          postId: selectedPost.id,
                          content: commentText,
                        });
                      }}
                      className="rounded-lg bg-[#4F46E5] px-3 py-2 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#4338CA]"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default GroupDetail;