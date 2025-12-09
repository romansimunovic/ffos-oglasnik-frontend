import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Box, Typography, Avatar, Chip, Button } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import api from "../api/axiosInstance";
import { getTypeDetails, getDeptDetails } from "../utils/uiHelpers";
import { ODSJECI } from "../constants/odsjeci";

const ACCENT = "#b41f24";

export default function UserProfil() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [objave, setObjave] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userLocal = JSON.parse(localStorage.getItem("user") || "null");
        const userIdParam = id || userLocal?._id;

        console.log("🔹 Dohvaćam korisnika s ID:", userIdParam);

        const { data: userData } = await api.get(`/korisnik/${userIdParam}`);
        console.log("✅ userData:", userData);
        setUser(userData);

        const { data: postsData } = await api.get(`/objave/autor/${userIdParam}`);
        console.log("✅ postsData:", postsData);
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

  return (
    <Box className="page-container" sx={{ maxWidth: 1000, mx: "auto", px: 2, py: 4 }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 6 }}>
        <Avatar src={avatarSrc} alt={user.ime} sx={{ width: 100, height: 100, mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>{user.ime}</Typography>
      </Box>

      {/* OBJAVE */}
      <Typography variant="h5" sx={{ mb: 3, textAlign: "center", fontWeight: 600 }}>Objave korisnika</Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {objave.length === 0 ? (
          <Typography variant="body1" sx={{ color: "#666", textAlign: "center" }}>
            Korisnik još nema objava.
          </Typography>
        ) : objave.map((objava) => {
          const tip = getTypeDetails(objava.tip);
          const odsjek = getDeptDetails(objava.odsjek);

          return (
            <Link key={objava._id} to={`/objava/${objava._id}`} style={{ textDecoration: "none" }}>
              <Box sx={{
                border: `1px solid #ccc`,
                borderRadius: 2,
                p: 3,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                transition: "box-shadow 0.2s",
                "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }
              }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: ACCENT }}>{objava.naslov}</Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  <Chip label={tip.label} size="small" sx={{ bgcolor: tip.color, color: tip.contrastText }} />
                  <Chip label={odsjek.label} size="small" sx={{ bgcolor: odsjek.color, color: odsjek.contrastText }} />
                  <Chip label={new Date(objava.datum).toLocaleDateString()} size="small" />
                </Box>

                <Typography variant="body2" sx={{ color: "#222", lineHeight: 1.6 }}>
                  {objava.sadrzaj.length > 150 ? objava.sadrzaj.slice(0, 150) + "..." : objava.sadrzaj}
                </Typography>

                <Box sx={{ display: "flex", gap: 3, mt: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <VisibilityOutlinedIcon fontSize="small" /> <span>{objava.views || 0}</span>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <BookmarkBorderOutlinedIcon fontSize="small" /> <span>{objava.saves || 0}</span>
                  </Box>
                </Box>
              </Box>
            </Link>
          );
        })}
      </Box>
    </Box>
  );
}
