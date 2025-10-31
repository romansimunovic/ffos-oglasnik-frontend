import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

export default function Login() {
  const [email, setEmail] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const { data } = await api.post("/auth/login", { email, lozinka });

      // Spremi token i korisnika
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setMsg("Prijava uspješna.");

      // Preusmjeri ovisno o ulozi
      setTimeout(() => {
        if (data.user.uloga === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 1000);

    } catch (err) {
      setMsg(err.response?.data?.message || "Greška pri prijavi.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-[#b41f24] mb-6">
          Prijava
        </h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            className="border border-gray-300 w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#b41f24]"
            placeholder="email@ffos.hr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="border border-gray-300 w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#b41f24]"
            placeholder="Lozinka"
            type="password"
            value={lozinka}
            onChange={(e) => setLozinka(e.target.value)}
          />
          <button
            type="submit"
            className="bg-[#b41f24] hover:bg-[#a11c20] text-white font-semibold w-full py-2 rounded transition"
          >
            Prijavi se
          </button>
        </form>
        {msg && (
          <p
            className={`mt-4 text-center text-sm ${
              msg.includes("uspješna") ? "text-green-600" : "text-red-600"
            }`}
          >
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}
