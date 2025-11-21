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
      setTimeout(() => setMsg(""), 2000);
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
      setTimeout(() => setMsg(""), 2000);
    } catch (err) {
      setMsg("Greška pri brisanju objave.");
    }
    setLoadingId(null);
  };

  return (
    <section className="page-bg">
      <div className="container">
        <h1>Admin panel</h1>
        {msg && <p className="center-msg">{msg}</p>}
        {objave.length === 0 ? (
          <p className="center-msg">Nema dostupnih objava.</p>
        ) : (
          <div className="card-grid">
            {objave.map((o) => (
              <div key={o._id} className="card inner-card">
                <h3 style={{ marginBottom: "0.7rem" }}>{o.naslov}</h3>
                <p>{o.sadrzaj}</p>
                <div className="meta-info">
                  <span>Status: <strong>{o.status}</strong></span>
                  <span>Autor: {o.autor || "Nepoznato"}</span>
                  <span>Tip: {o.tip}</span>
                  <span>Odsjek: {o.odsjek?.naziv || o.odsjek || "-"}</span>
                  <span className="card-date">
                    {o.datum ? new Date(o.datum).toLocaleDateString("hr-HR") : ""}
                  </span>
                </div>
                <div className="card-btn-group" style={{ marginTop: "0.9rem" }}>
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
                  <button
                    disabled={loadingId === o._id}
                    onClick={() => handleDelete(o._id)}
                    className="delete-btn"
                  >
                    {loadingId === o._id ? "..." : "Obriši"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
