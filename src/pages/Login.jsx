import React, { useState } from "react";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("/auth/login", { email, lozinka });
      const { token, korisnik } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("uloga", korisnik.uloga);

      // ako je admin, idi na admin panel
      if (korisnik.uloga === "admin") {
        navigate("/admin");
      } else {
        navigate("/"); // obični korisnik ide na početnu
      }
    } catch (err) {
      setError("Neispravni podaci za prijavu.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center text-[#b41f24] mb-4">
          Prijava na FFOS Oglasnik
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 text-center py-2 mb-4 rounded">
            {error}
          </div>
        )}

        <label className="block mb-2 text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded w-full px-3 py-2 mb-4"
        />

        <label className="block mb-2 text-sm font-medium">Lozinka</label>
        <input
          type="password"
          value={lozinka}
          onChange={(e) => setLozinka(e.target.value)}
          className="border rounded w-full px-3 py-2 mb-4"
        />

        <button
          type="submit"
          className="bg-[#b41f24] text-white w-full py-2 rounded hover:bg-red-700 transition"
        >
          Prijavi se
        </button>
      </form>
    </div>
  );
}
