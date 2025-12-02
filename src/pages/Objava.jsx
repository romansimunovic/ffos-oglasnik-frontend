import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Linkify from "linkify-react";
import api from "../api/axiosInstance";
import { ODSJECI } from "../constants/odsjeci";
import { useDebounce } from "../hooks/useDebounce";
import { SkeletonCard } from "../components/SkeletonCard";
import { useToast } from "../components/Toast";

export default function Objava() {
  const [objave, setObjave] = useState([]);
  const [filterTip, setFilterTip] = useState("Sve");
  const [odsjek, setOdsjek] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  // Nova objava form state
  const [novaNaslov, setNovaNaslov] = useState("");
  const [novaSadrzaj, setNovaSadrzaj] = useState("");
  const [novaTip, setNovaTip] = useState("radionice");
  const [novaOdsjek, setNovaOdsjek] = useState("");

  const navigate = useNavigate();
  const toast = useToast();
  const user = JSON.parse(localStorage.getItem("user") || "null");

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

  // Fetch objave sa pagination
  const fetchObjave = async (page = 1, append = false) => {
    if (!append) setLoading(true);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "9",
        ...(filterTip !== "Sve" && { tip: filterTip }),
        ...(odsjek && { odsjek }),
        sortBy,
        ...(debouncedSearch && { search: debouncedSearch }),
      });

      const res = await api.get(`/objave/paginated?${params}`);
      
      if (append) {
        // Append za "Učitaj još"
        setObjave((prev) => [...prev, ...(res.data.objave || [])]);
      } else {
        // Replace za novi filter/search
        setObjave(res.data.objave || []);
      }

      setCurrentPage(res.data.currentPage || 1);
      setTotalPages(res.data.totalPages || 1);
      setHasMore(res.data.hasMore || false);
    } catch (err) {
      console.error("Fetch objave error:", err);
      if (!append) setObjave([]);
      toast("Greška pri dohvaćanju objava.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchObjave(1, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset na prvu stranicu kad se promijeni filter
  useEffect(() => {
    setCurrentPage(1);
    fetchObjave(1, false);
  }, [filterTip, odsjek, sortBy, debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load more
  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    fetchObjave(nextPage, true);
  };

  const spremiObjavu = async (e, id) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    const token = localStorage.getItem("token");
    if (!token) return toast("Niste prijavljeni.", "error");

    try {
      const res = await api.post(
        `/korisnik/spremiObjavu/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast(res.data?.message || "Objava spremljena.", "success");
      window.dispatchEvent(new Event("refreshSpremljene"));
    } catch (err) {
      toast(
        err?.response?.data?.message || "Greška pri spremanju objave.",
        "error"
      );
    }
  };

  const openObjava = (id) => navigate(`/objava/${id}`);
  const openProfil = (e, id) => {
    e.stopPropagation();
    navigate(`/profil/${id}`);
  };

  const handleCreateObjava = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token)
      return toast("Za kreiranje objave morate biti prijavljeni.", "error");
    if (!novaNaslov.trim() || !novaSadrzaj.trim() || !novaOdsjek) {
      return toast("Naslov, sadržaj i odsjek su obavezni.", "error");
    }

    try {
      await api.post(
        "/objave",
        {
          naslov: novaNaslov,
          sadrzaj: novaSadrzaj,
          tip: novaTip,
          odsjek: novaOdsjek,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast("Objava poslana na odobrenje.", "success");
      setNovaNaslov("");
      setNovaSadrzaj("");
      setNovaTip("radionice");
      setNovaOdsjek("");
      setShowForm(false);
      fetchObjave(1, false);
    } catch (err) {
      toast(
        err?.response?.data?.message || "Greška pri slanju objave.",
        "error"
      );
    }
  };

  return (
    <section className="page-bg">
      <div className="container">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: "1.5rem",
          }}
        >
          <h1>Objave</h1>
          {user && user.uloga !== "admin" && (
            <Button
              variant="contained"
              color="error"
              onClick={() => setShowForm((s) => !s)}
            >
              {showForm ? "Zatvori formu" : "Nova objava"}
            </Button>
          )}
        </div>

        {/* FILTERI */}
        <div
          className="better-filters"
          style={{
            alignItems: "flex-end",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: "2rem",
          }}
        >
          <TextField
            size="small"
            variant="outlined"
            label="Pretraži objave"
            value={search}
            style={{ minWidth: 180, maxWidth: 240 }}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            placeholder="Upiši pojam..."
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <FormControl size="small" className="filter-control">
              <InputLabel id="tip-label" shrink>
                Tip
              </InputLabel>
              <Select
                labelId="tip-label"
                value={filterTip}
                label="Tip"
                onChange={(e) => setFilterTip(e.target.value)}
                IconComponent={ArrowDropDownIcon}
              >
                {tipovi.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              size="small"
              className="filter-control odsjek-control"
            >
              <InputLabel id="odsjek-label" shrink>
                Odsjek
              </InputLabel>
              <Select
                labelId="odsjek-label"
                value={odsjek}
                label="Odsjek"
                onChange={(e) => setOdsjek(e.target.value)}
                IconComponent={ArrowDropDownIcon}
              >
                {departmentOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" className="filter-control">
              <InputLabel id="sort-label" shrink>
                Sortiraj
              </InputLabel>
              <Select
                labelId="sort-label"
                value={sortBy}
                label="Sortiraj"
                onChange={(e) => setSortBy(e.target.value)}
                IconComponent={ArrowDropDownIcon}
              >
                {sortOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>

        {/* FORMA ZA NOVU OBJAVU */}
        {showForm && user && user.uloga !== "admin" && (
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ marginTop: 0 }}>Nova objava</h2>
            <form onSubmit={handleCreateObjava}>
              <TextField
                label="Naslov"
                fullWidth
                margin="normal"
                value={novaNaslov}
                onChange={(e) => setNovaNaslov(e.target.value)}
                required
              />
              <TextField
                label="Sadržaj"
                fullWidth
                margin="normal"
                multiline
                minRows={4}
                value={novaSadrzaj}
                onChange={(e) => setNovaSadrzaj(e.target.value)}
                required
              />
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  marginTop: 8,
                }}
              >
                <FormControl size="small" style={{ minWidth: 160 }}>
                  <InputLabel id="nova-tip-label">Tip</InputLabel>
                  <Select
                    labelId="nova-tip-label"
                    value={novaTip}
                    label="Tip"
                    onChange={(e) => setNovaTip(e.target.value)}
                  >
                    {tipovi
                      .filter((t) => t.value !== "Sve")
                      .map((t) => (
                        <MenuItem key={t.value} value={t.value}>
                          {t.label}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                <FormControl size="small" style={{ minWidth: 180 }}>
                  <InputLabel id="nova-odsjek-label">Odsjek</InputLabel>
                  <Select
                    labelId="nova-odsjek-label"
                    value={novaOdsjek}
                    label="Odsjek"
                    onChange={(e) => setNovaOdsjek(e.target.value)}
                  >
                    {ODSJECI.map((ods) => (
                      <MenuItem key={ods.id} value={ods.id}>
                        {ods.naziv}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <Button
                type="submit"
                variant="contained"
                color="error"
                style={{ marginTop: 16 }}
              >
                Pošalji objavu
              </Button>
            </form>
          </div>
        )}

        {/* LOADING SKELETON */}
        {loading ? (
          <div className="card-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : objave.length === 0 ? (
          <p className="center-msg">
            {debouncedSearch
              ? `Nema rezultata za "${debouncedSearch}"`
              : "Nema dostupnih objava."}
          </p>
        ) : (
          <>
            {/* OBJAVE GRID */}
            <div className="card-grid">
              {objave.map((obj) => {
                const autor =
                  obj.autor && typeof obj.autor === "object"
                    ? obj.autor
                    : null;
                const autorIme = autor?.ime || obj.autor || "Nepoznato";
                const autorId = autor?._id || obj.autorId || null;
                const autorAvatar = autor?.avatar || obj.autorAvatar || null;
                const avatarSrc = buildAvatarSrc(autorAvatar);

                return (
                  <div
                    key={obj._id}
                    className="card-link"
                    style={{ cursor: "pointer" }}
                    onClick={() => openObjava(obj._id)}
                    role="link"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") openObjava(obj._id);
                    }}
                  >
                    <div className="card">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          marginBottom: 8,
                        }}
                      >
                        <img
                          src={avatarSrc}
                          alt={`Avatar ${autorIme}`}
                          className="tiny-avatar"
                          onClick={(e) => autorId && openProfil(e, autorId)}
                          style={{ cursor: autorId ? "pointer" : "default" }}
                        />
                        <div style={{ flex: 1 }}>
                          <h2 style={{ margin: 0 }}>
                            {obj.naslov || "Bez naslova"}
                          </h2>
                          <div style={{ fontSize: 13, color: "#666" }}>
                            {autorIme}
                          </div>
                        </div>
                      </div>
                      <p
                        className="card-desc"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Linkify options={linkifyOptions}>
                          {obj.sadrzaj || "Nema opisa."}
                        </Linkify>
                      </p>
                      <div className="meta-info">
                        <span>
                          Tip: <i>{obj.tip}</i>
                        </span>
                        <span>
                          Odsjek:{" "}
                          {ODSJECI.find((ods) => ods.id === obj.odsjek)
                            ?.naziv || "-"}
                        </span>
                        <span className="card-date">
                          {obj.datum
                            ? new Date(obj.datum).toLocaleDateString("hr-HR")
                            : ""}
                        </span>
                        <span title="Broj spremanja">★ {obj.saves || 0}</span>
                        <span title="Broj pregleda">👁 {obj.views || 0}</span>
                      </div>
                      {user && user.uloga !== "admin" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            spremiObjavu(e, obj._id);
                          }}
                          type="button"
                          className="save-btn"
                          style={{
                            marginTop: "1.1rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <i
                            className="fa fa-bookmark-o"
                            style={{ fontSize: 20 }}
                          />{" "}
                          Spremi
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* LOAD MORE BUTTON */}
            {hasMore && (
              <div style={{ textAlign: "center", margin: "2rem 0" }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? "Učitavanje..." : "Učitaj još"}
                </Button>
              </div>
            )}

            {/* PAGINATION INFO */}
            <div style={{ textAlign: "center", color: "#666", marginTop: "1rem" }}>
              Stranica {currentPage} od {totalPages}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
