import { useAccessibility } from "../context/AccessibilityContext";
import { translateText } from "../utils/translate";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const { t, lang } = useAccessibility();
  const [objave, setObjave] = useState([]);
  const [translatedObjave, setTranslatedObjave] = useState([]);

  useEffect(() => {
    fetch("/api/objave")
      .then((res) => res.json())
      .then((data) => setObjave(data));
  }, []);

  useEffect(() => {
    // automatski prevedi svaku objavu ako treba
    Promise.all(
      objave.map(async (o) => {
        if (!o.originalLang || o.originalLang === lang) return o;
        const naslov = await translateText(o.naslov, lang);
        const sadrzaj = await translateText(o.sadrzaj, lang);
        return { ...o, naslov, sadrzaj };
      })
    ).then(setTranslatedObjave);
  }, [objave, lang]);

  const prikazObjave = (translatedObjave.length ? translatedObjave : objave);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#b41f24] mb-3">
          {t("home")} FFOS Oglasnik
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-4">
          {lang === "en"
            ? "Digital space for FFOS Osijek projects and academic opportunities."
            : "Digitalni prostor Filozofskog fakulteta u Osijeku za dijeljenje studentskih projekata, radionice, i akademskih prilika."}
        </p>
        <div className="mt-6 h-1 w-24 bg-[#b41f24] mx-auto rounded-full"></div>
      </div>
      {prikazObjave.length === 0 ? (
        <div className="flex flex-col items-center my-10">
          <p className="text-center text-gray-500 mt-6">{t("noPosts")}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {prikazObjave.slice(0, 3).map((o) => (
            <Link to={`/objava/${o._id}`} key={o._id}>
              <div className="border border-gray-200 rounded-lg bg-white p-5 shadow-sm hover:shadow-lg cursor-pointer transition-all duration-200">
                <h2 className="text-xl font-semibold text-[#b41f24] mb-2">
                  {o.naslov}
                </h2>
                <p className="text-gray-700 mb-3 text-sm leading-relaxed">
                  {o.sadrzaj.length > 120
                    ? o.sadrzaj.slice(0, 120) + "..."
                    : o.sadrzaj}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(o.datum).toLocaleDateString(lang === "en" ? "en-US" : "hr-HR")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
