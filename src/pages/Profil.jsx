import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { Link } from "react-router-dom";
import { useAccessibility } from "../context/AccessibilityContext";

export default function Profil() {
  const { t, lang } = useAccessibility();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [spremljene, setSpremljene] = useState([]);

  if (!user)
    return <p className="text-center my-6 text-red-600">{t("notLoggedIn") || "Niste prijavljeni."}</p>;

  useEffect(() => {
    if (user.uloga !== "admin") {
      const fetchSpremljene = async () => {
        try {
          const token = localStorage.getItem("token");
          const { data } = await api.get("/korisnik/spremljene", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSpremljene(data || []);
        } catch (err) {
          setSpremljene([]);
        }
      };
      fetchSpremljene();
      const handler = () => fetchSpremljene();
      window.addEventListener("refreshSpremljene", handler);
      return () => window.removeEventListener("refreshSpremljene", handler);
    }
  }, [user.uloga]);

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <div className="bg-white shadow-md rounded-lg p-8 mb-8 max-w-lg">
        <h2 className="text-2xl font-bold text-[#b41f24] mb-6">{t("profile") || "Moj Profil"}</h2>
        <p className="mb-2">
          <span className="font-bold">{t("name") || "Ime"}: </span>{user.ime}
        </p>
        <p className="mb-2">
          <span className="font-bold">Email: </span>{user.email}
        </p>
        <p className="mb-2">
          <span className="font-bold">{t("role") || "Uloga"}: </span>{user.uloga}
        </p>
      </div>
      {user.uloga !== "admin" && (
        <section className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-[#b41f24]">
            {t("savedPosts") || "Spremljene objave"}
          </h3>
          {spremljene.length === 0 ? (
            <p className="text-gray-500 text-sm">{t("noSavedPosts") || "Još nemaš spremljenih objava."}</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {spremljene.map((o) => (
                <Link key={o._id} to={`/objava/${o._id}`}
                  className="border border-gray-200 rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition block">
                  <h4 className="text-lg font-semibold text-[#b41f24] mb-1">
                    {o.naslov || t("noTitle") || "Bez naslova"}
                  </h4>
                  <p className="text-sm text-gray-700 mb-2">
                    {o.sadrzaj?.length > 120 ? o.sadrzaj.slice(0, 120) + "..." : o.sadrzaj || t("noDescription") || "Nema opisa."}
                  </p>
                  <p className="text-xs text-gray-500">
                    {o.datum ? new Date(o.datum).toLocaleDateString(lang === "en" ? "en-US" : "hr-HR") : ""}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
