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
  const [bulkLoading, setBulkLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterTip, setFilterTip] = useState("Sve");
  const [selectedIds, setSelectedIds] = useState([]);
  const [lastBulkAction, setLastBulkAction] = useState(null);

  // 🔹 NOVO: filtriranje po datumu
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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

  // helper za selekciju
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
      if (allSelected) {
        // makni sve iz tog statusa
        return prev.filter((id) => !statusIds.includes(id));
      } else {
        // dodaj sve iz tog statusa
        const asSet = new Set(prev);
        statusIds.forEach((id) => asSet.add(id));
        return Array.from(asSet);
      }
    });
  };

  // single change – i dalje radi kao prije, samo spremamo za undo
  const handleStatusChange = async (id, noviStatus) => {
    const prevStatus = objave.find((o) => o._id === id)?.status;
    setLoadingId(id);
    try {
      await api.patch(`/objave/${id}/status`, { status: noviStatus });
      setObjave((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: noviStatus } : o))
      );

      setLastBulkAction({
        type: "status",
        items: [{ id, prevStatus }],
      });

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

  // bulk approve / reject
  const handleBulkStatusChange = async (statusKey, noviStatus, grupirane) => {
    const kandidatIds = grupirane[statusKey].map((o) => o._id);
    const targetIds = kandidatIds.filter((id) => selectedIds.includes(id));

    if (targetIds.length === 0) {
      return toast("Nema odabranih objava za ovu akciju.", "info");
    }

    const prevStatuses = objave
      .filter((o) => targetIds.includes(o._id))
      .map((o) => ({ id: o._id, prevStatus: o.status }));

    setBulkLoading(true);
    try {
      await Promise.all(
        targetIds.map((id) =>
          api.patch(`/objave/${id}/status`, { status: noviStatus })
        )
      );

      setObjave((prev) =>
        prev.map((o) =>
          targetIds.includes(o._id) ? { ...o, status: noviStatus } : o
        )
      );

      setLastBulkAction({
        type: "status",
        items: prevStatuses,
      });

      // nakon bulk akcije makni selekciju iz tog statusa
      setSelectedIds((prev) => prev.filter((id) => !targetIds.includes(id)));

      toast(
        noviStatus === "odobreno"
          ? `Odobreno ${targetIds.length} objava.`
          : `Odbijeno ${targetIds.length} objava.`,
        "success"
      );
    } catch (err) {
      console.error("bulk status error:", err);
      toast("Greška pri grupnoj promjeni statusa.", "error");
    }
    setBulkLoading(false);
  };

  const handleBulkDeleteSelected = async () => {
    // dopuštamo brisanje samo odobrenih i odbijenih
    const deletableIds = objave
      .filter(
        (o) =>
          selectedIds.includes(o._id) &&
          (o.status === "odobreno" || o.status === "odbijeno")
      )
      .map((o) => o._id);

    if (deletableIds.length === 0) {
      return toast(
        "Nema odabranih prihvaćenih/odbijenih objava za brisanje.",
        "info"
      );
    }

    if (
      !window.confirm(
        `Sigurno želiš obrisati ${deletableIds.length} odabranih objava? Ova radnja je nepovratna.`
      )
    ) {
      return;
    }

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
    if (!lastBulkAction || lastBulkAction.type !== "status") {
      return;
    }

    const items = lastBulkAction.items;
    if (!items || items.length === 0) return;

    setBulkLoading(true);
    try {
      await Promise.all(
        items.map((it) =>
          api.patch(`/objave/${it.id}/status`, { status: it.prevStatus })
        )
      );

      setObjave((prev) =>
        prev.map((o) => {
          const found = items.find((it) => it.id === o._id);
          return found ? { ...o, status: found.prevStatus } : o;
        })
      );

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
        currentUrgentno
          ? "Objava više nije hitna."
          : "Objava označena kao hitna!",
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

  // 🔹 LOKALNO FILTRIRANJE PO DATUMU
  const filteredObjave = objave.filter((o) => {
    if (!dateFrom && !dateTo) return true; // nema filtera po datumu

    if (!o.datum) return false; // ako nema datum, ne prikazuj kad je aktivan date filter

    const d = new Date(o.datum);
    if (Number.isNaN(d.getTime())) return false;

    if (dateFrom) {
      const from = new Date(dateFrom + "T00:00:00");
      if (d < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo + "T23:59:59");
      if (d > to) return false;
    }
    return true;
  });

  // Grupiranje po statusu (NA FILTRIRANIM OBJAVAMA!)
  const grupirane = {
    "na čekanju": [],
    odobreno: [],
    odbijeno: [],
  };
  filteredObjave.forEach((o) => {
    if (grupirane[o.status]) grupirane[o.status].push(o);
  });

  // koliko je odabranih u kojem statusu (također na filtriranom setu)
  const selectedPendingCount = grupirane["na čekanju"].filter((o) =>
    selectedIds.includes(o._id)
  ).length;

  const selectedFinalCount =
    grupirane["odobreno"].filter((o) => selectedIds.includes(o._id)).length +
    grupirane["odbijeno"].filter((o) => selectedIds.includes(o._id)).length;

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
            marginBottom: "1rem",
            flexWrap: "wrap",
            alignItems: "center",
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

          {/* 🔹 DATUM OD */}
          <TextField
            size="small"
            label="Od datuma"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          {/* 🔹 DATUM DO */}
          <TextField
            size="small"
            label="Do datuma"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: dateFrom || undefined,
            }}
          />

          {/* (Opcionalno) gumb za brzo čišćenje datuma */}
          {(dateFrom || dateTo) && (
            <Button
              size="small"
              variant="text"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
            >
              Očisti datume
            </Button>
          )}
        </div>

        {/* INFO O SELEKCIJI + BULK GUMBI */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ fontSize: "0.9rem", color: "#555" }}>
            Odabrano objava: <strong>{selectedIds.length}</strong>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {/* ODOBRI ODABRANE */}
            <Button
              variant="outlined"
              size="small"
              disabled={selectedPendingCount === 0 || bulkLoading}
              onClick={() =>
                handleBulkStatusChange("na čekanju", "odobreno", grupirane)
              }
              sx={{
                borderColor: "#23cb63",
                color: "#23cb63",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                backgroundColor: "#fff",
                opacity: selectedPendingCount === 0 ? 0.5 : 1,
                "&:hover": {
                  backgroundColor:
                    selectedPendingCount === 0
                      ? "#fff"
                      : "rgba(35,203,99,0.08)",
                },
              }}
            >
              Odobri odabrane
            </Button>

            {/* ODBIJ ODABRANE */}
            <Button
              variant="outlined"
              size="small"
              disabled={selectedPendingCount === 0 || bulkLoading}
              onClick={() =>
                handleBulkStatusChange("na čekanju", "odbijeno", grupirane)
              }
              sx={{
                borderColor: "#e21a1a",
                color: "#e21a1a",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                backgroundColor: "#fff",
                opacity: selectedPendingCount === 0 ? 0.5 : 1,
                "&:hover": {
                  backgroundColor:
                    selectedPendingCount === 0
                      ? "#fff"
                      : "rgba(226,26,26,0.08)",
                },
              }}
            >
              Odbij odabrane
            </Button>

            {/* OBRIŠI ODABRANE (odobrene/odbijene) */}
            <Button
              variant="outlined"
              size="small"
              disabled={selectedFinalCount === 0 || bulkLoading}
              onClick={handleBulkDeleteSelected}
              sx={{
                borderColor: "#e74c3c",
                color: "#e74c3c",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                backgroundColor: "#fff",
                opacity: selectedFinalCount === 0 ? 0.5 : 1,
                "&:hover": {
                  backgroundColor:
                    selectedFinalCount === 0 ? "#fff" : "rgba(231,76,60,0.08)",
                },
              }}
            >
              Obriši odabrane
            </Button>

            {/* UNDO */}
            <Button
              variant="outlined"
              size="small"
              disabled={!lastBulkAction || bulkLoading}
              onClick={handleUndoLastAction}
              sx={{
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                borderColor: "#999",
                color: "#444",
                backgroundColor: "#fff",
                opacity: !lastBulkAction ? 0.5 : 1,
                "&:hover": {
                  backgroundColor: !lastBulkAction ? "#fff" : "#f5f5f5",
                },
              }}
            >
              Poništi zadnju akciju
            </Button>
          </div>
        </div>

        <div
          className="card-grid"
          style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
        >
          {statusi.map((st) => {
            const statusIds = grupirane[st.key].map((o) => o._id);
            const selectedInStatus = statusIds.filter((id) =>
              selectedIds.includes(id)
            );
            const allSelected =
              statusIds.length > 0 &&
              selectedInStatus.length === statusIds.length;
            const partiallySelected =
              selectedInStatus.length > 0 && !allSelected;

            return (
              <div key={st.key} className="card card-static status-card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                    gap: 8,
                  }}
                >
                  <h2
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 0,
                    }}
                  >
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

                  {grupirane[st.key].length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: "0.8rem",
                        color: "#555",
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={allSelected}
                        indeterminate={partiallySelected}
                        onChange={() => toggleSelectStatus(st.key, grupirane)}
                      />
                      <span>Označi sve</span>
                    </div>
                  )}
                </div>

                {grupirane[st.key].length === 0 ? (
                  <p className="center-msg" style={{ fontSize: "0.98rem" }}>
                    Nema dostupnih objava.
                  </p>
                ) : (
                  grupirane[st.key].map((o) => {
                    const isSelected = selectedIds.includes(o._id);

                    return (
                      <div
                        key={o._id}
                        className="card card-static inner-card"
                        style={{
                          marginBottom: "1.1rem",
                          marginTop: "0.8rem",
                          position: "relative",
                        }}
                      >
                        {/* Checkbox u kutu */}
                        <div
                          style={{
                            position: "absolute",
                            top: 6,
                            right: 6,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => toggleSelect(o._id)}
                          />
                        </div>

                        {/* BADGES */}
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            marginBottom: 8,
                            paddingRight: 32,
                          }}
                        >
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
                        <p style={{ fontSize: "0.9rem", color: "#555" }}>
                          {o.sadrzaj?.length > 160
                            ? `${o.sadrzaj.slice(0, 160)}...`
                            : o.sadrzaj || "Nema opisa."}
                        </p>

                        <div className="meta-info">
                          <span>
                            Autor:{" "}
                            {o.autorIme ||
                              o.autor?.ime ||
                              o.autor ||
                              "Nepoznato"}
                          </span>
                          <span>Tip: {o.tip}</span>
                          <span>
                            Odsjek:{" "}
                            {ODSJECI.find((ods) => ods.id === o.odsjek)
                              ?.naziv ||
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
                                disabled={loadingId === o._id || bulkLoading}
                                onClick={() =>
                                  handleStatusChange(o._id, "odobreno")
                                }
                                className="approve-btn"
                                style={{
                                  fontSize: "0.85rem",
                                  padding: "6px 12px",
                                }}
                              >
                                {loadingId === o._id ? "..." : "Odobri"}
                              </button>
                              <button
                                disabled={loadingId === o._id || bulkLoading}
                                onClick={() =>
                                  handleStatusChange(o._id, "odbijeno")
                                }
                                className="reject-btn"
                                style={{
                                  fontSize: "0.85rem",
                                  padding: "6px 12px",
                                }}
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
                                disabled={loadingId === o._id || bulkLoading}
                                color={o.pinned ? "primary" : "default"}
                                title={
                                  o.pinned
                                    ? "Otkvači objavu"
                                    : "Prikvači objavu"
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
                                disabled={loadingId === o._id || bulkLoading}
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
                            disabled={loadingId === o._id || bulkLoading}
                            onClick={() => confirmDelete(o._id)}
                            className="delete-btn"
                            style={{
                              fontSize: "0.85rem",
                              padding: "6px 12px",
                            }}
                          >
                            {loadingId === o._id ? "..." : "Obriši"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
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
