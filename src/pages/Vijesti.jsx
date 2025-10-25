import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Vijesti() {
  const [vijesti, setVijesti] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVijesti = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/vijesti`
        );
        setVijesti(res.data || []);
      } catch (err) {
        console.error("❌ Greška pri dohvaćanju vijesti:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVijesti();
  }, []);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center text-[#b41f24] mb-4">
        Vijesti
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Ovdje ćeš moći saznati sve o novim radionicama, Erasmus+ prilikama, studentskim projektima i konferencijama, do zanimljivih predavanja i gostujućih profesora.
      </p>

      {loading ? (
        <p className="text-center text-gray-500">Učitavanje vijesti...</p>
      ) : vijesti.length === 0 ? (
        <p className="text-center text-gray-500">Nema dostupnih vijesti.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vijesti.map((v, i) => (
            <a
              key={i}
              href={v.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition bg-white p-4"
            >
              <h2 className="text-lg font-semibold text-[#b41f24] mb-2">
                {v.naslov}
              </h2>
              <p className="text-sm text-gray-600 mb-1">
                Izvor: <span className="italic">{v.izvor}</span>
              </p>
              <p className="text-xs text-gray-400">
                {v.datum
                  ? new Date(v.datum).toLocaleDateString("hr-HR")
                  : "Nepoznat datum"}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
