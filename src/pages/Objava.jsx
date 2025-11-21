import { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import { ODSJECI } from "../constants/odsjeci";
import { Link } from "react-router-dom";
import { useAccessibility } from "../context/AccessibilityContext";

export default function Objava() {
  const [objave, setObjave] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [filterTip, setFilterTip] = useState("sve");
  const [odsjek, setOdsjek] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);

  // Forma za novu objavu
  const [naslov, setNaslov] = useState("");
  const [sadrzaj, setSadrzaj] = useState("");
  const [tip, setTip] = useState("radionice");
  const [odsjekForm, setOdsjekForm] = useState("");
  const [greske, setGreske] = useState({});
  const [msg, setMsg] = useState("");
  const [loadingForm, setLoadingForm] = useState(false);

  const tipovi = [
    { value: "sve", label: "Sve" },
    { value: "radionice", label: "Radionice" },
    { value: "kvizovi", label: "Kvizovi" },
    { value: "projekti", label: "Projekti" },
    { value: "natječaji", label: "Natječaji" },
    { value: "ostalo", label: "Ostalo" }
  ];
  const sortOptions = [
    { value: "newest", label: "Najnovije" },
    { value: "oldest", label: "Najstarije" }
  ];
  const departmentOptions = [
    { value: "", label: "Svi odsjeci" },
    ...ODSJECI.map((ods) => ({
      value: ods.id, label: ods.naziv
    }))
  ];

  useEffect(() => {
    const fetchObjave = async () => {
      setLoading(true);
      try {
        const res = await api.get("/objave", {
          params: { tip: filterTip, odsjekId: odsjek, sortBy },
        });
        setObjave(res.data);
      } catch (err) {
        setObjave([]);
      }
      setLoading(false);
    };
    fetchObjave();

    const handler = () => fetchObjave();
    window.addEventListener("refreshObjave", handler);
    return () => window.removeEventListener("refreshObjave", handler);
  }, [filterTip, odsjek, sortBy]);

  const spremiObjavu = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Niste prijavljeni.");
      return;
    }
    try {
      const res = await api.post(
        `/korisnik/spremiObjavu/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data?.message || "Objava je spremljena.");
      window.dispatchEvent(new Event("refreshSpremljene"));
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Greška pri spremanju objave.";
      alert(msg);
    }
  };

  // Nova objava forma
  const handleSubmit = async (e) => {
    e.preventDefault();
    const novaGreske = {};
    if (!naslov.trim()) novaGreske.naslov = "Naslov je obavezan.";
    if (!sadrzaj.trim()) novaGreske.sadrzaj = "Sadržaj je obavezan.";
    if (!tip) novaGreske.tip = "Odaberite tip objave.";
    if (!odsjekForm) novaGreske.odsjek = "Odaberite odsjek.";
    setGreske(novaGreske);

    if (Object.keys(novaGreske).length > 0) return;

    setLoadingForm(true);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/objave",
        { naslov, sadrzaj, tip, odsjek: odsjekForm },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg("Objava poslana administratorima na odobrenje.");
      setNaslov("");
      setSadrzaj("");
      setOdsjekForm("");
      setTip("radionice");
      setGreske({});
      window.dispatchEvent(new Event("refreshObjave"));
      setTimeout(() => {
        setMsg("");
        setShowForm(false);
      }, 1200);
    } catch (err) {
      setMsg(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Greška pri slanju objave."
      );
    }
    setLoadingForm(false);
  };

  return (
    <section className="page-bg">
      <div className="container">
        <h1>Objave</h1>
        <div className="objava-controls">
          <div className="objava-btn-grid">
            {tipovi.map((tip) => (
              <button
                key={tip.value}
                onClick={() => setFilterTip(tip.value)}
                className={`filter-btn${filterTip === tip.value ? " active" : ""}`}
              >
                {tip.label}
              </button>
            ))}
          </div>
          <select
            value={odsjek}
            onChange={e => setOdsjek(e.target.value)}
            className="form-select"
          >
            {departmentOptions.map(opt => (
              <option value={opt.value} key={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="form-select"
          >
            {sortOptions.map(opt => (
              <option value={opt.value} key={opt.value}>{opt.label}</option>
            ))}
          </select>
          {user && user.uloga !== "admin" && (
            <button onClick={() => setShowForm(v => !v)} className="main-btn">
              Nova objava
            </button>
          )}
        </div>
        {/* Forma za dodavanje objave */}
        {showForm && (
          <div className="form-modal">
            <div className="relative max-w-lg mx-auto bg-white shadow-md p-6 mt-4 rounded">
              <h2 className="text-xl font-semibold text-[#b41f24] mb-4 text-center">Nova objava</h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="absolute top-3 right-4 text-gray-500 hover:text-gray-900 text-xl font-bold"
                aria-label="Zatvori"
              >
                ×
              </button>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  value={naslov}
                  onChange={e => setNaslov(e.target.value)}
                  placeholder="Naslov"
                  className="border w-full p-2 rounded"
                  required
                  disabled={loadingForm}
                />
                {greske.naslov && (<p className="text-red-600 text-xs">{greske.naslov}</p>)}
                <textarea
                  value={sadrzaj}
                  onChange={e => setSadrzaj(e.target.value)}
                  placeholder="Sadržaj"
                  className="border w-full p-2 rounded"
                  required
                  disabled={loadingForm}
                />
                {greske.sadrzaj && (<p className="text-red-600 text-xs">{greske.sadrzaj}</p>)}
                <select
                  value={tip}
                  onChange={e => setTip(e.target.value)}
                  className="border w-full p-2 rounded"
                  required
                  disabled={loadingForm}
                >
                  <option value="radionice">Radionice</option>
                  <option value="projekti">Projekti</option>
                  <option value="natječaji">Natječaji</option>
                  <option value="kvizovi">Kvizovi</option>
                  <option value="ostalo">Ostalo</option>
                </select>
                {greske.tip && (<p className="text-red-600 text-xs">{greske.tip}</p>)}
                <select
                  value={odsjekForm}
                  onChange={e => setOdsjekForm(e.target.value)}
                  required
                  className="border w-full p-2 rounded"
                  disabled={loadingForm}
                >
                  <option value="">Odaberite odsjek</option>
                  {ODSJECI.map(o => (
                    <option value={o.id} key={o.id}>{o.naziv}</option>
                  ))}
                </select>
                {greske.odsjek && (<p className="text-red-600 text-xs">{greske.odsjek}</p>)}
                <button
                  className={`bg-[#b41f24] text-white px-4 py-2 rounded w-full transition ${loadingForm ? "opacity-75 cursor-not-allowed" : ""}`}
                  disabled={loadingForm}
                >
                  Pošalji
                </button>
              </form>
              {msg && <p className="mt-3 text-center text-sm">{msg}</p>}
            </div>
          </div>
        )}
        {loading ? (
          <p className="center-msg">Učitavanje objava...</p>
        ) : objave.length === 0 ? (
          <p className="center-msg">Nema dostupnih objava.</p>
        ) : (
          <div className="card-grid">
            {objave.map((obj) => (
              <Link to={`/objava/${obj._id}`} key={obj._id} className="card-link">
                <div className="card">
                  <h2>{obj.naslov || "Bez naslova"}</h2>
                  <p className="card-desc">{obj.sadrzaj || "Nema opisa."}</p>
                  <div className="meta-info">
                    <span>Tip: <i>{obj.tip}</i></span>
                    <span>Odsjek: {ODSJECI.find((ods) => ods.id === obj.odsjek)?.naziv || "-"}</span>
                    <span>Autor: {obj.autor || "Nepoznato"}</span>
                    <span className="card-date">{obj.datum ? new Date(obj.datum).toLocaleDateString("hr-HR") : ""}</span>
                  </div>
                  {user && user.uloga !== "admin" && (
                    <button
                      onClick={(e) => spremiObjavu(e, obj._id)}
                      type="button"
                      className="save-btn"
                    >
                      Spremi
                    </button>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
