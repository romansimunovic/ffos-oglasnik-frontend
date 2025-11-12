import { useEffect, useState } from "react";
import api from "../api/axiosInstance";

const TIPOVI = ["radionice", "kvizovi", "projekti", "natječaji", "ostalo"]; // bez "sve"

export default function MojeObjave() {
  const [odsjeci, setOdsjeci] = useState([]);
  const [moje, setMoje] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    naslov: "",
    sadrzaj: "",
    tip: "projekti",
    odsjekId: "",
  });

  // Dohvati odsjeke + moje objave
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [odsRes, mojeRes] = await Promise.all([
          api.get("/odsjeci"),
          api.get("/objave/moje"),
        ]);
        if (!mounted) return;
        setOdsjeci(odsRes.data || []);
        setMoje(mojeRes.data || []);
      } catch (err) {
        console.error(err);
        setMsg(
          err.response?.data?.message || "Greška pri dohvaćanju podataka."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.naslov.trim() || !form.sadrzaj.trim()) {
      setMsg("Unesi naslov i sadržaj.");
      return;
    }
    if (!form.odsjekId) {
      setMsg("Odaberi odsjek.");
      return;
    }

    try {
      // očekivani backend body: { naslov, sadrzaj, tip, odsjekId }
      const { data } = await api.post("/objave", {
        naslov: form.naslov.trim(),
        sadrzaj: form.sadrzaj.trim(),
        tip: form.tip,
        odsjekId: form.odsjekId,
      });

      // optimistički update liste
      setMoje((prev) => [data, ...prev]);
      setForm({ naslov: "", sadrzaj: "", tip: "projekti", odsjekId: "" });
      setMsg("Objava je spremljena.");
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.message || "Greška pri spremanju objave.");
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center text-[#b41f24] mb-8">
        Moje objave
      </h1>

      {/* Forma za novu objavu */}
      <form
        onSubmit={onSubmit}
        className="bg-white shadow-md rounded-lg p-6 mb-8 max-w-2xl mx-auto"
      >
        <div className="grid gap-4">
          <input
            name="naslov"
            placeholder="Naslov"
            value={form.naslov}
            onChange={onChange}
            className="border border-gray-300 rounded p-2"
            required
          />

          <textarea
            name="sadrzaj"
            placeholder="Opis / sadržaj objave"
            value={form.sadrzaj}
            onChange={onChange}
            className="border border-gray-300 rounded p-2 min-h-[120px]"
            required
          />

          <div className="flex flex-col md:flex-row gap-3">
            <select
              name="tip"
              value={form.tip}
              onChange={onChange}
              className="border border-gray-300 rounded p-2 w-full"
            >
              {TIPOVI.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              name="odsjekId"
              value={form.odsjekId}
              onChange={onChange}
              className="border border-gray-300 rounded p-2 w-full"
              required
            >
              <option value="">Odaberi odsjek</option>
              {odsjeci.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.naziv}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="bg-[#b41f24] hover:bg-[#a11c20] text-white font-semibold py-2 rounded"
          >
            Spremi objavu
          </button>

          {msg && (
            <p className="text-sm text-center mt-1 text-gray-700">{msg}</p>
          )}
        </div>
      </form>

      {/* Lista mojih objava */}
      {loading ? (
        <p className="text-center text-gray-500">Učitavanje...</p>
      ) : moje.length === 0 ? (
        <p className="text-center text-gray-500">Nema tvojih objava još.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {moje.map((o) => (
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
                  Odsjek: <span>{o.odsjek?.naziv || "-"}</span>
                </p>
                <p className="text-gray-400 mt-1">
                  {o.datum ? new Date(o.datum).toLocaleDateString("hr-HR") : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
