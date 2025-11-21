import { useEffect, useState } from "react";
import api from "../api/axiosInstance";

export default function AdminPanel() {
  const [objave, setObjave] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const fetchObjave = async () => {
      try {
        const { data } = await api.get("/objave/admin");
        setObjave(data);
      } catch (err) {
        setMsg("Greška pri dohvaćanju objava.");
      }
    };
    fetchObjave();
  }, []);

  const handleStatusChange = async (id, noviStatus) => {
    setLoadingId(id);
    try {
      await api.put(`/objave/${id}/status`, { status: noviStatus });
      setObjave(prev =>
        prev.map(o => o._id === id ? { ...o, status: noviStatus } : o)
      );
      setMsg(noviStatus === "odobreno" ? "Objava odobrena!" : "Objava odbijena!");
      setTimeout(() => setMsg(""), 1500);
    } catch (err) {
      setMsg("Greška pri promjeni statusa.");
    }
    setLoadingId(null);
  };

  const handleDelete = async (id) => {
    setLoadingId(id);
    try {
      await api.delete(`/objave/${id}`);
      setObjave(prev => prev.filter(o => o._id !== id));
      setMsg("Objava obrisana!");
      setTimeout(() => setMsg(""), 1500);
    } catch (err) {
      setMsg("Greška pri brisanju objave.");
    }
    setLoadingId(null);
  };

  // Grupiraj objave po statusu
  const grupirane = {
    "na čekanju": [],
    "odobreno": [],
    "odbijeno": []
  };
  objave.forEach(o => grupirane[o.status]?.push(o));

  const statusi = [
    { key: "na čekanju", label: "Na čekanju" },
    { key: "odobreno", label: "Prihvaćene" },
    { key: "odbijeno", label: "Odbijene" }
  ];

  return (
    <section className="page-bg">
      <div className="container">
        <h1>Admin panel</h1>
        {msg && <p className="center-msg">{msg}</p>}
        <div className="card-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          {statusi.map(st => (
            <div key={st.key} className="card status-card">
              <h2>{st.label}</h2>
              {grupirane[st.key].length === 0 ? (
                <p className="center-msg" style={{ fontSize: "0.98rem" }}>Nema dostupnih objava.</p>
              ) : (
                grupirane[st.key].map(o => (
                  <div key={o._id} className="card inner-card" style={{ marginBottom: "1.1rem", marginTop: "0.8rem" }}>
                    <h3 style={{ marginBottom: "0.7rem" }}>{o.naslov}</h3>
                    <p>{o.sadrzaj}</p>
                    <div className="meta-info">
                      <span>Autor: {o.autor || "Nepoznato"}</span>
                      <span>Tip: {o.tip}</span>
                      <span>Odsjek: {o.odsjek?.naziv || o.odsjek || "-"}</span>
                      <span className="card-date">{o.datum ? new Date(o.datum).toLocaleDateString("hr-HR") : ""}</span>
                    </div>
                    <div className="card-btn-group" style={{ marginTop: "0.9rem" }}>
                      {st.key === "na čekanju" && (
                        <>
                          <button
                            disabled={loadingId === o._id}
                            onClick={() => handleStatusChange(o._id, "odobreno")}
                            className="approve-btn"
                          >
                            {loadingId === o._id ? "..." : "Odobri"}
                          </button>
                          <button
                            disabled={loadingId === o._id}
                            onClick={() => handleStatusChange(o._id, "odbijeno")}
                            className="reject-btn"
                          >
                            {loadingId === o._id ? "..." : "Odbij"}
                          </button>
                        </>
                      )}
                      <button
                        disabled={loadingId === o._id}
                        onClick={() => handleDelete(o._id)}
                        className="delete-btn"
                      >
                        {loadingId === o._id ? "..." : "Obriši"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
