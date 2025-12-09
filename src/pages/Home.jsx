import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
  Container,
  Avatar,
  Chip,
  Grid,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CategoryIcon from "@mui/icons-material/Category";
import PeopleIcon from "@mui/icons-material/People";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ApartmentIcon from "@mui/icons-material/Apartment";
import EventIcon from "@mui/icons-material/Event";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import api from "../api/axiosInstance";
import { ODSJECI } from "../constants/odsjeci";
import { useAuth } from "../context/AuthContext";

const ACCENT = "#b41f24";
const ACCENT_DARK = "#8f191f";

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
      {/* HERO */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, rgba(236,205,205,0.18) 0%, rgba(255,255,255,0.06) 100%), url('https://www.ffos.unios.hr/wp-content/uploads/2025/02/IMG_7438-scaled.jpg') center/cover",
          color: "#fff",
          py: { xs: 8, md: 12 },
          textAlign: "center",
          mb: 6,
          borderBottom: `6px solid ${ACCENT}`,
        }}
      >
        <Container maxWidth="md">
          <Typography variant="overline" sx={{ fontSize: "1.05rem", fontWeight: 800, letterSpacing: 3, mb: 1 }}>
            Dobrodošli na
          </Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: "2.2rem", md: "3.5rem" }, fontWeight: 900, mb: 2 }}>
            FFOS Oglasnik
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 300, maxWidth: "680px", mx: "auto", mb: 3 }}>
            Dijeli projekte, radionice i akademske prilike s kolegama i kolegicama.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/objave")}
            endIcon={<ArrowRightIcon />}
            sx={{ backgroundColor: ACCENT, color: "#fff", "&:hover": { backgroundColor: ACCENT_DARK } }}
          >
            Vidi sve objave
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* STATISTIKE */} <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" }, gap: 3, mb: 6 }}> <Card onClick={() => navigate("/objave")} sx={{ textAlign: "center", p: 3, background: "rgba(180,31,36,0.05)", borderTop: "4px solid #b41f24", cursor: "pointer", "&:hover": { transform: "translateY(-6px)", boxShadow: "0 12px 24px rgba(180,31,36,0.15)" } }}> <CategoryIcon sx={{ fontSize: 48, color: "#b41f24", mb: 2 }} /> <Typography variant="h3" sx={{ fontWeight: 900, color: "#b41f24" }}>{stats.total}</Typography> <Typography variant="body1" color="text.secondary">Ukupno objava</Typography> </Card> <Card onClick={() => navigate("/objave?filter=thisWeek")} sx={{ textAlign: "center", p: 3, background: "rgba(16,185,129,0.05)", borderTop: "4px solid #10b981", cursor: "pointer", "&:hover": { transform: "translateY(-6px)", boxShadow: "0 12px 24px rgba(16,185,129,0.15)" } }}> <TrendingUpIcon sx={{ fontSize: 48, color: "#10b981", mb: 2 }} /> <Typography variant="h3" sx={{ fontWeight: 900, color: "#10b981" }}>{stats.thisWeek}</Typography> <Typography variant="body1" color="text.secondary">Novih ovaj tjedan</Typography> </Card> <Card onClick={() => navigate("/objave?view=byCategory")} sx={{ textAlign: "center", p: 3, background: "rgba(59,130,246,0.05)", borderTop: "4px solid #3b82f6", cursor: "pointer", "&:hover": { transform: "translateY(-6px)", boxShadow: "0 12px 24px rgba(59,130,246,0.15)" } }}> <PeopleIcon sx={{ fontSize: 48, color: "#3b82f6", mb: 2 }} /> <Typography variant="h3" sx={{ fontWeight: 900, color: "#3b82f6" }}>{Object.keys(stats.categories).length}</Typography> <Typography variant="body1" color="text.secondary">Kategorije</Typography> </Card> </Box>
        

        {/* NAJNOVIJE OBJAVE */}
        <Typography variant="h2" sx={{ fontSize: { xs: "1.3rem", md: "1.8rem" }, fontWeight: 700, mb: 2 }}>
          Najnovije objave
        </Typography>

        {loading ? (
          <Typography className="center-msg">Učitavanje objava...</Typography>
        ) : objave.length === 0 ? (
          <Box sx={{ textAlign: "center", p: 4, background: "rgba(180,31,36,0.05)", borderRadius: 2 }}>
            <Typography variant="h6" color="text.secondary">Nema dostupnih objava.</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Vratite se kasnije ili kreirajte prvu objavu.</Typography>
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {objave.map((obj) => {
              const autor = obj.autor && typeof obj.autor === "object" ? obj.autor : null;
              const autorIme = autor?.ime || obj.autor || "Nepoznato";
              const autorAvatar = autor?.avatar || obj.autorAvatar || null;
              const avatarSrc = buildAvatarSrc(autorAvatar);
              const isNew = obj.datum && new Date() - new Date(obj.datum) < 3 * 24 * 60 * 60 * 1000;

              return (
                <Grid key={obj._id} item xs={12} sm={6} md={4}>
                  <Card sx={{ height: "100%" }}>
                    <CardActionArea onClick={() => navigate(`/objava/${obj._id}`)} sx={{ height: "100%", p: 2 }}>
                      {isNew && (
                        <Chip label="Najnovije" size="small" sx={{ position: "absolute", right: 12, top: 12, bgcolor: "#10b981", color: "#fff", fontWeight: 700 }} />
                      )}

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                        <Avatar src={avatarSrc} sx={{ width: 44, height: 44, border: `2px solid ${ACCENT}` }} />
                        <Typography sx={{ fontWeight: 700, color: ACCENT }}>{autorIme}</Typography>
                      </Box>

                      <Typography sx={{ fontWeight: 800, mb: 1 }}>{obj.naslov || "Bez naslova"}</Typography>
                      <Typography sx={{ fontSize: "0.95rem", color: "#444" }}>
                        {obj.sadrzaj?.length > 120 ? `${obj.sadrzaj.slice(0, 120)}...` : obj.sadrzaj || "Nema opisa."}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 1.5, mt: 2, alignItems: "center", flexWrap: "wrap" }}>
                        <Chip icon={<CategoryIcon />} label={obj.tip || "Ostalo"} size="small" variant="outlined" />
                        <Chip icon={<ApartmentIcon />} label={ODSJECI.find((ods) => ods.id === obj.odsjek)?.naziv || "-"} size="small" variant="outlined" />
                        <Box sx={{ ml: "auto", display: "flex", gap: 1, alignItems: "center" }}>
                          <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <EventIcon fontSize="small" /> {obj.datum ? new Date(obj.datum).toLocaleDateString("hr-HR") : ""}
                          </Typography>
                        </Box>
                      </Box>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* CTA za neprijavljene */}
        {!user && (
          <Box sx={{ background: "rgba(180,31,36,0.08)", borderRadius: 3, p: { xs: 3, md: 5 }, textAlign: "center" }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: ACCENT }}>Prijavite se i započnite</Typography>
            <Typography sx={{ color: "#555", mb: 3 }}>Registrirajte se sa svojom AAI adresom i dijelite prilike s akademskom zajednicom.</Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <Button variant="contained" size="large" onClick={() => navigate("/registracija")} sx={{ backgroundColor: ACCENT, "&:hover": { backgroundColor: ACCENT_DARK } }}>
                Registriraj se
              </Button>
              <Button variant="outlined" size="large" onClick={() => navigate("/login")} sx={{ borderColor: ACCENT, color: ACCENT }}>
                Prijavi se
              </Button>
            </Box>
          </Box>
        )}
      </Container>
    </section>
  );
}
