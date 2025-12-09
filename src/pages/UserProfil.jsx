import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Box, Typography, Avatar, Chip } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import api from "../api/axiosInstance";
import { getTypeDetails, getDeptDetails } from "../utils/uiHelpers";


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

  if (!user) return <div>Učitavanje korisnika...</div>;

  const avatarSrc = user.avatar || "/default-avatar.png";

  return (
    <Box className="page-container">
      {/* HEADER */}
      <Box className="profile-header" sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <Avatar src={avatarSrc} alt={user.ime} sx={{ width: 90, height: 90 }} />
        <Box className="profile-info">
          <Typography variant="h5">{user.ime}</Typography>
        </Box>
      </Box>

      {/* OBJAVE */}
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Objave korisnika</Typography>

      <Box className="posts-list">
        {objave.length === 0 ? (
          <Typography variant="body2" sx={{ color: "#666" }}>
            Korisnik još nema objava.
          </Typography>
        ) : objave.map((objava) => {
          const tip = getTypeDetails(objava.tip);
          const odsjek = getDeptDetails(objava.odsjek);

          return (
            <Link key={objava._id} to={`/objava/${objava._id}`} style={{ textDecoration: "none" }}>
              <Box className="post-card" sx={{ border: "1px solid #ccc", p: 2, mb: 2, borderRadius: 1 }}>
                <Typography variant="h6">{objava.naslov}</Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                  <Chip label={tip.label} size="small" />
                  <Chip label={odsjek.label} size="small" />
                  <Chip label={new Date(objava.datum).toLocaleDateString()} size="small" />
                </Box>
                <Typography variant="body2">
                  {objava.sadrzaj.length > 150 ? objava.sadrzaj.slice(0, 150) + "..." : objava.sadrzaj}
                </Typography>
                <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
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
