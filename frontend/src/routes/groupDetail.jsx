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

  const [selectedPostId, setSelectedPostId] = useState(null);
  const [commentText, setCommentText] = useState("");

  // 🔥 POSTS
  const { data, isLoading } = useQuery({
    queryKey: ["posts", groupId],
    queryFn: () => fetchPosts(groupId),
  });

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

  if (isLoading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Group Posts</h2>

      {/* 🔥 CREATE POST */}
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
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
      >
        Add Post
      </button>

      {/* 🔥 POSTS */}
      {data?.results?.map((post) => (
        <div
          key={post.id}
          style={{
            border: "1px solid gray",
            marginTop: 10,
            padding: 10,
          }}
        >
          {/* 🔥 CLICKABLE AREA ONLY */}
          <div
            onClick={() =>
              setSelectedPostId(
                selectedPostId === post.id ? null : post.id
              )
            }
            style={{ cursor: "pointer" }}
          >
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <p>👤 {post.author}</p>
          </div>

          {/* 🔥 AUTHOR ACTIONS */}
          {post.author === user?.username && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const t = prompt("Edit title", post.title);
                  const c = prompt("Edit content", post.content);

                  if (t && c) {
                    updateMutation.mutate({
                      id: post.id,
                      data: {
                        title: t,
                        content: c,
                        group: Number(groupId),
                      },
                    });
                  }
                }}
              >
                Edit
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const confirmDelete = window.confirm(
                    "Delete this post?"
                  );
                  if (confirmDelete) {
                    deleteMutation.mutate(post.id);
                  }
                }}
              >
                Delete
              </button>
            </>
          )}

          {/* 🔥 COMMENTS */}
          {selectedPostId === post.id && (
            <div
              style={{ marginTop: 10, paddingLeft: 10 }}
              onClick={(e) => e.stopPropagation()} // ✅ FIX
            >
              <h4>Comments</h4>

              {/* CREATE COMMENT */}
              <input
                placeholder="Write comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onClick={(e) => e.stopPropagation()} // ✅ FIX
              />

              <button
                onClick={(e) => {
                  e.stopPropagation(); // ✅ FIX

                  if (!commentText) {
                    alert("Comment cannot be empty ⚠️");
                    return;
                  }

                  createCommentMutation.mutate({
                    postId: post.id,
                    content: commentText,
                  });
                }}
              >
                Add
              </button>

              {/* COMMENTS LIST */}
              {commentsData?.results?.map((c) => (
                <div key={c.id}>
                  <p>{c.content}</p>
                  <small>{c.author}</small>

                  {c.author === user?.username && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const text = prompt(
                            "Edit comment",
                            c.content
                          );
                          if (text) {
                            updateCommentMutation.mutate({
                              postId: post.id,
                              commentId: c.id,
                              content: text,
                            });
                          }
                        }}
                      >
                        Edit
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCommentMutation.mutate({
                            postId: post.id,
                            commentId: c.id,
                          });
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GroupDetail;