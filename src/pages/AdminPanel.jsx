import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
} from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import NewReleasesOutlinedIcon from "@mui/icons-material/NewReleasesOutlined";
import api from "../api/axiosInstance";
import { useToast } from "../components/Toast";
import { ODSJECI } from "../constants/odsjeci";

export default function AdminPanel() {
  const [objave, setObjave] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterTip, setFilterTip] = useState("Sve");
  const toast = useToast();

  const tipovi = [
    { value: "Sve", label: "Sve" },
    { value: "radionice", label: "Radionice" },
    { value: "kvizovi", label: "Kvizovi" },
    { value: "projekti", label: "Projekti" },
    { value: "natječaji", label: "Natječaji" },
    { value: "ostalo", label: "Ostalo" },
  ];

  useEffect(() => {
    fetchObjave();
  }, [search, filterTip]); // eslint-disable-line

  const fetchObjave = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filterTip !== "Sve") params.append("tip", filterTip);

      const { data } = await api.get(`/objave/admin/sve?${params}`);
      setObjave(data || []);
    } catch (err) {
      console.error("fetch admin objave:", err);
      toast("Greška pri dohvaćanju objava.", "error");
    }
  };

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

  const handleTogglePin = async (id, currentPinned) => {
    setLoadingId(id);
    try {
      await api.patch(`/objave/${id}/pin`);
      setObjave((prev) =>
        prev.map((o) => (o._id === id ? { ...o, pinned: !currentPinned } : o))
      );
      toast(
        currentPinned ? "Objava otkvačena." : "Objava prikvačena!",
        "success"
      );
    } catch (err) {
      console.error("toggle pin error:", err);
      toast("Greška pri prikvačivanju objave.", "error");
    }
    setLoadingId(null);
  };

  const handleToggleUrgentno = async (id, currentUrgentno) => {
    setLoadingId(id);
    try {
      await api.patch(`/objave/${id}/urgentno`);
      setObjave((prev) =>
        prev.map((o) =>
          o._id === id ? { ...o, urgentno: !currentUrgentno } : o
        )
      );
      toast(
        currentUrgentno ? "Objava više nije hitna." : "Objava označena kao hitna!",
        "success"
      );
    } catch (err) {
      console.error("toggle urgentno error:", err);
      toast("Greška pri označavanju objave.", "error");
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

  // Grupiranje po statusu
  const grupirane = {
    "na čekanju": [],
    odobreno: [],
    odbijeno: [],
  };
  objave.forEach((o) => {
    if (grupirane[o.status]) grupirane[o.status].push(o);
  });

  const statusi = [
    { key: "na čekanju", label: "Na čekanju", color: "#f6af24" },
    { key: "odobreno", label: "Prihvaćene", color: "#23cb63" },
    { key: "odbijeno", label: "Odbijene", color: "#e21a1a" },
  ];

  return (
    <section className="page-bg">
      <div className="container">
        <h1>Admin panel</h1>

        {/* FILTERI ZA ADMIN */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            variant="outlined"
            label="Pretraži objave"
            value={search}
            style={{ minWidth: 200 }}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Naslov ili sadržaj..."
          />
          <FormControl size="small" style={{ minWidth: 150 }}>
            <InputLabel id="admin-tip-label">Tip</InputLabel>
            <Select
              labelId="admin-tip-label"
              value={filterTip}
              label="Tip"
              onChange={(e) => setFilterTip(e.target.value)}
            >
              {tipovi.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div
          className="card-grid"
          style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
        >
          {statusi.map((st) => (
            <div key={st.key} className="card status-card">
              <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {st.label}
                <Chip
                  label={grupirane[st.key].length}
                  size="small"
                  style={{
                    backgroundColor: st.color,
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                />
              </h2>

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
                    {/* BADGES */}
                    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                      {o.pinned && (
                        <Chip
                          icon={<PushPinIcon />}
                          label="Prikvačeno"
                          size="small"
                          color="primary"
                        />
                      )}
                      {o.urgentno && (
                        <Chip
                          icon={<NewReleasesIcon />}
                          label="Hitno"
                          size="small"
                          color="error"
                        />
                      )}
                    </div>

                    <h3 style={{ marginBottom: "0.7rem" }}>{o.naslov}</h3>
                    <p>{o.sadrzaj}</p>

                    <div className="meta-info">
                      <span>
                        Autor:{" "}
                        {o.autorIme || o.autor?.ime || o.autor || "Nepoznato"}
                      </span>
                      <span>Tip: {o.tip}</span>
                      <span>
                        Odsjek:{" "}
                        {ODSJECI.find((ods) => ods.id === o.odsjek)?.naziv ||
                          o.odsjek?.naziv ||
                          o.odsjek ||
                          "-"}
                      </span>
                      <span className="card-date">
                        {o.datum
                          ? new Date(o.datum).toLocaleDateString("hr-HR")
                          : ""}
                      </span>
                    </div>

                    {/* ADMIN KONTROLE */}
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginTop: "0.9rem",
                        flexWrap: "wrap",
                      }}
                    >
                      {/* STATUS GUMBI */}
                      {st.key === "na čekanju" && (
                        <>
                          <button
                            disabled={loadingId === o._id}
                            onClick={() =>
                              handleStatusChange(o._id, "odobreno")
                            }
                            className="approve-btn"
                            style={{ fontSize: "0.85rem", padding: "6px 12px" }}
                          >
                            {loadingId === o._id ? "..." : "Odobri"}
                          </button>
                          <button
                            disabled={loadingId === o._id}
                            onClick={() =>
                              handleStatusChange(o._id, "odbijeno")
                            }
                            className="reject-btn"
                            style={{ fontSize: "0.85rem", padding: "6px 12px" }}
                          >
                            {loadingId === o._id ? "..." : "Odbij"}
                          </button>
                        </>
                      )}

                      {/* PIN / URGENTNO GUMBI (samo za odobrene) */}
                      {st.key === "odobreno" && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleTogglePin(o._id, o.pinned)}
                            disabled={loadingId === o._id}
                            color={o.pinned ? "primary" : "default"}
                            title={
                              o.pinned ? "Otkvači objavu" : "Prikvači objavu"
                            }
                          >
                            {o.pinned ? (
                              <PushPinIcon />
                            ) : (
                              <PushPinOutlinedIcon />
                            )}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleToggleUrgentno(o._id, o.urgentno)
                            }
                            disabled={loadingId === o._id}
                            color={o.urgentno ? "error" : "default"}
                            title={
                              o.urgentno
                                ? "Ukloni oznaku hitno"
                                : "Označi kao hitno"
                            }
                          >
                            {o.urgentno ? (
                              <NewReleasesIcon />
                            ) : (
                              <NewReleasesOutlinedIcon />
                            )}
                          </IconButton>
                        </>
                      )}

                      {/* DELETE GUMB */}
                      <button
                        disabled={loadingId === o._id}
                        onClick={() => confirmDelete(o._id)}
                        className="delete-btn"
                        style={{ fontSize: "0.85rem", padding: "6px 12px" }}
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
