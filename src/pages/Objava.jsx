import { useAccessibility } from "../context/AccessibilityContext";
import { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import { Link } from "react-router-dom";
import { ODSJECI } from "../constants/odsjeci";
import NovaObjava from "./NovaObjava";

export default function Objava() {
  const { t, lang } = useAccessibility();
  const [objave, setObjave] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [filterTip, setFilterTip] = useState("sve");
  const [odsjek, setOdsjek] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);

  // Ključevi su value, prikaz je uvijek lokaliziran
  const tipovi = [
    { value: "sve", label: t("sve") },
    { value: "radionice", label: t("radionice") },
    { value: "kvizovi", label: t("kvizovi") },
    { value: "projekti", label: t("projekti") },
    { value: "natječaji", label: t("natječaji") },
    { value: "ostalo", label: t("ostalo") }
  ];
  const sortOptions = [
    { value: "newest", label: t("newest") },
    { value: "oldest", label: t("oldest") }
  ];
  const departmentOptions = [
    { value: "", label: t("allDepartments") },
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
    e.stopPropagation(); // Sprečava klik na save da aktivira detalje
    const token = localStorage.getItem("token");
    if (!token) {
      alert(t("notLoggedIn") || "Niste prijavljeni.");
      return;
    }
    try {
      const res = await api.post(
        `/korisnik/spremiObjavu/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data?.message || t("postSaved") || "Objava je spremljena.");
      window.dispatchEvent(new Event("refreshSpremljene"));
    } catch (err) {
      const msg = err.response?.data?.message || err.message || t("saveError") || "Greška pri spremanju objave.";
      alert(msg);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center text-[#b41f24] mb-8">
        {t("posts")}
      </h1>
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
        <div className="flex flex-wrap justify-center gap-2">
          {tipovi.map((tip) => (
            <button
              key={tip.value}
              onClick={() => setFilterTip(tip.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterTip === tip.value
                  ? "bg-[#b41f24] text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {tip.label}
            </button>
          ))}
        </div>
        <select
          value={odsjek}
          onChange={(e) => setOdsjek(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 text-sm"
        >
          {departmentOptions.map(opt => (
            <option value={opt.value} key={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 text-sm"
        >
          {sortOptions.map(opt => (
            <option value={opt.value} key={opt.value}>{opt.label}</option>
          ))}
        </select>
        {user && user.uloga !== "admin" && (
          <button
            onClick={() => setShowForm(v => !v)}
            className="bg-[#b41f24] text-white px-4 py-2 rounded ml-4"
          >
            {t("newPost")}
          </button>
        )}
      </div>
      {showForm && (
        <div className="flex justify-center mb-8">
          <NovaObjava closeForm={() => setShowForm(false)} />
        </div>
      )}
      {loading ? (
        <p className="text-center text-gray-500">{t("loadingPosts") || "Učitavanje objava..."}</p>
      ) : objave.length === 0 ? (
        <p className="text-center text-gray-500">{t("noPosts")}</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {objave.map((obj) => (
            <Link
              to={`/objava/${obj._id}`} // Klik na cijeli card vodi na detalje objave
              key={obj._id}
              className="border border-gray-200 rounded-lg shadow-sm bg-white p-5 hover:shadow-md transition cursor-pointer block"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <h2 className="text-lg font-semibold text-[#b41f24] mb-2">
                {obj.naslov || t("noTitle") || "Bez naslova"}
              </h2>
              <p className="text-sm text-gray-700 mb-1">
                {obj.sadrzaj || t("noDescription") || "Nema opisa."}
              </p>
              <div className="text-xs text-gray-500">
                <p>
                  {t("type") || "Tip"}: <span className="italic">{t(obj.tip) || obj.tip}</span>
                </p>
                <p>
                  {t("department") || "Odsjek"}: {ODSJECI.find((ods) => ods.id === obj.odsjek)?.naziv || "-"}
                </p>
                <p>{t("author") || "Autor"}: {obj.autor || t("unknown") || "Nepoznato"}</p>
                <p className="text-gray-400 mt-1">
                  {obj.datum ? new Date(obj.datum).toLocaleDateString(lang === "en" ? "en-US" : "hr-HR") : ""}
                </p>
              </div>
              {user && user.uloga !== "admin" && (
                <button
                  onClick={(e) => spremiObjavu(e, obj._id)}
                  className="mt-3 inline-block text-sm bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded"
                  // ovo je bitno da klik na gumb ne vodi na detalje
                  type="button"
                  tabIndex={0}
                  onMouseDown={e => e.stopPropagation()}
                  onClickCapture={e => e.stopPropagation()}
                >
                  {t("savePost")}
                </button>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
