// src/pages/Objava.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Select, MenuItem, FormControl, InputLabel, TextField, Button } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Linkify from "linkify-react";
import api from "../api/axiosInstance";
import { ODSJECI } from "../constants/odsjeci";

export default function Objava() {
  const [sveObjave, setSveObjave] = useState([]);
  const [objave, setObjave] = useState([]);
  const [filterTip, setFilterTip] = useState("Sve");
  const [odsjek, setOdsjek] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // state za novu objavu
  const [novaNaslov, setNovaNaslov] = useState("");
  const [novaSadrzaj, setNovaSadrzaj] = useState("");
  const [novaTip, setNovaTip] = useState("radionice");
  const [novaOdsjek, setNovaOdsjek] = useState("");

  const navigate = useNavigate();
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
  ];

  const departmentOptions = [
    { value: "", label: "Svi odsjeci" },
    ...ODSJECI.map((ods) => ({ value: ods.id, label: ods.naziv })),
  ];

  const linkifyOptions = {
    nl2br: true,
    formatHref: {
      tel: (href) => href,
      mailto: (href) => href,
    },
    attributes: {
      rel: "noopener noreferrer",
      target: "_blank",
    },
  };

  const buildAvatarSrc = (avatarPath) => {
    if (!avatarPath) return "/default-avatar.png";
    if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
      return `${avatarPath}?t=${Date.now()}`;
    }
    const base = api.defaults.baseURL || "";
    const backendOrigin = base.replace(/\/api\/?$/i, "");
    const origin = backendOrigin || "";
    return `${origin}${avatarPath}?t=${Date.now()}`;
  };

  // Dohvat objava
  const fetchObjave = async () => {
    setLoading(true);
    try {
      const res = await api.get("/objave");
      setSveObjave(res.data || []);
    } catch (err) {
      console.error("fetch objave:", err);
      setSveObjave([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObjave();
  }, []);

  // Filtriranje + sortiranje
  useEffect(() => {
    let filtrirano = [...sveObjave];

    if (filterTip !== "Sve") {
      filtrirano = filtrirano.filter((o) => o.tip === filterTip);
    }

    if (odsjek) {
      filtrirano = filtrirano.filter(
        (o) => o.odsjek === odsjek || o.odsjek?._id === odsjek
      );
    }

    filtrirano.sort((a, b) => {
      const aDate = new Date(a.datum || a.createdAt || 0).getTime();
      const bDate = new Date(b.datum || b.createdAt || 0).getTime();
      return sortBy === "newest" ? bDate - aDate : aDate - bDate;
    });

    setObjave(filtrirano);
  }, [filterTip, odsjek, sortBy, sveObjave]);

  const spremiObjavu = async (e, id) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Niste prijavljeni.");
      return;
    }

    try {
      const res = await api.post(
        `/korisnik/spremiObjavu/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(res.data?.message || "Objava je spremljena.");
      window.dispatchEvent(new Event("refreshSpremljene"));
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          err.message ||
          "Greška pri spremanju objave."
      );
    }
  };

  const openObjava = (id) => {
    navigate(`/objava/${id}`);
  };

  const openProfil = (e, id) => {
    e.stopPropagation();
    navigate(`/profil/${id}`);
  };

  // slanje nove objave
  const handleCreateObjava = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Za kreiranje objave morate biti prijavljeni.");
      return;
    }

    if (!novaNaslov.trim() || !novaSadrzaj.trim() || !novaOdsjek) {
      alert("Naslov, sadržaj i odsjek su obavezni.");
      return;
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Objava poslana na odobrenje.");
      setNovaNaslov("");
      setNovaSadrzaj("");
      setNovaTip("radionice");
      setNovaOdsjek("");
      setShowForm(false);
      fetchObjave(); // osvježi listu
    } catch (err) {
      console.error("create objava error:", err);
      alert(
        err?.response?.data?.message ||
          err.message ||
          "Greška pri slanju objave."
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
        <div className="better-filters">
          <div className="filters-left">
            <FilterListIcon style={{ marginRight: 8 }} />
            <span>Filteri</span>
          </div>

          <div className="filters-right">
            {/* Tip */}
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

            {/* Odsjek */}
            <FormControl size="small" className="filter-control odsjek-control">
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

            {/* Sortiraj */}
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

        {showForm && user && user.uloga !== "admin" && (
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ marginTop: 0 }}>Nova objava</h2>
            <form onSubmit={handleCreateObjava} className="objava-form">
              <TextField
                label="Naslov"
                fullWidth
                margin="normal"
                value={novaNaslov}
                onChange={(e) => setNovaNaslov(e.target.value)}
              />
              <TextField
                label="Sadržaj"
                fullWidth
                margin="normal"
                multiline
                minRows={4}
                value={novaSadrzaj}
                onChange={(e) => setNovaSadrzaj(e.target.value)}
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

        {loading ? (
          <p className="center-msg">Učitavanje objava...</p>
        ) : objave.length === 0 ? (
          <p className="center-msg">Nema dostupnih objava.</p>
        ) : (
          <div className="card-grid">
            {objave.map((obj) => {
              const autor =
                obj.autor && typeof obj.autor === "object" ? obj.autor : null;
              const autorIme = autor?.ime || obj.autor || "Nepoznato";
              const autorId =
                autor?._id || obj.autorId || obj.autor?._id || null;
              const autorAvatar = autor?.avatar || obj.autorAvatar || null;

              const avatarSrc = buildAvatarSrc(autorAvatar);

              return (
                <div
                  key={obj._id}
                  className="card-link"
                  style={{ cursor: "pointer" }}
                  onClick={() => openObjava(obj._id)}
                  aria-role="link"
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
                        {ODSJECI.find((ods) => ods.id === obj.odsjek)?.naziv ||
                          "-"}
                      </span>
                      <span className="card-date">
                        {obj.datum
                          ? new Date(obj.datum).toLocaleDateString("hr-HR")
                          : ""}
                      </span>
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
        )}
      </div>
    </section>
  );
}
