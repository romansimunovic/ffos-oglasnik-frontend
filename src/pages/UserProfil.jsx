// src/pages/UserProfil.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import api from "../api/axiosInstance";
import { ODSJECI } from "../constants/odsjeci";
import { Button, Chip, Badge } from "@mui/material";
import { useToast } from "../components/Toast";

export default function UserProfil() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [korisnik, setKorisnik] = useState(null);
  const [authoredPosts, setAuthoredPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const pollingRef = useRef(null);

  const buildAvatarSrc = (avatarPath) => {
    if (!avatarPath) return "/default-avatar.png";
    if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://"))
      return `${avatarPath}?t=${Date.now()}`;
    const base = api.defaults.baseURL || "";
    const backendOrigin = base.replace(/\/api\/?$/i, "");
    return `${backendOrigin}${avatarPath}?t=${Date.now()}`;
  };

  // Dohvati korisnika
  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      try {
        const res = await api.get(`/korisnik/${id}`);
        if (mounted) setKorisnik(res.data);
      } catch (err) {
        console.error("fetch user profil:", err);
        toast("Greška pri dohvaćanju profila.", "error");
      } finally {
        if (mounted) setLoadingUser(false);
      }
    };
    fetchUser();
    return () => (mounted = false);
  }, [id]); // eslint-disable-line

  // Dohvati authored posts
  useEffect(() => {
    let mounted = true;
    const fetchPosts = async () => {
      try {
        const res = await api.get(`/objave/autor/${id}`);
        if (mounted) setAuthoredPosts(res.data || []);
      } catch (err) {
        console.error("fetch user posts:", err);
        toast("Greška pri dohvaćanju objava korisnika.", "error");
      } finally {
        if (mounted) setLoadingPosts(false);
      }
    };
    fetchPosts();
    return () => (mounted = false);
  }, [id]); // eslint-disable-line

  // Dohvati spremljene objave (pretpostavljeni endpoint - ako je drugačiji zamijeni URL)
  useEffect(() => {
    let mounted = true;
    const fetchSaved = async () => {
      try {
        const res = await api.get(`/korisnik/${id}/spremljene`);
        if (mounted) setSavedPosts(res.data || []);
      } catch (err) {
        // ako endpoint ne postoji — samo ignoriraj i ne kvrcaj korisnika
        console.warn("Nema endpointa za spremljene objave ili greška:", err);
        if (mounted) setSavedPosts([]);
      } finally {
        if (mounted) setLoadingSaved(false);
      }
    };
    fetchSaved();
    return () => (mounted = false);
  }, [id]); // eslint-disable-line

  // Obavijesti (polling) - pretpostavljeni endpoint /korisnik/:id/obavijesti
  useEffect(() => {
    let mounted = true;

    const fetchNotifs = async () => {
      try {
        const res = await api.get(`/korisnik/${id}/obavijesti`);
        if (mounted) setNotifications(res.data || []);
      } catch (err) {
        console.warn("Greška pri dohvatu obavijesti:", err);
      }
    };

    // prva dohvaćanja
    fetchNotifs();
    // polling svaka 30s dok je komponenta mountana
    pollingRef.current = setInterval(fetchNotifs, 30000);

    return () => {
      mounted = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [id]); // eslint-disable-line

  if (loadingUser) {
    return (
      <section className="page-bg">
        <div className="container">
          <p className="center-msg">Učitavanje profila...</p>
        </div>
      </section>
    );
  }

  if (!korisnik) {
    return (
      <section className="page-bg">
        <div className="container">
          <p className="center-msg">Korisnik nije pronađen.</p>
        </div>
      </section>
    );
  }

  // Kategorizacija authored posts
  const upperStatus = (p) => (p?.status || p?.statusPrisustva || "").toString().toUpperCase();
  const pendingPosts = authoredPosts.filter(
    (p) =>
      ["PENDING", "NA_CEKANJU", "NA ČEKANJU", "SUBMITTED"].includes(
        upperStatus(p)
      ) || p?.odobreno === false || p?.approved === false
  );
  const publishedPosts = authoredPosts.filter(
    (p) =>
      !pendingPosts.includes(p) &&
      (["APPROVED", "PUBLISHED", "OBJAVLJENO"].includes(upperStatus(p)) ||
        p?.odobreno === true ||
        p?.approved === true)
  );

  return (
    <section className="page-bg">
      <div
        className="container"
        style={{
          display: "grid",
          gap: 20,
          gridTemplateColumns: "minmax(260px, 340px) 1fr",
        }}
      >
        {/* Lijeva kolona: profil + obavijesti (desktop) */}
        <div>
          <div className="card profile-card">
            <div className="avatar-wrap" style={{ textAlign: "center" }}>
              <img
                src={buildAvatarSrc(korisnik.avatar)}
                alt={korisnik.ime}
                className="profile-avatar"
              />
            </div>
            <h2 style={{ textAlign: "center" }}>{korisnik.ime}</h2>
            <p>
              <strong>Uloga:</strong> {korisnik.uloga}
            </p>

            {/* Obavijesti kratko */}
            <div style={{ marginTop: 12 }}>
              <h4 style={{ marginBottom: 8 }}>Obavijesti</h4>
              {notifications.length === 0 ? (
                <div style={{ color: "#666" }}>Nema novih obavijesti</div>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div
                    key={n._id || n.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 6px",
                      borderRadius: 8,
                      backgroundColor: n.read ? "transparent" : "rgba(151,29,33,0.06)",
                      marginBottom: 8,
                      cursor: "pointer",
                    }}
                    onClick={async () => {
                      // označi kao pročitano (ako postoji endpoint)
                      try {
                        await api.post(`/korisnik/${id}/obavijesti/${n._id || n.id}/read`);
                      } catch (err) {
                        // ignore ako nema endpointa
                      }
                      // opcija: navigiraj korisnika na objavu koja je odbijena (ako payload sadrži objavuId)
                      if (n?.objavaId) navigate(`/objava/${n.objavaId}`);
                      // osvježi lokalno stanje
                      setNotifications((prev) =>
                        prev.map((x) => (x._id === n._id ? { ...x, read: true } : x))
                      );
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.95rem" }}>{n.title || n.message || "Obavijest"}</div>
                      <div style={{ fontSize: "0.8rem", color: "#666" }}>
                        {n.createdAt ? new Date(n.createdAt).toLocaleString("hr-HR") : ""}
                      </div>
                    </div>
                    {!n.read && <Chip label="Novo" size="small" color="error" />}
                  </div>
                ))
              )}

              <div style={{ marginTop: 8 }}>
                <Button size="small" onClick={() => navigate(`/profil/${id}?tab=notifications`)}>
                  Prikaži sve obavijesti
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Desna kolona: spremljene objave (gore) + objave na čekanju (dolje) */}
        <div>
          {/* SPREMLJENE OBJAVE */}
          <section className="card saved-card" style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Spremljene objave</h3>
              <div style={{ color: "#666", fontSize: "0.9rem" }}>{loadingSaved ? "Učitavanje..." : `${savedPosts.length} · ${savedPosts.length ? "" : "—"}`}</div>
            </div>

            {loadingSaved ? (
              <p className="center-msg">Učitavanje spremljenih...</p>
            ) : savedPosts.length === 0 ? (
              <p className="center-msg">Nema spremljenih objava.</p>
            ) : (
              <div className="card-grid">
                {savedPosts.map((obj) => (
                  <div
                    key={obj._id}
                    className="card-link"
                    onClick={() => navigate(`/objava/${obj._id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="card">
                      <h4 style={{ marginTop: 0 }}>{obj.naslov || "Bez naslova"}</h4>
                      <p className="card-desc">
                        {obj.sadrzaj ? (obj.sadrzaj.length > 140 ? obj.sadrzaj.slice(0, 140) + "..." : obj.sadrzaj) : "Nema opisa."}
                      </p>
                      <div className="meta-info">
                        <span>Tip: <i>{obj.tip}</i></span>
                        <span>Odsjek: {ODSJECI.find((x) => x.id === (obj.odsjek?._id || obj.odsjek))?.naziv || "-"}</span>
                        <span className="card-date">{obj.datum ? new Date(obj.datum).toLocaleDateString("hr-HR") : ""}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* OBJAVE NA ČEKANJU */}
          <section className="card" style={{ marginTop: "1rem" }}>
            <h3 style={{ marginTop: 0 }}>Objave na čekanju</h3>
            {loadingPosts ? (
              <p className="center-msg">Učitavanje objava...</p>
            ) : pendingPosts.length === 0 ? (
              <p className="center-msg">Nema objava na čekanju.</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {pendingPosts.map((obj) => (
                  <div key={obj._id} className="card-link" onClick={() => navigate(`/objava/${obj._id}`)} style={{ cursor: "pointer" }}>
                    <div className="card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4 style={{ margin: 0 }}>{obj.naslov || "Bez naslova"}</h4>
                        <Badge badgeContent={"Na čekanju"} color="warning" />
                      </div>
                      <p className="card-desc">{obj.sadrzaj ? (obj.sadrzaj.length > 200 ? obj.sadrzaj.slice(0, 200) + "..." : obj.sadrzaj) : "Nema opisa."}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#666", fontSize: "0.9rem" }}>
                        <div>{obj.tip || "-"}</div>
                        <div>{obj.datum ? new Date(obj.datum).toLocaleDateString("hr-HR") : ""}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* (Opcionalno) objave objavljene */}
          {publishedPosts.length > 0 && (
            <section className="card" style={{ marginTop: "1rem" }}>
              <h3 style={{ marginTop: 0 }}>Objavljene objave</h3>
              <div className="card-grid">
                {publishedPosts.map((obj) => (
                  <div key={obj._id} className="card-link" onClick={() => navigate(`/objava/${obj._id}`)} style={{ cursor: "pointer" }}>
                    <div className="card">
                      <h4 style={{ marginTop: 0 }}>{obj.naslov}</h4>
                      <p className="card-desc">{obj.sadrzaj ? (obj.sadrzaj.length > 120 ? obj.sadrzaj.slice(0, 120) + "..." : obj.sadrzaj) : "Nema opisa."}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* RESPONSIVE fallback: kad je viewport malen, container CSS treba stackati kolone.
          Ovisno o globalnom CSS-u možda već imaš media queries; ako ne, dodaj ove stilove u globalni CSS:
          @media (max-width: 900px) { .container { grid-template-columns: 1fr !important; } }
      */}
    </section>
  );
}
