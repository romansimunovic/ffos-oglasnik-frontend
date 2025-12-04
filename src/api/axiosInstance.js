import axios from "axios";

// 🔍 Koristi environment varijablu sa fallback-om
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

console.log("📡 API URL:", apiUrl);

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true // VAŽNO za cookies i CORS
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
    } else if (error.response?.status === 403) {
      console.error("❌ 403 - Nemaš dozvolu za ovaj zahtjev!");
    } else if (error.message === "Network Error") {
      console.error("❌ Network Error - Backend nije dostupan!");
      console.error("API URL:", apiUrl);
    }
    return Promise.reject(error);
  }
);

export default api;