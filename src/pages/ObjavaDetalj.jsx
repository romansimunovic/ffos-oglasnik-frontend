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

/**
 * ObjavaDetalj komponenta
 * Prikazuje detaljnu stranicu objave sa mogućnostima dijeljenja
 */
export default function ObjavaDetalj() {
  const { id } = useParams();
  const [objava, setObjava] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  /**
   * Učitaj objavu pri mountanju komponente
   */
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
  }, [id]);

  /**
   * Kopiraj trenutni URL u clipboard
   */
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast("✅ Link kopiran!", "success");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("❌ Clipboard greška:", err);
      toast("Ne mogu kopirati link", "error");
    }
  };

  // Loading state
  if (loading || !objava)
    return <p className="center-msg">⏳ Učitavanje objave...</p>;

  // Share text za društvene mreže
  const shareText = objava?.naslov || "Pogledaj ovu objavu";

  // ============================================
  // SHARE URLs
  // ============================================

  // Facebook share URL
  const facebookUrl =
    "https://www.facebook.com/sharer/sharer.php?u=" +
    encodeURIComponent(currentUrl);

  // X (Twitter) share URL - AŽURIRANO NA X.COM
  const xUrl =
    "https://x.com/intent/tweet?url=" +
    encodeURIComponent(currentUrl) +
    "&text=" +
    encodeURIComponent(shareText);

  // WhatsApp share URL
  const whatsappUrl =
    "https://wa.me/?text=" + encodeURIComponent(shareText + " " + currentUrl);

  // ============================================
  // PARSIRANJE AUTORA
  // ============================================

  const autor =
    objava.autor && typeof objava.autor === "object" ? objava.autor : null;
  const autorIme = autor?.ime || objava.autor || "Nepoznato";
  const autorId = autor?._id || objava.autorId || null;
  const autorAvatar = autor?.avatar || objava.autorAvatar || null;

  /**
   * Izgradi Avatar URL sa cache busting
   */
  const buildAvatarSrc = (avatarPath) => {
    if (!avatarPath) return "/default-avatar.png";

    // Ako je već URL
    if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://"))
      return `${avatarPath}?t=${Date.now()}`;

    // Ako je relativna putanja - dodaj backend origin
    const base = api.defaults.baseURL || "";
    const backendOrigin = base.replace(/\/api\/?$/i, "");
    return `${backendOrigin}${avatarPath}?t=${Date.now()}`;
  };

  const avatarSrc = buildAvatarSrc(autorAvatar);

  // ============================================
  // RENDER
  // ============================================

  return (
    <section className="page-bg">
      <div className="container">
        <div className="card">
          {/* ============================================
              HEADER - Autor i Naslov
              ============================================ */}
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
              className="tiny-avatar"
              style={{ cursor: autorId ? "pointer" : "default" }}
              onClick={() => autorId && navigate(`/profil/${autorId}`)}
            />
            <div>
              <h1 style={{ margin: 0 }}>{objava.naslov}</h1>
              <div style={{ color: "#666", fontSize: 14 }}>📝 {autorIme}</div>
            </div>
          </div>

          {/* ============================================
              SADRŽAJ - Sa linkify za linkove
              ============================================ */}
          <p className="card-desc">
            <Linkify options={{ nl2br: true }}>{objava.sadrzaj}</Linkify>
          </p>

          {/* ============================================
              META INFO - Tip, Odsjek, Datum, Brojač
              ============================================ */}
          <div className="meta-info">
            <span>📌 Tip: {objava.tip}</span>
            <span>
              📂 Odsjek:{" "}
              {ODSJECI.find(
                (x) => x.id === (objava.odsjek?._id || objava.odsjek)
              )?.naziv || "-"}
            </span>
            <span className="card-date">
              📅{" "}
              {objava.datum
                ? new Date(objava.datum).toLocaleDateString("hr-HR")
                : ""}
            </span>
            <span title="Broj spremanja">⭐ {objava.saves || 0}</span>
            <span title="Broj pregleda">👁️ {objava.views || 0}</span>
          </div>

          {/* ============================================
              SHARE BUTTON
              ============================================ */}
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShareOpen(true)}
            style={{ marginTop: "1rem" }}
          >
            🔗 Podijeli objavu
          </Button>
        </div>

        {/* ============================================
            SHARE DIALOG
            ============================================ */}
        <Dialog
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>📤 Podijeli objavu</DialogTitle>
          <DialogContent dividers>
            <p style={{ marginBottom: "1rem", fontWeight: 500 }}>
              Odaberi gdje želiš podijeliti:
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                minWidth: "260px",
              }}
            >
              {/* Facebook Button */}
              <Button
                variant="contained"
                onClick={() =>
                  window.open(facebookUrl, "_blank", "noopener,noreferrer")
                }
                startIcon={<FacebookIcon />}
                sx={{
                  backgroundColor: "#1877F2",
                  color: "#FFFFFF",
                  "&:hover": { backgroundColor: "#155FBD" },
                }}
              >
                Facebook
              </Button>

              {/* WhatsApp Button */}
              <Button
                variant="contained"
                onClick={() =>
                  window.open(whatsappUrl, "_blank", "noopener,noreferrer")
                }
                startIcon={<WhatsAppIcon />}
                sx={{
                  backgroundColor: "#25D366",
                  color: "#FFFFFF",
                  "&:hover": { backgroundColor: "#20BA5C" },
                }}
              >
                WhatsApp
              </Button>

              {/* X (Twitter) Button - AŽURIRANO */}
              <Button
                variant="contained"
                onClick={() =>
                  window.open(xUrl, "_blank", "noopener,noreferrer")
                }
                startIcon={<XIcon />}
                sx={{
                  backgroundColor: "#000000",
                  color: "#FFFFFF",
                  "&:hover": { backgroundColor: "#333333" },
                }}
              >
                X (Twitter)
              </Button>

              {/* Copy Link Button */}
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
                {copied ? "✅ Link kopiran!" : "🔗 Kopiraj link"}
              </Button>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShareOpen(false)} color="inherit">
              Zatvori
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </section>
  );
}