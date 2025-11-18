import { useAccessibility } from "../context/AccessibilityContext";
import { translateText } from "../utils/translate";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ODSJECI } from "../constants/odsjeci";

export default function ObjavaDetalj() {
  const { id } = useParams();
  const { t, lang } = useAccessibility();
  const [objava, setObjava] = useState(null);
  const [naslov, setNaslov] = useState("");
  const [sadrzaj, setSadrzaj] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/objave/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setObjava(data);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!objava) return;
    if (!objava.originalLang || objava.originalLang === lang) {
      setNaslov(objava.naslov);
      setSadrzaj(objava.sadrzaj);
    } else {
      setNaslov("...");
      setSadrzaj("...");
      Promise.all([
        translateText(objava.naslov, lang),
        translateText(objava.sadrzaj, lang),
      ]).then(([tNaslov, tSadrzaj]) => {
        setNaslov(tNaslov);
        setSadrzaj(tSadrzaj);
      });
    }
  }, [lang, objava]);

  if (loading || !objava)
    return <p className="text-center mt-10">{t("noPosts")}</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 mt-10 rounded shadow">
      <h1 className="text-2xl font-bold text-[#b41f24] mb-6">{naslov}</h1>
      <p className="mb-4 text-gray-700">{sadrzaj}</p>
      <div className="text-sm text-gray-500">
        <p>{t("posts")}: {objava.tip}</p>
        <p>
          {t("details")}:{" "}
          {ODSJECI.find((x) => x.id === (objava.odsjek?._id || objava.odsjek))?.naziv || "-"}
        </p>
        <p>{t("profile")}: {objava.autor || "Nepoznato"}</p>
        <p>
          {objava.datum
            ? new Date(objava.datum).toLocaleDateString(lang === "en" ? "en-US" : "hr-HR")
            : ""}
        </p>
      </div>
    </div>
  );
}
