import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#b41f24] mb-3">
          Dobrodošli na FFOS Oglasnik
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-4">
          Digitalni prostor Filozofskog fakulteta u Osijeku za dijeljenje projekata,
          radionica i akademskih prilika. 
        </p>
        <div className="mt-6 h-1 w-24 bg-[#b41f24] mx-auto rounded-full"></div>
      </div>

      {/* Sekcija s objavama */}
      {objave.length === 0 ? (
        <div className="flex flex-col items-center my-10">
          {/* Dodaj ovdje SVG ikonu, po želji */}
          <p className="text-center text-gray-500 mt-6">Trenutno nema aktivnih objava.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {objave.slice(0, 3).map((o) => (
            <Link to={`/objava/${o._id}`} key={o._id}>
              <div
                className="border border-gray-200 rounded-lg bg-white p-5 shadow-sm hover:shadow-lg hover:border-[#b41f24] cursor-pointer transition-all duration-200"
              >
                <h2 className="text-xl font-semibold text-[#b41f24] mb-2">
                  {o.naslov}
                </h2>
                <p className="text-gray-700 mb-3 text-sm leading-relaxed">
                  {o.sadrzaj.length > 120 ? o.sadrzaj.slice(0, 120) + "..." : o.sadrzaj}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(o.datum).toLocaleDateString("hr-HR")}
                </p>
                {o.sadrzaj.length > 120 && (
                  <span className="text-xs text-[#b41f24] underline">Vidi više</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
