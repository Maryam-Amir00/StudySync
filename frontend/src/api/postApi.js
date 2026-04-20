import axiosInstance from "./axios";


export const fetchPosts = async (groupId) => {
  const response = await axiosInstance.get(`/posts/?group=${groupId}`);
  return response.data;
};