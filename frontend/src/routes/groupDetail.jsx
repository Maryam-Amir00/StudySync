import { useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axios";

const GroupDetail = () => {
    const params = useParams({ from: "/groups/$groupId" });
    const groupId = params.groupId;

  const { data, isLoading } = useQuery({
    queryKey: ["posts", groupId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/posts/?group=${groupId}`);
      return res.data;
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Group Posts</h2>

      {data.results.length === 0 ? (
        <p>No posts</p>
      ) : (
        data.results.map((post) => (
          <div key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <p>{post.author}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default GroupDetail;