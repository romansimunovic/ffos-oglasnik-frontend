import { useState } from "react";
import api from "../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { useAccessibility } from "../context/AccessibilityContext";

const DOMAIN = "@ffos.hr";

const passwordStrength = (pwd, t) => {
  let score = 0;
  if (!pwd) return { score, label: t("tooWeak") || "Preslabo" };
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  const labels = [
    t("tooWeak") || "Preslabo",
    t("weak") || "Slabo",
    t("medium") || "Umjereno",
    t("strong") || "Jako",
    t("veryStrong") || "Vrlo jako"
  ];
  return { score, label: labels[Math.min(score, labels.length - 1)] };
};

export default function Registracija() {
  const { t } = useAccessibility();
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
      setMsg(t("fillRequired") || "Popuni obavezna polja.");
      return;
    }
    if (!form.email.endsWith(DOMAIN)) {
      setMsg(t("domainOnly") || `Registracija moguća samo s ${DOMAIN} mailom.`);
      return;
    }
    if (form.lozinka !== form.potvrdaLozinke) {
      setMsg(t("passwordsNoMatch") || "Lozinke se ne podudaraju.");
      return;
    }
    const regExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regExp.test(form.lozinka)) {
      setMsg(t("passwordRequirements") || "Lozinka mora imati najmanje 8 znakova, jedno malo i jedno veliko slovo te broj.");
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
      setMsg(err.response?.data?.message || t("registrationError") || "Greška pri registraciji.");
    }
    setLoading(false);
  };

  const strength = passwordStrength(form.lozinka, t);

  return (
    <div className="flex justify-center items-center py-20">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded p-8 w-96">
        <h2 className="text-2xl font-semibold mb-6 text-center">{t("registration") || "Registracija"}</h2>
        <label className="block mb-2">{t("name") || "Ime"}</label>
        <input name="ime" value={form.ime} onChange={handleChange} className="border rounded w-full mb-4 p-2" required />
        <label className="block mb-2">{t("surname") || "Prezime"}</label>
        <input name="prezime" value={form.prezime} onChange={handleChange} className="border rounded w-full mb-4 p-2" />
        <label className="block mb-2">Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} className="border rounded w-full mb-4 p-2" required />
        <p className="text-xs text-gray-500 mb-3">{t("mustUseDomain") || `Morate koristiti ${DOMAIN} email.`}</p>
        <label className="block mb-2 flex items-center justify-between">
          <span>{t("password") || "Lozinka"}</span>
          <span className="text-xs text-gray-500">{t("strength") || "Snaga"}: <strong>{strength.label}</strong></span>
        </label>
        <input type="password" name="lozinka" value={form.lozinka} onChange={handleChange} className="border rounded w-full mb-2 p-2" required />
        <div className="h-2 w-full bg-gray-200 rounded mb-4">
          <div style={{ width: `${(strength.score/4)*100}%` }} className="h-2 rounded bg-green-500 transition-all"></div>
        </div>
        <label className="block mb-2">{t("repeatPassword") || "Ponovi lozinku"}</label>
        <input type="password" name="potvrdaLozinke" value={form.potvrdaLozinke} onChange={handleChange} className="border rounded w-full mb-6 p-2" required />
        {msg && <p className="text-red-600 text-sm mb-3 text-center">{msg}</p>}
        <button type="submit" className="w-full bg-[#b41f24] hover:bg-[#a11c20] text-white py-2 rounded" disabled={loading}>
          {loading ? t("creating") || "Kreiranje..." : t("createProfile") || "Kreiraj profil"}
        </button>
        <p className="text-sm mt-4 text-center">
          {t("alreadyHaveProfile") || "Već imaš profil?"}{" "}
          <Link to="/login" className="font-semibold text-[#b41f24]">{t("login") || "Prijavi se!"}</Link>
        </p>
      </form>
    </div>
  );
}
