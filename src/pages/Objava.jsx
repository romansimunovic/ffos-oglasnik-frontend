import { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import { Link } from "react-router-dom";
import { ODSJECI } from "../constants/odsjeci";

export default function Objava() {
  const [objave, setObjave] = useState([]);
  const [filterTip, setFilterTip] = useState("sve");
  const [odsjek, setOdsjek] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);

  const tipovi = ["sve", "radionice", "kvizovi", "projekti", "natječaji", "ostalo"];

  useEffect(() => {
    const fetchObjave = async () => {
      setLoading(true);
      try {
        const res = await api.get("/objave", {
          params: { tip: filterTip, odsjekId: odsjek, sortBy },
        });
        setObjave(res.data);
      } catch {}
      setLoading(false);
    };
    fetchObjave();
  }, [filterTip, odsjek, sortBy]);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center text-[#b41f24] mb-8">
        Studentski Oglasnik
      </h1>
      {/* Filter sekcija */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
        <div className="flex flex-wrap justify-center gap-2">
          {tipovi.map((tip) => (
            <button
              key={tip}
              onClick={() => setFilterTip(tip)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterTip === tip
                  ? "bg-[#b41f24] text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {tip.charAt(0).toUpperCase() + tip.slice(1)}
            </button>
          ))}
        </div>
        <select
          value={odsjek}
          onChange={e => setOdsjek(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 text-sm"
        >
          <option value="">Svi odsjeci</option>
          {ODSJECI.map((ods) => (
            <option key={ods.id} value={ods.id}>{ods.naziv}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 text-sm"
        >
          <option value="newest">Najnovije</option>
          <option value="oldest">Najstarije</option>
        </select>
      </div>
      {/* Prikaz objava */}
      {loading ? (
        <p className="text-center text-gray-500">Učitavanje objava...</p>
      ) : objave.length === 0 ? (
        <p className="text-center text-gray-500">Nema dostupnih objava.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {objave.map((obj) => (
            <Link
              key={obj._id}
              to={`/objava/${obj._id}`}
              className="border border-gray-200 rounded-lg shadow-sm bg-white p-5 hover:shadow-md transition cursor-pointer block"
            >
              <h2 className="text-lg font-semibold text-[#b41f24] mb-2">
                {obj.naslov || "Bez naslova"}
              </h2>
              <p className="text-sm text-gray-700 mb-2">{obj.sadrzaj || "Nema opisa."}</p>
              <div className="text-xs text-gray-500">
                <p>Tip: <span className="italic">{obj.tip}</span></p>
                <p>
                  Odsjek: {ODSJECI.find(ods => ods.id === obj.odsjek)?.naziv || '-'}
                </p>
                <p className="text-gray-400 mt-1">
                  {obj.datum ? new Date(obj.datum).toLocaleDateString("hr-HR") : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
