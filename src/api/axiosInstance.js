// src/api/axiosInstance.js
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: apiUrl,
});

// svaki request uzme token iz localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// response interceptor – NE briše token automatski
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ 401 odgovor backend-a:", error.response.data);
      // ovdje samo log, bez automatskog logouta
    }
    return Promise.reject(error);
  }
);

export default api;
