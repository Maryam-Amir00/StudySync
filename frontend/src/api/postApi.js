import axiosInstance from "./axios";

export const fetchPosts = async (groupId) => {
  const response = await axiosInstance.get("/posts/", {
    params: { group: groupId },
  });
  return response.data;
};

export const createPost = async (postData) => {
  const response = await axiosInstance.post("/posts/", postData);
  return response.data;
};

export const deletePost = async (postId) => {
  await axiosInstance.delete(`/posts/${postId}/`);
};

export const updatePost = async ({ id, data }) => {
  const response = await axiosInstance.put(`/posts/${id}/`, data);
  return response.data;
};