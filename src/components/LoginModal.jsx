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
    <div className="modal-overlay">
      <div className="modal-card">
        <button
          className="modal-close"
          onClick={onClose}
        >×</button>
        <h2 className="modal-title">Prijava</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            className="form-input"
            placeholder="email@ffos.hr"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="form-input"
            placeholder="Lozinka"
            type="password"
            value={lozinka}
            onChange={(e) => setLozinka(e.target.value)}
          />
          <button className="form-submit">Prijavi se</button>
        </form>
        {msg && (
          <p className={`modal-msg ${msg.includes("uspješna") ? "msg-success" : "msg-error"}`}>
            {msg}
          </p>
        )}
        <p className="modal-footer">
          Nemaš profil?{" "}
          <a href="/registracija" className="modal-link" onClick={onClose}>
            Kreiraj ga!
          </a>
        </p>
      </div>
    </div>
  );
}

