import { useState } from "react";
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.lozinka !== form.potvrdaLozinke) {
      alert("Lozinke se ne podudaraju.");
      return;
    }

    // lozinka minimalno 8 znakova
    // mora sadržavati barem 1 veliko, 1 malo slovo, 1 broj
    const regExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regExp.test(form.lozinka)) {
      alert(
        "Lozinka mora imati najmanje 8 znakova, jedno malo slovo, jedno veliko slovo i jedan broj."
      );
      return;
    }

    // kasnije cemo ovdje raditi slanje na backend
    // za sada samo simulacija i redirect
    alert("Profil kreiran! Sada se možete prijaviti.");
    navigate("/login");
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

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          Kreiraj profil
        </button>

        <p className="text-sm mt-4 text-center">
          Već imaš profil?{" "}
          <Link to="/login" className="font-semibold text-blue-600">
            Prijavi se!
          </Link>
        </p>
      </form>
    </div>
  );
}
