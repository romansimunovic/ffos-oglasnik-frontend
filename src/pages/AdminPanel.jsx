import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";
import api from "../api/axiosInstance";
import { useToast } from "../components/Toast";

export default function AdminPanel() {
  const [objave, setObjave] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchObjave = async () => {
      try {
        const { data } = await api.get("/objave/admin/sve");
        setObjave(data || []);
      } catch (err) {
        console.error("fetch admin objave:", err);
        toast("Greška pri dohvaćanju objava.", "error");
      }
    };
    fetchObjave();
  }, [toast]);

  const handleStatusChange = async (id, noviStatus) => {
    setLoadingId(id);
    try {
      await api.patch(`/objave/${id}/status`, { status: noviStatus });
      setObjave((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: noviStatus } : o))
      );
      toast(
        noviStatus === "odobreno" ? "Objava odobrena!" : "Objava odbijena!",
        "success"
      );
    } catch (err) {
      console.error("update status error:", err);
      toast("Greška pri promjeni statusa.", "error");
    }
    setLoadingId(null);
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoadingId(deleteId);
    try {
      await api.delete(`/objave/${deleteId}`);
      setObjave((prev) => prev.filter((o) => o._id !== deleteId));
      toast("Objava obrisana!", "success");
    } catch (err) {
      console.error("delete objava error:", err);
      toast("Greška pri brisanju objave.", "error");
    }
    setLoadingId(null);
    setDeleteId(null);
  };

  const grupirane = {
    "na čekanju": [],
    odobreno: [],
    odbijeno: [],
  };
  objave.forEach((o) => {
    if (grupirane[o.status]) grupirane[o.status].push(o);
  });

  const statusi = [
    { key: "na čekanju", label: "Na čekanju" },
    { key: "odobreno", label: "Prihvaćene" },
    { key: "odbijeno", label: "Odbijene" },
  ];

  return (
    <section className="page-bg">
      <div className="container">
        <h1>Admin panel</h1>

        <div className="card-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          {statusi.map((st) => (
            <div key={st.key} className="card status-card">
              <h2>{st.label}</h2>

              {grupirane[st.key].length === 0 ? (
                <p className="center-msg" style={{ fontSize: "0.98rem" }}>
                  Nema dostupnih objava.
                </p>
              ) : (
                grupirane[st.key].map((o) => (
                  <div
                    key={o._id}
                    className="card inner-card"
                    style={{ marginBottom: "1.1rem", marginTop: "0.8rem" }}
                  >
                    <h3 style={{ marginBottom: "0.7rem" }}>{o.naslov}</h3>
                    <p>{o.sadrzaj}</p>

                    <div className="meta-info">
                      <span>Autor: {o.autorIme || o.autor?.ime || o.autor || "Nepoznato"}</span>
                      <span>Tip: {o.tip}</span>
                      <span>Odsjek: {o.odsjek?.naziv || o.odsjek || "-"}</span>
                      <span className="card-date">
                        {o.datum ? new Date(o.datum).toLocaleDateString("hr-HR") : ""}
                      </span>
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
                        onClick={() => confirmDelete(o._id)}
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

        {/* Potvrda brisanja */}
        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
          <DialogTitle>Potvrdi brisanje</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Sigurno želite obrisati ovu objavu? Ova radnja je nepovratna.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteId(null)}>Odustani</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Obriši
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </section>
  );
}
