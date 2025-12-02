import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Chip, Card, CardContent, Typography, Grid } from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CategoryIcon from "@mui/icons-material/Category";
import PeopleIcon from "@mui/icons-material/People";
import api from "../api/axiosInstance";
import { ODSJECI } from "../constants/odsjeci";

export default function Home() {
  const [objave, setObjave] = useState([]);
  const [stats, setStats] = useState({ total: 0, thisWeek: 0, categories: {} });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

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

      // Top 6 (pinned prvo, pa najnovije)
      const sorted = odobrene.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.datum) - new Date(a.datum);
      });

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

  // Mini kalendar - top 3 nadolazeća događaja
  const upcomingEvents = objave
    .filter((o) => new Date(o.datum) >= new Date())
    .slice(0, 3);

  return (
    <section className="page-bg">
      <div className="container">
        {/* HERO SEKCIJA */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "3rem",
            padding: "2rem 0",
          }}
        >
          <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
            FFOS Oglasnik
          </h1>
          <p
            className="home-subtitle"
            style={{
              fontSize: "1.2rem",
              color: "#666",
              maxWidth: "800px",
              margin: "0 auto 2rem",
            }}
          >
            Digitalni prostor Filozofskog fakulteta u Osijeku za dijeljenje
            studentskih projekata, radionica i akademskih prilika.
          </p>
          <div
            className="home-underline"
            style={{
              width: "80px",
              height: "4px",
              background: "var(--ffos-red)",
              margin: "0 auto 2rem",
            }}
          ></div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/objave")}
              sx={{
                backgroundColor: "#b41f24",
                "&:hover": { backgroundColor: "#8a1519" },
              }}
            >
              Pregledaj objave
            </Button>
            {user && user.uloga !== "admin" && (
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/objave")}
                sx={{
                  borderColor: "#b41f24",
                  color: "#b41f24",
                  "&:hover": {
                    borderColor: "#8a1519",
                    backgroundColor: "rgba(180, 31, 36, 0.05)",
                  },
                }}
              >
                Objavi novu prijavu
              </Button>
            )}
          </div>
        </div>

        {/* STATISTIKE */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                textAlign: "center",
                p: 3,
                background:
                  "linear-gradient(135deg, rgba(180, 31, 36, 0.1), rgba(180, 31, 36, 0.05))",
              }}
            >
              <CategoryIcon sx={{ fontSize: 48, color: "#b41f24", mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                {stats.total}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Ukupno objava
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                textAlign: "center",
                p: 3,
                background:
                  "linear-gradient(135deg, rgba(33, 128, 141, 0.1), rgba(33, 128, 141, 0.05))",
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 48, color: "#21808d", mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                {stats.thisWeek}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Novih ovaj tjedan
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                textAlign: "center",
                p: 3,
                background:
                  "linear-gradient(135deg, rgba(246, 175, 36, 0.1), rgba(246, 175, 36, 0.05))",
              }}
            >
              <PeopleIcon sx={{ fontSize: 48, color: "#f6af24", mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                {Object.keys(stats.categories).length}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Kategorija
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* MINI KALENDAR - Nadolazeći događaji */}
        {upcomingEvents.length > 0 && (
          <div style={{ marginBottom: "3rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
              }}
            >
              <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CalendarTodayIcon sx={{ color: "#b41f24" }} />
                Nadolazeći događaji
              </h2>
              <Button
                variant="text"
                onClick={() => navigate("/kalendar")}
                sx={{ color: "#b41f24" }}
              >
                Vidi kalendar →
              </Button>
            </div>

            <Grid container spacing={2}>
              {upcomingEvents.map((obj) => (
                <Grid item xs={12} sm={4} key={obj._id}>
                  <Card
                    sx={{
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                      },
                    }}
                    onClick={() => navigate(`/objava/${obj._id}`)}
                  >
                    <CardContent>
                      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                        {obj.pinned && (
                          <Chip
                            icon={<PushPinIcon />}
                            label="Istaknuto"
                            size="small"
                            color="primary"
                          />
                        )}
                        {obj.urgentno && (
                          <Chip
                            icon={<NewReleasesIcon />}
                            label="Hitno"
                            size="small"
                            color="error"
                          />
                        )}
                      </div>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", mb: 1 }}
                      >
                        {obj.naslov}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {obj.sadrzaj?.substring(0, 80)}
                        {obj.sadrzaj?.length > 80 ? "..." : ""}
                      </Typography>
                      <Typography variant="caption" color="primary">
                        📅{" "}
                        {obj.datum
                          ? new Date(obj.datum).toLocaleDateString("hr-HR")
                          : ""}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </div>
        )}

        {/* NAJNOVIJE OBJAVE */}
        <div style={{ marginBottom: "3rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
            }}
          >
            <h2>Najnovije objave</h2>
            <Button
              variant="text"
              onClick={() => navigate("/objave")}
              sx={{ color: "#b41f24" }}
            >
              Vidi sve →
            </Button>
          </div>

          {loading ? (
            <p className="center-msg">Učitavanje...</p>
          ) : objave.length === 0 ? (
            <p className="center-msg">Nema dostupnih objava.</p>
          ) : (
            <div className="card-grid">
              {objave.map((obj) => {
                const autor =
                  obj.autor && typeof obj.autor === "object" ? obj.autor : null;
                const autorIme = autor?.ime || obj.autor || "Nepoznato";
                const autorAvatar = autor?.avatar || obj.autorAvatar || null;
                const avatarSrc = buildAvatarSrc(autorAvatar);

                return (
                  <div
                    key={obj._id}
                    className="card-link"
                    style={{ cursor: "pointer", position: "relative" }}
                    onClick={() => navigate(`/objava/${obj._id}`)}
                  >
                    {/* BADGES */}
                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        display: "flex",
                        gap: 6,
                      }}
                    >
                      {obj.pinned && (
                        <Chip
                          icon={<PushPinIcon />}
                          label="Istaknuto"
                          size="small"
                          color="primary"
                        />
                      )}
                      {obj.urgentno && (
                        <Chip
                          icon={<NewReleasesIcon />}
                          label="Hitno"
                          size="small"
                          color="error"
                        />
                      )}
                    </div>

                    <div className="card">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          marginBottom: 8,
                        }}
                      >
                        <img
                          src={avatarSrc}
                          alt={`Avatar ${autorIme}`}
                          className="tiny-avatar"
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <h2 style={{ margin: 0, fontSize: "1.2rem" }}>
                            {obj.naslov || "Bez naslova"}
                          </h2>
                          <div style={{ fontSize: 13, color: "#666" }}>
                            {autorIme}
                          </div>
                        </div>
                      </div>
                      <p className="card-desc">
                        {obj.sadrzaj?.length > 120
                          ? `${obj.sadrzaj.slice(0, 120)}...`
                          : obj.sadrzaj || "Nema opisa."}
                      </p>
                      <div className="meta-info">
                        <span>
                          Tip: <i>{obj.tip}</i>
                        </span>
                        <span>
                          Odsjek:{" "}
                          {ODSJECI.find((ods) => ods.id === obj.odsjek)
                            ?.naziv || "-"}
                        </span>
                        <span className="card-date">
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
        </div>

        {/* KATEGORIJE - BRZI PRISTUP */}
        <div style={{ marginBottom: "3rem" }}>
          <h2 style={{ marginBottom: "1.5rem" }}>Pretraži po kategoriji</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { label: "Radionice", value: "radionice", color: "#21808d" },
              { label: "Kvizovi", value: "kvizovi", color: "#f6af24" },
              { label: "Projekti", value: "projekti", color: "#8a1519" },
              { label: "Natječaji", value: "natječaji", color: "#23cb63" },
              { label: "Ostalo", value: "ostalo", color: "#666" },
            ].map((cat) => (
              <Chip
                key={cat.value}
                label={`${cat.label} (${stats.categories[cat.value] || 0})`}
                onClick={() =>
                  navigate(`/objave?tip=${cat.value}`)
                }
                sx={{
                  backgroundColor: cat.color,
                  color: "#fff",
                  fontWeight: "bold",
                  cursor: "pointer",
                  "&:hover": {
                    opacity: 0.8,
                  },
                }}
              />
            ))}
          </div>
        </div>

        {/* CTA - Za neprijavljene korisnike */}
        {!user && (
          <div
            style={{
              textAlign: "center",
              padding: "3rem 2rem",
              background:
                "linear-gradient(135deg, rgba(180, 31, 36, 0.1), rgba(180, 31, 36, 0.05))",
              borderRadius: "12px",
              marginBottom: "3rem",
            }}
          >
            <h2 style={{ marginBottom: "1rem" }}>Prijavite se i počnite</h2>
            <p style={{ color: "#666", marginBottom: "2rem" }}>
              Registrirajte se s FFOS emailom i počnite dijeliti svoje projekte
              i prilike s akademskom zajednicom.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/registracija")}
                sx={{
                  backgroundColor: "#b41f24",
                  "&:hover": { backgroundColor: "#8a1519" },
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
                  "&:hover": {
                    borderColor: "#8a1519",
                    backgroundColor: "rgba(180, 31, 36, 0.05)",
                  },
                }}
              >
                Prijavi se
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
