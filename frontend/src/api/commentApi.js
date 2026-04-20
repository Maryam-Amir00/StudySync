import axiosInstance from "./axios";

export const fetchComments = async (postId) => {
  const res = await axiosInstance.get(`/comments/${postId}/`);
  return res.data;
};

export const createComment = async ({ postId, content }) => {
    const res = await axiosInstance.post(`/comments/${postId}/`, {
      content,
      post: postId, 
    });
    return res.data;
  };

export const deleteComment = async ({ postId, commentId }) => {
  await axiosInstance.delete(`/comments/${postId}/${commentId}/`);
};

export const updateComment = async ({ postId, commentId, content }) => {
  const res = await axiosInstance.put(
    `/comments/${postId}/${commentId}/`,
    { content }
  );
  return res.data;
};