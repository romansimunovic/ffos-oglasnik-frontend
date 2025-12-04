import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosInstance";
import { useToast } from "../components/Toast";

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
  const toast = useToast();

  const [form, setForm] = useState({
    ime: "",
    prezime: "",
    email: "",
    lozinka: "",
    potvrdaLozinke: "",
  });

  const [loading, setLoading] = useState(false);

  // "form" = ekran za unos podataka, "verify" = ekran za unos koda
  const [step, setStep] = useState("form");
  const [pendingEmail, setPendingEmail] = useState("");
  const [code, setCode] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.ime || !form.email || !form.lozinka) {
      return toast("Popuni obavezna polja.", "error");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return toast("Unesite valjanu email adresu.", "error");
    }

    if (!form.email.endsWith(DOMAIN)) {
      return toast(`Registracija moguća samo s ${DOMAIN} emailom.`, "error");
    }

    if (form.lozinka !== form.potvrdaLozinke) {
      return toast("Lozinke se ne podudaraju.", "error");
    }

    const regExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regExp.test(form.lozinka)) {
      return toast(
        "Lozinka mora imati najmanje 8 znakova, jedno malo i jedno veliko slovo te broj.",
        "error"
      );
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        ime: `${form.ime} ${form.prezime}`.trim(),
        email: form.email,
        lozinka: form.lozinka,
        uloga: "user",
      });

      toast(
        res.data?.message ||
          "Korisnik kreiran. Provjerite e-mail i unesite verifikacijski kod.",
        "success"
      );

      // spremi email za verifikacijski korak
      setPendingEmail(form.email);
      setStep("verify");

      // ako na backendu privremeno vraćaš devCode, možeš ga ovdje pokazati:
      // console.log("DEV CODE:", res.data?.devCode);
    } catch (err) {
      toast(err.response?.data?.message || "Greška pri registraciji.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!code) return toast("Unesite verifikacijski kod.", "error");
    if (!pendingEmail)
      return toast("Nedostaje email za verifikaciju. Pokušajte ponovo.", "error");

    setLoading(true);
    try {
      const res = await api.post("/auth/verify", {
        email: pendingEmail,
        code,
      });

      const { token, user } = res.data;

      if (token && user) {
        // ako koristiš AuthContext, ovdje možeš pozvati login(user, token)
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      toast("Email verificiran! Preusmjeravanje...", "success");
      setTimeout(() => navigate("/profil"), 1000);
    } catch (err) {
      toast(
        err.response?.data?.message || "Greška pri verifikaciji kodom.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength(form.lozinka);

  return (
    <section className="page-bg">
      <div
        className="flex items-center justify-center"
        style={{ minHeight: "70vh" }}
      >
        {step === "form" ? (
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
              Registracija
            </h2>

            <label className="form-label" htmlFor="ime">
              Ime
            </label>
            <input
              id="ime"
              name="ime"
              autoFocus
              value={form.ime}
              onChange={handleChange}
              className="form-input"
              placeholder="Unesi ime..."
              required
            />

            <label className="form-label" htmlFor="prezime">
              Prezime
            </label>
            <input
              id="prezime"
              name="prezime"
              value={form.prezime}
              onChange={handleChange}
              className="form-input"
              placeholder="Unesi prezime..."
            />

            <label className="form-label" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              name="email"
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

            <label
              className="form-label flex items-center justify-between"
              htmlFor="lozinka"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <span>Lozinka</span>
              <span className="text-xs" style={{ color: "var(--ffos-red)" }}>
                Snaga: <strong>{strength.label}</strong>
              </span>
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

            <div
              className="h-2 w-full rounded mb-3"
              style={{ background: "#454654" }}
            >
              <div
                style={{
                  width: `${(strength.score / 4) * 100}%`,
                  height: "100%",
                  borderRadius: "5px",
                  background:
                    strength.score < 2
                      ? "#e21a1a"
                      : strength.score < 4
                      ? "#f6af24"
                      : "#23cb63",
                  transition: "all 0.13s",
                }}
              ></div>
            </div>

            <label className="form-label" htmlFor="potvrdaLozinke">
              Ponovi lozinku
            </label>
            <input
              id="potvrdaLozinke"
              type="password"
              name="potvrdaLozinke"
              value={form.potvrdaLozinke}
              onChange={handleChange}
              className="form-input"
              required
            />

            <button type="submit" className="form-submit" disabled={loading}>
              {loading ? "Kreiranje..." : "Kreiraj profil"}
            </button>

            <p className="text-sm mt-4 text-center">
              Već imaš profil?{" "}
              <Link
                to="/login"
                className="form-link"
                style={{ fontWeight: 700, color: "var(--ffos-red)" }}
              >
                Prijavi se!
              </Link>
            </p>
          </form>
        ) : (
          <form
            onSubmit={handleVerify}
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
              Potvrda emaila
            </h2>

            <p className="text-sm mb-3">
              Poslali smo verifikacijski kod na{" "}
              <strong>{pendingEmail}</strong>. Unesite ga ispod.
            </p>

            <label className="form-label" htmlFor="code">
              Verifikacijski kod
            </label>
            <input
              id="code"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="form-input"
              placeholder="npr. 123456"
              required
            />

            <button type="submit" className="form-submit" disabled={loading}>
              {loading ? "Provjera..." : "Potvrdi email"}
            </button>

            <p className="text-sm mt-4 text-center">
              Pogrešan email?{" "}
              <button
                type="button"
                onClick={() => setStep("form")}
                className="form-link"
                style={{ fontWeight: 700, color: "var(--ffos-red)", border: "none", background: "transparent", cursor: "pointer" }}
              >
                Vrati se na registraciju
              </button>
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
