import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Button
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import FacebookIcon from "@mui/icons-material/Facebook";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import XIcon from "@mui/icons-material/X";
import LinkIcon from "@mui/icons-material/Link";

import api from "../api/axiosInstance";
import { getTypeDetails, getDeptDetails } from "../utils/uiHelpers";
import { ODSJECI } from "../constants/odsjeci";
import { useToast } from "../components/Toast";

const ACCENT = "#b41f24";

export default function UserProfil() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [objave, setObjave] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const userId = currentUser?._id || currentUser?.id || null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userLocal = currentUser;
        const userIdParam = id || userLocal?._id;

        const { data: userData } = await api.get(`/korisnik/${userIdParam}`);
        setUser(userData);

        const { data: postsData } = await api.get(`/objave/autor/${userIdParam}`);
        setObjave(Array.isArray(postsData) ? postsData : postsData.objave || []);
      } catch (err) {
        console.error("❌ Greška u fetchData:", err);
        setUser(null);
        setObjave([]);
      }
    };
    fetchData();
  }, [id]);

  if (!user) return <div style={{ textAlign: "center", marginTop: 50 }}>Učitavanje korisnika...</div>;

  const avatarSrc = user.avatar || "/default-avatar.png";

  const copyLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      toast("Link kopiran!", "success");
    } catch (err) {
      toast("Ne mogu kopirati link", "error");
    }
  };

  return (
    <Box className="page-container" sx={{ maxWidth: 900, mx: "auto", px: 2, py: 4 }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 6 }}>
        <Avatar src={avatarSrc} alt={user.ime} sx={{ width: 100, height: 100, mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>{user.ime}</Typography>
      </Box>

      {/* OBJAVE */}
      <Typography variant="h5" sx={{ mb: 3, textAlign: "center", fontWeight: 600 }}>Objave korisnika</Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {objave.length === 0 ? (
          <Typography variant="body1" sx={{ color: "#666", textAlign: "center" }}>
            Korisnik još nema objava.
          </Typography>
        ) : objave.map((objava) => {
          const tip = getTypeDetails(objava.tip);
          const odsjek = getDeptDetails(objava.odsjek);

          const autor = objava.autor && typeof objava.autor === "object" ? objava.autor : null;
          const autorIme = autor?.ime || objava.autor || "Nepoznato";
          const autorId = autor?._id || objava.autorId || null;
          const autorAvatar = autor?.avatar || objava.autorAvatar || null;

          const buildAvatarSrc = (avatarPath) => {
            if (!avatarPath) return "/default-avatar.png";
            if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) return `${avatarPath}?t=${Date.now()}`;
            const base = api.defaults.baseURL || "";
            const backendOrigin = base.replace(/\/api\/?$/i, "");
            return `${backendOrigin}${avatarPath}?t=${Date.now()}`;
          };

          const avatarSrcPost = buildAvatarSrc(autorAvatar);

          const currentUrl = typeof window !== "undefined" ? window.location.href : "";

          const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
          const xUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(objava.naslov)}`;
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(objava.naslov + " " + currentUrl)}`;

          return (
            <Box key={objava._id} sx={{
              border: `1px solid #ccc`,
              borderRadius: 2,
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              transition: "box-shadow 0.2s",
              "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }
            }}>
              {/* HEADER */}
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Avatar
                  src={avatarSrcPost}
                  sx={{ width: 56, height: 56, border: `2px solid ${ACCENT}`, cursor: "pointer" }}
                  onClick={() => {
                    if (!autorId) return;
                    if (autorId === userId) navigate("/profil");
                    else navigate(`/profil/${autorId}`);
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ color: ACCENT, fontWeight: 700 }}>{objava.naslov}</Typography>
                  <Typography variant="body2" sx={{ color: "#444" }}>Autor: <strong>{autorIme}</strong></Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button size="small" variant="outlined" onClick={() => window.open(facebookUrl, "_blank")}>FB</Button>
                  <Button size="small" variant="outlined" onClick={() => window.open(whatsappUrl, "_blank")}>WA</Button>
                  <Button size="small" variant="outlined" onClick={() => window.open(xUrl, "_blank")}>X</Button>
                  <Button size="small" variant="outlined" onClick={() => copyLink(currentUrl)}>Kopiraj</Button>
                </Box>
              </Box>

              {/* META */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 1, alignItems: "center" }}>
                <Chip label={tip.label} size="small" sx={{ bgcolor: tip.color, color: tip.contrastText }} />
                <Chip label={odsjek.label} size="small" sx={{ bgcolor: odsjek.color, color: odsjek.contrastText }} />
                <Chip label={new Date(objava.datum).toLocaleDateString()} size="small" />

                <Box sx={{ ml: "auto", display: "flex", gap: 1, alignItems: "center" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <VisibilityOutlinedIcon fontSize="small" /> <Typography variant="body2">{objava.views || 0}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <BookmarkBorderOutlinedIcon fontSize="small" /> <Typography variant="body2">{objava.saves || 0}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* CONTENT */}
              <Typography variant="body2" sx={{ color: "#222", mt: 1, lineHeight: 1.6 }}>
                {objava.sadrzaj}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
