import axios from "./axios";

const AUTH_ENDPOINTS = {
  LOGIN: "accounts/login/",
  REGISTER: "accounts/register/",
};

const postRequest = async (url, data) => {
  const response = await axios.post(url, data);
  return response.data;
};

export const loginUser = async (data) => {
  try {
    return await postRequest(AUTH_ENDPOINTS.LOGIN, data);
  } catch (error) {
    throw error.response?.data || "Login failed";
  }
};

export const registerUser = async (data) => {
  try {
    return await postRequest(AUTH_ENDPOINTS.REGISTER, data);
  } catch (error) {
    throw error.response?.data || "Registration failed";
  }
};