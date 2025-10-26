import React, { useState, useEffect } from "react";
import axios from "../api/axiosInstance";

export default function Objava() {
  const [objave, setObjave] = useState([]);
  const [filter, setFilter] = useState("sve");
  const [loading, setLoading] = useState(true);

  const tipovi = ["sve", "radionice", "kvizovi", "projekti", "natječaji", "ostalo"];

  useEffect(() => {
    const fetchObjave = async () => {
      try {
        const url =
          filter === "sve"
            ? "/objave"
            : `/objave?tip=${filter}`;
        const res = await axios.get(url);
        setObjave(res.data);
      } catch (err) {
        console.error("Greška pri dohvaćanju objava:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchObjave();
  }, [filter]);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center text-[#b41f24] mb-6">
        Studentski Oglasnik
      </h1>

      <div className="flex justify-center gap-2 mb-6 flex-wrap">
        {tipovi.map((tip) => (
          <button
            key={tip}
            onClick={() => setFilter(tip)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === tip
                ? "bg-[#b41f24] text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {tip.charAt(0).toUpperCase() + tip.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Učitavanje objava...</p>
      ) : objave.length === 0 ? (
        <p className="text-center text-gray-500">Nema dostupnih objava.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {objave.map((o) => (
            <div
              key={o._id}
              className="border border-gray-200 rounded-lg shadow-sm bg-white p-4 hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold text-[#b41f24] mb-2">
                {o.naslov}
              </h2>
              <p className="text-sm text-gray-700 mb-2">{o.opis}</p>
              <p className="text-xs text-gray-500">
                Tip: <span className="italic">{o.tip}</span>
              </p>
              <p className="text-xs text-gray-400">
                {new Date(o.datum).toLocaleDateString("hr-HR")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
