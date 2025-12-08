import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import SaveIcon from "@mui/icons-material/Bookmark";
import api from "../api/axiosInstance";
import { useToast } from "../components/Toast";

export default function Profil() {
  const [spremljene, setSpremljene] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [localUser, setLocalUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [mojeNaCekanju, setMojeNaCekanju] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();

  const user = localUser;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (!user || user.uloga === "admin") {
      setSpremljene([]);
      setMojeNaCekanju([]);
      return;
    }

    let isMounted = true;

    const fetchSpremljene = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await api.get(`/korisnik/${user._id || user.id}/spremljene`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isMounted) setSpremljene(data || []);
      } catch (err) {
        console.error("Greška pri dohvaćanju spremljenih:", err);
        if (isMounted) setSpremljene([]);
      }
    };

    const fetchMojeNaCekanju = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await api.get(`/objave/moje?status=na čekanju`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isMounted) setMojeNaCekanju(data || []);
      } catch (err) {
        console.error("Greška pri dohvaćanju mojih objava na čekanju:", err);
        if (isMounted) setMojeNaCekanju([]);
      }
    };

    fetchSpremljene();
    fetchMojeNaCekanju();

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
      const res = await api.post(`/korisnik/upload-avatar`, formData, {
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

      setSpremljene((prev) => prev.filter((o) => o._id !== objavaId));
      toast("Objava uklonjena iz spremljenih.", "success");
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

  const avatarSrc = previewUrl || (user.avatar ? buildAvatarSrc(user.avatar) : "/default-avatar.png");

  return (
    <section className="page-bg">
      <div
        className="container"
        style={{
          display: "grid",
          gap: 20,
          gridTemplateColumns: isMobile ? "1fr" : "320px 1fr",
          alignItems: "start",
        }}
      >
        {/* left column (profile card) */}
        <div>
          <div className="card profile-card" style={{ textAlign: "center" }}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
              <Avatar src={avatarSrc} sx={{ width: 120, height: 120 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{user.ime}</Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>{user.email}</Typography>

            <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 1 }}>
              <label style={{ cursor: "pointer" }}>
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" onChange={handleAvatarChange} style={{ display: "none" }} />
                <Button startIcon={<EditIcon />} size="small">Promijeni</Button>
              </label>
              <Button startIcon={<LogoutIcon />} size="small" color="error" onClick={() => setLogoutConfirm(true)}>Odjava</Button>
            </Box>

            {uploading && <Typography variant="body2" sx={{ mt: 1 }}>Upload u tijeku...</Typography>}
          </div>

          {/* desktop: quick links */}
          {!isMobile && (
            <div style={{ marginTop: 12 }}>
              <div className="card" style={{ padding: 12 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Brzi linkovi</Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Button size="small" onClick={() => navigate("/objave")} variant="outlined">Pregledaj objave</Button>
                  <Button size="small" component={Link} to="/objave?filter=thisWeek" variant="outlined">Nove ovaj tjedan</Button>
                </Box>
              </div>
            </div>
          )}
        </div>

        {/* right column */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <Typography variant="h6">Spremljene objave <SaveIcon fontSize="small" sx={{ ml: 1 }} /></Typography>
            {spremljene.length === 0 ? (
              <Typography variant="body2" sx={{ color: "#666", mt: 1 }}>Još nemaš spremljenih objava.</Typography>
            ) : (
              <Box sx={{ display: "grid", gap: 1, mt: 1 }}>
                {spremljene.map((o) => (
                  <Link key={o._id} to={`/objava/${o._id}`} className="card-link" style={{ textDecoration: "none" }}>
                    <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <Typography variant="subtitle1" sx={{ margin: 0 }}>{o.naslov || "Bez naslova"}</Typography>
                        <Typography variant="body2" sx={{ color: "#666" }}>{o.sadrzaj ? (o.sadrzaj.length > 80 ? `${o.sadrzaj.slice(0, 80)}...` : o.sadrzaj) : "Nema opisa."}</Typography>
                        <Typography variant="caption" sx={{ color: "#666" }}>{o.datum ? new Date(o.datum).toLocaleDateString("hr-HR") : ""}</Typography>
                      </div>
                      <IconButton onClick={(e) => handleRemoveSaved(o._id, e)} size="small" aria-label="Ukloni">
                        <SaveIcon />
                      </IconButton>
                    </div>
                  </Link>
                ))}
              </Box>
            )}
          </div>

          <div className="card">
            <Typography variant="h6">Moje objave na čekanju</Typography>
            {mojeNaCekanju.length === 0 ? (
              <Typography variant="body2" sx={{ color: "#666", mt: 1 }}>Trenutno nemaš objava na čekanju.</Typography>
            ) : (
              <Box sx={{ display: "grid", gap: 1, mt: 1 }}>
                {mojeNaCekanju.map((o) => (
                  <Link key={o._id} to={`/objava/${o._id}`} className="card-link" style={{ textDecoration: "none" }}>
                    <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <Typography variant="subtitle1" sx={{ margin: 0 }}>{o.naslov || "Bez naslova"}</Typography>
                        <Typography variant="body2" sx={{ color: "#666" }}>{o.sadrzaj ? (o.sadrzaj.length > 80 ? `${o.sadrzaj.slice(0, 80)}...` : o.sadrzaj) : "Nema opisa."}</Typography>
                        <Typography variant="caption" sx={{ color: "#666" }}>{o.datum ? new Date(o.datum).toLocaleDateString("hr-HR") : ""}</Typography>
                        <Typography variant="caption" sx={{ color: "#ff9800", display: "block" }}>Status: {o.status || "na čekanju"}</Typography>
                      </div>
                      <Button size="small" variant="outlined">Detalji</Button>
                    </div>
                  </Link>
                ))}
              </Box>
            )}
          </div>
        </div>
      </div>

      <Dialog open={logoutConfirm} onClose={() => setLogoutConfirm(false)}>
        <DialogTitle>Potvrdi odjavu</DialogTitle>
        <DialogContent>
          <DialogContentText>Sigurno se želite odjaviti?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutConfirm(false)}>Odustani</Button>
          <Button onClick={handleLogout} color="error" variant="contained">Odjavi se</Button>
        </DialogActions>
      </Dialog>
    </section>
  );
}
