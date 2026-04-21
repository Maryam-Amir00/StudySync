import axios from "axios";

const ACCESS_TOKEN = "access";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  const url = config.url || "";

  if (
    token &&
    !url.endsWith("/login/") &&
    !url.endsWith("/register/")
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstance;