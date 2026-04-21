import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { fetchPosts } from "../api/postApi";

const MyPosts = () => {
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  // ✅ Loading
  if (isLoading) return <p>Loading...</p>;

  // ✅ Error
  if (isError) return <p>Something went wrong...</p>;

  // ✅ User check
  if (!user) return <p>Loading user...</p>;

  // ✅ Handle API structure safely
  const postsArray = Array.isArray(data)
    ? data
    : data?.results || [];

  // ✅ Filter only MY posts
  const myPosts = postsArray.filter(
    (post) => post.user === user.id
  );

  return (
    <div>
      <h2>My Posts</h2>

      {myPosts.length === 0 ? (
        <p>No posts yet</p>
      ) : (
        myPosts.map((post) => (
          <div key={post.id}>
            <p>{post.content}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default MyPosts;