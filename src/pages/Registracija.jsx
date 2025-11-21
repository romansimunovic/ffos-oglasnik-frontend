import { useState } from "react";
import api from "../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";

const DOMAIN = "@ffos.hr";

function passwordStrength(pwd) {
  let score = 0;
  if (!pwd) return { score, label: "Preslabo" };
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  const labels = ["Preslabo", "Slabo", "Umjereno", "Jako", "Vrlo jako"];
  return { score, label: labels[Math.min(score, labels.length - 1)] };
}

export default function Registracija() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    ime: "",
    prezime: "",
    email: "",
    lozinka: "",
    potvrdaLozinke: "",
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!form.ime || !form.email || !form.lozinka) {
      setMsg("Popuni obavezna polja.");
      return;
    }
    if (!form.email.endsWith(DOMAIN)) {
      setMsg(`Registracija moguća samo s ${DOMAIN} emailom.`);
      return;
    }
    if (form.lozinka !== form.potvrdaLozinke) {
      setMsg("Lozinke se ne podudaraju.");
      return;
    }
    const regExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regExp.test(form.lozinka)) {
      setMsg("Lozinka mora imati najmanje 8 znakova, jedno malo i jedno veliko slovo te broj.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        ime: `${form.ime} ${form.prezime}`.trim(),
        email: form.email,
        lozinka: form.lozinka,
        uloga: "user"
      });
      const { token, user } = res.data;
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
      navigate("/profil");
    } catch (err) {
      setMsg(err.response?.data?.message || "Greška pri registraciji.");
    }
    setLoading(false);
  };

  const strength = passwordStrength(form.lozinka);

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
            background: "var(--ffos-light-card)",
            boxShadow: "0 4px 18px rgba(40,30,50,0.16)"
          }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-center" style={{ color: "var(--ffos-red)" }}>Registracija</h2>
          <label className="block mb-2">Ime</label>
          <input
            name="ime"
            autoFocus
            value={form.ime}
            onChange={handleChange}
            className="form-input mb-4"
            required
          />
          <label className="block mb-2">Prezime</label>
          <input
            name="prezime"
            value={form.prezime}
            onChange={handleChange}
            className="form-input mb-4"
          />
          <label className="block mb-2">E-mail</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="form-input mb-2"
            required
          />
          <p className="text-xs text-gray-500 mb-3">Morate koristiti {DOMAIN} email.</p>
          <label className="block mb-2 flex items-center justify-between">
            <span>Lozinka</span>
            <span className="text-xs text-gray-500">Snaga: <strong>{strength.label}</strong></span>
          </label>
          <input
            type="password"
            name="lozinka"
            value={form.lozinka}
            onChange={handleChange}
            className="form-input mb-2"
            required
          />
          <div className="h-2 w-full bg-gray-200 rounded mb-4">
            <div
              style={{
                width: `${(strength.score / 4) * 100}%`,
                background: strength.score < 2 ? "#e21a1a" : strength.score < 4 ? "#f6af24" : "#23cb63"
              }}
              className="h-2 rounded transition-all"
            ></div>
          </div>
          <label className="block mb-2">Ponovi lozinku</label>
          <input
            type="password"
            name="potvrdaLozinke"
            value={form.potvrdaLozinke}
            onChange={handleChange}
            className="form-input mb-4"
            required
          />
          {msg && <p className="text-red-600 text-sm mb-3 text-center">{msg}</p>}
          <button
            type="submit"
            className="form-submit"
            disabled={loading}
            style={{ marginTop: 8, marginBottom: 3 }}
          >
            {loading ? "Kreiranje..." : "Kreiraj profil"}
          </button>
          <p className="text-sm mt-4 text-center">
            Već imaš profil?{" "}
            <Link to="/login" className="font-semibold" style={{ color: "var(--ffos-red)" }}>
              Prijavi se!
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
