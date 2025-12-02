// src/pages/UserProfil.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { ODSJECI } from "../constants/odsjeci";

export default function UserProfil() {
  const { id } = useParams(); // id korisnika iz URL-a
  const navigate = useNavigate();
  const [korisnik, setKorisnik] = useState(null);
  const [objave, setObjave] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

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

  // 1) dohvat korisnika
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(`/korisnik/${id}`);
        if (mounted) setKorisnik(res.data);
      } catch (err) {
        console.error("fetch user profil:", err);
      } finally {
        if (mounted) setLoadingUser(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  // 2) dohvat objava tog korisnika
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(`/objave/autor/${id}`);
        if (mounted) setObjave(res.data || []);
      } catch (err) {
        console.error("fetch user posts:", err);
      } finally {
        if (mounted) setLoadingPosts(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

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
      <div className="container">
        {/* Gornji dio – profil korisnika */}
        <div className="card profile-card">
          <div className="avatar-wrap">
            <img
              src={buildAvatarSrc(korisnik.avatar)}
              alt={korisnik.ime}
              className="profile-avatar"
            />
          </div>
          <h2>{korisnik.ime}</h2>
          <p>
            <strong>Uloga:</strong> {korisnik.uloga}
          </p>
        </div>

        {/* Donji dio – objave korisnika */}
        <section className="card saved-card" style={{ marginTop: "1.5rem" }}>
          <h3>Objave korisnika</h3>
          {loadingPosts ? (
            <p>Učitavanje objava...</p>
          ) : objave.length === 0 ? (
            <p>Ovaj korisnik još nema objava.</p>
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
                    <h4>{o.naslov || "Bez naslova"}</h4>
                    <p className="card-desc">
                      {(o.sadrzaj || "Nema opisa.").slice(0, 140)}…
                    </p>
                    <div className="meta-info">
                      <span>
                        Odsjek:{" "}
                        {ODSJECI.find((x) => x.id === (o.odsjek?._id || o.odsjek))
                          ?.naziv || "-"}
                      </span>
                      <span className="card-date">
                        {o.datum
                          ? new Date(o.datum).toLocaleDateString("hr-HR")
                          : ""}
                      </span>
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
