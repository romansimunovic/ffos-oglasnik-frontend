// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Container,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CategoryIcon from "@mui/icons-material/Category";
import PeopleIcon from "@mui/icons-material/People";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import api from "../api/axiosInstance";
import { ODSJECI } from "../constants/odsjeci";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const [objave, setObjave] = useState([]);
  const [stats, setStats] = useState({ total: 0, thisWeek: 0, categories: {} });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/objave");
      const allObjave = res.data || [];

      // Filtriraj odobrene
      const odobrene = allObjave.filter((o) => o.status === "odobreno");

      // Sve objave sortirane (pinned prvo, pa najnovije)
      const sorted = odobrene.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.datum) - new Date(a.datum);
      });

      setObjave(sorted);

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
      {/* HERO SEKCIJA - SA SLIKOM */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.3) 100%), url('https://www.ffos.unios.hr/wp-content/uploads/2025/02/IMG_7438-scaled.jpg') center/cover",
          backgroundAttachment: "fixed",
          color: "#fff",
          py: { xs: 8, md: 12 },
          textAlign: "center",
          mb: 6,
          borderBottom: "6px solid #b41f24",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="overline"
            sx={{
              fontSize: "1rem",
              fontWeight: "bold",
              letterSpacing: 2,
              color: "#10b981",
              mb: 2,
            }}
          >
            ✨ Dobrodošli na
          </Typography>

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2.5rem", md: "4rem" },
              fontWeight: 900,
              mb: 2,
              textShadow: "2px 2px 8px rgba(0,0,0,0.5)",
              letterSpacing: -1,
            }}
          >
            FFOS Oglasnik
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: "1rem", md: "1.3rem" },
              fontWeight: 300,
              maxWidth: "600px",
              mx: "auto",
              mb: 4,
              lineHeight: 1.6,
            }}
          >
            Digitalni prostor Filozofskog fakulteta gdje se dijele studentski
            projekti, radionice, konferencije i akademske prilike.
          </Typography>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/objave")}
              endIcon={<ArrowRightIcon />}
              sx={{
                backgroundColor: "#10b981",
                color: "#fff",
                fontWeight: "bold",
                px: 4,
                py: 1.5,
                fontSize: "1rem",
                "&:hover": { backgroundColor: "#059669" },
              }}
            >
              Vidi sve objave
            </Button>
          </Box>
        </Container>
      </Box>

      <div className="container">
        {/* STATISTIKE - 3 KARTICE - POTPUNO CENTRIRANE */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 6,
          width: "100%",
          mx: "auto",
          px: 2,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, 1fr)",
            },
            gap: 3,
            maxWidth: "1000px",
            width: "100%",
          }}
        >
          {/* KARTICA 1 - Ukupno objava */}
<Card
  onClick={() => navigate("/objave")}
  sx={{
    textAlign: "center",
    p: 3,
    background:
      "linear-gradient(135deg, rgba(180, 31, 36, 0.1), rgba(180, 31, 36, 0.05))",
    borderTop: "4px solid #b41f24",
    transition: "transform 0.3s, box-shadow 0.3s",
    cursor: "pointer",
    "&:hover": {
      transform: "translateY(-6px)",
      boxShadow: "0 12px 24px rgba(180, 31, 36, 0.15)",
    },
  }}
>
  <CategoryIcon sx={{ fontSize: 48, color: "#b41f24", mb: 2 }} />
  <Typography variant="h3" sx={{ fontWeight: 900, color: "#b41f24" }}>
    {stats.total}
  </Typography>
  <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
    Ukupno objava
  </Typography>
</Card>

{/* KARTICA 2 - Novih ovaj tjedan */}
<Card
  onClick={() => navigate("/objave?filter=thisWeek")}
  sx={{
    textAlign: "center",
    p: 3,
    background:
      "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))",
    borderTop: "4px solid #10b981",
    transition: "transform 0.3s, box-shadow 0.3s",
    cursor: "pointer",
    "&:hover": {
      transform: "translateY(-6px)",
      boxShadow: "0 12px 24px rgba(16, 185, 129, 0.15)",
    },
  }}
>
  <TrendingUpIcon sx={{ fontSize: 48, color: "#10b981", mb: 2 }} />
  <Typography variant="h3" sx={{ fontWeight: 900, color: "#10b981" }}>
    {stats.thisWeek}
  </Typography>
  <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
    Novih ovaj tjedan
  </Typography>
</Card>

{/* KARTICA 3 - Kategorija */}
<Card
  onClick={() => navigate("/objave?view=byCategory")}
  sx={{
    textAlign: "center",
    p: 3,
    background:
      "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))",
    borderTop: "4px solid #3b82f6",
    transition: "transform 0.3s, box-shadow 0.3s",
    cursor: "pointer",
    "&:hover": {
      transform: "translateY(-6px)",
      boxShadow: "0 12px 24px rgba(59, 130, 246, 0.15)",
    },
  }}
>
  <PeopleIcon sx={{ fontSize: 48, color: "#3b82f6", mb: 2 }} />
  <Typography variant="h3" sx={{ fontWeight: 900, color: "#3b82f6" }}>
    {Object.keys(stats.categories).length}
  </Typography>
  <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
    Kategorija
  </Typography>
</Card>
        </Box>
      </Box>


        {/* SVE OBJAVE - GRID */}
        <div style={{ marginBottom: "4rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "2rem",
            }}
          >
            <h2 style={{ fontSize: "1.8rem", fontWeight: "bold" }}>
              Sve objave
            </h2>
          </div>

          {loading ? (
            <p className="center-msg">Učitavanje objava...</p>
          ) : objave.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                background: "rgba(180, 31, 36, 0.05)",
                borderRadius: "12px",
                border: "2px dashed #b41f24",
              }}
            >
              <Typography variant="h6" color="text.secondary">
                🔍 Nema dostupnih objava.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Vratite se kasnije ili kreirajte prvu objavu!
              </Typography>
            </div>
          ) : (
            <div className="card-grid">
              {objave.map((obj) => {
                const autor =
                  obj.autor && typeof obj.autor === "object" ? obj.autor : null;
                const autorIme = autor?.ime || obj.autor || "Nepoznato";
                const autorId = autor?._id || obj.autorId || null;
                const autorAvatar = autor?.avatar || obj.autorAvatar || null;
                const avatarSrc = buildAvatarSrc(autorAvatar);

                const isNew =
                  obj.datum &&
                  new Date() - new Date(obj.datum) < 3 * 24 * 60 * 60 * 1000;

                return (
                  <div
                    key={obj._id}
                    className="card-link"
                    style={{
                      cursor: "pointer",
                      position: "relative",
                      transition: "transform 0.2s",
                    }}
                    onClick={() => navigate(`/objava/${obj._id}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* NEW BADGE */}
                    {isNew && (
                      <div
                        style={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          zIndex: 10,
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: "#10b981",
                            color: "#fff",
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                          }}
                        >
                          Najnovije
                        </span>
                      </div>
                    )}

                    <div className="card">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          marginBottom: 12,
                        }}
                      >
                        <img
                          src={avatarSrc}
                          alt={`Avatar ${autorIme}`}
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid #b41f24",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <h3
                            style={{
                              margin: 0,
                              fontSize: "1.1rem",
                              color: "#b41f24",
                              fontWeight: 700,
                            }}
                          >
                            {obj.naslov || "Bez naslova"}
                          </h3>
                          <div style={{ fontSize: "0.85rem", color: "#666" }}>
                            {autorIme}
                          </div>
                        </div>
                      </div>

                      <p
                        style={{
                          margin: "12px 0",
                          fontSize: "0.9rem",
                          color: "#555",
                          lineHeight: 1.5,
                        }}
                      >
                        {obj.sadrzaj?.length > 120
                          ? `${obj.sadrzaj.slice(0, 120)}...`
                          : obj.sadrzaj || "Nema opisa."}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "12px",
                          fontSize: "0.85rem",
                          color: "#666",
                          marginTop: "12px",
                          paddingTop: "12px",
                          borderTop: "1px solid #eee",
                        }}
                      >
                        <span>📌 {obj.tip || "Ostalo"}</span>
                        <span>
                          🏫{" "}
                          {ODSJECI.find((ods) => ods.id === obj.odsjek)
                            ?.naziv || "-"}
                        </span>
                        <span style={{ marginLeft: "auto" }}>
                          📅{" "}
                          {obj.datum
                            ? new Date(obj.datum).toLocaleDateString("hr-HR")
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/objave")}
              sx={{
                backgroundColor: "#b41f24",
                color: "#fff",
                fontWeight: "bold",
                px: 4,
                "&:hover": { backgroundColor: "#8a1519" },
              }}
            >
              Vidi sve objave s filtrima →
            </Button>
          </div>
        </div>

        {/* CTA - Za neprijavljene korisnike */}
        {!user && (
          <Box
            sx={{
              background:
                "linear-gradient(135deg, rgba(180, 31, 36, 0.15) 0%, rgba(180, 31, 36, 0.08) 100%)",
              backdropFilter: "blur(10px)",
              borderRadius: "16px",
              p: { xs: 3, md: 6 },
              textAlign: "center",
              border: "2px solid rgba(180, 31, 36, 0.2)",
              mb: 4,
            }}
          >
            <Typography
              variant="h4"
              sx={{ fontWeight: 900, mb: 2, color: "#b41f24" }}
            >
              ✨ Prijavite se i započnite
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "#666", mb: 3, fontSize: "1.05rem" }}
            >
              Registrirajte se s FFOS email adresom i počnite dijeliti projekte,
              radionice i prilike s akademskom zajednicom.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/registracija")}
                sx={{
                  backgroundColor: "#b41f24",
                  "&:hover": { backgroundColor: "#8a1519" },
                  fontWeight: "bold",
                  px: 4,
                }}
              >
                Registriraj se
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/login")}
                sx={{
                  borderColor: "#b41f24",
                  color: "#b41f24",
                  fontWeight: "bold",
                  px: 4,
                  "&:hover": {
                    borderColor: "#8a1519",
                    backgroundColor: "rgba(180, 31, 36, 0.05)",
                  },
                }}
              >
                Prijavi se
              </Button>
            </Box>
          </Box>
        )}
      </div>
    </section>
  );
}
