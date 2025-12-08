// src/pages/UserProfil.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { ODSJECI } from "../constants/odsjeci";
import { Button } from "@mui/material";
import { useToast } from "../components/Toast";

const ROLE_LABELS = {
  admin: "Administrator",
  user: "Korisnik",
  moderator: "Moderator",
};

export default function UserProfil() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [korisnik, setKorisnik] = useState(null);
  const [objave, setObjave] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const localUser = JSON.parse(localStorage.getItem("user") || "null");
  const localUserId = localUser?._id || localUser?.id || null;

  // redirect ako je ovo moj profil
  useEffect(() => {
    if (localUserId && id && localUserId.toString() === id.toString()) {
      navigate("/profil");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, localUserId]);

  const buildAvatarSrc = (avatarPath) => {
    if (!avatarPath) return "/default-avatar.png";
    if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://"))
      return `${avatarPath}?t=${Date.now()}`;
    const base = api.defaults.baseURL || "";
    const backendOrigin = base.replace(/\/api\/?$/i, "");
    return `${backendOrigin}${avatarPath}?t=${Date.now()}`;
  };

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

    const fetchPosts = async () => {
      try {
        const res = await api.get(`/objave/autor/${id}`);
        if (mounted) setObjave(res.data || []);
      } catch (err) {
        console.error("fetch user posts:", err);
        toast("Greška pri dohvaćanju objava autora.", "error");
      } finally {
        if (mounted) setLoadingPosts(false);
      }
    };

    fetchUser();
    fetchPosts();

    return () => {
      mounted = false;
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

  return (
    <section className="page-bg">
      <div className="container" style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Profil korisnika */}
        <div className="card profile-card" style={{ marginBottom: 20, textAlign: "center" }}>
          <div className="avatar-wrap">
            <img
              src={buildAvatarSrc(korisnik.avatar)}
              alt={korisnik.ime}
              className="profile-avatar"
            />
          </div>
          <h2>{korisnik.ime}</h2>
          <p style={{ color: "#666", margin: "4px 0" }}>
            <strong>Uloga:</strong> {ROLE_LABELS[korisnik.uloga] || korisnik.uloga}
          </p>
          <p style={{ color: "#666", margin: "2px 0" }}>
            <strong>Email:</strong> {korisnik.email || "-"}
          </p>
        </div>

        {/* Objave korisnika */}
        <section className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Objave autora</h3>
          {loadingPosts ? (
            <p className="center-msg">Učitavanje objava...</p>
          ) : objave.length === 0 ? (
            <p className="center-msg">Ovaj korisnik nema javno objavljenih sadržaja.</p>
          ) : (
            <div className="card-grid">
              {objave.map((o) => (
                <div
                  key={o._id}
                  className="card-link"
                  onClick={() => navigate(`/objava/${o._id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="card">
                    <h4 style={{ marginTop: 0 }}>{o.naslov || "Bez naslova"}</h4>
                    <p className="card-desc">
                      {o.sadrzaj ? (o.sadrzaj.length > 140 ? o.sadrzaj.slice(0, 140) + "..." : o.sadrzaj) : "Nema opisa."}
                    </p>
                    <div className="meta-info" style={{ display: "flex", gap: 12, fontSize: 12, color: "#666", flexWrap: "wrap" }}>
                      <span>Tip: <i>{o.tip}</i></span>
                      <span>Odsjek: {ODSJECI.find(x => x.id === (o.odsjek?._id || o.odsjek))?.naziv || "-"}</span>
                      <span>{o.datum ? new Date(o.datum).toLocaleDateString("hr-HR") : ""}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
