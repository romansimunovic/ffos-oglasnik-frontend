import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Prilagodi ako trebas
});

// ✅ INTERCEPTOR - Dodaj token u SVE zahtjeve
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token dodan u header:", token.substring(0, 20) + "...");
    } else {
      console.warn("⚠️ Nema tokena u localStorage");
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ ERROR INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("❌ 401 - Token nije validan!");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
