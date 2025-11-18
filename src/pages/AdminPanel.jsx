import { useAccessibility } from "../context/AccessibilityContext";
import { useEffect, useState } from "react";
import api from "../api/axiosInstance";

export default function AdminPanel() {
  const { t, lang } = useAccessibility();
  const [objave, setObjave] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [msg, setMsg] = useState("");

  const statusLabel = {
    "odobreno": t("approved") || "Odobrene",
    "odbijeno": t("rejected") || "Odbijene",
    "na čekanju": t("pending") || "Na čekanju"
  };

  useEffect(() => {
    const fetchObjave = async () => {
      try {
        const { data } = await api.get("/objave/admin");
        setObjave(data);
      } catch (err) {
        setMsg(t("fetchError") || "Greška pri dohvaćanju objava.");
      }
    };
    fetchObjave();
  }, [t]);

  const handleStatusChange = async (id, noviStatus) => {
    setLoadingId(id);
    try {
      await api.put(`/objave/${id}/status`, { status: noviStatus });
      setObjave(prev =>
        prev.map(o => o._id === id ? { ...o, status: noviStatus } : o)
      );
      setMsg(noviStatus === "odobreno" ? t("approvedMsg") || "Objava odobrena!" : t("rejectedMsg") || "Objava odbijena!");
      setTimeout(() => setMsg(""), 2000);
    } catch (err) {
      setMsg(t("statusError") || "Greška pri promjeni statusa.");
    }
    setLoadingId(null);
  };

  const handleDelete = async (id) => {
    setLoadingId(id);
    try {
      await api.delete(`/objave/${id}`);
      setObjave(prev => prev.filter(o => o._id !== id));
      setMsg(t("deletedMsg") || "Objava obrisana!");
      setTimeout(() => setMsg(""), 2000);
    } catch (err) {
      setMsg(t("deleteError") || "Greška pri brisanju objave.");
    }
    setLoadingId(null);
  };

  const objavePoStatusu = {
    "na čekanju": [],
    "odobreno": [],
    "odbijeno": []
  };
  objave.forEach(o => objavePoStatusu[o.status]?.push(o));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#b41f24] mb-4">{t("adminPanel") || "Admin panel"}</h1>
      {msg && <p className="text-green-700 mb-2">{msg}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["na čekanju", "odobreno", "odbijeno"].map(status => (
          <div key={status} className="bg-white rounded shadow p-4">
            <h2 className="font-bold mb-2">{statusLabel[status]}</h2>
            {objavePoStatusu[status].length === 0 ? (
              <p className="text-gray-400 text-sm">{t("noPosts")}</p>
            ) : (
              objavePoStatusu[status].map(o => (
                <div key={o._id} className="border mb-3 rounded p-3 shadow-sm">
                  <h3 className="font-semibold">{o.naslov}</h3>
                  <p className="text-gray-600 text-sm">{o.sadrzaj}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {status === "na čekanju" && (
                      <>
                        <button
                          disabled={loadingId === o._id}
                          onClick={() => handleStatusChange(o._id, "odobreno")}
                          className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                          {loadingId === o._id ? "..." : t("approve") || "Odobri"}
                        </button>
                        <button
                          disabled={loadingId === o._id}
                          onClick={() => handleStatusChange(o._id, "odbijeno")}
                          className="bg-yellow-600 text-white px-3 py-1 rounded"
                        >
                          {loadingId === o._id ? "..." : t("reject") || "Odbij"}
                        </button>
                      </>
                    )}
                    <button
                      disabled={loadingId === o._id}
                      onClick={() => handleDelete(o._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      {loadingId === o._id ? "..." : t("delete") || "Obriši"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
