import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  useTheme,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Bookmark";
import api from "../api/axiosInstance";
import { useToast } from "../components/Toast";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

import { useLocation } from "react-router-dom";


export default function Profil() {
  const [spremljene, setSpremljene] = useState([]);
  const [mojeNaCekanju, setMojeNaCekanju] = useState([]);
  const [obavijesti, setObavijesti] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [localUser, setLocalUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState("overview"); // default tab
  const user = localUser;

  useEffect(() => {
  const params = new URLSearchParams(location.search);
  const tab = params.get("tab");
  if (tab) setActiveTab(tab); // npr. "submitted"
}, [location.search]);

  useEffect(() => {
  if (!user) return;

  // Postavi previewUrl iz user.avatar odmah pri mountu
  if (user.avatar) {
    setPreviewUrl(buildAvatarSrc(user.avatar));
  }

  if (user.uloga === "admin") {
    setSpremljene([]);
    setMojeNaCekanju([]);
    fetchObavijesti();
    return;
  }

  fetchSpremljene();
  fetchMojeNaCekanju();
  fetchObavijesti();

  const refreshSpremljeneHandler = () => fetchSpremljene();
  const refreshObavijestiHandler = () => fetchObavijesti();

  window.addEventListener("refreshSpremljene", refreshSpremljeneHandler);
  window.addEventListener("refreshObavijesti", refreshObavijestiHandler);

  return () => {
    window.removeEventListener("refreshSpremljene", refreshSpremljeneHandler);
    window.removeEventListener("refreshObavijesti", refreshObavijestiHandler);
  };
}, [user]);

  const fetchSpremljene = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const { data } = await api.get("/korisnik/spremljene");
      setSpremljene(data || []);
    } catch (err) {
      console.error(err);
      setSpremljene([]);
    }
  };

  const fetchMojeNaCekanju = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const { data } = await api.get(`/objave/moje?status=na čekanju`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMojeNaCekanju(data || []);
    } catch (err) {
      console.error(err);
      setMojeNaCekanju([]);
    }
  };

  const fetchObavijesti = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const { data } = await api.get(`/korisnik/${user._id || user.id}/obavijesti`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setObavijesti(data || []);
    } catch (err) {
      console.error(err);
      setObavijesti([]);
    }
  };

  const markRead = async (notifId) => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/korisnik/${user._id || user.id}/obavijesti/${notifId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setObavijesti((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
      toast("Greška pri označavanju obavijesti.", "error");
    }
  };

  const buildAvatarSrc = (avatarPath) => {
    if (!avatarPath) return "/default-avatar.png";
    if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://"))
      return `${avatarPath}?t=${Date.now()}`;
    const base = api.defaults.baseURL || "";
    const backendOrigin = base.replace(/\/api\/?$/i, "");
    return `${backendOrigin}${avatarPath}?t=${Date.now()}`;
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const token = localStorage.getItem("token");
      const { data } = await api.post("/korisnik/upload-avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setPreviewUrl(data.avatar);
      setLocalUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast("Avatar uspješno ažuriran.", "success");
    } catch (err) {
      console.error(err);
      toast("Greška pri uploadu avatara.", "error");
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
        {/* LEFT: profile */}
        <div>
          <div className="card profile-card" style={{ textAlign: "center" }}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 1, position: "relative" }}>
              <Avatar
                src={avatarSrc}
                sx={{ width: 120, height: 120, cursor: "pointer" }}
                onClick={() => setAvatarDialogOpen(true)}
              />
              <IconButton
                sx={{ position: "absolute", bottom: 0, right: "calc(50% - 60px)", backgroundColor: "#fff" }}
                size="small"
                onClick={() => fileInputRef.current.click()}
              >
                <PhotoCameraIcon fontSize="small" />
              </IconButton>
            </Box>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/png, image/jpeg, image/webp"
              onChange={handleAvatarChange}
            />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {user.ime}
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              {user.email}
            </Typography>
          </div>
        </div>

        {/* RIGHT: notifications + saved + pending */}
        <div>
          {/* Obavijesti */}
          <div className="card" style={{ marginBottom: 16 }}>
            <Typography variant="h6">
              Obavijesti {obavijesti.filter((n) => !n.read).length > 0 && `(${obavijesti.filter((n) => !n.read).length})`}
            </Typography>
            {obavijesti.length === 0 ? (
              <Typography variant="body2" sx={{ color: "#666", mt: 1 }}>
                Nema obavijesti.
              </Typography>
            ) : (
              <Box sx={{ display: "grid", gap: 1, mt: 1 }}>
                {obavijesti.map((n) => (
                  <div
                    key={n._id}
                    className="card"
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", opacity: n.read ? 0.6 : 1 }}
                  >
                    <div>
                      <Typography variant="subtitle2" sx={{ margin: 0 }}>
                        {n.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#666" }}>
                        {n.message}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#999" }}>
                        {n.createdAt ? new Date(n.createdAt).toLocaleString("hr-HR") : ""}
                      </Typography>
                    </div>
                    <div>{!n.read && <Button size="small" onClick={() => markRead(n._id)}>Označi kao pročitano</Button>}</div>
                  </div>
                ))}
              </Box>
            )}
          </div>

          {/* Spremljene objave */}
          <div className="card" style={{ marginBottom: 16 }}>
            <Typography variant="h6">
              Spremljene objave <SaveIcon fontSize="small" sx={{ ml: 1 }} />
            </Typography>
            {spremljene.length === 0 ? (
              <Typography variant="body2" sx={{ color: "#666", mt: 1 }}>
                Još nemaš spremljenih objava.
              </Typography>
            ) : (
              <Box sx={{ display: "grid", gap: 1, mt: 1 }}>
                {spremljene.map((o) => (
                  <Link key={o._id} to={`/objava/${o._id}`} className="card-link" style={{ textDecoration: "none" }}>
                    <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <Typography variant="subtitle1" sx={{ margin: 0 }}>
                          {o.naslov || "Bez naslova"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          {o.sadrzaj ? (o.sadrzaj.length > 80 ? `${o.sadrzaj.slice(0, 80)}...` : o.sadrzaj) : "Nema opisa."}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#666" }}>
                          {o.datum ? new Date(o.datum).toLocaleDateString("hr-HR") : ""}
                        </Typography>
                      </div>
                    </div>
                  </Link>
                ))}
              </Box>
            )}
          </div>

          {/* Moje na čekanju */}
          <div className="card">
            <Typography variant="h6">Moje objave na čekanju</Typography>
            {mojeNaCekanju.length === 0 ? (
              <Typography variant="body2" sx={{ color: "#666", mt: 1 }}>
                Trenutno nemaš objava na čekanju.
              </Typography>
            ) : (
              <Box sx={{ display: "grid", gap: 1, mt: 1 }}>
                {mojeNaCekanju.map((o) => (
                  <Link key={o._id} to={`/objava/${o._id}`} className="card-link" style={{ textDecoration: "none" }}>
                    <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <Typography variant="subtitle1" sx={{ margin: 0 }}>
                          {o.naslov || "Bez naslova"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          {o.sadrzaj ? (o.sadrzaj.length > 80 ? `${o.sadrzaj.slice(0, 80)}...` : o.sadrzaj) : "Nema opisa."}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#666" }}>
                          {o.datum ? new Date(o.datum).toLocaleDateString("hr-HR") : ""}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#ff9800", display: "block" }}>
                          Status: {o.status || "na čekanju"}
                        </Typography>
                      </div>
                      <div>
                        <Button size="small" variant="outlined">
                          Detalji
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </Box>
            )}
          </div>
        </div>
      </div>

      {/* Avatar enlarge dialog */}
      <Dialog open={avatarDialogOpen} onClose={() => setAvatarDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Profilna fotografija</DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Avatar src={avatarSrc} sx={{ width: 200, height: 200, margin: "auto" }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvatarDialogOpen(false)}>Zatvori</Button>
        </DialogActions>
      </Dialog>
    </section>
  );
}
