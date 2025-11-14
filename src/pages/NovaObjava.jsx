import { useState } from "react";
import api from "../api/axiosInstance";
import { ODSJECI } from "../constants/odsjeci";

export default function NovaObjava() {
  const [naslov, setNaslov] = useState("");
  const [sadrzaj, setSadrzaj] = useState("");
  const [tip, setTip] = useState("ostalo");
  const [odsjek, setOdsjek] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/objave",
        { naslov, sadrzaj, tip, odsjek },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg("Objava poslana administratorima na odobrenje.");
      setNaslov("");
      setSadrzaj("");
      setOdsjek("");
    } catch (err) {
      setMsg("Greška pri slanju objave.");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow-md p-6 mt-10 rounded">
      <h2 className="text-xl font-semibold text-[#b41f24] mb-4">Nova objava</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={naslov}
          onChange={e => setNaslov(e.target.value)}
          placeholder="Naslov"
          className="border w-full p-2 rounded"
          required
        />
        <textarea
          value={sadrzaj}
          onChange={e => setSadrzaj(e.target.value)}
          placeholder="Sadržaj"
          className="border w-full p-2 rounded"
          required
        />
        <select
          value={tip}
          onChange={e => setTip(e.target.value)}
          className="border w-full p-2 rounded"
          required
        >
          <option value="radionice">Radionice</option>
          <option value="projekti">Projekti</option>
          <option value="natječaji">Natječaji</option>
          <option value="kvizovi">Kvizovi</option>
          <option value="ostalo">Ostalo</option>
        </select>
        <select
  value={odsjek}
  onChange={e => setOdsjek(e.target.value)}
  required
  className="border w-full p-2 rounded"
>
  <option value="">Odaberite odsjek</option>
  {ODSJECI.map(o => (
    <option value={o.id} key={o.id}>{o.naziv}</option>
  ))}
</select>

        <button className="bg-[#b41f24] text-white px-4 py-2 rounded w-full">
          Pošalji
        </button>
      </form>
      {msg && <p className="mt-3 text-center text-sm">{msg}</p>}
    </div>
  );
}
