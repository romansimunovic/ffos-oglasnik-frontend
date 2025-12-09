// src/pages/ObjavaDetalj.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Avatar,
  Chip,
} from "@mui/material";
import Linkify from "linkify-react";
import api from "../api/axiosInstance";
import { useToast } from "../components/Toast";
import { ODSJECI } from "../constants/odsjeci";

import FacebookIcon from "@mui/icons-material/Facebook";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import XIcon from "@mui/icons-material/X";
import LinkIcon from "@mui/icons-material/Link";
import EventIcon from "@mui/icons-material/Event";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BookmarkIcon from "@mui/icons-material/Bookmark";

import { getTypeDetails, getDeptDetails } from "../utils/uiHelpers";

const ACCENT = "#b41f24";

export default function ObjavaDetalj() {
  const { id } = useParams();
  const [objava, setObjava] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(`/objave/${id}`);
        if (mounted) setObjava(res.data);
      } catch (err) {
        console.error("❌ Greška pri učitavanju objave:", err);
        if (mounted) toast("Greška pri učitavanju objave", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [id, toast]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast("Link kopiran!", "success");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard greška:", err);
      toast("Ne mogu kopirati link", "error");
    }
  };

  if (loading) return <p className="center-msg"> Učitavanje objave...</p>;
  if (!objava) return <p className="center-msg">Objava nije pronađena.</p>;

  const shareText = objava?.naslov || "Pogledaj ovu objavu";
  const canShare = objava.status === "odobreno" || !objava.status;

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
  const xUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + " " + currentUrl)}`;

  const autor = objava.autor && typeof objava.autor === "object" ? objava.autor : null;
  const autorIme = autor?.ime || objava.autor || "Nepoznato";
  const autorId = autor?._id || objava.autorId || null;
  const autorAvatar = autor?.avatar || objava.autorAvatar || null;

  const buildAvatarSrc = (avatarPath) => {
    if (!avatarPath) return "/default-avatar.png";
    if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://"))
      return `${avatarPath}?t=${Date.now()}`;
    const base = api.defaults.baseURL || "";
    const backendOrigin = base.replace(/\/api\/?$/i, "");
    return `${backendOrigin}${avatarPath}?t=${Date.now()}`;
  };
  const avatarSrc = buildAvatarSrc(autorAvatar);

  const tipNaziv = objava.tip || "ostalo";
  const odsjekNaziv =
    ODSJECI.find((x) => x.id === (objava.odsjek?._id || objava.odsjek))?.naziv ||
    (typeof objava.odsjek === "string" ? objava.odsjek : "-");
  const datum =
    objava.datum &&
    new Date(objava.datum).toLocaleDateString("hr-HR", { day: "2-digit", month: "2-digit", year: "numeric" });

  // content truncation
  const MAX_WORDS = 120;
  const fullText = objava.sadrzaj || "";
  let isTruncated = false;
  let displayText = fullText;
  if (!showFull && fullText) {
    const words = fullText.split(/\s+/);
    if (words.length > MAX_WORDS) {
      isTruncated = true;
      displayText = words.slice(0, MAX_WORDS).join(" ");
    }
  }

  // visuals
  const typeDetails = getTypeDetails(tipNaziv.toLowerCase());
  const deptDetails = getDeptDetails(
    // getDeptDetails expects either id or readable label — pass readable label if possible
    ODSJECI.find((x) => x.id === (objava.odsjek?._id || objava.odsjek))?.id ||
      (typeof objava.odsjek === "string" ? objava.odsjek : "")
  );
  const TypeIcon = typeDetails.Icon;
  const DeptIcon = deptDetails.Icon;

  return (
    <section className="page-bg">
      <div className="container">
        <Box sx={{ mb: 2 }}>
          <Button variant="text" size="small" onClick={() => navigate(-1)} sx={{ color: ACCENT }}>
            ← Natrag
          </Button>
        </Box>

        <Box className="card card-static" sx={{ maxWidth: 1000, mx: "auto", p: 3 }}>
          {/* header */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
            <Avatar src={avatarSrc} sx={{ width: 56, height: 56, border: `2px solid ${ACCENT}` }} onClick={() => autorId && navigate(`/profil/${autorId}`)} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ color: ACCENT, fontWeight: 800 }}>{objava.naslov}</Typography>
              <Typography variant="body2" sx={{ color: "#444" }}>Autor: <strong>{autorIme}</strong></Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Button size="small" variant="outlined" onClick={() => setShareOpen(true)}>Podijeli</Button>
            </Box>
          </Box>

          {/* meta row */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2, alignItems: "center" }}>
            <Chip
  icon={<TypeIcon sx={typeDetails.iconSx} />}
  label={typeDetails.label}
  size="small"
  sx={{ 
    bgcolor: typeDetails.color, 
    color: typeDetails.contrastText, 
    fontWeight: 700,
    "& .MuiChip-icon": { color: `${typeDetails.contrastText} !important` }
  }}
/>

<Chip
  icon={<DeptIcon sx={deptDetails.iconSx} />}
  label={ODSJECI.find((x) => x.id === (objava.odsjek?._id || objava.odsjek))?.naziv || (typeof objava.odsjek === "string" ? objava.odsjek : "-")}
  size="small"
  sx={{ 
    bgcolor: deptDetails.color, 
    color: deptDetails.contrastText,
    "& .MuiChip-icon": { color: `${deptDetails.contrastText} !important` }
  }}
/>


            <Chip icon={<EventIcon />} label={datum || ""} size="small" />

            <Box sx={{ ml: "auto", display: "flex", gap: 1, alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <VisibilityIcon fontSize="small" /> <Typography variant="body2">{objava.views || 0}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <BookmarkIcon fontSize="small" /> <Typography variant="body2">{objava.saves || 0}</Typography>
              </Box>
            </Box>
          </Box>

          {/* content */}
          <Typography component="div" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7, color: "#222", mb: 2 }}>
            <Linkify options={{ nl2br: true }}>{displayText}{isTruncated && !showFull ? "..." : ""}</Linkify>

            {isTruncated && !showFull && (
              <Button size="small" onClick={() => setShowFull(true)} sx={{ ml: 1, textTransform: "none", color: ACCENT }}>
                Nastavi čitati
              </Button>
            )}
          </Typography>

          {!canShare && (
            <Typography variant="body2" sx={{ color: "#666", fontStyle: "italic" }}>
              Objavu možete podijeliti tek kad bude odobrena. Status: <strong>{objava.status || "na čekanju"}</strong>.
            </Typography>
          )}
        </Box>

        {/* Share dialog */}
        <Dialog open={shareOpen} onClose={() => setShareOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Podijeli objavu</DialogTitle>
          <DialogContent>
            <Box sx={{ display: "grid", gap: 1.25 }}>
              <Button variant="contained" startIcon={<FacebookIcon />} onClick={() => window.open(facebookUrl, "_blank", "noopener,noreferrer")} sx={{ backgroundColor: "#1877F2", "&:hover": { backgroundColor: "#155FBD" } }}>
                Facebook
              </Button>
              <Button variant="contained" startIcon={<WhatsAppIcon />} onClick={() => window.open(whatsappUrl, "_blank", "noopener,noreferrer")} sx={{ backgroundColor: "#25D366", "&:hover": { backgroundColor: "#20BA5C" } }}>
                WhatsApp
              </Button>
              <Button variant="contained" startIcon={<XIcon />} onClick={() => window.open(xUrl, "_blank", "noopener,noreferrer")} sx={{ backgroundColor: "#000", "&:hover": { backgroundColor: "#333" } }}>
                X
              </Button>
              <Button variant="outlined" startIcon={<LinkIcon />} onClick={copyLink} color={copied ? "success" : "primary"}>
                {copied ? "Link kopiran!" : "Kopiraj link"}
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShareOpen(false)}>Zatvori</Button>
          </DialogActions>
        </Dialog>
      </div>
    </section>
  );
}
