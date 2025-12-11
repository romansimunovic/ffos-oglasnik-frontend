import { getTypeDetails, getDeptDetails } from "../utils/uiHelpers";
import { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";

import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import NewReleasesOutlinedIcon from "@mui/icons-material/NewReleasesOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import EventIcon from "@mui/icons-material/Event";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BookmarkIcon from "@mui/icons-material/Bookmark";

import api from "../api/axiosInstance";
import { useToast } from "../components/Toast";
import { ODSJECI } from "../constants/odsjeci";


export default function AdminPanel() {
  const [objave, setObjave] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [lastBulkAction, setLastBulkAction] = useState(null);

  // dialog kontrola
  const [reasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [reasonForId, setReasonForId] = useState(null); // single id or "__bulk__:statusKey"
  const reasonRef = useRef(null); // UNCONTROLLED input

  const bulkTargetIdsRef = useRef([]); // koristi umjesto global var

  const toast = useToast();

  const statusi = [
    { key: "na čekanju", label: "Na čekanju", color: "#f6af24" },
    { key: "odobreno", label: "Prihvaćene", color: "#23cb63" },
    { key: "odbijeno", label: "Odbijene", color: "#e21a1a" },
  ];

  // per-status limits (start with 50 each)
  const [limits, setLimits] = useState(() =>
    statusi.reduce((acc, s) => ({ ...acc, [s.key]: 50 }), {})
  );

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
      // zatvori dialog ako je bio single
      if (reasonForId === id) {
        setReasonDialogOpen(false);
        setReasonForId(null);
        if (reasonRef.current) reasonRef.current.value = "";
      }
    }
  };

  // bulk: može primiti override listu i razlog (ako je odbijanje)
  const handleBulkStatusChange = async (statusKey, noviStatus, askReason = false, targetIdsOverride = null, reasonOverride = null) => {
    const candidate = grupirane[statusKey].map(o => o._id);
    const targetIds = Array.isArray(targetIdsOverride) ? targetIdsOverride : candidate.filter(o => selectedIds.includes(o));
    if (!targetIds.length) return toast("Nema odabranih objava.", "info");

    if (noviStatus === "odbijeno" && askReason && !reasonOverride) {
      setReasonForId("__bulk__:" + statusKey);
      bulkTargetIdsRef.current = targetIds;
      setReasonDialogOpen(true);
      return;
    }

    setBulkLoading(true);
    const prevStatuses = objave.filter(o => targetIds.includes(o._id)).map(o => ({ id: o._id, prevStatus: o.status }));
    try {
      const reasonToSend = reasonOverride;
      await Promise.all(targetIds.map(id =>
        api.patch(`/objave/${id}/status`, { status: noviStatus, reason: reasonToSend })
      ));

      setObjave(prev => prev.map(o => targetIds.includes(o._id) ? { ...o, status: noviStatus } : o));
      setLastBulkAction({ type: "status", items: prevStatuses });

      window.dispatchEvent(new Event("refreshObavijesti"));
      window.dispatchEvent(new Event("refreshSpremljene"));

      setSelectedIds(prev => prev.filter(id => !targetIds.includes(id)));
      toast(`${noviStatus === "odobreno" ? "Odobreno" : "Odbijeno"} ${targetIds.length} objava.`, "success");
    } catch (err) {
      console.error("handleBulkStatusChange err:", err);
      toast("Greška pri grupnoj promjeni statusa.", "error");
    } finally {
      setBulkLoading(false);
      if (reasonForId && reasonForId.startsWith("__bulk__:")) {
        setReasonDialogOpen(false);
        setReasonForId(null);
        if (reasonRef.current) reasonRef.current.value = "";
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
      toast(pinned ? "Objava otkvačena." : "Objava prikvačana!", "success");
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

  // submit iz dialoga (single ili bulk) - čitamo iz reasonRef (uncontrolled)
  const handleReasonSubmit = async () => {
    const val = reasonRef.current?.value || "";
    if (!val.trim() || val.trim().length < 3) {
      return toast("Unesi konkretan razlog (bar 3 znaka).", "info");
    }

    try {
      if (reasonForId?.startsWith("__bulk__:")) {
        const statusKey = reasonForId.split("__bulk__:")[1];
        const targetIds = Array.isArray(bulkTargetIdsRef.current) ? bulkTargetIdsRef.current : [];
        setReasonDialogOpen(false);
        setReasonForId(null);
        if (reasonRef.current) reasonRef.current.value = "";

        await handleBulkStatusChange(statusKey, "odbijeno", false, targetIds, val);
      } else {
        const id = reasonForId;
        setReasonDialogOpen(false);
        setReasonForId(null);
        if (reasonRef.current) reasonRef.current.value = "";

        await handleStatusChange(id, "odbijeno", val);
      }
    } catch (err) {
      console.error("handleReasonSubmit err:", err);
      toast("Greška pri slanju razloga.", "error");
    }
  };

  return (
    <section className="page-bg">
      <div className="container">
        <h1>Admin Panel</h1>

        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          <Button variant="outlined" onClick={() => handleBulkStatusChange("na čekanju", "odobreno")} disabled={bulkLoading}>
            Odobri odabrane
          </Button>
          <Button variant="outlined" color="error" onClick={() => handleBulkStatusChange("na čekanju", "odbijeno", true)} disabled={bulkLoading}>
            Odbij odabrane
          </Button>
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleBulkDeleteSelected} disabled={bulkLoading}>
            Obriši odabrane
          </Button>
          <Button variant="outlined" onClick={handleUndoLastAction} disabled={!lastBulkAction || bulkLoading}>
            Poništi zadnju
          </Button>
        </Box>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {statusi.map((st) => (
            <div key={st.key} className="card card-static" style={{ padding: 12 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <h2 style={{ margin: 0 }}>
                  {st.label}{" "}
                  <Chip label={grupirane[st.key].length} size="small" sx={{ bgcolor: st.color, color: "#fff", ml: 1 }} />
                </h2>

                <Checkbox
                  checked={grupirane[st.key].length > 0 && grupirane[st.key].every((o) => selectedIds.includes(o._id))}
                  indeterminate={
                    grupirane[st.key].some((o) => selectedIds.includes(o._id)) &&
                    !grupirane[st.key].every((o) => selectedIds.includes(o._id))
                  }
                  onChange={() => toggleSelectStatus(st.key)}
                />
              </Box>

              {grupirane[st.key].length === 0 ? (
                <p className="center-msg">Nema objava.</p>
              ) : (
                <>
                  {grupirane[st.key].slice(0, limits[st.key] || 50).map((o) => {
                    const typeDetails = getTypeDetails((o.tip || "ostalo").toLowerCase());
                    const deptDetails = getDeptDetails(
                      ODSJECI.find((x) => x.id === (o.odsjek?._id || o.odsjek))?.id ||
                        (typeof o.odsjek === "string" ? o.odsjek : "")
                    );
                    const TypeIcon = typeDetails.Icon;
                    const DeptIcon = deptDetails.Icon;
                    const shortContent = (o.sadrzaj || "").length > 160 ? (o.sadrzaj || "").slice(0, 160) + "..." : o.sadrzaj || "";
                    const datum = o.datum
                      ? new Date(o.datum).toLocaleDateString("hr-HR", { day: "2-digit", month: "2-digit", year: "numeric" })
                      : "";

                    return (
                      <div
                        key={o._id}
                        className="card card-static inner-card"
                        style={{ marginBottom: 12, position: "relative", padding: 12 }}
                      >
                        <Checkbox
                          size="small"
                          checked={selectedIds.includes(o._id)}
                          onChange={() => toggleSelect(o._id)}
                          style={{ position: "absolute", top: 10, right: 10 }}
                        />

                        <Typography
                          variant="h6"
                          sx={{ margin: 0, cursor: "pointer", color: "#111" }}
                          onClick={() => (window.location.href = `/objava/${o._id}`)}
                        >
                          {o.naslov}
                        </Typography>

                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", mt: 1, mb: 1 }}>
                          <Chip
                            icon={<TypeIcon sx={typeDetails.iconSx} />}
                            label={typeDetails.label}
                            size="small"
                            sx={{
                              bgcolor: typeDetails.color,
                              color: typeDetails.contrastText,
                              fontWeight: 700,
                              "& .MuiChip-icon": { color: `${typeDetails.contrastText} !important` },
                            }}
                          />
                          <Chip
                            icon={<DeptIcon sx={deptDetails.iconSx} />}
                            label={
                              ODSJECI.find((x) => x.id === (o.odsjek?._id || o.odsjek))?.naziv ||
                              (typeof o.odsjek === "string" ? o.odsjek : "-")
                            }
                            size="small"
                            sx={{
                              bgcolor: deptDetails.color,
                              color: deptDetails.contrastText,
                              "& .MuiChip-icon": { color: `${deptDetails.contrastText} !important` },
                            }}
                          />
                          {datum && <Chip icon={<EventIcon />} label={datum} size="small" />}
                          <Box sx={{ ml: "auto", display: "flex", gap: 1, alignItems: "center" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <VisibilityIcon fontSize="small" /> <Typography variant="body2">{o.views || 0}</Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <BookmarkIcon fontSize="small" /> <Typography variant="body2">{o.saves || 0}</Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Typography component="div" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.5, color: "#333", mb: 1 }}>
                          {shortContent}
                        </Typography>

                        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                          {st.key === "na čekanju" && (
                            <>
                              <Button
                                size="small"
                                onClick={() => handleStatusChange(o._id, "odobreno")}
                                disabled={loadingId === o._id || bulkLoading}
                              >
                                Odobri
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => {
                                  setReasonForId(o._id);
                                  setReasonDialogOpen(true);
                                }}
                                disabled={loadingId === o._id || bulkLoading}
                              >
                                Odbij
                              </Button>
                            </>
                          )}

                          {st.key === "odobreno" && (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => handleTogglePin(o._id, !!o.pinned)}
                                disabled={loadingId === o._id || bulkLoading}
                                title={o.pinned ? "Otkvači" : "Prikvači"}
                              >
                                {o.pinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleUrgentno(o._id, !!o.urgentno)}
                                disabled={loadingId === o._id || bulkLoading}
                                title={o.urgentno ? "Ukloni hitno" : "Označi hitno"}
                              >
                                {o.urgentno ? <NewReleasesIcon /> : <NewReleasesOutlinedIcon />}
                              </IconButton>
                            </>
                          )}

                          <Button size="small" color="error" onClick={() => handleDelete(o._id)} disabled={loadingId === o._id || bulkLoading}>
                            Obriši
                          </Button>
                        </Box>

                        <div style={{ marginTop: 8, color: "#666", fontSize: 13 }}>
                          <span>Autor: {o.autor?.ime || o.autor || "Nepoznato"}</span>
                          <span style={{ marginLeft: 12 }}>
                            Tip: <strong>{typeDetails.label}</strong>
                          </span>
                          <span style={{ marginLeft: 12 }}>
                            Odsjek: {ODSJECI.find((x) => x.id === o.odsjek)?.naziv || o.odsjek || "-"}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Prikaži još za ovaj status */}
                  {grupirane[st.key].length > (limits[st.key] || 0) && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() =>
                          setLimits(prev => ({ ...prev, [st.key]: (prev[st.key] || 0) + 50 }))
                        }
                      >
                        Prikaži još 50 ({grupirane[st.key].length - (limits[st.key] || 0)} preostalo)
                      </Button>
                    </Box>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        <Dialog
          open={reasonDialogOpen}
          onClose={() => {
            setReasonDialogOpen(false);
            setReasonForId(null);
            if (reasonRef.current) reasonRef.current.value = "";
          }}
          fullWidth
          maxWidth="md"
          PaperProps={{ sx: { minWidth: 560, maxWidth: "90vw", p: 1 } }}
        >
          <DialogTitle>Razlog odbijanja</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              minRows={4}
              inputRef={reasonRef}
              defaultValue=""
              placeholder="Unesi razlog... (što konkretnije — korisniku će stići obavijest)"
              inputProps={{ maxLength: 1000 }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setReasonDialogOpen(false);
                setReasonForId(null);
                if (reasonRef.current) reasonRef.current.value = "";
              }}
            >
              Odustani
            </Button>
            <Button color="error" variant="contained" onClick={handleReasonSubmit}>
              Pošalji
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </section>
  );
}
