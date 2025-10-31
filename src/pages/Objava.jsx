import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

export default function Objava() {
  const [objave, setObjave] = useState([]);
  const [odsjeci, setOdsjeci] = useState([]);
  const [filterTip, setFilterTip] = useState("sve");
  const [odsjek, setOdsjek] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);

  const tipovi = ["sve", "radionice", "kvizovi", "projekti", "natječaji", "ostalo"];

  // 🔹 Dohvati odsjeke
  useEffect(() => {
    const fetchOdsjeci = async () => {
      try {
        const res = await axios.get("/odsjeci");
        setOdsjeci(res.data);
      } catch (err) {
        console.error("Greška pri dohvaćanju odsjeka:", err);
      }
    };
    fetchOdsjeci();
  }, []);

  // 🔹 Dohvati objave
  useEffect(() => {
    const fetchObjave = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/objave", {
          params: { tip: filterTip, odsjekId: odsjek, sortBy },
        });
        setObjave(res.data);
      } catch (err) {
        console.error("Greška pri dohvaćanju objava:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchObjave();
  }, [filterTip, odsjek, sortBy]);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center text-[#b41f24] mb-8">
        Studentski Oglasnik
      </h1>

      {/* 🔹 Filter sekcija */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">

        {/* Tip objave */}
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

        {/* Odsjek filter */}
        <select
          value={odsjek}
          onChange={(e) => setOdsjek(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 text-sm"
        >
          <option value="">Svi odsjeci</option>
          {odsjeci.map((o) => (
            <option key={o._id} value={o._id}>
              {o.naziv}
            </option>
          ))}
        </select>

        {/* Sortiranje */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 text-sm"
        >
          <option value="newest">Najnovije</option>
          <option value="oldest">Najstarije</option>
        </select>
      </div>

      {/* 🔹 Prikaz objava */}
      {loading ? (
        <p className="text-center text-gray-500">Učitavanje objava...</p>
      ) : objave.length === 0 ? (
        <p className="text-center text-gray-500">Nema dostupnih objava.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {objave.map((o) => (
            <div
              key={o._id}
              className="border border-gray-200 rounded-lg shadow-sm bg-white p-5 hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold text-[#b41f24] mb-2">
                {o.naslov || "Bez naslova"}
              </h2>

              <p className="text-sm text-gray-700 mb-2">
                {o.sadrzaj || "Nema opisa."}
              </p>

              <div className="text-xs text-gray-500">
                <p>
                  Tip: <span className="italic">{o.tip}</span>
                </p>
                <p>
                  Odsjek:{" "}
                  <span>{o.odsjek?.naziv || "Filozofski fakultet"}</span>
                </p>
                <p className="text-gray-400 mt-1">
                  {new Date(o.datum).toLocaleDateString("hr-HR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
