import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true, // always send cookies
});

// ✅ Attach localStorage token to every request as Bearer header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" 
      ? localStorage.getItem("authToken") 
      : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ If 401, clear bad token
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
