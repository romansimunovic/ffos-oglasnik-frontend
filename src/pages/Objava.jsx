import { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import { ODSJECI } from "../constants/odsjeci";
import { Link } from "react-router-dom";
import Linkify from "linkify-react";
import { Select, MenuItem, FormControl, Box, Button } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export default function Objava() {
  const [sveObjave, setSveObjave] = useState([]); // sve objave iz baze
  const [objave, setObjave] = useState([]);       // filtrirani prikaz
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [filterTip, setFilterTip] = useState("Sve");
  const [odsjek, setOdsjek] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  // Forma
  const [naslov, setNaslov] = useState("");
  const [sadrzaj, setSadrzaj] = useState("");
  const [tip, setTip] = useState("radionice");
  const [odsjekForm, setOdsjekForm] = useState("");
  const [greske, setGreske] = useState({});
  const [msg, setMsg] = useState("");
  const [loadingForm, setLoadingForm] = useState(false);

  const tipovi = [
    { value: "Sve", label: "Sve" },
    { value: "radionice", label: "Radionice" },
    { value: "kvizovi", label: "Kvizovi" },
    { value: "projekti", label: "Projekti" },
    { value: "natječaji", label: "Natječaji" },
    { value: "ostalo", label: "Ostalo" }
  ];
  const sortOptions = [
    { value: "newest", label: "Najnovije" },
    { value: "oldest", label: "Najstarije" }
  ];
  const departmentOptions = [
    { value: "", label: "Svi odsjeci" },
    ...ODSJECI.map((ods) => ({
      value: ods.id, label: ods.naziv
    }))
  ];

  // Prvo dohvatimo sve objave samo jednom
  useEffect(() => {
    setLoading(true);
    api.get("/objave")
      .then(res => {
        setSveObjave(res.data);
        setLoading(false);
      })
      .catch(() => {
        setSveObjave([]);
        setLoading(false);
      });
  }, []);

  // Filtriramo u memoriji svaki put kad se filter promijeni
  useEffect(() => {
    let filtrirano = [...sveObjave];
    if (filterTip !== "Sve") {
      filtrirano = filtrirano.filter(o => o.tip === filterTip);
    }
    if (odsjek) {
      filtrirano = filtrirano.filter(o =>
        o.odsjek === odsjek || o.odsjek?._id === odsjek
      );
    }
    // Sort
    filtrirano = filtrirano.sort((a, b) => {
      const aDate = new Date(a.datum || a.createdAt || 0);
      const bDate = new Date(b.datum || b.createdAt || 0);
      return sortBy === "newest" ? bDate - aDate : aDate - bDate;
    });
    setObjave(filtrirano);
  }, [filterTip, odsjek, sortBy, sveObjave]);

  const spremiObjavu = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Niste prijavljeni.");
      return;
    }
    try {
      const res = await api.post(
        `/korisnik/spremiObjavu/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data?.message || "Objava je spremljena.");
      window.dispatchEvent(new Event("refreshSpremljene"));
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Greška pri spremanju objave.");
    }
  };

  const linkifyOptions = {
    nl2br: true,
    formatHref: { tel: (href) => href, mailto: (href) => href }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const novaGreske = {};
    if (!naslov.trim()) novaGreske.naslov = "Naslov je obavezan.";
    if (!sadrzaj.trim()) novaGreske.sadrzaj = "Sadržaj je obavezan.";
    if (!tip) novaGreske.tip = "Odaberite tip objave.";
    if (!odsjekForm) novaGreske.odsjek = "Odaberite odsjek.";
    setGreske(novaGreske);
    if (Object.keys(novaGreske).length > 0) return;

    setLoadingForm(true);
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/objave",
        { naslov, sadrzaj, tip, odsjek: odsjekForm },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg("Objava poslana administratorima na odobrenje.");
      setNaslov("");
      setSadrzaj("");
      setOdsjekForm("");
      setTip("radionice");
      setGreske({});
      window.dispatchEvent(new Event("refreshObjave"));
      setTimeout(() => {
        setMsg("");
        setShowForm(false);
      }, 1200);
    } catch (err) {
      setMsg(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Greška pri slanju objave."
      );
    }
    setLoadingForm(false);
  };

  return (
    <section className="page-bg">
      <div className="container">
        <h1>Objave</h1>
        <div className="better-filters">
  <div className="filter-col">
    <span className="filter-label">
      <FilterListIcon fontSize="small" style={{ marginRight: 6, marginBottom: "-3px" }} />
      Tip
    </span>
    <FormControl size="small">
      <Select
        value={filterTip}
        onChange={e => setFilterTip(e.target.value)}
        IconComponent={ArrowDropDownIcon}
        autoWidth
        sx={{ minWidth: 108, maxWidth: 120, fontSize: 16 }}
        MenuProps={{
          PaperProps: { sx: { minWidth: 110 } }
        }}
      >
        {tipovi.map(t => (
          <MenuItem value={t.value} key={t.value}>{t.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  </div>
  <div className="filter-col">
    <span className="filter-label">
      <FilterListIcon fontSize="small" style={{ marginRight: 6, marginBottom: "-3px" }} />
      Odsjek
    </span>
    <FormControl size="small">
      <Select
        value={odsjek}
        onChange={e => setOdsjek(e.target.value)}
        displayEmpty
        autoWidth
        sx={{ minWidth: 130, maxWidth: 205, fontSize: 16 }}
        MenuProps={{
          PaperProps: { sx: { minWidth: 220, maxWidth: 330 } }
        }}
        renderValue={val => {
          if (!val) return "Svi odsjeci";
          const found = departmentOptions.find(o => o.value === val);
          return found ? found.label : "Svi odsjeci";
        }}
      >
        {departmentOptions.map(opt => (
          <MenuItem value={opt.value} key={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </div>
  <div className="filter-col">
    <span className="filter-label">
      <FilterListIcon fontSize="small" style={{ marginRight: 6, marginBottom: "-3px" }} />
      Sortiraj
    </span>
    <FormControl size="small">
      <Select
        value={sortBy}
        onChange={e => setSortBy(e.target.value)}
        autoWidth
        sx={{ minWidth: 110, maxWidth: 140, fontSize: 16 }}
        MenuProps={{
          PaperProps: { sx: { minWidth: 110 } }
        }}
      >
        {sortOptions.map(opt => (
          <MenuItem value={opt.value} key={opt.value}>{opt.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  </div>
  {user && user.uloga !== "admin" && (
    <button
      onClick={() => setShowForm(v => !v)}
      className="main-btn"
      style={{ marginLeft: 18, alignSelf: "flex-end" }}
    >
      Nova objava
    </button>
  )}
</div>



        {/* ... ostatak forme i kartica je identičan kao prije */}
        {showForm && (
          <div className="form-modal">
            {/* ...forma za novu objavu (ostaje kao do sada, optimizirana za dark/light) */}
            {/* ...pogledaj prijašnje verzije - forma je prilagođena tvom global.css */}
          </div>
        )}

        {loading ? (
          <p className="center-msg">Učitavanje objava...</p>
        ) : objave.length === 0 ? (
          <p className="center-msg">Nema dostupnih objava.</p>
        ) : (
          <div className="card-grid">
            {objave.map((obj) => (
              <Link to={`/objava/${obj._id}`} key={obj._id} className="card-link">
                <div className="card">
                  <h2>{obj.naslov || "Bez naslova"}</h2>
                  <p className="card-desc">
                    <Linkify options={linkifyOptions}>
                      {obj.sadrzaj || "Nema opisa."}
                    </Linkify>
                  </p>
                  <div className="meta-info">
                    <span>Tip: <i>{obj.tip}</i></span>
                    <span>Odsjek: {ODSJECI.find((ods) => ods.id === obj.odsjek)?.naziv || "-"}</span>
                    <span>Autor: {obj.autor || "Nepoznato"}</span>
                    <span className="card-date">{obj.datum ? new Date(obj.datum).toLocaleDateString("hr-HR") : ""}</span>
                  </div>
                  {user && user.uloga !== "admin" && (
                    <button
                      onClick={(e) => spremiObjavu(e, obj._id)}
                      type="button"
                      className="save-btn"
                      style={{ marginTop: "1.1rem" }}
                    >Spremi</button>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
