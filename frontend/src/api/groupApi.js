import axiosInstance from "./axios";

export const fetchGroups = async (search = "") => {
    let url = "/groups/";
  
    if (typeof search === "string" && search.trim() !== "") {
      url += `?search=${search}`;
    }
  
    const response = await axiosInstance.get(url);
    return response.data;
  };


export const fetchGroup = async (id) => {
    const response = await axiosInstance.get(`/groups/${id}/`);
    return response.data;
};

export const createGroup = async (data) => {
  const response = await axiosInstance.post("/groups/", data);
  return response.data;
};

export const joinGroup = async (groupId) => {
  const response = await axiosInstance.post(`/groups/${groupId}/join/`);
  return response.data;
};

export const leaveGroup = async (groupId) => {
  const response = await axiosInstance.post(`/groups/${groupId}/leave/`);
  return response.data;
};

export const updateGroup = async ({ id, data }) => {
    const res = await axiosInstance.patch(`/groups/${id}/`, data);
    return res.data;
};