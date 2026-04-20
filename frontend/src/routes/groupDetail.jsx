import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import {
  fetchPosts,
  createPost,
  deletePost,
  updatePost,
} from "../api/postApi";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const GroupDetail = () => {
  const params = useParams({ from: "/groups/$groupId" });
  const groupId = params.groupId;

  const { user } = useAuth(); 

  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 🔥 FETCH POSTS
  const { data, isLoading, error } = useQuery({
    queryKey: ["posts", groupId],
    queryFn: () => fetchPosts(groupId),
  });

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      alert("Post created successfully 🎉");
      queryClient.invalidateQueries(["posts", groupId]);
      setTitle("");
      setContent("");
    },
    onError: (error) => {
      console.log("ERROR:", error.response?.data);

      alert(
        error.response?.data?.group ||
          error.response?.data?.detail ||
          "Failed to create post ❌"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      alert("Post deleted ✅");
      queryClient.invalidateQueries(["posts", groupId]);
    },
    onError: (error) => {
      alert(error.response?.data?.detail || "Delete failed ❌");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updatePost,
    onSuccess: () => {
      alert("Post updated ✏️");
      queryClient.invalidateQueries(["posts", groupId]);
    },
    onError: () => {
      alert("Update failed ❌");
    },
  });

  if (isLoading) return <div>Loading posts...</div>;
  if (error) return <div>Error loading posts</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Group Posts</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <br />

        <textarea
          placeholder="Post content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <br />

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
      </div>

      {!data?.results?.length ? (
        <p>No posts in this group</p>
      ) : (
        data.results.map((post) => (
          <div
            key={post.id}
            style={{
              border: "1px solid gray",
              padding: 10,
              marginBottom: 10,
            }}
          >
            <h3>{post.title}</h3>
            <p>{post.content}</p>

            <p>👤 {post.author}</p>
            <p>💬 {post.comment_count} comments</p>

            {post.author === user?.username && (
              <>
                <button
                  onClick={() => {
                    const newTitle = prompt("Edit title:", post.title);
                    const newContent = prompt("Edit content:", post.content);

                    if (!newTitle || !newContent) return;

                    updateMutation.mutate({
                      id: post.id,
                      data: {
                        title: newTitle,
                        content: newContent,
                        group: Number(groupId),
                      },
                    });
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={() => {
                    const confirmDelete = window.confirm(
                      "Are you sure you want to delete?"
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
          </div>
        ))
      )}
    </div>
  );
};

export default GroupDetail;