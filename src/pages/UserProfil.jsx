// src/pages/UserProfil.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { ODSJECI } from "../constants/odsjeci";

export default function UserProfil() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [korisnik, setKorisnik] = useState(null);
  const [objave, setObjave] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const buildAvatarSrc = (avatarPath) => {
  if (!avatarPath) return "/default-avatar.png"; // ovo će sad raditi
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
      } finally {
        if (mounted) setLoadingUser(false);
      }
    };
    fetchUser();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    let mounted = true;
    const fetchPosts = async () => {
      try {
        const res = await api.get(`/objave/autor/${id}`);
        if (mounted) setObjave(res.data || []);
      } catch (err) {
        console.error("fetch user posts:", err);
      } finally {
        if (mounted) setLoadingPosts(false);
      }
    };
    fetchPosts();
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
        {/* Profil korisnika */}
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

        {/* Objave korisnika */}
        <section className="card saved-card" style={{ marginTop: "1.5rem" }}>
          <h3>Objave korisnika</h3>
          {loadingPosts ? (
            <p className="center-msg">Učitavanje objava...</p>
          ) : objave.length === 0 ? (
            <p className="center-msg">Ovaj korisnik još nema objava.</p>
          ) : (
            <div className="card-grid">
              {objave.map((obj) => (
                <div
                  key={obj._id}
                  className="card-link"
                  onClick={() => navigate(`/objava/${obj._id}`)}
                  style={{ cursor: "pointer" }}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") navigate(`/objava/${obj._id}`);
                  }}
                >
                  <div className="card">
                    <h4 style={{ marginTop: 0 }}>
                      {obj.naslov || "Bez naslova"}
                    </h4>
                    <p className="card-desc">
                      {obj.sadrzaj
                        ? obj.sadrzaj.length > 140
                          ? obj.sadrzaj.slice(0, 140) + "..."
                          : obj.sadrzaj
                        : "Nema opisa."}
                    </p>
                    <div className="meta-info">
                      <span>
                        Tip: <i>{obj.tip}</i>
                      </span>
                      <span>
                        Odsjek:{" "}
                        {ODSJECI.find(
                          (x) => x.id === (obj.odsjek?._id || obj.odsjek)
                        )?.naziv || "-"}
                      </span>
                      <span className="card-date">
                        {obj.datum
                          ? new Date(obj.datum).toLocaleDateString("hr-HR")
                          : ""}
                      </span>
                      <span title="Broj spremanja">★ {obj.saves || 0}</span>
                      <span title="Broj pregleda">👁 {obj.views || 0}</span>
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
