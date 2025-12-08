import { useEffect, useState, useRef } from "react";
import {
  Box, Button, Checkbox, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, TextField
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
  const [selectedIds, setSelectedIds] = useState([]);
  const [lastBulkAction, setLastBulkAction] = useState(null);

  const [reasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [reasonForId, setReasonForId] = useState(null); // single id or "__bulk__:statusKey"
  const [rejectReason, setRejectReason] = useState("");

  const bulkTargetIdsRef = useRef([]); // koristi umjesto window.__admin_bulk_targetIds

  const toast = useToast();

  const statusi = [
    { key: "na čekanju", label: "Na čekanju", color: "#f6af24" },
    { key: "odobreno", label: "Prihvaćene", color: "#23cb63" },
    { key: "odbijeno", label: "Odbijene", color: "#e21a1a" },
  ];

  useEffect(() => {
    fetchObjave();
  }, []); // eslint-disable-line

  const fetchObjave = async () => {
    try {
      const { data } = await api.get("/objave/admin/sve");
      setObjave(data || []);
    } catch (err) {
      console.error("fetchObjave err:", err);
      toast("Greška pri dohvaćanju objava.", "error");
    }
  };

  const grupirane = statusi.reduce((acc, s) => ({ ...acc, [s.key]: [] }), {});
  objave.forEach((o) => { if (grupirane[o.status]) grupirane[o.status].push(o); });

  const toggleSelect = id => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectStatus = (statusKey) => {
    const statusIds = grupirane[statusKey].map(o => o._id);
    const allSelected = statusIds.length > 0 && statusIds.every(id => selectedIds.includes(id));
    setSelectedIds(prev => allSelected ? prev.filter(id => !statusIds.includes(id)) : Array.from(new Set([...prev, ...statusIds])));
  };

  // pojedinačno: šalje reason ako postoji; backend kreira Obavijest
  const handleStatusChange = async (id, noviStatus, reason = null) => {
    const prevStatus = objave.find(o => o._id === id)?.status;
    setLoadingId(id);
    try {
      await api.patch(`/objave/${id}/status`, { status: noviStatus, reason: reason || undefined });
      setObjave(prev => prev.map(o => o._id === id ? { ...o, status: noviStatus } : o));
      setLastBulkAction({ type: "status", items: [{ id, prevStatus }] });

      // trigger refresh u slučaju da je user profil otvoren u istom clientu
      window.dispatchEvent(new Event("refreshObavijesti"));
      window.dispatchEvent(new Event("refreshSpremljene"));

      toast(noviStatus === "odobreno" ? "Objava odobrena!" : "Objava odbijena!", "success");
    } catch (err) {
      console.error("handleStatusChange err:", err);
      toast("Greška pri promjeni statusa.", "error");
    } finally {
      setLoadingId(null);
      if (reasonForId === id) {
        setReasonDialogOpen(false);
        setReasonForId(null);
        setRejectReason("");
      }
    }
  };

  // bulk: može primiti override listu i razlog (ako je odbijanje)
  const handleBulkStatusChange = async (statusKey, noviStatus, askReason = false, targetIdsOverride = null, reasonOverride = null) => {
    const candidate = grupirane[statusKey].map(o => o._id);
    const targetIds = Array.isArray(targetIdsOverride) ? targetIdsOverride : candidate.filter(o => selectedIds.includes(o));
    if (!targetIds.length) return toast("Nema odabranih objava.", "info");

    if (noviStatus === "odbijeno" && askReason && !reasonOverride) {
      // otvori dialog; spremi listu u ref
      setReasonForId("__bulk__:" + statusKey);
      bulkTargetIdsRef.current = targetIds;
      setReasonDialogOpen(true);
      return;
    }

    setBulkLoading(true);
    const prevStatuses = objave.filter(o => targetIds.includes(o._id)).map(o => ({ id: o._id, prevStatus: o.status }));
    try {
      // pošalji reason ako imamo
      const reasonToSend = reasonOverride || (noviStatus === "odbijeno" ? rejectReason || undefined : undefined);

      await Promise.all(targetIds.map(id =>
        api.patch(`/objave/${id}/status`, { status: noviStatus, reason: reasonToSend })
      ));

      setObjave(prev => prev.map(o => targetIds.includes(o._id) ? { ...o, status: noviStatus } : o));
      setLastBulkAction({ type: "status", items: prevStatuses });

      // trigger refresh za otvorene profile
      window.dispatchEvent(new Event("refreshObavijesti"));
      window.dispatchEvent(new Event("refreshSpremljene"));

      setSelectedIds(prev => prev.filter(id => !targetIds.includes(id)));
      toast(`${noviStatus === "odobreno" ? "Odobreno" : "Odbijeno"} ${targetIds.length} objava.`, "success");
    } catch (err) {
      console.error("handleBulkStatusChange err:", err);
      toast("Greška pri grupnoj promjeni statusa.", "error");
    } finally {
      setBulkLoading(false);
      // zatvori dialog ako je bulk
      if (reasonForId && reasonForId.startsWith("__bulk__:")) {
        setReasonDialogOpen(false);
        setReasonForId(null);
        setRejectReason("");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Sigurno želiš obrisati ovu objavu? Ova radnja je nepovratna.")) return;
    setLoadingId(id);
    try {
      await api.delete(`/objave/${id}`);
      setObjave(prev => prev.filter(o => o._id !== id));
      setSelectedIds(prev => prev.filter(x => x !== id));
      window.dispatchEvent(new Event("refreshSpremljene"));
      toast("Objava obrisana.", "success");
    } catch (err) {
      console.error("handleDelete err:", err);
      toast("Greška pri brisanju objave.", "error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleBulkDeleteSelected = async () => {
    const deletable = selectedIds.slice();
    if (!deletable.length) return toast("Nema odabranih objava za brisanje.", "info");
    if (!window.confirm(`Sigurno želiš obrisati ${deletable.length} odabranih objava?`)) return;
    setBulkLoading(true);
    try {
      await Promise.all(deletable.map(id => api.delete(`/objave/${id}`)));
      setObjave(prev => prev.filter(o => !deletable.includes(o._id)));
      setSelectedIds(prev => prev.filter(id => !deletable.includes(id)));
      window.dispatchEvent(new Event("refreshSpremljene"));
      toast(`Obrisano ${deletable.length} objava.`, "success");
    } catch (err) {
      console.error("handleBulkDeleteSelected err:", err);
      toast("Greška pri masovnom brisanju.", "error");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleUndoLastAction = async () => {
    if (!lastBulkAction?.items?.length) return;
    setBulkLoading(true);
    try {
      await Promise.all(lastBulkAction.items.map(it => api.patch(`/objave/${it.id}/status`, { status: it.prevStatus })));
      setObjave(prev => prev.map(o => {
        const found = lastBulkAction.items.find(it => it.id === o._id);
        return found ? { ...o, status: found.prevStatus } : o;
      }));
      window.dispatchEvent(new Event("refreshObavijesti"));
      toast("Zadnja akcija poništena.", "success");
      setLastBulkAction(null);
    } catch (err) {
      console.error("handleUndoLastAction err:", err);
      toast("Greška pri poništavanju akcije.", "error");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleTogglePin = async (id, pinned) => {
    setLoadingId(id);
    try {
      await api.patch(`/objave/${id}/pin`);
      setObjave(prev => prev.map(o => o._id === id ? { ...o, pinned: !pinned } : o));
      toast(pinned ? "Objava otkvačena." : "Objava prikvačena!", "success");
    } catch (err) {
      console.error("handleTogglePin err:", err);
      toast("Greška pri prikvačivanju objave.", "error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleUrgentno = async (id, urgentno) => {
    setLoadingId(id);
    try {
      await api.patch(`/objave/${id}/urgentno`);
      setObjave(prev => prev.map(o => o._id === id ? { ...o, urgentno: !urgentno } : o));
      toast(urgentno ? "Hitno uklonjeno." : "Označeno hitno!", "success");
    } catch (err) {
      console.error("handleToggleUrgentno err:", err);
      toast("Greška pri označavanju objave.", "error");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <section className="page-bg">
      <div className="container">
        <h1>Admin Panel</h1>

        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          <Button variant="outlined" onClick={() => handleBulkStatusChange("na čekanju", "odobreno")} disabled={bulkLoading}>Odobri odabrane</Button>
          <Button variant="outlined" color="error" onClick={() => handleBulkStatusChange("na čekanju", "odbijeno", true)} disabled={bulkLoading}>Odbij odabrane</Button>
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleBulkDeleteSelected} disabled={bulkLoading}>Obriši odabrane</Button>
          <Button variant="outlined" onClick={handleUndoLastAction} disabled={!lastBulkAction || bulkLoading}>Poništi zadnju</Button>
        </Box>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {statusi.map(st => (
            <div key={st.key} className="card card-static">
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <h2>{st.label} <Chip label={grupirane[st.key].length} size="small" sx={{ bgcolor: st.color, color: "#fff" }} /></h2>
                <Checkbox
                  checked={grupirane[st.key].length > 0 && grupirane[st.key].every(o => selectedIds.includes(o._id))}
                  indeterminate={grupirane[st.key].some(o => selectedIds.includes(o._id)) && !grupirane[st.key].every(o => selectedIds.includes(o._id))}
                  onChange={() => toggleSelectStatus(st.key)}
                />
              </Box>

              {grupirane[st.key].length === 0 ? <p className="center-msg">Nema objava.</p> :
                grupirane[st.key].map(o => (
                  <div key={o._id} className="card card-static inner-card" style={{ marginBottom: 12, position: "relative" }}>
                    <Checkbox size="small" checked={selectedIds.includes(o._id)} onChange={() => toggleSelect(o._id)} style={{ position: "absolute", top: 8, right: 8 }} />
                    <h3 style={{ marginTop: 0 }}>{o.naslov}</h3>
                    <p style={{ color: "#555" }}>{o.sadrzaj?.slice(0, 160)}{o.sadrzaj?.length > 160 ? "..." : ""}</p>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {st.key === "na čekanju" && <>
                        <Button size="small" onClick={() => handleStatusChange(o._id, "odobreno")} disabled={loadingId === o._id || bulkLoading}>Odobri</Button>
                        <Button size="small" color="error" onClick={() => { setReasonForId(o._id); setReasonDialogOpen(true); }} disabled={loadingId === o._id || bulkLoading}>Odbij</Button>
                      </>}
                      {st.key === "odobreno" && <>
                        <IconButton size="small" onClick={() => handleTogglePin(o._id, !!o.pinned)} disabled={loadingId === o._id || bulkLoading} title={o.pinned ? "Otkvači" : "Prikvači"}>
                          {o.pinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
                        </IconButton>
                        <IconButton size="small" onClick={() => handleToggleUrgentno(o._id, !!o.urgentno)} disabled={loadingId === o._id || bulkLoading} title={o.urgentno ? "Ukloni hitno" : "Označi hitno"}>
                          {o.urgentno ? <NewReleasesIcon /> : <NewReleasesOutlinedIcon />}
                        </IconButton>
                      </>}
                      <Button size="small" color="error" onClick={() => handleDelete(o._id)} disabled={loadingId === o._id || bulkLoading}>Obriši</Button>
                    </Box>

                    <div style={{ marginTop: 8, color: "#666", fontSize: 13 }}>
                      <span>Autor: {o.autor?.ime || o.autor || "Nepoznato"}</span>
                      <span style={{ marginLeft: 12 }}>Tip: {o.tip}</span>
                      <span style={{ marginLeft: 12 }}>Odsjek: {ODSJECI.find(x => x.id === o.odsjek)?.naziv || o.odsjek || "-"}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          ))}
        </div>

        <Dialog open={reasonDialogOpen} onClose={() => { setReasonDialogOpen(false); setReasonForId(null); setRejectReason(""); }}>
          <DialogTitle>Razlog odbijanja</DialogTitle>
          <DialogContent>
            <TextField fullWidth multiline minRows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Unesi razlog..." />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setReasonDialogOpen(false); setReasonForId(null); setRejectReason(""); }}>Odustani</Button>
            <Button color="error" variant="contained" onClick={async () => {
              if (reasonForId?.startsWith("__bulk__")) {
                const statusKey = reasonForId.split("__bulk__:")[1];
                const targetIds = Array.isArray(bulkTargetIdsRef.current) ? bulkTargetIdsRef.current : [];
                setReasonDialogOpen(false);
                setReasonForId(null);
                // proslijedi targetIdsOverride i reasonOverride
                await handleBulkStatusChange(statusKey, "odbijeno", false, targetIds, rejectReason);
              } else {
                await handleStatusChange(reasonForId, "odbijeno", rejectReason);
              }
              setRejectReason("");
            }}>Pošalji</Button>
          </DialogActions>
        </Dialog>
      </div>
    </section>
  );
}
