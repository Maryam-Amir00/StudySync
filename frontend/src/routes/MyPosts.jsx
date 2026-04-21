import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { fetchPosts } from "../api/postApi";

const MyPosts = () => {
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });


  if (isLoading) return <p className="text-[#6B7280]">Loading...</p>;

  if (isError) return <p className="text-[#EF4444]">Something went wrong...</p>;


  if (!user) return <p className="text-[#6B7280]">Loading user...</p>;

  const postsArray = Array.isArray(data)
    ? data
    : data?.results || [];

  const myPosts = postsArray.filter(
    (post) => post.user === user.id
  );

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-[#111827] tracking-tight">My Posts</h2>

      {myPosts.length === 0 ? (
        <p className="text-[#6B7280]">No posts yet</p>
      ) : (
        myPosts.map((post) => (
          <div key={post.id} className="bg-white/90 backdrop-blur-sm border border-[#E5E7EB] rounded-xl shadow-sm p-5">
            <p className="text-[#374151]">{post.content}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default MyPosts;