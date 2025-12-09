import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import FacebookIcon from "@mui/icons-material/Facebook";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import XIcon from "@mui/icons-material/X";
import LinkIcon from "@mui/icons-material/Link";
import EventIcon from "@mui/icons-material/Event";

import api from "../api/axiosInstance";
import { getTypeDetails, getDeptDetails } from "../utils/uiHelpers";
import { ODSJECI } from "../constants/odsjeci";
import { useToast } from "../components/Toast";

const ACCENT = "#b41f24";

const getDeptName = (deptId) => {
  return ODSJECI.find((x) => x.id === deptId)?.naziv || "-";
};

export default function UserProfil() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [objave, setObjave] = useState([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareTitle, setShareTitle] = useState("");
  const [copied, setCopied] = useState(false);

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

  const buildAvatarSrc = (avatarPath) => {
    if (!avatarPath) return "/default-avatar.png";
    if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://"))
      return `${avatarPath}?t=${Date.now()}`;
    const base = api.defaults.baseURL || "";
    const backendOrigin = base.replace(/\/api\/?$/i, "");
    return `${backendOrigin}${avatarPath}?t=${Date.now()}`;
  };

  const openShareDialog = (url, title) => {
    setShareUrl(url);
    setShareTitle(title);
    setShareOpen(true);
    setCopied(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast("Link kopiran!", "success");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast("Ne mogu kopirati link", "error");
    }
  };

  if (!user)
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        Učitavanje korisnika...
      </div>
    );

  const avatarSrc = buildAvatarSrc(user.avatar);
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareUrl
  )}`;
  const xUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
    shareTitle
  )}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    shareTitle + " " + shareUrl
  )}`;

  return (
    <Box className="page-bg" sx={{ py: 4 }}>
      <div className="container">
        {/* HEADER */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
          <Button
            variant="text"
            size="small"
            onClick={() => navigate(-1)}
            sx={{ color: ACCENT }}
          >
            ← Natrag
          </Button>
        </Box>

        <Box
          className="card card-static"
          sx={{
            maxWidth: 900,
            mx: "auto",
            p: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            mb: 4,
          }}
        >
          <Avatar
            src={avatarSrc}
            alt={user.ime}
            sx={{
              width: 120,
              height: 120,
              mb: 2,
              border: `3px solid ${ACCENT}`,
            }}
          />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {user.ime}
          </Typography>
          {user.email && (
            <Typography variant="body2" sx={{ color: "#666" }}>
              {user.email}
            </Typography>
          )}
          <Typography
            variant="body2"
            sx={{ color: "#999", mt: 1, fontSize: "0.9rem" }}
          >
            {objave.length} {objave.length === 1 ? "objava" : "objava"}
          </Typography>
        </Box>

        {/* OBJAVE */}
        <Box sx={{ maxWidth: 900, mx: "auto" }}>
          <Typography
            variant="h5"
            sx={{ mb: 3, fontWeight: 600, color: ACCENT }}
          >
            Objave korisnika
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {objave.length === 0 ? (
              <Typography variant="body1" sx={{ color: "#666", textAlign: "center", py: 4 }}>
                Korisnik još nema objava.
              </Typography>
            ) : (
              objave.map((objava) => {
                const tipDetails = getTypeDetails(objava.tip);
                const deptDetails = getDeptDetails(
                  ODSJECI.find((x) => x.id === (objava.odsjek?._id || objava.odsjek))?.id ||
                    (typeof objava.odsjek === "string" ? objava.odsjek : "")
                );
                const TypeIcon = tipDetails.Icon;
                const DeptIcon = deptDetails.Icon;

                const autor = objava.autor && typeof objava.autor === "object" ? objava.autor : null;
                const autorIme = autor?.ime || objava.autor || "Nepoznato";
                const autorId = autor?._id || objava.autorId || null;
                const autorAvatar = autor?.avatar || objava.autorAvatar || null;
                const avatarSrcPost = buildAvatarSrc(autorAvatar);

                const datum =
                  objava.datum &&
                  new Date(objava.datum).toLocaleDateString("hr-HR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  });

                const postUrl = `${window.location.origin}/objava/${objava._id}`;

                // Truncate content to 150 characters
                const MAX_CHARS = 150;
                let displayText = objava.sadrzaj || "";
                let isTruncated = false;
                if (displayText.length > MAX_CHARS) {
                  isTruncated = true;
                  displayText = displayText.substring(0, MAX_CHARS) + "...";
                }

                return (
                  <Box
                    key={objava._id}
                    sx={{
                      border: `1px solid #ddd`,
                      borderRadius: 2,
                      p: 3,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      transition: "all 0.2s",
                      cursor: "pointer",
                      "&:hover": {
                        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                        borderColor: ACCENT,
                      },
                    }}
                    onClick={() => navigate(`/objava/${objava._id}`)}
                  >
                    {/* HEADER */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Box sx={{ display: "flex", gap: 2, alignItems: "center", flex: 1 }}>
                        <Avatar
                          src={avatarSrcPost}
                          sx={{
                            width: 56,
                            height: 56,
                            border: `2px solid ${ACCENT}`,
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                          onClick={() => {
                            if (!autorId) return;
                            if (autorId === userId) navigate("/profil");
                            else navigate(`/profil/${autorId}`);
                          }}
                        />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              color: ACCENT,
                              fontWeight: 700,
                              wordBreak: "break-word",
                            }}
                          >
                            {objava.naslov}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#666" }}>
                            Autor: <strong>{autorIme}</strong>
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => openShareDialog(postUrl, objava.naslov)}
                          sx={{
                            color: ACCENT,
                            borderColor: ACCENT,
                            "&:hover": { borderColor: ACCENT, bgcolor: "rgba(180,31,36,0.05)" },
                          }}
                        >
                          Podijeli
                        </Button>
                      </Box>
                    </Box>

                    {/* META */}
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1.5,
                        alignItems: "center",
                      }}
                    >
                      <Chip
                        icon={<TypeIcon sx={tipDetails.iconSx} />}
                        label={tipDetails.label}
                        size="small"
                        sx={{
                          bgcolor: tipDetails.color,
                          color: tipDetails.contrastText,
                          fontWeight: 700,
                          "& .MuiChip-icon": {
                            color: `${tipDetails.contrastText} !important`,
                          },
                        }}
                      />

                      <Chip
                        icon={<DeptIcon sx={deptDetails.iconSx} />}
                        label={getDeptName(
                          objava.odsjek?._id || objava.odsjek
                        )}
                        size="small"
                        sx={{
                          bgcolor: deptDetails.color,
                          color: deptDetails.contrastText,
                          fontWeight: 700,
                          "& .MuiChip-icon": {
                            color: `${deptDetails.contrastText} !important`,
                          },
                        }}
                      />

                      <Chip icon={<EventIcon />} label={datum} size="small" />

                      <Box
                        sx={{
                          ml: "auto",
                          display: "flex",
                          gap: 2,
                          alignItems: "center",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                          <Typography variant="body2">
                            {objava.views || 0}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <BookmarkBorderOutlinedIcon fontSize="small" />
                          <Typography variant="body2">
                            {objava.saves || 0}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* CONTENT */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#333",
                        lineHeight: 1.6,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {displayText}
                      {isTruncated && (
                        <Button
                          size="small"
                          sx={{
                            ml: 1,
                            textTransform: "none",
                            color: ACCENT,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/objava/${objava._id}`);
                          }}
                        >
                          Nastavi čitati
                        </Button>
                      )}
                    </Typography>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareOpen} onClose={() => setShareOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Podijeli objavu</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 1.25, pt: 1 }}>
            <Button
              variant="contained"
              startIcon={<FacebookIcon />}
              onClick={() =>
                window.open(facebookUrl, "_blank", "noopener,noreferrer")
              }
              sx={{
                backgroundColor: "#1877F2",
                "&:hover": { backgroundColor: "#155FBD" },
              }}
            >
              Facebook
            </Button>
            <Button
              variant="contained"
              startIcon={<WhatsAppIcon />}
              onClick={() =>
                window.open(whatsappUrl, "_blank", "noopener,noreferrer")
              }
              sx={{
                backgroundColor: "#25D366",
                "&:hover": { backgroundColor: "#20BA5C" },
              }}
            >
              WhatsApp
            </Button>
            <Button
              variant="contained"
              startIcon={<XIcon />}
              onClick={() => window.open(xUrl, "_blank", "noopener,noreferrer")}
              sx={{
                backgroundColor: "#000",
                "&:hover": { backgroundColor: "#333" },
              }}
            >
              X
            </Button>
            <Button
              variant="outlined"
              startIcon={<LinkIcon />}
              onClick={copyLink}
              color={copied ? "success" : "primary"}
            >
              {copied ? "Link kopiran!" : "Kopiraj link"}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareOpen(false)}>Zatvori</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
