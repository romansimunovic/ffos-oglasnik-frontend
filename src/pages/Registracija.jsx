import { useState } from "react";
import api from "../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";

const DOMAIN = "@ffos.hr";

const passwordStrength = (pwd) => {
  let score = 0;
  if (!pwd) return { score, label: "Preslabo" };
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  // optional: symbols not required, so no score for them
  const labels = ["Preslabo", "Slabo", "Umjereno", "Jako", "Vrlo jako"];
  return { score, label: labels[Math.min(score, labels.length - 1)] };
};

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

    // domena check
    if (!form.email.endsWith(DOMAIN)) {
      setMsg(`Registracija moguća samo s ${DOMAIN} mailom.`);
      return;
    }

    // lozinke
    if (form.lozinka !== form.potvrdaLozinke) {
      setMsg("Lozinke se ne podudaraju.");
      return;
    }

    // client-side password policy (isti kao server)
    const regExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regExp.test(form.lozinka)) {
      setMsg("Lozinka mora imati najmanje 8 znakova, jedno malo i jedno veliko slovo te broj.");
      return;
    }

    setLoading(true);
    try {
      // register -> server vraća token + user
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
      console.error("Registracija error:", err.response?.data || err);
      setMsg(err.response?.data?.message || "Greška pri registraciji.");
    }
    setLoading(false);
  };

  const strength = passwordStrength(form.lozinka);

  return (
    <div className="flex justify-center items-center py-20">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded p-8 w-96">
        <h2 className="text-2xl font-semibold mb-6 text-center">Registracija</h2>

        <label className="block mb-2">Ime</label>
        <input name="ime" value={form.ime} onChange={handleChange} className="border rounded w-full mb-4 p-2" required />

        <label className="block mb-2">Prezime</label>
        <input name="prezime" value={form.prezime} onChange={handleChange} className="border rounded w-full mb-4 p-2" />

        <label className="block mb-2">Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} className="border rounded w-full mb-4 p-2" required />
        <p className="text-xs text-gray-500 mb-3">Morate koristiti {DOMAIN} email.</p>

        <label className="block mb-2 flex items-center justify-between">
          <span>Lozinka</span>
          <span className="text-xs text-gray-500">Snaga: <strong>{strength.label}</strong></span>
        </label>
        <input type="password" name="lozinka" value={form.lozinka} onChange={handleChange} className="border rounded w-full mb-2 p-2" required />
        <div className="h-2 w-full bg-gray-200 rounded mb-4">
          <div style={{ width: `${(strength.score/4)*100}%` }} className="h-2 rounded bg-green-500 transition-all"></div>
        </div>

        <label className="block mb-2">Ponovi lozinku</label>
        <input type="password" name="potvrdaLozinke" value={form.potvrdaLozinke} onChange={handleChange} className="border rounded w-full mb-6 p-2" required />

        {msg && <p className="text-red-600 text-sm mb-3 text-center">{msg}</p>}

        <button type="submit" className="w-full bg-[#b41f24] hover:bg-[#a11c20] text-white py-2 rounded" disabled={loading}>
          {loading ? "Kreiranje..." : "Kreiraj profil"}
        </button>

        <p className="text-sm mt-4 text-center">
          Već imaš profil? <Link to="/login" className="font-semibold text-[#b41f24]">Prijavi se!</Link>
        </p>
      </form>
    </div>
  );
}
