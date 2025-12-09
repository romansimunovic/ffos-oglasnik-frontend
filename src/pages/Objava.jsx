// src/pages/Objava.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Chip,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
} from "@mui/material";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClearIcon from "@mui/icons-material/Clear";
import PushPinIcon from "@mui/icons-material/PushPin";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import SearchIcon from "@mui/icons-material/Search";
import Linkify from "linkify-react";
import api from "../api/axiosInstance";
import { ODSJECI } from "../constants/odsjeci";
import { useDebounce } from "../hooks/useDebounce";
import { SkeletonCard } from "../components/SkeletonCard";
import { useToast } from "../components/Toast";

export default function Objava() {
  // state
  const [objave, setObjave] = useState([]);
  const [filterTip, setFilterTip] = useState("Sve");
  const [odsjek, setOdsjek] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  // new post state
  const [novaNaslov, setNovaNaslov] = useState("");
  const [novaSadrzaj, setNovaSadrzaj] = useState("");
  const [novaTip, setNovaTip] = useState("radionice");
  const [novaOdsjek, setNovaOdsjek] = useState("");

  // dialog after submit
  const [showSubmitSuccessDialog, setShowSubmitSuccessDialog] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?._id || user?.id || null;
  const userOdsjek = user?.odsjek || "";

  const tipovi = [
    { value: "Sve", label: "Sve" },
    { value: "radionice", label: "Radionice" },
    { value: "kvizovi", label: "Kvizovi" },
    { value: "projekti", label: "Projekti" },
    { value: "natječaji", label: "Natječaji" },
    { value: "ostalo", label: "Ostalo" },
  ];

  const sortOptions = [
    { value: "newest", label: "Najnovije" },
    { value: "oldest", label: "Najstarije" },
    { value: "views", label: "Najpopularnije" },
  ];

  const periodOptions = [
    { value: "all", label: "Svi datumi" },
    { value: "week", label: "Ovaj tjedan" },
    { value: "month", label: "Ovaj mjesec" },
    { value: "past", label: "Prošli događaji" },
  ];

  const departmentOptions = [
    { value: "", label: "Svi odsjeci" },
    ...ODSJECI.map((ods) => ({ value: ods.id, label: ods.naziv })),
  ];

  const linkifyOptions = {
    nl2br: true,
    attributes: { rel: "noopener noreferrer", target: "_blank" },
  };

  const buildAvatarSrc = (avatarPath) => {
    if (!avatarPath) return "/default-avatar.png";
    if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://"))
      return `${avatarPath}?t=${Date.now()}`;
    const base = api.defaults.baseURL || "";
    const backendOrigin = base.replace(/\/api\/?$/i, "");
    return `${backendOrigin}${avatarPath}?t=${Date.now()}`;
  };

  // Init from query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("filter") === "thisWeek") setPeriodFilter("week");
    if (params.get("view") === "byCategory") setSortBy("newest");
  }, [location.search]);

  // fetch posts (paginated)
  const fetchObjave = async (page = 1, append = false) => {
    if (!append) setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "9",
        ...(filterTip && filterTip !== "Sve" && { tip: filterTip }),
        ...(odsjek && { odsjek }),
        ...(periodFilter && { periodFilter }),
        sortBy,
        ...(debouncedSearch && { search: debouncedSearch }),
      });
      const res = await api.get(`/objave/paginated?${params}`);
      const data = res.data || {};
      const lista = data.objave || [];
      if (append) setObjave((prev) => [...prev, ...lista]);
      else setObjave(lista);
      setCurrentPage(data.currentPage || page);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Fetch objave error:", err);
      if (!append) setObjave([]);
      toast("Greška pri dohvaćanju objava.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial load
    fetchObjave(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // when filters/search/sort change -> reset to page 1 and fetch
    setCurrentPage(1);
    fetchObjave(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTip, odsjek, sortBy, debouncedSearch, periodFilter]);

  const handleQuickFilter = (type) => {
    if (type === "myDepartment") {
      setOdsjek(userOdsjek);
      setFilterTip("Sve");
    } else if (type === "radionice") {
      setFilterTip("radionice");
      setOdsjek("");
    } else if (type === "natječaji") {
      setFilterTip("natječaji");
      setOdsjek("");
    }
  };

  const handleClearFilters = () => {
    setFilterTip("Sve");
    setOdsjek("");
    setSortBy("newest");
    setSearch("");
    setPeriodFilter("");
  };

  // save (favorite) post
  const spremiObjavu = async (e, id) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    const token = localStorage.getItem("token");
    if (!token) return toast("Niste prijavljeni.", "error");
    try {
      const res = await api.post(`/korisnik/spremiObjavu/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast(res.data?.message || "Objava spremljena.", "success");
      window.dispatchEvent(new Event("refreshSpremljene"));
    } catch (err) {
      console.error("spremiObjavu error:", err);
      toast(err?.response?.data?.message || "Greška pri spremanju objave.", "error");
    }
  };

  const openObjava = (id) => navigate(`/objava/${id}`);
  const openProfil = (e, id) => {
    e.stopPropagation();
    navigate(`/profil/${id}`);
  };

  // create new post
  const handleCreateObjava = async (e) => {
    e.preventDefault();

    if (!novaNaslov.trim() || !novaSadrzaj.trim() || !novaOdsjek) {
      return toast("Naslov, sadržaj i odsjek su obavezni.", "error");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast("Morate biti prijavljeni.", "error");
      navigate("/login");
      return;
    }

    const submitBtn = e.target.querySelector("button[type='submit']");
    const originalText = submitBtn?.textContent;
    if (submitBtn) {
      submitBtn.textContent = "Slanje...";
      submitBtn.disabled = true;
    }

    try {
      const response = await api.post("/objave", {
        naslov: novaNaslov.trim(),
        sadrzaj: novaSadrzaj.trim(),
        tip: novaTip,
        odsjek: novaOdsjek,
      });

      toast("✅ Objava poslana na odobrenje!", "success");
      // reset form
      setNovaNaslov("");
      setNovaSadrzaj("");
      setNovaTip("radionice");
      setNovaOdsjek("");
      setShowForm(false);

      // show dialog that leads to profile -> submitted tab
      setShowSubmitSuccessDialog(true);

      // refresh feed
      await fetchObjave(1, false);
    } catch (err) {
      console.error("❌ Greška pri slanju:", err);
      const errorMsg = err?.response?.data?.message || err?.message || "Greška pri slanju objave.";
      toast(errorMsg, "error");
    } finally {
      if (submitBtn) {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    }
  };

  // Pagination UI helper (windowed pages)
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const maxButtons = 7; // koliko numeričkih gumbova mostrar
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }

    const pages = [];
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("dots-start");
    }

    for (let p = start; p <= end; p++) pages.push(p);

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("dots-end");
      pages.push(totalPages);
    }

    return (
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
        <Button
          size="small"
          onClick={() => {
            if (currentPage > 1) {
              fetchObjave(currentPage - 1, false);
              setCurrentPage((c) => c - 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          disabled={currentPage === 1 || loading}
          sx={{ minWidth: 40 }}
        >
          Prev
        </Button>

        {pages.map((p, idx) =>
          p === "dots-start" || p === "dots-end" ? (
            <Typography key={p + idx} style={{ display: "inline-flex", alignItems: "center", padding: "6px 10px", color: "#666" }}>
              ...
            </Typography>
          ) : (
            <Button
              key={p}
              size="small"
              variant={p === currentPage ? "contained" : "outlined"}
              onClick={() => {
                if (p === currentPage) return;
                fetchObjave(p, false);
                setCurrentPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={loading}
              sx={{ minWidth: 40, backgroundColor: p === currentPage ? "#971d21" : undefined }}
            >
              {p}
            </Button>
          )
        )}

        <Button
          size="small"
          onClick={() => {
            if (currentPage < totalPages) {
              fetchObjave(currentPage + 1, false);
              setCurrentPage((c) => c + 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          disabled={currentPage === totalPages || loading}
          sx={{ minWidth: 40 }}
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <section className="page-bg">
      <div className="container">
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: "2rem" }}>
          <h1>Objave</h1>
          {user && user.uloga !== "admin" && (
            <Button
              variant="contained"
              sx={{ backgroundColor: "#971d21", "&:hover": { backgroundColor: "#701013" } }}
              onClick={() => setShowForm((s) => !s)}
              aria-expanded={showForm}
              aria-controls="nova-objava-form"
            >
              {showForm ? "Zatvori" : "+ Nova objava"}
            </Button>
          )}
        </div>

        {/* FORMA ZA NOVU OBJAVU */}
        {showForm && user && user.uloga !== "admin" && (
          <div id="nova-objava-form" className="card card-static" style={{ marginBottom: "2rem" }}>
            <h2 style={{ marginTop: 0, color: "#971d21" }}>Nova objava</h2>
            <form onSubmit={handleCreateObjava}>
              <TextField label="Naslov" fullWidth margin="normal" value={novaNaslov} onChange={(e) => setNovaNaslov(e.target.value)} placeholder="Upiši naslov objave..." required />
              <TextField label="Sadržaj" fullWidth margin="normal" multiline minRows={4} value={novaSadrzaj} onChange={(e) => setNovaSadrzaj(e.target.value)} placeholder="Detaljno objasni što objavljuješ..." required />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="nova-tip-label">Vrsta</InputLabel>
                  <Select labelId="nova-tip-label" value={novaTip} label="Vrsta" onChange={(e) => setNovaTip(e.target.value)}>
                    {tipovi.filter((t) => t.value !== "Sve").map((t) => (
                      <MenuItem key={t.value} value={t.value}>
                        {t.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel id="nova-odsjek-label">Odsjek</InputLabel>
                  <Select labelId="nova-odsjek-label" value={novaOdsjek} label="Odsjek" onChange={(e) => setNovaOdsjek(e.target.value)}>
                    {ODSJECI.map((ods) => (
                      <MenuItem key={ods.id} value={ods.id}>
                        {ods.naziv}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <Button type="submit" variant="contained" fullWidth sx={{ marginTop: 2, backgroundColor: "#971d21", "&:hover": { backgroundColor: "#701013" } }}>
                Pošalji na odobrenje
              </Button>
            </form>
          </div>
        )}

        {/* SEARCH & FILTERS */}
        <div className="filters-section">
          <div style={{ marginBottom: isMobile ? "1rem" : "2rem", display: "flex", gap: 12, alignItems: "center" }}>
            <SearchIcon sx={{ color: "#971d21", fontSize: 28, opacity: 0.7 }} />
            <TextField size="small" variant="outlined" label="Pretraži objave" value={search} onChange={(e) => setSearch(e.target.value)} autoComplete="off" placeholder="Upiši pojam..." sx={{ flex: 1, maxWidth: 400, "& .MuiOutlinedInput-root": { borderRadius: "8px", transition: "all 0.2s", "&:hover": { borderColor: "#971d21" }, "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(151, 29, 33, 0.1)" } } }} />
            {/* quick filters */}
            <div style={{ display: "flex", gap: 8 }}>
              <Button size="small" onClick={() => handleQuickFilter("radionice")}>Radionice</Button>
              <Button size="small" onClick={() => handleQuickFilter("natječaji")}>Natječaji</Button>
            </div>
          </div>

          {isMobile && (
            <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center" }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowMobileFilters((prev) => !prev)}
                startIcon={<FilterAltOutlinedIcon />}
                sx={{
                  borderColor: "#971d21",
                  color: showMobileFilters ? "#971d21" : "#971d21",
                  backgroundColor: showMobileFilters ? "transparent" : "transparent",
                  width: "100%",
                  maxWidth: 400,
                  borderRadius: "8px",
                  py: 1.1,
                  fontWeight: 600,
                  "&:hover": { backgroundColor: "rgba(151,29,33,0.1)" },
                  "&:focus": { boxShadow: "none", outline: "none" },
                }}
              >
                {showMobileFilters ? "Sakrij filtere" : "Prikaži filtere"}
              </Button>
            </div>
          )}

          {(!isMobile || showMobileFilters) && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: "1rem", padding: "1.5rem", backgroundColor: "var(--ffos-light-card)", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                {/* Vrsta */}
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "8px", color: "#666", textTransform: "uppercase", letterSpacing: "0.5px" }}>Vrsta objave</label>
                  <FormControl fullWidth size="small">
                    <Select value={filterTip} onChange={(e) => setFilterTip(e.target.value)} IconComponent={ArrowDropDownIcon} sx={{ backgroundColor: "transparent" }}>
                      {tipovi.map((t) => (
                        <MenuItem key={t.value} value={t.value}>
                          {t.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                {/* Odsjek */}
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "8px", color: "#666", textTransform: "uppercase", letterSpacing: "0.5px" }}>Odsjek</label>
                  <FormControl fullWidth size="small">
                    <Select value={odsjek} onChange={(e) => setOdsjek(e.target.value)} IconComponent={ArrowDropDownIcon} displayEmpty renderValue={(selected) => { if (!selected) return "Svi odsjeci"; const opt = departmentOptions.find((o) => o.value === selected); return opt ? opt.label : "Svi odsjeci"; }} sx={{ backgroundColor: "transparent" }}>
                      {departmentOptions.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                {/* Period */}
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "8px", color: "#666", textTransform: "uppercase", letterSpacing: "0.5px" }}>Vremenski period</label>
                  <FormControl fullWidth size="small">
                    <Select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)} IconComponent={ArrowDropDownIcon} displayEmpty renderValue={(selected) => { if (!selected) return "Svi datumi"; const opt = periodOptions.find((o) => o.value === selected); return opt ? opt.label : "Svi datumi"; }} sx={{ backgroundColor: "transparent" }}>
                      {periodOptions.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                {/* Sort */}
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "8px", color: "#666", textTransform: "uppercase", letterSpacing: "0.5px" }}>Sortiranje</label>
                  <FormControl fullWidth size="small">
                    <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} IconComponent={ArrowDropDownIcon} sx={{ backgroundColor: "transparent" }}>
                      {sortOptions.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "2rem" }}>
                <Button variant="outlined" size="small" startIcon={<ClearIcon />} onClick={handleClearFilters} sx={{ borderColor: "#666", color: "#666", "&:hover": { backgroundColor: "rgba(0,0,0,0.05)" } }}>
                  Ukloni filtere
                </Button>
              </div>
            </>
          )}
        </div>

        {/* LOADING / EMPTY / GRID */}
        {loading ? (
          <div className="card-grid">{[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}</div>
        ) : objave.length === 0 ? (
          <p className="center-msg">{debouncedSearch ? `📭 Nema rezultata za "${debouncedSearch}"` : "📭 Nema dostupnih objava."}</p>
        ) : (
          <>
            <div className="card-grid">
              {objave.map((obj) => {
                const autor = obj.autor && typeof obj.autor === "object" ? obj.autor : null;
                const autorIme = autor?.ime || obj.autor || "Nepoznato";
                const autorId = autor?._id || obj.autor || null;
                const autorAvatar = autor?.avatar || obj.autorAvatar || null;
                const avatarSrc = buildAvatarSrc(autorAvatar);

                const isNew = obj.datum && new Date() - new Date(obj.datum) < 3 * 24 * 60 * 60 * 1000;

                return (
                  <div key={obj._id} className="card-link" style={{ cursor: "pointer", position: "relative" }} onClick={() => openObjava(obj._id)} role="link" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") openObjava(obj._id); }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                      {isNew && <Chip label="Najnovije" size="small" sx={{ backgroundColor: "#20956eff", color: "#fff", fontWeight: "bold", height: 28, fontSize: "0.8rem" }} />}
                      {obj.pinned && <Chip icon={<PushPinIcon />} label="Istaknuto" size="small" color="primary" sx={{ height: 28, fontSize: "0.8rem" }} />}
                      {obj.urgentno && <Chip icon={<NewReleasesIcon />} label="Hitno" size="small" color="error" sx={{ height: 28, fontSize: "0.8rem" }} />}
                    </div>

                    <div className="card">
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <img
                          src={avatarSrc}
                          alt={`Avatar ${autorIme}`}
                          className="tiny-avatar"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (autorId) navigate(`/profil/${autorId}`);
                          }}
                          style={{ cursor: autorId ? "pointer" : "default" }}
                        />
                        <div style={{ flex: 1 }}>
                          <h2 style={{ margin: 0, fontSize: "1.1rem", color: "#971d21" }}>{obj.naslov || "Bez naslova"}</h2>
                          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "2px" }}>{autorIme}</div>
                        </div>
                      </div>

                      <p className="card-desc" onClick={(e) => e.stopPropagation()}>
                        <Linkify options={linkifyOptions}>
                          {(obj.sadrzaj || "Nema opisa.").length > 180 ? `${(obj.sadrzaj || "Nema opisa.").slice(0, 180)}...` : obj.sadrzaj || "Nema opisa."}
                        </Linkify>
                      </p>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "0.85rem", color: "#666", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #eee" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>Vrsta {obj.tip || "Ostalo"}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>{ODSJECI.find((x) => x.id === obj.odsjek)?.naziv || "-"}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>{obj.datum ? new Date(obj.datum).toLocaleDateString("hr-HR") : ""}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginLeft: "auto" }}>⭐ {obj.saves || 0}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>👁 {obj.views || 0}</span>
                      </div>

                      {user && user.uloga !== "admin" && (
                        <button onClick={(e) => { e.stopPropagation(); spremiObjavu(e, obj._id); }} type="button" className="save-btn" style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "6px", width: "100%", justifyContent: "center" }}>
                          Dodaj u favorite
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {renderPagination()}

            <div style={{ textAlign: "center", color: "#666", marginTop: "1.5rem", fontSize: "0.9rem" }}>
              Stranica {currentPage} od {totalPages}
            </div>
          </>
        )}

        {/* Dialog nakon uspješnog slanja objave */}
        <Dialog open={showSubmitSuccessDialog} onClose={() => setShowSubmitSuccessDialog(false)}>
          <DialogTitle>Objava poslana na odobrenje</DialogTitle>
          <DialogContent>
            <Typography variant="body1" paragraph>Hvala — tvoja objava je poslana administratoru na odobrenje.</Typography>
            <Typography variant="body2" color="textSecondary">Možeš pratiti status svojih poslanih objava na profilu.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSubmitSuccessDialog(false)} size="small">Zatvori</Button>
            <Button
              variant="contained"
              onClick={() => {
                setShowSubmitSuccessDialog(false);
                if (userId) navigate(`/profil/${userId}?tab=submitted`);
                else navigate("/profil");
              }}
              sx={{ backgroundColor: "#971d21", "&:hover": { backgroundColor: "#701013" } }}
            >
              Vidi poslane objave
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </section>
  );
}
