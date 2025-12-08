import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { ODSJECI } from "../constants/odsjeci";
import Linkify from "linkify-react";
import api from "../api/axiosInstance";
import { useToast } from "../components/Toast";
import FacebookIcon from "@mui/icons-material/Facebook";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import XIcon from "@mui/icons-material/X";
import LinkIcon from "@mui/icons-material/Link";

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
    return () => {
      mounted = false;
    };
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

  if (loading || !objava)
    return <p className="center-msg">⏳ Učitavanje objave...</p>;

  const shareText = objava?.naslov || "Pogledaj ovu objavu";
  // smije se dijeliti samo ako je odobrena (ili ako iz nekog razloga status ne postoji)
  const canShare = objava.status === "odobreno" || !objava.status;

  const facebookUrl =
    "https://www.facebook.com/sharer/sharer.php?u=" +
    encodeURIComponent(currentUrl);
  const xUrl =
    "https://x.com/intent/tweet?url=" +
    encodeURIComponent(currentUrl) +
    "&text=" +
    encodeURIComponent(shareText);
  const whatsappUrl =
    "https://wa.me/?text=" + encodeURIComponent(shareText + " " + currentUrl);

  const autor =
    objava.autor && typeof objava.autor === "object" ? objava.autor : null;
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

  const tipNaziv = objava.tip || "Ostalo";
  const odsjekNaziv =
    ODSJECI.find((x) => x.id === (objava.odsjek?._id || objava.odsjek))
      ?.naziv || "-";
  const datum =
    objava.datum &&
    new Date(objava.datum).toLocaleDateString("hr-HR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const MAX_WORDS = 300;
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

  return (
    <section className="page-bg">
      <div className="container">
        {/* Povratak */}
        <div style={{ marginBottom: "1rem" }}>
          <Button
            variant="text"
            size="small"
            onClick={() => navigate(-1)}
            sx={{ color: "#971d21" }}
          >
            ← Natrag na objave
          </Button>
        </div>

        <div
          className="card card-static"
          style={{
            padding: "1.8rem 2.2rem",
            maxWidth: "1000px",
            width: "100%",
            margin: "0 auto",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <img
              src={avatarSrc}
              alt={`Avatar ${autorIme}`}
              className="tiny-avatar"
              style={{ cursor: autorId ? "pointer" : "default" }}
              onClick={() => autorId && navigate(`/profil/${autorId}`)}
            />
            <div style={{ flex: 1, minWidth: 200 }}>
              <h1 style={{ margin: 0, fontSize: "1.5rem" }}>{objava.naslov}</h1>
              <div style={{ color: "#666", fontSize: 14 }}>Opis {autorIme}</div>
            </div>
          </div>

          {/* META */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              fontSize: 14,
              color: "#555",
              marginBottom: 16,
            }}
          >
            <span> Vrsta: {tipNaziv}</span>
            <span> Odsjek: {odsjekNaziv}</span>
            <span> Datum: {datum}</span>
            <span title="Broj spremanja">Broj spremanja {objava.saves || 0}</span>
            <span title="Broj pregleda">Broj pregleda {objava.views || 0}</span>
          </div>

          {/* SADRŽAJ */}
          <p
            className="card-desc"
            style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
          >
            <Linkify options={{ nl2br: true }}>
              {displayText}
              {isTruncated && !showFull ? "..." : ""}
            </Linkify>

            {isTruncated && !showFull && (
              <button
                type="button"
                onClick={() => setShowFull(true)}
                style={{
                  marginLeft: 6,
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "#971d21",
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Nastavi čitati
              </button>
            )}
          </p>
          {/* SHARE / INFO O STATUSU */}
          {canShare ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShareOpen(true)}
              style={{ marginTop: "1rem" }}
            >
              Podijeli
            </Button>
          ) : (
            <p
              style={{
                marginTop: "1rem",
                fontStyle: "italic",
                color: "#666",
                fontSize: "0.9rem",
              }}
            >
              Objavu možete podijeliti tek kada bude odobrena. Trenutni status:{" "}
              <strong>{objava.status || "na čekanju"}</strong>.
            </p>
          )}
        </div>

        {/* SHARE DIALOG – samo ako je dijeljenje dozvoljeno */}
        {canShare && (
          <Dialog
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle> Podijeli </DialogTitle>
            <DialogContent dividers>
              <p style={{ marginBottom: "1rem", fontWeight: 500 }}>
                Odaberi gdje želiš podijeliti:
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <Button
                  variant="contained"
                  onClick={() =>
                    window.open(facebookUrl, "_blank", "noopener,noreferrer")
                  }
                  startIcon={<FacebookIcon />}
                  sx={{
                    backgroundColor: "#1877F2",
                    color: "#fff",
                    "&:hover": { backgroundColor: "#155FBD" },
                  }}
                >
                  Facebook
                </Button>
                <Button
                  variant="contained"
                  onClick={() =>
                    window.open(whatsappUrl, "_blank", "noopener,noreferrer")
                  }
                  startIcon={<WhatsAppIcon />}
                  sx={{
                    backgroundColor: "#25D366",
                    color: "#fff",
                    "&:hover": { backgroundColor: "#20BA5C" },
                  }}
                >
                  WhatsApp
                </Button>
                <Button
                  variant="contained"
                  onClick={() =>
                    window.open(xUrl, "_blank", "noopener,noreferrer")
                  }
                  startIcon={<XIcon />}
                  sx={{
                    backgroundColor: "#000",
                    color: "#fff",
                    "&:hover": { backgroundColor: "#333" },
                  }}
                >
                  X (Twitter)
                </Button>
                <Button
                  variant="outlined"
                  onClick={copyLink}
                  startIcon={<LinkIcon />}
                  color={copied ? "success" : "primary"}
                  sx={{
                    borderColor: copied ? "#4CAF50" : undefined,
                    color: copied ? "#4CAF50" : undefined,
                  }}
                >
                  {copied ? "Link kopiran!" : " Kopiraj link"}
                </Button>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShareOpen(false)} color="inherit">
                Zatvori
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </div>
    </section>
  );
}
