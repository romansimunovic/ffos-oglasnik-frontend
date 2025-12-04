import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosInstance";
import { useToast } from "../components/Toast";
import { useAuth } from "../context/AuthContext";

const DOMAIN = "@ffos.hr";

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useAuth();
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
        login(user, token);
        toast("Prijava uspješna! Preusmjeravanje...", "success");

        setTimeout(() => {
  navigate(user.uloga === "admin" ? "/admin" : "/welcome");
}, 1000);

      } else {
        throw new Error("Nema tokena ili korisnika u odgovoru.");
      }
    } catch (err) {
      const status = err.response?.status;
      const message =
        err.response?.data?.message || "Greška pri prijavi.";

      if (status === 403) {
        // korisnik nije verificiran
        toast(message, "error");
        // ovdje bi ga mogao i preusmjeriti na registraciju/verify ako želiš
        // navigate("/registracija", { state: { email: form.email, fromLogin: true } });
      } else {
        toast(message, "error");
      }

      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-bg">
      <div
        className="flex items-center justify-center"
        style={{ minHeight: "70vh" }}
      >
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
