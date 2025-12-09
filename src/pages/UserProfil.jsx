import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Box, Typography, Avatar, Chip } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import { getTypeDetails, getDeptDetails } from "../utils/uiHelpers";

export default function UserProfil() {
  const { id } = useParams(); // id iz URL-a
  const [user, setUser] = useState(null);
  const [objave, setObjave] = useState([]);
  const [loading, setLoading] = useState(true); // loading state
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // dohvati userId: iz URL param ili iz localStorage
        const userLocal = JSON.parse(localStorage.getItem("user") || "null");
        const userIdParam = id || userLocal?._id;
        console.log("userIdParam:", userIdParam);

        if (!userIdParam) {
          throw new Error("Nije definiran userId!");
        }

        // fetch korisnika
        const userRes = await fetch(`/api/users/${userIdParam}`);
        console.log("userRes ok?", userRes.ok, "status:", userRes.status);
        if (!userRes.ok) throw new Error(`Greška pri dohvaćanju korisnika: ${userRes.status}`);

        const userData = await userRes.json();
        console.log("userData:", userData);
        if (!userData || Object.keys(userData).length === 0) throw new Error("Korisnik ne postoji!");

        setUser(userData);

        // fetch objava korisnika
        const objaveRes = await fetch(`/api/posts/user/${userIdParam}`);
        console.log("objaveRes ok?", objaveRes.ok, "status:", objaveRes.status);
        if (!objaveRes.ok) throw new Error(`Greška pri dohvaćanju objava: ${objaveRes.status}`);

        const postsData = await objaveRes.json();
        console.log("postsData:", postsData);
        setObjave(Array.isArray(postsData) ? postsData : postsData.objave || []);

      } catch (err) {
        console.error("❌ Error u fetchData:", err);
        setError(err.message || "Došlo je do pogreške.");
        setUser(null);
        setObjave([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div>Učitavanje korisnika...</div>;
  if (error) return <div style={{ color: "red" }}>Greška: {error}</div>;
  if (!user) return <div>Korisnik nije pronađen.</div>;

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
