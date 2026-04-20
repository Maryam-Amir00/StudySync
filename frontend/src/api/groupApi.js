import axiosInstance from "./axios";

// 1. Get all groups
export const fetchGroups = async (search = "") => {
    let url = "/groups/";
  
    if (typeof search === "string" && search.trim() !== "") {
      url += `?search=${search}`;
    }
  
    const response = await axiosInstance.get(url);
    return response.data;
  };

// 2. Create group
export const createGroup = async (data) => {
  const response = await axiosInstance.post("/groups/", data);
  return response.data;
};

// 3. Join group
export const joinGroup = async (groupId) => {
  const response = await axiosInstance.post(`/groups/${groupId}/join/`);
  return response.data;
};

// 4. Leave group
export const leaveGroup = async (groupId) => {
  const response = await axiosInstance.post(`/groups/${groupId}/leave/`);
  return response.data;
};