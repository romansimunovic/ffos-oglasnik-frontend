// src/pages/AdminPanel.jsx
import { useEffect, useState, useRef } from "react";
import {
  Box, Button, Checkbox, Chip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
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

  const bulkTargetIdsRef = useRef([]); // <-- koristi umjesto window.__admin_bulk_targetIds

  const toast = useToast();

  const statusi = [
    { key: "na čekanju", label: "Na čekanju", color: "#f6af24" },
    { key: "odobreno", label: "Prihvaćene", color: "#23cb63" },
    { key: "odbijeno", label: "Odbijene", color: "#e21a1a" },
  ];

  useEffect(() => fetchObjave(), []);

  const fetchObjave = async () => {
    try {
      const { data } = await api.get("/objave/admin/sve");
      setObjave(data || []);
    } catch (err) {
      console.error(err);
      toast("Greška pri dohvaćanju objava.", "error");
    }
  };

  const grupirane = statusi.reduce((acc, s) => ({ ...acc, [s.key]: [] }), {});
  objave.forEach(o => { if (grupirane[o.status]) grupirane[o.status].push(o); });

  const toggleSelect = id => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectStatus = (statusKey) => {
    const statusIds = grupirane[statusKey].map(o => o._id);
    const allSelected = statusIds.every(id => selectedIds.includes(id));
    setSelectedIds(prev => allSelected ? prev.filter(id => !statusIds.includes(id)) : Array.from(new Set([...prev, ...statusIds])));
  };

  const handleStatusChange = async (id, noviStatus, reason = null) => {
    const prevStatus = objave.find(o => o._id === id)?.status;
    setLoadingId(id);
    try {
      await api.patch(`/objave/${id}/status`, { status: noviStatus, reason: reason || undefined });
      setObjave(prev => prev.map(o => o._id === id ? { ...o, status: noviStatus } : o));
      setLastBulkAction({ type: "status", items: [{ id, prevStatus }] });

      // notifikacija autoru
      const obj = objave.find(o => o._id === id);
      const authorId = obj?.autor?._id || obj?.autorId || null;
      if (authorId) {
        const title = noviStatus === "odobreno" ? "Objava odobrena" : "Objava odbijena";
        const message = noviStatus === "odobreno"
          ? "Vaša objava je odobrena i postala je javna."
          : (reason || "Objava odbijena od strane administratora.");
        // endpoint: POST /korisnik/:userId/obavijesti (protect)
        await api.post(`/korisnik/${authorId}/obavijesti`, { title, message, objavaId: id });
      }

      toast(noviStatus === "odobreno" ? "Objava odobrena!" : "Objava odbijena!", "success");
    } catch (err) {
      console.error(err);
      toast("Greška pri promjeni statusa.", "error");
    }
    setLoadingId(null);
    if (reasonForId === id) {
      setReasonDialogOpen(false);
      setReasonForId(null);
      setRejectReason("");
    }
  };

  // moguće proslijediti ciljnu listu targetIdsOverride (koristi se kod bulk nakon reason dialog)
  const handleBulkStatusChange = async (statusKey, noviStatus, askReason = false, targetIdsOverride = null) => {
    const candidate = grupirane[statusKey].map(o => o._id);
    const targetIds = Array.isArray(targetIdsOverride) ? targetIdsOverride : candidate.filter(o => selectedIds.includes(o));
    if (!targetIds.length) return toast("Nema odabranih objava.", "info");

    if (noviStatus === "odbijeno" && askReason) {
      setReasonForId("__bulk__:" + statusKey);
      bulkTargetIdsRef.current = targetIds;
      setReasonDialogOpen(true);
      return;
    }

    setBulkLoading(true);
    const prevStatuses = objave.filter(o => targetIds.includes(o._id)).map(o => ({ id: o._id, prevStatus: o.status }));
    try {
      await Promise.all(targetIds.map(id => api.patch(`/objave/${id}/status`, { status: noviStatus })));
      setObjave(prev => prev.map(o => targetIds.includes(o._id) ? { ...o, status: noviStatus } : o));
      setLastBulkAction({ type: "status", items: prevStatuses });

      // send notifications to authors
      await Promise.all(
        objave.filter(o => targetIds.includes(o._id)).map(async o => {
          const authorId = o.autor?._id || o.autor;
          if (!authorId) return;
          const title = noviStatus === "odobreno" ? "Objava odobrena" : "Objava odbijena";
          const message = noviStatus === "odobreno"
            ? "Vaša objava je odobrena i postala je javna."
            : (rejectReason || "Objava odbijena od strane administratora.");
          try {
            await api.post(`/korisnik/${authorId}/obavijesti`, { title, message, objavaId: o._id });
          } catch (e) {
            // ignore individual send fails
            console.warn("notif fail:", e);
          }
        })
      );

      setSelectedIds(prev => prev.filter(id => !targetIds.includes(id)));
      toast(`${noviStatus === "odobreno" ? "Odobreno" : "Odbijeno"} ${targetIds.length} objava.`, "success");
    } catch (err) {
      console.error(err);
      toast("Greška pri grupnoj promjeni statusa.", "error");
    }
    setBulkLoading(false);
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
      toast("Zadnja akcija poništena.", "success");
      setLastBulkAction(null);
    } catch (err) {
      console.error(err);
      toast("Greška pri poništavanju akcije.", "error");
    }
    setBulkLoading(false);
  };

  const handleTogglePin = async (id, pinned) => {
    setLoadingId(id);
    try {
      await api.patch(`/objave/${id}/pin`);
      setObjave(prev => prev.map(o => o._id === id ? { ...o, pinned: !pinned } : o));
      toast(pinned ? "Objava otkvačena." : "Objava prikvačena!", "success");
    } catch (err) {
      console.error(err);
      toast("Greška pri prikvačivanju objave.", "error");
    }
    setLoadingId(null);
  };

  const handleToggleUrgentno = async (id, urgentno) => {
    setLoadingId(id);
    try {
      await api.patch(`/objave/${id}/urgentno`);
      setObjave(prev => prev.map(o => o._id === id ? { ...o, urgentno: !urgentno } : o));
      toast(urgentno ? "Hitno uklonjeno." : "Označeno hitno!", "success");
    } catch (err) {
      console.error(err);
      toast("Greška pri označavanju objave.", "error");
    }
    setLoadingId(null);
  };

  return (
    <section className="page-bg">
      <div className="container">
        <h1>Admin Panel</h1>

        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          <Button variant="outlined" onClick={() => handleBulkStatusChange("na čekanju", "odobreno")} disabled={bulkLoading}>Odobri odabrane</Button>
          <Button variant="outlined" color="error" onClick={() => handleBulkStatusChange("na čekanju", "odbijeno", true)} disabled={bulkLoading}>Odbij odabrane</Button>
          <Button variant="outlined" onClick={handleUndoLastAction} disabled={!lastBulkAction || bulkLoading}>Poništi zadnju</Button>
        </Box>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {statusi.map(st => (
            <div key={st.key} className="card card-static">
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <h2>{st.label} <Chip label={grupirane[st.key].length} size="small" sx={{ bgcolor: st.color, color: "#fff" }} /></h2>
                <Checkbox
                  checked={grupirane[st.key].every(o => selectedIds.includes(o._id))}
                  indeterminate={grupirane[st.key].some(o => selectedIds.includes(o._id)) && !grupirane[st.key].every(o => selectedIds.includes(o._id))}
                  onChange={() => toggleSelectStatus(st.key)}
                />
              </Box>

              {grupirane[st.key].map(o => (
                <div key={o._id} className="card card-static inner-card" style={{ marginBottom: 12, position: "relative" }}>
                  <Checkbox size="small" checked={selectedIds.includes(o._id)} onChange={() => toggleSelect(o._id)} style={{ position: "absolute", top: 8, right: 8 }} />
                  <h3>{o.naslov}</h3>
                  <p>{o.sadrzaj?.slice(0, 160)}{o.sadrzaj?.length > 160 ? "..." : ""}</p>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {st.key === "na čekanju" && <>
                      <Button size="small" onClick={() => handleStatusChange(o._id, "odobreno")}>Odobri</Button>
                      <Button size="small" color="error" onClick={() => { setReasonForId(o._id); setReasonDialogOpen(true); }}>Odbij</Button>
                    </>}
                    {st.key === "odobreno" && <>
                      <IconButton size="small" onClick={() => handleTogglePin(o._id, !!o.pinned)}>{o.pinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}</IconButton>
                      <IconButton size="small" onClick={() => handleToggleUrgentno(o._id, !!o.urgentno)}>{o.urgentno ? <NewReleasesIcon /> : <NewReleasesOutlinedIcon />}</IconButton>
                    </>}
                  </Box>
                </div>
              ))}
            </div>
          ))}
        </div>

        <Dialog open={reasonDialogOpen} onClose={() => setReasonDialogOpen(false)}>
          <DialogTitle>Razlog odbijanja</DialogTitle>
          <DialogContent>
            <TextField fullWidth multiline minRows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Unesi razlog..." />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setReasonDialogOpen(false); setReasonForId(null); setRejectReason(""); }}>Odustani</Button>
            <Button color="error" onClick={async () => {
              if (reasonForId?.startsWith("__bulk__")) {
                const statusKey = reasonForId.split("__bulk__:")[1];
                const targetIds = Array.isArray(bulkTargetIdsRef.current) ? bulkTargetIdsRef.current : [];
                setReasonDialogOpen(false);
                setReasonForId(null);
                // proslijedi targetIdsOverride da se koristi ista lista koju smo spremili
                await handleBulkStatusChange(statusKey, "odbijeno", false, targetIds);
              } else {
                await handleStatusChange(reasonForId, "odbijeno", rejectReason);
              }
              setRejectReason("");
            }} variant="contained">Pošalji</Button>
          </DialogActions>
        </Dialog>
      </div>
    </section>
  );
}
