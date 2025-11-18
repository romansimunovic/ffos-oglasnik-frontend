import { useState } from "react";
import api from "../api/axiosInstance";
import { ODSJECI } from "../constants/odsjeci";

export default function NovaObjava({ closeForm }) {
  const [naslov, setNaslov] = useState("");
  const [sadrzaj, setSadrzaj] = useState("");
  const [tip, setTip] = useState("radionice");
  const [odsjek, setOdsjek] = useState("");
  const [msg, setMsg] = useState("");
  const [greske, setGreske] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const novaGreske = {};
    if (!naslov.trim()) novaGreske.naslov = "Naslov je obavezan.";
    if (!sadrzaj.trim()) novaGreske.sadrzaj = "Sadržaj je obavezan.";
    if (!tip) novaGreske.tip = "Odaberite tip objave.";
    if (!odsjek) novaGreske.odsjek = "Odaberite odsjek.";
    setGreske(novaGreske);

    if (Object.keys(novaGreske).length > 0) return;

    setLoading(true);
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
      window.dispatchEvent(new Event("refreshObjave"));
      setTimeout(() => {
        setMsg("");
        if (closeForm) closeForm();
      }, 1200);
    } catch (err) {
      setMsg(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Greška pri slanju objave."
      );
    }
    setLoading(false);
  };

  return (
    <div className="relative max-w-lg mx-auto bg-white shadow-md p-6 mt-4 rounded">
      <h2 className="text-xl font-semibold text-[#b41f24] mb-4 text-center">Nova objava</h2>
      {/* Zatvori/close gumb gore desno */}
      {closeForm &&
        <button
          type="button"
          onClick={closeForm}
          className="absolute top-3 right-4 text-gray-500 hover:text-gray-900 text-xl font-bold"
          aria-label="Zatvori"
        >
          ×
        </button>
      }
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={naslov}
          onChange={e => setNaslov(e.target.value)}
          placeholder="Naslov"
          className="border w-full p-2 rounded"
          required
          disabled={loading}
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
          disabled={loading}
        />
        {greske.sadrzaj && (
          <p className="text-red-600 text-xs">{greske.sadrzaj}</p>
        )}
        <select
          value={tip}
          onChange={e => setTip(e.target.value)}
          className="border w-full p-2 rounded"
          required
          disabled={loading}
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
          disabled={loading}
        >
          <option value="">Odaberite odsjek</option>
          {ODSJECI.map(o => (
            <option value={o.id} key={o.id}>{o.naziv}</option>
          ))}
        </select>
        {greske.odsjek && (
          <p className="text-red-600 text-xs">{greske.odsjek}</p>
        )}
        <button
          className={`bg-[#b41f24] text-white px-4 py-2 rounded w-full transition ${loading ? "opacity-75 cursor-not-allowed" : ""}`}
          disabled={loading}
        >
          Pošalji
        </button>
      </form>
      {msg && <p className="mt-3 text-center text-sm">{msg}</p>}
    </div>
  );
}
