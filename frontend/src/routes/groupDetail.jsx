import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { fetchPosts } from "../api/postApi";

const GroupDetail = () => {
  const params = useParams({ from: "/groups/$groupId" });
  const groupId = params.groupId;

  const { data, isLoading, error } = useQuery({
    queryKey: ["posts", groupId],
    queryFn: () => fetchPosts(groupId),
  });

  if (isLoading) return <div>Loading posts...</div>;

  if (error) return <div>Error loading posts</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Group Posts</h2>
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
          </div>
        ))
      )}
    </div>
  );
};

export default GroupDetail;