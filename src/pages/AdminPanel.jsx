// src/pages/AdminPanel.jsx
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
  Checkbox,
  Box,
} from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import NewReleasesOutlinedIcon from "@mui/icons-material/NewReleasesOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../api/axiosInstance";
import { useToast } from "../components/Toast";
import { ODSJECI } from "../constants/odsjeci";

export default function AdminPanel() {
  const [objave, setObjave] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterTip, setFilterTip] = useState("Sve");
  const [selectedIds, setSelectedIds] = useState([]);
  const [lastBulkAction, setLastBulkAction] = useState(null);

  const [reasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [reasonForId, setReasonForId] = useState(null); // id koji odbijamo
  const [rejectReason, setRejectReason] = useState("");

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

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectStatus = (statusKey, grupirane) => {
    const statusIds = grupirane[statusKey].map((o) => o._id);
    const selectedInStatus = statusIds.filter((id) => selectedIds.includes(id));
    const allSelected = selectedInStatus.length === statusIds.length;

    setSelectedIds((prev) => {
      if (allSelected) return prev.filter((id) => !statusIds.includes(id));
      const asSet = new Set(prev);
      statusIds.forEach((id) => asSet.add(id));
      return Array.from(asSet);
    });
  };

  // helper: nakon što status promijenimo, šaljemo notifikaciju autoru
  const sendNotificationToAuthor = async (authorId, title, message, objavaId) => {
    if (!authorId) return;
    try {
      await api.post(`/korisnik/${authorId}/obavijesti`, {
        title,
        message,
        objavaId,
      });
    } catch (err) {
      console.warn("Ne mogu poslati notifikaciju:", err);
    }
  };

  // pojedinačna promjena statusa (sad podržava razlog za odbijanje)
  const handleStatusChange = async (id, noviStatus, reason = null) => {
    const prevStatus = objave.find((o) => o._id === id)?.status;
    setLoadingId(id);
    try {
      // backend očekuje samo status; mi također zovemo endpoint za notifikaciju
      await api.patch(`/objave/${id}/status`, { status: noviStatus });

      // ažuriraj lokalni state
      const updated = objave.map((o) =>
        o._id === id ? { ...o, status: noviStatus } : o
      );
      setObjave(updated);

      // spremi za undo
      setLastBulkAction({ type: "status", items: [{ id, prevStatus }] });

      // dohvati autora iz objave (ako postoji)
      const obj = objave.find((o) => o._id === id);
      const authorId = obj?.autor?._id || obj?.autorId || null;

      // posalji notifikaciju autoru (razlog ide u poruku)
      if (noviStatus === "odbijeno") {
        const title = "Objava odbijena";
        const message =
          (reason && reason.trim()) ||
          "Vaša objava je odbijena od strane administratora.";
        await sendNotificationToAuthor(authorId, title, message, id);
      } else if (noviStatus === "odobreno") {
        await sendNotificationToAuthor(
          authorId,
          "Objava odobrena",
          "Vaša objava je odobrena i postala je javna.",
          id
        );
      }

      toast(noviStatus === "odobreno" ? "Objava odobrena!" : "Objava odbijena!", "success");
    } catch (err) {
      console.error("update status error:", err);
      toast("Greška pri promjeni statusa.", "error");
    }
    setLoadingId(null);
    // zatvori reason dialog ako je otvoren za taj id
    if (reasonForId === id) {
      setReasonDialogOpen(false);
      setReasonForId(null);
      setRejectReason("");
    }
  };

  // bulk promjena (za odbijanje grupno, otvorimo modal s razlogom)
  const handleBulkStatusChange = async (statusKey, noviStatus, grupirane, askReason = false) => {
    const kandidatIds = grupirane[statusKey].map((o) => o._id);
    const targetIds = kandidatIds.filter((id) => selectedIds.includes(id));
    if (targetIds.length === 0) return toast("Nema odabranih objava za ovu akciju.", "info");

    if (noviStatus === "odbijeno" && askReason) {
      // otvori dialog za unos razloga i pamtimo targetIds u state
      setReasonForId("__bulk__:" + statusKey);
      setReasonDialogOpen(true);
      (window as any).__admin_bulk_targetIds = targetIds; // quick hack za prosljeđivanje
      return;
    }

    const prevStatuses = objave.filter((o) => targetIds.includes(o._id)).map((o) => ({ id: o._id, prevStatus: o.status }));
    setBulkLoading(true);
    try {
      await Promise.all(targetIds.map((id) => api.patch(`/objave/${id}/status`, { status: noviStatus })));

      setObjave((prev) => prev.map((o) => (targetIds.includes(o._id) ? { ...o, status: noviStatus } : o)));
      setLastBulkAction({ type: "status", items: prevStatuses });

      // poslji notifikacije autorima (ako odbijamo, može biti isti razlog)
      if (noviStatus === "odbijeno") {
        const reason = rejectReason || "Objava je odbijena od strane administratora.";
        const authors = objave.filter((o) => targetIds.includes(o._id)).map((o) => ({ id: o._id, authorId: o.autor?._id || o.autor }));
        await Promise.all(authors.map((a) => sendNotificationToAuthor(a.authorId, "Objava odbijena", reason, a.id)));
      } else if (noviStatus === "odobreno") {
        const authors = objave.filter((o) => targetIds.includes(o._id)).map((o) => ({ id: o._id, authorId: o.autor?._id || o.autor }));
        await Promise.all(authors.map((a) => sendNotificationToAuthor(a.authorId, "Objava odobrena", "Objava je odobrena.", a.id)));
      }

      setSelectedIds((prev) => prev.filter((id) => !targetIds.includes(id)));
      toast(noviStatus === "odobreno" ? `Odobreno ${targetIds.length} objava.` : `Odbijeno ${targetIds.length} objava.`, "success");
    } catch (err) {
      console.error("bulk status error:", err);
      toast("Greška pri grupnoj promjeni statusa.", "error");
    }
    setBulkLoading(false);
  };

  const handleBulkDeleteSelected = async () => {
    const deletableIds = objave.filter((o) => selectedIds.includes(o._id) && (o.status === "odobreno" || o.status === "odbijeno")).map((o) => o._id);
    if (deletableIds.length === 0) return toast("Nema odabranih prihvaćenih/odbijenih objava za brisanje.", "info");
    if (!window.confirm(`Sigurno želiš obrisati ${deletableIds.length} odabranih objava?`)) return;
    setBulkLoading(true);
    try {
      await Promise.all(deletableIds.map((id) => api.delete(`/objave/${id}`)));
      setObjave((prev) => prev.filter((o) => !deletableIds.includes(o._id)));
      setSelectedIds((prev) => prev.filter((id) => !deletableIds.includes(id)));
      toast(`Obrisano ${deletableIds.length} objava.`, "success");
    } catch (err) {
      console.error("bulk delete error:", err);
      toast("Greška pri masovnom brisanju objava.", "error");
    }
    setBulkLoading(false);
  };

  const handleUndoLastAction = async () => {
    if (!lastBulkAction || lastBulkAction.type !== "status") return;
    const items = lastBulkAction.items;
    if (!items || items.length === 0) return;
    setBulkLoading(true);
    try {
      await Promise.all(items.map((it) => api.patch(`/objave/${it.id}/status`, { status: it.prevStatus })));
      setObjave((prev) => prev.map((o) => {
        const found = items.find((it) => it.id === o._id);
        return found ? { ...o, status: found.prevStatus } : o;
      }));
      toast("Zadnja akcija je poništena.", "success");
      setLastBulkAction(null);
    } catch (err) {
      console.error("undo error:", err);
      toast("Greška pri poništavanju akcije.", "error");
    }
    setBulkLoading(false);
  };

  const handleTogglePin = async (id, currentPinned) => {
    setLoadingId(id);
    try {
      await api.patch(`/objave/${id}/pin`);
      setObjave((prev) => prev.map((o) => (o._id === id ? { ...o, pinned: !currentPinned } : o)));
      toast(currentPinned ? "Objava otkvačena." : "Objava prikvačena!", "success");
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
      setObjave((prev) => prev.map((o) => (o._id === id ? { ...o, urgentno: !currentUrgentno } : o)));
      toast(currentUrgentno ? "Objava više nije hitna." : "Objava označena kao hitna!", "success");
    } catch (err) {
      console.error("toggle urgentno error:", err);
      toast("Greška pri označavanju objave.", "error");
    }
    setLoadingId(null);
  };

  const confirmDelete = (id) => setDeleteId(id);
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

  // simple grouping
  const grupirane = { "na čekanju": [], odobreno: [], odbijeno: [] };
  objave.forEach((o) => { if (grupirane[o.status]) grupirane[o.status].push(o); });

  const statusi = [
    { key: "na čekanju", label: "Na čekanju", color: "#f6af24" },
    { key: "odobreno", label: "Prihvaćene", color: "#23cb63" },
    { key: "odbijeno", label: "Odbijene", color: "#e21a1a" },
  ];

  return (
    <section className="page-bg">
      <div className="container">
        <h1>Admin panel</h1>

        {/* top controls */}
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          <TextField size="small" label="Pretraži" value={search} onChange={(e) => setSearch(e.target.value)} />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Tip</InputLabel>
            <Select value={filterTip} label="Tip" onChange={(e) => setFilterTip(e.target.value)}>
              {tipovi.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
            </Select>
          </FormControl>

          <Button variant="outlined" onClick={() => handleBulkStatusChange("na čekanju", "odobreno", grupirane, false)} disabled={bulkLoading}>Odobri odabrane</Button>
          <Button variant="outlined" color="error" onClick={() => handleBulkStatusChange("na čekanju", "odbijeno", grupirane, true)} disabled={bulkLoading}>Odbij odabrane (s razlogom)</Button>
          <Button variant="outlined" color="error" onClick={handleBulkDeleteSelected} disabled={bulkLoading}><DeleteIcon /> Obriši odabrane</Button>
          <Button variant="outlined" onClick={handleUndoLastAction} disabled={!lastBulkAction || bulkLoading}>Poništi zadnju</Button>
        </Box>

        {/* cards by status */}
        <div className="card-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          {statusi.map(st => (
            <div key={st.key} className="card card-static status-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <h2 style={{ margin: 0 }}>{st.label} <Chip label={grupirane[st.key].length} size="small" sx={{ bgcolor: st.color, color: "#fff", fontWeight: 700, ml: 1 }} /></h2>
                {grupirane[st.key].length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Checkbox
                      size="small"
                      checked={grupirane[st.key].every(o => selectedIds.includes(o._id))}
                      indeterminate={grupirane[st.key].some(o => selectedIds.includes(o._id)) && !grupirane[st.key].every(o => selectedIds.includes(o._1))}
                      onChange={() => toggleSelectStatus(st.key, grupirane)}
                    />
                    <span style={{ fontSize: 13, color: "#555" }}>Označi sve</span>
                  </div>
                )}
              </div>

              {grupirane[st.key].length === 0 ? <p className="center-msg">Nema objava.</p> :
                grupirane[st.key].map(o => {
                  const isSelected = selectedIds.includes(o._1) || selectedIds.includes(o._id);
                  const oid = o._id || o._1;
                  return (
                    <div key={oid} className="card card-static inner-card" style={{ marginBottom: 12, position: "relative" }}>
                      <div style={{ position: "absolute", top: 8, right: 8 }}>
                        <Checkbox size="small" checked={selectedIds.includes(oid)} onChange={() => toggleSelect(oid)} />
                      </div>

                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                        {o.pinned && <Chip icon={<PushPinIcon />} label="Prikvačeno" size="small" />}
                        {o.urgentno && <Chip icon={<NewReleasesIcon />} label="Hitno" size="small" color="error" />}
                        <div style={{ marginLeft: "auto", color: "#666", fontSize: 13 }}>{new Date(o.datum || Date.now()).toLocaleDateString("hr-HR")}</div>
                      </div>

                      <h3 style={{ marginTop: 0 }}>{o.naslov}</h3>
                      <p style={{ color: "#555", marginBottom: 8 }}>{o.sadrzaj?.length > 160 ? `${o.sadrzaj.slice(0,160)}...` : o.sadrzaj || "Nema opisa."}</p>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        {st.key === "na čekanju" && (
                          <>
                            <Button size="small" onClick={() => handleStatusChange(oid, "odobreno")} disabled={loadingId === oid || bulkLoading}>Odobri</Button>
                            <Button size="small" color="error" onClick={() => { setReasonForId(oid); setReasonDialogOpen(true); }} disabled={loadingId === oid || bulkLoading}>Odbij</Button>
                          </>
                        )}

                        {st.key === "odobreno" && (
                          <>
                            <IconButton size="small" onClick={() => handleTogglePin(oid, !!o.pinned)} disabled={loadingId === oid || bulkLoading} title={o.pinned ? "Otkvači" : "Prikvači"}>
                              {o.pinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
                            </IconButton>
                            <IconButton size="small" onClick={() => handleToggleUrgentno(oid, !!o.urgentno)} disabled={loadingId === oid || bulkLoading} title={o.urgentno ? "Ukloni hitno" : "Označi hitno"}>
                              {o.urgentno ? <NewReleasesIcon /> : <NewReleasesOutlinedIcon />}
                            </IconButton>
                          </>
                        )}

                        <Button size="small" color="error" onClick={() => { confirmDelete(oid); }} disabled={loadingId === oid || bulkLoading}>Obriši</Button>
                      </div>

                      <div style={{ marginTop: 8, color: "#666", fontSize: 13 }}>
                        <span>Autor: {o.autor?.ime || o.autorIme || o.autor || "Nepoznato"}</span>
                        <span style={{ marginLeft: 12 }}>Tip: {o.tip}</span>
                        <span style={{ marginLeft: 12 }}>Odsjek: {ODSJECI.find(x => x.id === o.odsjek)?.naziv || o.odsjek || "-"}</span>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          ))}
        </div>

        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
          <DialogTitle>Potvrdi brisanje</DialogTitle>
          <DialogContent><DialogContentText>Sigurno želite obrisati ovu objavu? Ova radnja je nepovratna.</DialogContentText></DialogContent>
          <DialogActions><Button onClick={() => setDeleteId(null)}>Odustani</Button><Button onClick={handleDelete} color="error" variant="contained">Obriši</Button></DialogActions>
        </Dialog>

        {/* RAZLOG DIALOG (pojedinačno ili bulk) */}
        <Dialog open={reasonDialogOpen} onClose={() => { setReasonDialogOpen(false); setReasonForId(null); setRejectReason(""); }}>
          <DialogTitle>Razlog odbijanja</DialogTitle>
          <DialogContent>
            <DialogContentText>Unesi kratak razlog zašto odbijaš objavu — poruka će biti poslana autoru.</DialogContentText>
            <TextField autoFocus fullWidth multiline minRows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Npr. Neispravan datum, nedostaje kontakt..." sx={{ mt: 2 }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setReasonDialogOpen(false); setReasonForId(null); setRejectReason(""); }}>Odustani</Button>
            <Button onClick={async () => {
              // ako je bulk
              if (reasonForId && reasonForId.startsWith("__bulk__:")) {
                const statusKey = reasonForId.split("__bulk__:")[1];
                // retrieve targets
                const targetIds = (window as any).__admin_bulk_targetIds || [];
                if (!targetIds || targetIds.length === 0) {
                  toast("Nema odabranih objava za odbijanje.", "info");
                  setReasonDialogOpen(false);
                  return;
                }
                // apply bulk with reason
                setReasonDialogOpen(false);
                setReasonForId(null);
                await handleBulkStatusChange(statusKey, "odbijeno", { [statusKey]: objave.filter(o => targetIds.includes(o._id)) }, false);
              } else {
                // pojedinačno
                await handleStatusChange(reasonForId, "odbijeno", rejectReason);
              }
              setRejectReason("");
            }} color="error" variant="contained">Pošalji i odbij</Button>
          </DialogActions>
        </Dialog>
      </div>
    </section>
  );
}
