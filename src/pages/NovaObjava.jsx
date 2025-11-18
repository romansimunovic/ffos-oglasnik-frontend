import { useState } from "react";
import api from "../api/axiosInstance";
import { ODSJECI } from "../constants/odsjeci";
import { useAccessibility } from "../context/AccessibilityContext";

export default function NovaObjava({ closeForm }) {
  const { t, lang } = useAccessibility();
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
    if (!naslov.trim()) novaGreske.naslov = t("requiredTitle") || "Naslov je obavezan.";
    if (!sadrzaj.trim()) novaGreske.sadrzaj = t("requiredContent") || "Sadržaj je obavezan.";
    if (!tip) novaGreske.tip = t("requiredType") || "Odaberite tip objave.";
    if (!odsjek) novaGreske.odsjek = t("requiredDepartment") || "Odaberite odsjek.";
    setGreske(novaGreske);

    if (Object.keys(novaGreske).length > 0) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/objave",
        { naslov, sadrzaj, tip, odsjek, originalLang: lang },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg(t("postSubmitted") || "Objava poslana administratorima na odobrenje.");
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
        t("submitError") || "Greška pri slanju objave."
      );
    }
    setLoading(false);
  };

  return (
    <div className="relative max-w-lg mx-auto bg-white shadow-md p-6 mt-4 rounded">
      <h2 className="text-xl font-semibold text-[#b41f24] mb-4 text-center">{t("newPost")}</h2>
      {closeForm &&
        <button
          type="button"
          onClick={closeForm}
          className="absolute top-3 right-4 text-gray-500 hover:text-gray-900 text-xl font-bold"
          aria-label={t("close")}
        >
          ×
        </button>
      }
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={naslov}
          onChange={e => setNaslov(e.target.value)}
          placeholder={t("title") || "Naslov"}
          className="border w-full p-2 rounded"
          required
          disabled={loading}
        />
        {greske.naslov && (<p className="text-red-600 text-xs">{greske.naslov}</p>)}
        <textarea
          value={sadrzaj}
          onChange={e => setSadrzaj(e.target.value)}
          placeholder={t("content") || "Sadržaj"}
          className="border w-full p-2 rounded"
          required
          disabled={loading}
        />
        {greske.sadrzaj && (<p className="text-red-600 text-xs">{greske.sadrzaj}</p>)}
        <select
          value={tip}
          onChange={e => setTip(e.target.value)}
          className="border w-full p-2 rounded"
          required
          disabled={loading}
        >
          <option value="radionice">{t("workshops") || "Radionice"}</option>
          <option value="projekti">{t("projects") || "Projekti"}</option>
          <option value="natječaji">{t("competitions") || "Natječaji"}</option>
          <option value="kvizovi">{t("quizzes") || "Kvizovi"}</option>
          <option value="ostalo">{t("other") || "Ostalo"}</option>
        </select>
        {greske.tip && (<p className="text-red-600 text-xs">{greske.tip}</p>)}
        <select
          value={odsjek}
          onChange={e => setOdsjek(e.target.value)}
          required
          className="border w-full p-2 rounded"
          disabled={loading}
        >
          <option value="">{t("selectDepartment") || "Odaberite odsjek"}</option>
          {ODSJECI.map(o => (
            <option value={o.id} key={o.id}>{o.naziv}</option>
          ))}
        </select>
        {greske.odsjek && (<p className="text-red-600 text-xs">{greske.odsjek}</p>)}
        <button
          className={`bg-[#b41f24] text-white px-4 py-2 rounded w-full transition ${loading ? "opacity-75 cursor-not-allowed" : ""}`}
          disabled={loading}
        >
          {t("send") || "Pošalji"}
        </button>
      </form>
      {msg && <p className="mt-3 text-center text-sm">{msg}</p>}
    </div>
  );
}
