import axios from "axios";
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";


const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, // cookies/session ke liye zaroori
});

export default axiosInstance;
