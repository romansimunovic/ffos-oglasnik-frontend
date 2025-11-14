import { useState } from "react";
import api from "../api/axiosInstance";

export default function LoginModal({ open, onClose, onLogin }) {
  const [email, setEmail] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [msg, setMsg] = useState("");

  if (!open) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const { data } = await api.post("/auth/login", { email, lozinka });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setMsg("Prijava uspješna.");
      onLogin(data.user);
      setTimeout(() => {
        setMsg("");
        onClose();
      }, 850);
    } catch (err) {
      setMsg(err.response?.data?.message || "Greška pri prijavi.");
    }
  };

  return (
<div className="fixed inset-0 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl border-2 border-[#b41f24] relative">
      <button
        className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-[#b41f24]"
        onClick={onClose}
      >×</button>
      <h2 className="text-xl font-bold mb-5 text-[#b41f24] text-center">Prijava</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className="border border-gray-300 w-full p-2 rounded"
          placeholder="email@ffos.hr"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border border-gray-300 w-full p-2 rounded"
          placeholder="Lozinka"
          type="password"
          value={lozinka}
          onChange={(e) => setLozinka(e.target.value)}
        />
        <button
          type="submit"
          className="bg-[#b41f24] text-white font-semibold w-full py-2 rounded hover:bg-[#a11c20] transition"
        >
          Prijavi se
        </button>
      </form>
      {msg && (
        <p className={`mt-4 text-center text-sm ${msg.includes("uspješna") ? "text-green-600" : "text-red-600"}`}>{msg}</p>
      )}
      <p className="text-xs text-center mt-4">
        Nemaš profil?{" "}
        <a
          href="/registracija"
          className="font-semibold text-[#b41f24] hover:underline"
          onClick={onClose}
        >
          Kreiraj ga!
        </a>
      </p>
    </div>
  </div>
);
}
