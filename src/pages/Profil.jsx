import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import api from "../api/axiosInstance";
import { useToast } from "../components/Toast";

export default function Profil() {
  const [spremljene, setSpremljene] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [localUser, setLocalUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [previewUrl, setPreviewUrl] = useState(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();

  const user = localUser;

  useEffect(() => {
    if (!user || user.uloga === "admin") {
      setSpremljene([]);
      return;
    }

    let isMounted = true;

    const fetchSpremljene = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await api.get("/korisnik/spremljene", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isMounted) setSpremljene(data || []);
      } catch (err) {
        console.error("Greška pri dohvaćanju spremljenih:", err);
        if (isMounted) setSpremljene([]);
      }
    };

    fetchSpremljene();

    const handler = () => fetchSpremljene();
    window.addEventListener("refreshSpremljene", handler);

    return () => {
      isMounted = false;
      window.removeEventListener("refreshSpremljene", handler);
    };
  }, [user]);

const buildAvatarSrc = (avatarPath) => {
  if (!avatarPath) return "/default-avatar.png";
  if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://"))
    return `${avatarPath}?t=${Date.now()}`;
  const base = api.defaults.baseURL || "";
  const backendOrigin = base.replace(/\/api\/?$/i, "");
  return `${backendOrigin}${avatarPath}?t=${Date.now()}`;
};



  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("avatar", file);

    setUploading(true);
    try {
      const res = await api.post("/korisnik/upload-avatar", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const newAvatar = res.data?.avatar || res.data?.user?.avatar;
      if (newAvatar) {
        const updatedUser = { ...user, avatar: newAvatar };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setLocalUser(updatedUser);
        setPreviewUrl(null);
        toast("Avatar ažuriran!", "success");
      }
    } catch (err) {
      console.error("Upload avatar error:", err);
      toast("Greška pri uploadu profilne.", "error");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    toast("Uspješno ste odjavljeni.", "success");
    setTimeout(() => navigate("/login"), 800);
  };

  const handleRemoveSaved = async (objavaId, e) => {
    // spriječi da klik na gumb otvori link /objava/:id
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast("Niste prijavljeni.", "error");
      return;
    }

    try {
      await api.delete(`/korisnik/spremljene/${objavaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // makni iz lokalnog state-a
      setSpremljene((prev) => prev.filter((o) => o._id !== objavaId));

      toast("Objava je uklonjena iz spremljenih.", "success");
    } catch (err) {
      console.error("Greška pri uklanjanju spremljene objave:", err);
      toast("Greška pri uklanjanju objave.", "error");
    }
  };

  if (!user) {
    return (
      <section className="page-bg">
        <div className="container">
          <p className="center-msg">Niste prijavljeni.</p>
        </div>
      </section>
    );
  }

  const avatarSrc =
    previewUrl ||
    (user.avatar ? buildAvatarSrc(user.avatar) : "/default-avatar.png");

  return (
    <section className="page-bg">
      <div className="container">
        <div className="card profile-card">
          <h2>Moj Profil</h2>

          <div className="avatar-wrap">
            <img
              src={avatarSrc}
              alt="Profilna fotografija"
              className="profile-avatar"
            />
            <label className="avatar-upload-btn" style={{ cursor: "pointer" }}>
              Promijeni profilnu
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
            </label>
            {uploading && <p className="card-date">Upload u tijeku...</p>}
          </div>

          <p>
            <span className="font-bold">Ime: </span>
            {user.ime}
          </p>
          <p>
            <span className="font-bold">Email: </span>
            {user.email}
          </p>
          <p>
            <span className="font-bold">Uloga: </span>
            {user.uloga}
          </p>
        </div>

        {user.uloga !== "admin" && (
          <section className="card saved-card">
            <h3>Spremljene objave</h3>
            {spremljene.length === 0 ? (
              <p>Još nemaš spremljenih objava.</p>
            ) : (
              <div className="card-grid">
                {spremljene.map((o) => (
                  <Link
                    key={o._id}
                    to={`/objava/${o._id}`}
                    className="card-link"
                  >
                    <div className="card saved-post">
                      <h4>{o.naslov || "Bez naslova"}</h4>
                      <p>
                        {o.sadrzaj?.length > 120
                          ? `${o.sadrzaj.slice(0, 120)}...`
                          : o.sadrzaj || "Nema opisa."}
                      </p>
                      <p className="card-date">
                        {o.datum
                          ? new Date(o.datum).toLocaleDateString("hr-HR")
                          : ""}
                      </p>

                      <button
                        type="button"
                        className="unsave-btn"
                        style={{ marginTop: "0.5rem" }}
                        onClick={(e) => handleRemoveSaved(o._id, e)}
                      >
                        Ukloni
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Logout potvrda */}
        <Dialog open={logoutConfirm} onClose={() => setLogoutConfirm(false)}>
          <DialogTitle>Potvrdi odjavu</DialogTitle>
          <DialogContent>
            <DialogContentText>Sigurno se želite odjaviti?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLogoutConfirm(false)}>Odustani</Button>
            <Button onClick={handleLogout} color="error" variant="contained">
              Odjavi se
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </section>
  );
}
