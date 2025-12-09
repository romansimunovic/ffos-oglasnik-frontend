// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Typography,
  Box,
  Container,
  Chip,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CategoryIcon from "@mui/icons-material/Category";
import PeopleIcon from "@mui/icons-material/People";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ApartmentIcon from "@mui/icons-material/Apartment";
import EventIcon from "@mui/icons-material/Event";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import api from "../api/axiosInstance";
import { ODSJECI } from "../constants/odsjeci";
import { useAuth } from "../context/AuthContext";
import { getTypeDetails, getDeptDetails } from "../utils/uiHelpers";

export default function Home() {
  const [objave, setObjave] = useState([]);
  const [stats, setStats] = useState({ total: 0, thisWeek: 0, categories: {} });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/objave");
      const allObjave = res.data || [];

      // Filtriraj odobrene i sortiraj (pinned + novije)
      const odobrene = allObjave.filter((o) => o.status === "odobreno");
      const sorted = odobrene.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.datum) - new Date(a.datum);
      });

      // Ograniči prikaz na zadnjih 6 objava
      setObjave(sorted.slice(0, 6));

      // Statistike
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const thisWeek = odobrene.filter((o) => new Date(o.datum) >= weekAgo);

      const categories = odobrene.reduce((acc, o) => {
        acc[o.tip] = (acc[o.tip] || 0) + 1;
        return acc;
      }, {});

      setStats({
        total: odobrene.length,
        thisWeek: thisWeek.length,
        categories,
      });
    } catch (err) {
      console.error("fetch home data:", err);
    } finally {
      setLoading(false);
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

  return (
    <section className="page-bg">
      {/* HERO SEKCIJA */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, rgba(236, 205, 205, 0.25) 0%, rgba(255,255,255,0.10) 100%), url('https://www.ffos.unios.hr/wp-content/uploads/2025/02/IMG_7438-scaled.jpg') center/cover",
          backgroundAttachment: "fixed",
          color: "#fff",
          py: { xs: 8, md: 12 },
          textAlign: "center",
          mb: 6,
          borderBottom: "6px solid #b41f24",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="overline" sx={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: 3, mb: 2, textShadow: "0 2px 6px rgba(0,0,0,1)" }}>
            Dobrodošli na
          </Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: "2.5rem", md: "4rem" }, fontWeight: 900, mb: 2, textShadow: "2px 2px 8px rgba(254, 241, 241, 0.5)", letterSpacing: -1 }}>
            FFOS Oglasnik
          </Typography>
          <Typography variant="h5" sx={{ fontSize: { xs: "1rem", md: "1.3rem" }, fontWeight: 300, maxWidth: "600px", mx: "auto", mb: 4, lineHeight: 1.6, textShadow: "0 2px 6px rgba(0,0,0,0.3)" }}>
            Digitalni prostor FFOS-a na kojem možete dijeliti studentske projekte, radionice, konferencije i akademske prilike.
          </Typography>
          <Button variant="contained" size="large" onClick={() => navigate("/objave")} endIcon={<ArrowRightIcon />} sx={{ backgroundColor: "var(--ffos-red)", color: "#fff", fontWeight: "bold", px: 4, py: 1.5, fontSize: "1rem", "&:hover": { backgroundColor: "#8f191f" } }}>
            Vidi sve objave
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* STATISTIKE */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" }, gap: 3, mb: 6 }}>
          <Card onClick={() => navigate("/objave")} sx={{ textAlign: "center", p: 3, background: "rgba(180,31,36,0.05)", borderTop: "4px solid #b41f24", cursor: "pointer", "&:hover": { transform: "translateY(-6px)", boxShadow: "0 12px 24px rgba(180,31,36,0.15)" } }}>
            <CategoryIcon sx={{ fontSize: 48, color: "#b41f24", mb: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 900, color: "#b41f24" }}>{stats.total}</Typography>
            <Typography variant="body1" color="text.secondary">Ukupno objava</Typography>
          </Card>

          <Card onClick={() => navigate("/objave?filter=thisWeek")} sx={{ textAlign: "center", p: 3, background: "rgba(16,185,129,0.05)", borderTop: "4px solid #10b981", cursor: "pointer", "&:hover": { transform: "translateY(-6px)", boxShadow: "0 12px 24px rgba(16,185,129,0.15)" } }}>
            <TrendingUpIcon sx={{ fontSize: 48, color: "#10b981", mb: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 900, color: "#10b981" }}>{stats.thisWeek}</Typography>
            <Typography variant="body1" color="text.secondary">Novih ovaj tjedan</Typography>
          </Card>

          <Card onClick={() => navigate("/objave?view=byCategory")} sx={{ textAlign: "center", p: 3, background: "rgba(59,130,246,0.05)", borderTop: "4px solid #3b82f6", cursor: "pointer", "&:hover": { transform: "translateY(-6px)", boxShadow: "0 12px 24px rgba(59,130,246,0.15)" } }}>
            <PeopleIcon sx={{ fontSize: 48, color: "#3b82f6", mb: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 900, color: "#3b82f6" }}>{Object.keys(stats.categories).length}</Typography>
            <Typography variant="body1" color="text.secondary">Kategorije</Typography>
          </Card>
        </Box>

        {/* ZADNJE OBJAVE */}
        <Typography variant="h1" sx={{ fontSize: { xs: "1.5rem", md: "2.5rem" }, fontWeight: 700, mb: 2, textShadow: "5px 2px 8px rgba(146, 139, 139, 0.5)", letterSpacing: -1 }}>
            Najnovije objave
        </Typography>

        {loading ? (
          <p className="center-msg">Učitavanje objava...</p>
        ) : objave.length === 0 ? (
          <Box sx={{ textAlign: "center", p: 4, background: "rgba(180,31,36,0.05)", borderRadius: 2, border: "2px dashed #b41f24" }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
              <SearchOffIcon sx={{ color: '#b41f24' }} />
              <Typography variant="h6" color="text.secondary">Nema dostupnih objava.</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Vratite se kasnije ili kreirajte prvu objavu!</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", md: "repeat(3,1fr)" }, gap: 3, mb: 4 }}>
            {objave.map((obj) => {
              const autor = obj.autor && typeof obj.autor === "object" ? obj.autor : null;
              const autorIme = autor?.ime || obj.autor || "Nepoznato";
              const autorAvatar = autor?.avatar || obj.autorAvatar || null;
              const avatarSrc = buildAvatarSrc(autorAvatar);
              const isNew = obj.datum && new Date() - new Date(obj.datum) < 3 * 24 * 60 * 60 * 1000;

              // type + dept visuals
              const t = getTypeDetails((obj.tip || "ostalo").toLowerCase());
              const TypeIcon = t.Icon;
              const found = ODSJECI.find((x) => x.id === obj.odsjek);
              const deptKey = found?.id || (obj.odsjek || "");
              const d = getDeptDetails(deptKey);
              const DeptIcon = d.Icon;
              const DeptLabel = found?.naziv || (typeof obj.odsjek === "string" ? obj.odsjek : "-");

              return (
                <Card key={obj._id} sx={{ cursor: "pointer", p: 2, position: "relative" }} onClick={() => navigate(`/objava/${obj._id}`)}>
                  {/* Najnovije badge u gornjem desnom kutu */}
                  {isNew && (
                    <Box sx={{ position: "absolute", top: 8, right: 8, bgcolor: "#10b981", color: "#fff", px: 1.5, py: 0.5, borderRadius: 10, fontSize: "0.75rem", fontWeight: 700, zIndex: 1 }}>
                      Najnovije
                    </Box>
                  )}

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                    <img
                      src={avatarSrc}
                      alt={autorIme}
                      style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid #b41f24" }}
                    />
                    <Typography sx={{ fontWeight: 700, color: "#b41f24" }}>{autorIme}</Typography>
                  </Box>

                  <Typography sx={{ fontWeight: 700, mb: 1 }}>{obj.naslov || "Bez naslova"}</Typography>
                  <Typography sx={{ fontSize: "0.9rem", color: "#555" }}>
                    {obj.sadrzaj?.length > 120 ? `${obj.sadrzaj.slice(0, 120)}...` : obj.sadrzaj || "Nema opisa."}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, mt: 2, alignItems: "center", flexWrap: "wrap" }}>
                    <Chip
                      icon={<TypeIcon sx={{ color: "#fff" }} />}
                      label={t.label}
                      size="small"
                      sx={{ bgcolor: t.color, color: "#fff" }}
                    />

                    <Chip
                      icon={<DeptIcon sx={{ color: "#fff" }} />}
                      label={DeptLabel}
                      size="small"
                      sx={{ bgcolor: d.color, color: "#fff" }}
                    />

                    <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
                      <EventIcon fontSize="small" />
                      <Typography variant="body2">{obj.datum ? new Date(obj.datum).toLocaleDateString("hr-HR") : ""}</Typography>
                    </Box>
                  </Box>
                </Card>
              );
            })}
          </Box>
        )}

        {/* CTA ZA NEPRIJAVLJENE */}
        {!user && (
          <Box sx={{ background: "rgba(180,31,36,0.1)", backdropFilter: "blur(8px)", borderRadius: 3, p: { xs: 3, md: 6 }, textAlign: "center", border: "2px solid rgba(180,31,36,0.2)", mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, color: "#b41f24" }}>✨ Prijavite se i započnite</Typography>
            <Typography sx={{ color: "#666", mb: 3, fontSize: "1.05rem" }}>
              Registrirajte se sa svojom AAI email adresom i podijelite projekte, radionice i prilike s akademskom zajednicom.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <Button variant="contained" size="large" onClick={() => navigate("/registracija")} sx={{ backgroundColor: "#b41f24", "&:hover": { backgroundColor: "#8a1519" }, fontWeight: "bold", px: 4 }}>Registriraj se</Button>
              <Button variant="outlined" size="large" onClick={() => navigate("/login")} sx={{ borderColor: "#b41f24", color: "#b41f24", fontWeight: "bold", px: 4, "&:hover": { borderColor: "#8a1519", backgroundColor: "rgba(180,31,36,0.05)" } }}>Prijavi se</Button>
            </Box>
          </Box>
        )}
      </Container>
    </section>
  );
}
