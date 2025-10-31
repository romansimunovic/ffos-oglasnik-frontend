import { useEffect, useState } from "react";
import api from "../api/axiosInstance";

export default function Home() {
  const [objave, setObjave] = useState([]);

  useEffect(() => {
    const fetchObjave = async () => {
      try {
        const { data } = await api.get("/objave");
        setObjave(data);
      } catch (err) {
        console.error("Greška pri dohvaćanju objava:", err);
      }
    };
    fetchObjave();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {/* Hero sekcija */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-[#b41f24] mb-3">
          Dobrodošli na FFOS Oglasnik
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Digitalni prostor Filozofskog fakulteta u Osijeku za dijeljenje projekata,
          radionica i akademskih prilika. 
        </p>
        <div className="mt-6 h-1 w-24 bg-[#b41f24] mx-auto rounded-full"></div>
      </div>

      {/* Sekcija s objavama */}
      {objave.length === 0 ? (
        <p className="text-center text-gray-500">Trenutno nema aktivnih objava.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {objave.map((o) => (
            <div
              key={o._id}
              className="border border-gray-200 rounded-lg bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold text-[#b41f24] mb-2">
                {o.naslov}
              </h2>
              <p className="text-gray-700 mb-3 text-sm leading-relaxed">
                {o.sadrzaj}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(o.datum).toLocaleDateString("hr-HR")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
