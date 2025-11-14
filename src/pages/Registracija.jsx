import { useState } from "react";
import api from "../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    // Validacija lozinke
    if (form.lozinka !== form.potvrdaLozinke) {
      setMsg("Lozinke se ne podudaraju.");
      return;
    }

    const regExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regExp.test(form.lozinka)) {
      setMsg(
        "Lozinka mora imati najmanje 8 znakova, jedno malo slovo, jedno veliko slovo i jedan broj."
      );
      return;
    }

    setLoading(true);
    try {
      // API poziv za registraciju
      await api.post("/auth/register", {
        ime: form.ime,
        email: form.email,
        lozinka: form.lozinka,
        uloga: "student",
      });

      // automatski login odmah nakon registracije
      const { data } = await api.post("/auth/login", {
        email: form.email,
        lozinka: form.lozinka,
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Preusmjeri korisnika na stranicu Profil
      navigate("/profil");
    } catch (err) {
      setMsg(
        err.response?.data?.message ||
          "Greška pri registraciji ili automatskoj prijavi."
      );
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center py-20">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded p-8 w-96"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Registracija
        </h2>
        <label className="block mb-2">Ime</label>
        <input
          type="text"
          name="ime"
          value={form.ime}
          onChange={handleChange}
          className="border rounded w-full mb-4 p-2"
          required
        />

        <label className="block mb-2">Prezime</label>
        <input
          type="text"
          name="prezime"
          value={form.prezime}
          onChange={handleChange}
          className="border rounded w-full mb-4 p-2"
          required
        />

        <label className="block mb-2">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="border rounded w-full mb-4 p-2"
          required
        />

        <label className="block mb-2">Lozinka</label>
        <input
          type="password"
          name="lozinka"
          value={form.lozinka}
          onChange={handleChange}
          className="border rounded w-full mb-6 p-2"
          required
        />

        <label className="block mb-2">Ponovi lozinku</label>
        <input
          type="password"
          name="potvrdaLozinke"
          value={form.potvrdaLozinke}
          onChange={handleChange}
          className="border rounded w-full mb-6 p-2"
          required
        />

        {msg && (
          <p className="text-red-600 text-sm mb-3 text-center">{msg}</p>
        )}

        <button
          type="submit"
          className="w-full bg-[#b41f24] hover:bg-[#a11c20] text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? "Kreiranje..." : "Kreiraj profil"}
        </button>

        <p className="text-sm mt-4 text-center">
          Već imaš profil?{" "}
          <Link to="/login" className="font-semibold text-[#b41f24]">
            Prijavi se!
          </Link>
        </p>
      </form>
    </div>
  );
}
