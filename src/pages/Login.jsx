// src/pages/Login.jsx
import { useState } from "react";
import api from "../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../components/Toast";
import { useAuth } from "../context/AuthContext"; // ✅ NOVO

const DOMAIN = "@ffos.hr";

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useAuth(); // ✅ NOVO - koristi context login
  const [form, setForm] = useState({ email: "", lozinka: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.lozinka) {
      return toast("Popuni sva polja.", "error");
    }

    // Email validacija
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return toast("Unesite valjanu email adresu.", "error");
    }

    if (!form.email.endsWith(DOMAIN)) {
      return toast(`Prijava moguća samo s ${DOMAIN} emailom.`, "error");
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email: form.email,
        lozinka: form.lozinka,
      });

      const { token, user } = res.data;

      if (token && user) {
        // ✅ Koristi context login umjesto manualnog spremanja
        login(user, token);

        toast("Prijava uspješna! Preusmjeravanje...", "success");

        // Navigiraj na odgovarajuću stranicu
        setTimeout(() => {
          navigate(user.uloga === "admin" ? "/admin" : "/profil");
        }, 1000);
      } else {
        throw new Error("Nema tokena ili korisnika u odgovoru.");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast(err.response?.data?.message || "Greška pri prijavi.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-bg">
      <div className="flex items-center justify-center" style={{ minHeight: "70vh" }}>
        <form
          onSubmit={handleSubmit}
          className="card"
          style={{
            maxWidth: 370,
            width: "100%",
            margin: "auto",
            boxShadow: "0 4px 18px rgba(40,30,50,0.16)",
          }}
        >
          <h2
            className="form-label"
            style={{
              fontSize: "1.6rem",
              marginBottom: "1.5rem",
              color: "var(--ffos-red)",
              textAlign: "center",
            }}
          >
            Prijava
          </h2>

          <label className="form-label" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            name="email"
            autoFocus
            value={form.email}
            onChange={handleChange}
            className="form-input"
            placeholder="npr. ime.prezime@ffos.hr"
            required
          />
          <p
            className="text-xs"
            style={{ color: "var(--ffos-red)", marginBottom: "0.8rem" }}
          >
            Morate koristiti {DOMAIN} email.
          </p>

          <label className="form-label" htmlFor="lozinka">
            Lozinka
          </label>
          <input
            id="lozinka"
            type="password"
            name="lozinka"
            value={form.lozinka}
            onChange={handleChange}
            className="form-input"
            required
          />

          <button type="submit" className="form-submit" disabled={loading}>
            {loading ? "Prijava..." : "Prijavi se"}
          </button>

          <p className="text-sm mt-4 text-center">
            Nemaš profil?{" "}
            <Link
              to="/registracija"
              className="form-link"
              style={{ fontWeight: 700, color: "var(--ffos-red)" }}
            >
              Kreiraj ga!
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
