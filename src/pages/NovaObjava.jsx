import { useState } from "react";
import api from "../api/axiosInstance";
import { ODSJECI } from "../constants/odsjeci";

export default function NovaObjava() {
  const [naslov, setNaslov] = useState("");
  const [sadrzaj, setSadrzaj] = useState("");
  const [tip, setTip] = useState("radionice");
  const [odsjek, setOdsjek] = useState("");
  const [msg, setMsg] = useState("");
  const [greske, setGreske] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validacija frontend polja
    const novaGreske = {};
    if (!naslov.trim()) novaGreske.naslov = "Naslov je obavezan.";
    if (!sadrzaj.trim()) novaGreske.sadrzaj = "Sadržaj je obavezan.";
    if (!tip) novaGreske.tip = "Odaberite tip objave.";
    if (!odsjek) novaGreske.odsjek = "Odaberite odsjek.";
    setGreske(novaGreske);

    // Ako ima grešaka, prekini slanje
    if (Object.keys(novaGreske).length > 0) return;

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
      setTip("radionice");
      setGreske({});
    } catch (err) {
        setMsg(
    err.response?.data?.error ||
    err.response?.data?.message ||
    "Greška pri slanju objave."
  );
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
        {greske.naslov && (
          <p className="text-red-600 text-xs">{greske.naslov}</p>
        )}
        <textarea
          value={sadrzaj}
          onChange={e => setSadrzaj(e.target.value)}
          placeholder="Sadržaj"
          className="border w-full p-2 rounded"
          required
        />
        {greske.sadrzaj && (
          <p className="text-red-600 text-xs">{greske.sadrzaj}</p>
        )}
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
        {greske.tip && (
          <p className="text-red-600 text-xs">{greske.tip}</p>
        )}
        <select
          value={odsjek}
          onChange={e => setOdsjek(e.target.value)}
          required
          className="border w-full p-2 rounded"
        >
          <option value="">Odaberite odsjek</option>
          {ODSJECI.map(o => (
            <option value={o.naziv} key={o.id}>{o.naziv}</option>
          ))}
        </select>
        {greske.odsjek && (
          <p className="text-red-600 text-xs">{greske.odsjek}</p>
        )}
        <button className="bg-[#b41f24] text-white px-4 py-2 rounded w-full">
          Pošalji
        </button>
      </form>
      {msg && <p className="mt-3 text-center text-sm">{msg}</p>}
    </div>
  );
}
